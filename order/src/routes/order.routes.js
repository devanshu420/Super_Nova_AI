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

// GET /api/orders/me ******************************************************************
// router.get("/me", AuthMiddleware(["user"]), orderController.getMyOrders);

// router.post(
//   "/:id/cancel",
//   AuthMiddleware(["user"]),
//   orderController.cancelOrderById
// );

// router.patch(
//   "/:id/address",
//   AuthMiddleware(["user"]),
//   validation.updateAddressValidation,
//   orderController.updateOrderAddress
// );

// router.get(
//   "/:id",
//   AuthMiddleware(["user", "admin"]),
//   orderController.getOrderById
// );

module.exports = router;
