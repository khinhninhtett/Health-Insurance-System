import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_key_prod"
      );

      // Attach authenticated user to request
      req.user = decoded;

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Invalid or expired token.",
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Access denied. Authorization token is required.",
  });
};

export default protect;