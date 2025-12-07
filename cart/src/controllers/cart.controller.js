const cartModel = require("../models/cart.model");

// Add Item to Cart Controller **************************************************************************************
async function addItemToCart(req, res) {
  const { productId, quantity } = req.body;

  const user = req.user;

  let cart = await cartModel.findOne({ user: user.id });

  if (!cart) {
    cart = new cartModel({ user: user.id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex((item) => {
    return item.productId.toString() === productId;
  });

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity: quantity });
  }

  await cart.save();

  res.status(200).json({
    message: "Item added to cart",
    cart,
  });
}

// Update Cart Controller ***************************************************************************************************
async function updateItemQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const cart = await cartModel.findOne({ user: user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex < 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    cart.items[existingItemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: "Item updated",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get  Cart Controller *****************************************************************************************
async function getCart(req, res) {
  const user = req.user;

  let cart = await cartModel.findOne({ user: user.id });

  if (!cart) {
    cart = new cartModel({ user: user.id, items: [] });
    await cart.save();
  }

  res.status(200).json({
    cart,
    totals: {
      itemCount: cart.items.length,
      totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
}

// Delete or Clear Cart
async function deleteCart(req, res) {
  try {
    const user = req.user;

    // Find and delete the user's cart
    const cart = await cartModel.findOneAndDelete({ user: user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  deleteCart,
};
