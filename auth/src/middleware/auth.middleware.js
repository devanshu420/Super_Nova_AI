const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {

  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access , no token provided",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded data : " , decoded);
    
    const user = decoded;
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};

module.exports = authMiddleware;
