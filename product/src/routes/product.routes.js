const express = require("express");

const router = express.Router();

const multer = require("multer")


// All Controller
const { createProductContoller } = require("../controller/product.controller");

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

// GET

module.exports = router;
