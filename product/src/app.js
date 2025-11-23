const express = require('express');
const cookieParser = require('cookie-parser');
const productRoutes = require("../src/routes/product.routes")





const app = express();
app.use(express.json());
app.use(cookieParser());

// Initial Routes for Product
app.use("/api/products" , productRoutes);




module.exports = app;