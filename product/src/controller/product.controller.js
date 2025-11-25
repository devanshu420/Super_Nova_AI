const productModel = require("../model/product.model");

const { uploadImage } = require("../services/imagekit.service");

// Create Product Controller
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
    console.log("Filter for search -> ",filter);
    
    const products = await productModel
      .find(filter)
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 20));

    return res.status(200).json({ data: products });
  
}




module.exports = {
  createProductContoller,
  getProductController,
};
