const express = require("express");

const router = express.Router();

const multer = require("multer")


// All Controller
const { createProductContoller , getProductController } = require("../controller/product.controller");

// Auth Middleware
const createAuthMiddleware = require("../middleware/auth.middleware");

// product Validator
const { createProductValidators } = require("../validators/product.validators");

// Multer
const upload = multer({ storage: multer.memoryStorage() });

// POST  /api/products/
router.post(
  "/",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidators,
  createProductContoller
);

// GET /api/products
router.get("/",getProductController)

module.exports = router;
