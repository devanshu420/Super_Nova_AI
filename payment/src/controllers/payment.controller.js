const axios = require("axios");
const paymentModel = require("../models/payment.model");

const razorpay = require("../services/razorpay.service");
// import from node_modules
const {
  validatePaymentVerification,
} = require("../../node_modules/razorpay/dist/utils/razorpay-utils.js");

// Create Payment Controller **********************************************************************************
async function createPayment(req, res) {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  try {
    const orderId = req.params.orderId;
    const orderResponse = await axios.get(
      `http://localhost:3003/api/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    //console.log("Order Detail Fetch For Payment Service => " , orderResponse.data.order.items);
    const price = orderResponse.data.order.totalPrice;
    console.log(
      "Order Total Price Fetch For Payment Service => ",
      orderResponse.data.order.totalPrice
    );

    // Create A RazorPay Order ***********************
    const razorpayOrder = await razorpay.orders.create(price);
    console.log("Razor Pay Order => ", razorpayOrder);

    // Save in DB
    const payment = await paymentModel.create({
      orderId: orderId,
      razorpayOrderId: razorpayOrder.id,
      user: req.user.id,
      price: {
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });

    return res.status(201).json({
      message: "Payment initiated",
      payment,
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Verify Payment Controller *********************************************************************************

async function verifyPayment(req, res) {

  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const result = validatePaymentVerification({
        order_id: razorpayOrderId,
        payment_id: razorpayPaymentId,
      },
      signature,
      secret
    );
    console.log("Paymnet Validation Result => ", result);

    if (result) {
      const payment = await paymentModel.findOne({
        orderId: razorpayOrderId,
        status: 'PENDING'
      });

      console.log("Before Payment Update : => " , payment);
      
      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = "completed";

      await payment.save();

      console.log("After Payment Update : => " , payment);


      res.json({
        status: "success",
        payment,
      });

    } else {
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error verifying payment");
  }
}

module.exports = {
  createPayment,
  verifyPayment,
};
