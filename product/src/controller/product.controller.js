const mongoose = require("mongoose");
const productModel = require("../model/product.model");

const { uploadImage } = require("../services/imagekit.service");

// Create Product Controller ********************************************************************************************************
// Accepts multipart/form-data with fields: title, description, priceAmount, priceCurrency, images[] (files)
async function createProductContoller(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = "INR" } = req.body;
    const seller = req.user.id; // Extract seller from authenticated user

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    const images = await Promise.all(
      (req.files || []).map((file) =>
        uploadImage({
          buffer: file.buffer,
        })
      )
    );

    const product = await productModel.create({
      title,
      description,
      price,
      seller,
      images,
    });

    // await publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", product);
    // await publishToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", {
    //     email: req.user.email,
    //     productId: product._id,
    //     sellerId: seller
    // });

    return res.status(201).json({
      message: "Product created",
      data: product,
    });
  } catch (err) {
    console.error("Create product error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
//GET CONTROLLER FOR PRODUCT *******************************************************************************************

//Get Product Controller
async function getProductController(req, res) {
  const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

  const filter = {};

  if (q) {
    filter.$text = { $search: q };
  }

  if (minprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $gte: Number(minprice),
    };
  }

  if (maxprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $lte: Number(maxprice),
    };
  }
  console.log("Filter for search -> ", filter);

  const products = await productModel
    .find(filter)
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 20));

  return res.status(200).json({ data: products });
}

// Get Product Controller by ID **************************************************************************************************
async function getProductByIdController(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json({ data: product });
}

//UPDATE CONTROLLER FOR PRODUCT *******************************************************************************************
// Update Product Controller by ID

// UPDATE CONTROLLER FOR PRODUCT
async function updateProductByIDController(req, res) {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    // Find product
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure only seller can update their product
    if (product.seller.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own products" });
    }

    // Allowed fields to update
    const { title, description, priceAmount, priceCurrency, stock } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (stock !== undefined) product.stock = Number(stock);

    // Update price
    if (priceAmount || priceCurrency) {
      product.price = product.price || {};
      if (priceAmount !== undefined) product.price.amount = Number(priceAmount);
      if (priceCurrency) product.price.currency = priceCurrency;
    }

    // Update images if provided
    if (req.files && req.files.length > 0) {
      const images = await Promise.all(
        req.files.map((file) => uploadImage({ buffer: file.buffer }))
      );
      product.images = images;
    }

    // Save changes
    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update Stock Controller **********************************************

async function updateStockController(req ,res) {
  
  try {
    const { stock } = req.body;

    const updated = await productModel.findByIdAndUpdate(
      req.params.id,
      { $set: { stock } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      product: updated
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//DELETE CONTROLLER FOR PRODUCT *******************************************************************************************
// Delete Product Controller by ID

async function deleteProductByIDController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await productModel.findOne({
      _id: id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only delete your own products" });
    }
    // Save Change for Delete
    await product.deleteOne();

    return res.status(200).json({
      message: "Product deleted",
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Get Products By Seller ****************************************************************************************************
async function getProductBySellerController(req, res) {
  try {
    const seller = req.user;
    console.log("Seller is " , seller);
    
    const { skip = 0, limit = 20 } = req.query;

    const products = await productModel
      .find({ seller: seller.id })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 20));

    return res.status(200).json({ data: products });
  } catch (err) {
    console.error("Get Products By Seller Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}



module.exports = {
  createProductContoller,
  getProductController,
  getProductByIdController,
  updateProductByIDController,
  updateStockController,
  deleteProductByIDController,
  getProductBySellerController
};
