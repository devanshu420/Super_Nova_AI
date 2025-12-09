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
router.get("/me", AuthMiddleware(["user"]), orderController.getMyOrders);

// All Cancel
// POST /api/orders/:id/cancelOrder ****************************************************
router.post(
  "/:id/cancelOrder",
  AuthMiddleware(["user"]),
  orderController.cancelOrderByOrderId
);


// PATCH /api/orders/:id/addressUpdate
router.patch(
  "/:id/addressUpdate",
  AuthMiddleware(["user"]),
  updateAddressValidation,
  orderController.updateOrderAddress
);

// Partial Cancel
// POST /api/orders/:orderId/item/:productId/cancel ****************************************************

// router.post(
//   "/:orderId/item/:productId/cancel",
//   AuthMiddleware(["user"]),
//   orderController.cancelPartialOrderByOrderId
// );


// Get Orders By Order ID
// GET /api/orders/:id *****************************************************************
router.get(
  "/:id",
  AuthMiddleware(["user", "admin"]),
  orderController.getOrdersByOrderID
);

module.exports = router;
