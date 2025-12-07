const express = require("express");
const router = express.Router();

// Import Middlewares ******************************************************************
const AuthMiddleware = require("../middlewares/auth.middleware");
const {
  createOrderValidation,
  updateAddressValidation,
} = require("../middlewares/validation.middleware");

// Import Controllers ******************************************************************
const orderController = require("../controllers/order.controller");




// POST /api/orders/ ******************************************************************
router.post(
  "/",
  createOrderValidation,
  AuthMiddleware(["user"]),
  orderController.createOrder
);

module.exports = router;
