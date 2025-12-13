const axios = require("axios");
const orderModel = require("../models/order.model");

// Create Order Controller ****************************************************************************************************
async function createOrder(req, res) {
  const user = req.user;
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  try {
    const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Cart Response => ", cartResponse.data.cart.items);

    const products = await Promise.all(
      cartResponse.data.cart.items.map(async (items) => {
        return (
          await axios.get(
            `http://localhost:3001/api/products/${items.productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        ).data.data;
      })
    );
    console.log("products => ", products);

    let priceAmount = 0;

    const orderItem = cartResponse.data.cart.items.map((items) => {
      const product = products.find((p) => {
        // console.log("P is =>" ,p);
        return p._id == items.productId;
      });

      const updatedStock = product.stock - items.quantity;
      // console.log("Updated Stock => " , updatedStock);

      // if not in stock, does not allow order creation
      if (updatedStock < items.quantity || updatedStock == 0) {
        throw new Error(
          `Product ${product.title} is out of stock or insufficient stock`
        );
      }

      // totalAmount -> store single product total amount
      const totalAmount = product.price.amount * items.quantity;
      // priceAmount -> Store all Product Total Amount
      priceAmount += totalAmount;

      // console.log("total item => " , totalAmount);

      return {
        product: items.productId,
        quantity: items.quantity,
        price: {
          amount: totalAmount,
          currency: product.price.currency,
        },
        stock: updatedStock,
      };
    });

    console.log("orderItem is => ", orderItem);

    // Update product stocks by calling PRODUCT SERVICE
    await Promise.all(
      orderItem.map(async (item) => {
        await axios.patch(
          `http://localhost:3001/api/products/update-stock/${item.product}`,
          { stock: item.stock },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      })
    );

    // Add Order In DB

    const order = await orderModel.create({
      user: user.id,
      items: orderItem,
      status: "PENDING",
      totalPrice: {
        amount: priceAmount,
        currency: "INR",
      },
      shippingAddress: {
        street: req.body.shippingAddress.street,
        city: req.body.shippingAddress.city,
        state: req.body.shippingAddress.state,
        zip: req.body.shippingAddress.pincode,
        country: req.body.shippingAddress.country,
      },
    });

    res.status(201).json({
      order,
    });
  } catch (error) {
    console.log("Error is => " , error);
    
    res.status(500).json({
      message: "Internal Server Error ",
      error: error.message,
    });
  }
}

// Get Order Controller *******************************************************************************************************
async function getMyOrders(req, res) {
  const user = req.user;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const orders = await orderModel
      .find({ user: user.id })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalOrders = await orderModel.countDocuments({ user: user.id });

    res.status(200).json({
      orders,
      meta: {
        total: totalOrders,
        page,
        limit,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

// Get Order By Order ID ******************************************************************************************************
async function getOrdersByOrderID(req, res) {
  const user = req.user;
  // console.log("User is =>", user);

  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);
    // console.log("Order is => ", order);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this order" });
    }

    res.status(200).json({ order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

// Cancel All Order By Order ID ***********************************************************************************************
async function cancelOrderByOrderId(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this order" });
    }

    // only PENDING orders can be cancelled
    if (order.status !== "PENDING") {
      return res.status(409).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.status = "CANCELLED";
    await order.save();

    res.status(200).json({
      message: "Order Cancel Successfully",
      orderStatus: order.status,
    });
  } catch (error) {
    console.error(err);

    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

// Update Order Address Controller ********************************************************************************************
async function updateOrderAddress(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== user.id) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this order",
      });
    }

    // only PENDING orders can have address updated
    if (order.status !== "PENDING") {
      return res.status(409).json({
        message: "Order address cannot be updated at this stage",
      });
    }

    order.shippingAddress = {
      street: req.body.shippingAddress.street,
      city: req.body.shippingAddress.city,
      state: req.body.shippingAddress.state,
      zip: req.body.shippingAddress.pincode,
      country: req.body.shippingAddress.country,
    };

    await order.save();

    res.status(200).json({ 
      message : "Order Address Successfully Address",
      address : order.shippingAddress 
    });
  } catch (err) { 
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

// Cancel Partial  Order By Order ID ******************************************************************************************
// Cancel specific product inside an order
// async function cancelPartialOrderByOrderId(req, res) {

//   const user = req.user;
//   const { orderId, productId } = req.params;

//   try {
//     // find order
//     const order = await orderModel.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // validate user
//     if (order.user.toString() !== user.id) {
//       return res.status(403).json({ message: "You cannot access this order" });
//     }

//     // find item
//     const item = order.items.find((i) => i.product.toString() === productId);

//     if (!item) {
//       return res
//         .status(404)
//         .json({ message: "Product not found in this order" });
//     }

//     // only pending items can be cancelled
//     if (item.status !== "PENDING") {
//       return res
//         .status(409)
//         .json({ message: "This item cannot be cancelled now" });
//     }

//     // cancel the selected item
//     item.status = "CANCELLED";

//     // update full order status
//     const allCancelled = order.items.every((i) => i.status === "CANCELLED");
//     const anyCancelled = order.items.some((i) => i.status === "CANCELLED");

//     if (allCancelled) {
//       order.status = "CANCELLED";
//     } else if (anyCancelled) {
//       order.status = "PARTIALLY_CANCELLED";
//     }

//     await order.save();

//     return res.status(200).json({
//       message: "Item cancelled successfully",
//       order,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// }

module.exports = {
  createOrder,
  getMyOrders,
  getOrdersByOrderID,
  cancelOrderByOrderId,
  updateOrderAddress,
  // cancelPartialOrderByOrderId
};
