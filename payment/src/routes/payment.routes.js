const express = require('express');
const AuthMiddleware = require("../middlewares/auth.middleware")
const paymentController = require("../controllers/payment.controller")



const router = express.Router();


router.post("/create/:orderId", AuthMiddleware([ "user" ]), paymentController.createPayment)

router.post("/verify", AuthMiddleware([ "user" ]), paymentController.verifyPayment)

module.exports = router;