const express = require("express");

const router = express.Router();

const multer = require("multer");

// All Controller
const {
  createProductContoller,
  getProductController,
  getProductByIdController,
  updateProductByIDController
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


// GET /api/products/:id  -->   GET product by Product ID --> SELLER Side
router.get("/:id", AuthMiddleware(["admin", "seller"]), getProductByIdController);

// PATCH /api/products/:id  --> Update product Detail --> SELLER Side
router.patch("/:id", AuthMiddleware(["admin", "seller"]), upload.array("images", 5), updateProductByIDController);




module.exports = router;
