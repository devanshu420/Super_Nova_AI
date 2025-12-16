const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");

// Import user model
const userModel = require("../model/user.model");

// Import Redis
const redis = require("../db/redis");

// Import Queue
const { publishToQueue } = require("../broker/broker");

// User Registration Controller ***************************************************************************************************
const registerController = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName: { firstName, lastName },
      address,
      role,
    } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (isUserAlreadyExists) {
      return res.status(409).json({
        success: false,
        message: "User with given username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName: { firstName, lastName },
      username,
      email,
      password: hashedPassword,
      address: address,
      role: role,
    });

    // // For Notification
    // await Promise.all([
    //   publishToQueue("AUTH_NOTIFICATION.USER_CREATED", {
    //     id: user._id,
    //     username: user.username,
    //     email: user.email,
    //     fullName: {
    //       firstName: user.fullName.firstName,
    //       lastName: user.fullName.lastName,
    //     },
    //   }),
    //   publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", {
    //     id: user._id,
    //     username: user.username,
    //     email: user.email,
    //     role: user.role,
    //     address: user.address,
    //     fullName: {
    //       firstName: user.fullName.firstName,
    //       lastName: user.fullName.lastName,
    //     },
    //   }),
    // ]);
    

    // Always send notification to AUTH_NOTIFICATION
await publishToQueue("AUTH_NOTIFICATION.USER_CREATED", {
  id: user._id,
  username: user.username,
  email: user.email,
  fullName: {
    firstName: user.fullName.firstName,
    lastName: user.fullName.lastName,
  },
});

// Only send to seller dashboard if role === "seller"
if (user.role === "seller") {
  await publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    address: user.address,
    fullName: {
      firstName: user.fullName.firstName,
      lastName: user.fullName.lastName,
    },
  });
}

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        address: user.address,
        token: token,
      },
    });
  } catch (err) {
    console.error("Error in registerController:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//User Login Controller ***************************************************************************************************
const loginController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // find user with password selected
    const user = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
      },
    });
  } catch (err) {
    console.error("Error in loginUser:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get Current User Controller ***************************************************************************************************
const getCurrentUserController = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: req.user,
    });
  } catch (err) {
    console.error("Error in getCurrentUserController:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Logout User Controller ***********************************************************************************************

const logOutUserController = async (req, res) => {
  // const token = req.cookie.token;
  const token = req.cookies?.token;

  if (token) {
    //Blacklist from Redis
    await redis.set(`blacklist:${token}`, "true", "EX", 24 * 60 * 60);
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });

  return res.status(200).json({
    message: "Logged Out Successfully ",
  });
};

module.exports = {
  registerController,
  loginController,
  getCurrentUserController,
  logOutUserController,
};
