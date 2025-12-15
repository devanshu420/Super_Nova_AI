const express = require("express");
const app = express();

const cookieParser = require("cookie-parser")

// Routes File
const sellerRoutes = require("./routes/seller.routes")


app.use(express.json());
app.use(cookieParser());

// For Routes Manage
app.use("/api/seller" , sellerRoutes);



module.exports = app;