const express = require("express");

const router = express.Router();

// Auth Middleware Import
const AuthMiddleware = require("../middlewares/auth.middleware")

// Seller Controller Import
const sellerController = require("../controllers/seller.controller")







// Get Metrics Routes -> /api/seller/dashboard/metrics 
router.get("/metrics" , AuthMiddleware(["seller"]) , sellerController.getMetrics)

// Get Order Routes -> /api/seller/dashboard/orders 
router.get("/orders", AuthMiddleware([ "seller" ]), sellerController.getOrders)

// Get Products Routes -> /api/seller/dashboard/products 
router.get("/products", AuthMiddleware([ "seller" ]), sellerController.getProducts)

 

module.exports = router;