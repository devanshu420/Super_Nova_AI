const express = require("express");

const router = express.Router();

const multer = require("multer");

// All Controller
const {
  createProductContoller,
  getProductController,
  getProductByIdController,
  updateProductByIDController,
  deleteProductByIDController,
  getProductBySellerController,
  updateStockController
} = require("../controller/product.controller");

// Auth Middleware
const AuthMiddleware = require("../middleware/auth.middleware");

// product Validator
const { createProductValidators } = require("../validators/product.validators");

// Multer
const upload = multer({ storage: multer.memoryStorage() });

// POST  /api/products/  --> Create Products SELLER Side
router.post(
  "/",
  AuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidators,
  createProductContoller
);


// GET /api/products  -->  GET all products
router.get("/", getProductController);


// PATCH /api/products/:id  --> Update product Detail --> SELLER Side
router.patch("/:id", AuthMiddleware(["admin", "seller"]), upload.array("images", 5), updateProductByIDController);

// PATCH /api/products/update-stock/:id
router.patch("/update-stock/:id" , AuthMiddleware(['user']) , updateStockController)

// DELETE /api/products/:id  --> Delete product Detail --> SELLER Side
router.delete("/:id", AuthMiddleware(["admin", "seller"]), deleteProductByIDController);

//GET /api/products/seller  --> Get Seller's Product
router.get("/seller" , AuthMiddleware(["seller"]) , getProductBySellerController)


// GET /api/products/:id  -->   GET product by Product ID --> SELLER Side
// router.get("/:id", AuthMiddleware(["admin", "seller"]), getProductByIdController);


// GET /api/products/:id  -->   GET product by Product ID 
router.get("/:id", getProductByIdController);








module.exports = router;
