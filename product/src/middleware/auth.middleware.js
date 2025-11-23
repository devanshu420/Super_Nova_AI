const jwt = require("jsonwebtoken");

function createAuthMiddleware(role = ["seller"]) {
  return function authMiddleware(req, res, next) {
    const token =
      req.cookies?.token || req.headers?.authorization?.split(" ")[1];
    console.log(token);

    if (!token) {
      return res.status(401).json({
        token,
        message: "Unauthorized , No token Provided",
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET || " ");
      console.log(decode.role);
      

      if (!role.includes(decode.role)) {
        return res.status(403).json({
          message: "Forbidden , Insufficien Permission -> Role Incrorrect",
          role
        });
      }

      req.user = decode;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Unauthrize : Access Denied -> Invalid Token ",
      });
    }
  };
}

module.exports = createAuthMiddleware;
