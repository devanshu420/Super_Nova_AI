const { default: axios } = require("axios");
const orderModel = require("../models/order.model");

// Create Order Controller **********************************************************************************************
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
    res.status(500).json({
      message: "Internal Server Error ",
      error: error.message,
    });
  }
}



module.exports = {
  createOrder,
};
