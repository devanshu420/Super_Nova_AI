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
async function updateProductByIDController(req, res) {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    // Extract fields to update
    const { title, description, priceAmount, priceCurrency, stock } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (stock !== undefined) updateData.stock = Number(stock);

    // Handle price update
    if (priceAmount || priceCurrency) {
      updateData.price = {};
      if (priceAmount) updateData.price.amount = Number(priceAmount);
      if (priceCurrency) updateData.price.currency = priceCurrency;
    }

    // Handle Images (optional)
   if (req.files && req.files.length > 0) {
  const images = await Promise.all(
    req.files.map((file) =>
      uploadImage({
        buffer: file.buffer,
      })
    )
  );
  updateData.images = images; 
}


    // Update product only if seller matches
    const updatedProduct = await productModel.findOneAndUpdate(
      { _id: id, seller: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized user" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}




module.exports = {
  createProductContoller,
  getProductController,
  getProductByIdController,
  updateProductByIDController,
};
