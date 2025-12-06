const express = require("express");
const { route } = require("../app");
const router = express.Router();

const { createCartController } = require("../controllers/cart.controller");

//GET /api/cart
// router.get("/" ,)

//POST /api/cart/items
router.post("/items" , createCartController);

//PATCH /api/cart/items/:productId

// DELETE /api/cart/items/:productId

// DELETE /api/cart

module.exports = router;
