const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");

const AuthMiddleware = require("../middlewares/auth.middleware");
const {
  validateAddItemToCart,
  validateUpdateCartItem,
} = require("../middlewares/validation.middleware");

//GET /api/cart
router.get('/',
    AuthMiddleware([ 'user' ]),
    cartController.getCart
);

//POST /api/cart/items
router.post(
  "/items",
  validateAddItemToCart,
  AuthMiddleware(["user"]),
  cartController.addItemToCart
);

//PATCH /api/cart/items/:productId
router.patch(
  "/items/:productId",
  validateUpdateCartItem,
  AuthMiddleware(["user"]),
  cartController.updateItemQuantity
);

// DELETE /api/cart/items/:productId

// DELETE /api/cart

module.exports = router;
