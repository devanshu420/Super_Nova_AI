const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');


const paymentRoutes = require("./routes/payment.routes")



app.use(express.json());
app.use(cookieParser());

// For Payment Routes
app.use('/api/payments' ,paymentRoutes);

module.exports = app;