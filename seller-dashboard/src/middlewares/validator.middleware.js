const { body, validationResult } = require("express-validator");

const validationResults = (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register Validator
const registerUserValidator = [
  body("username").isString().notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("fullName.firstName")
    .isString()
    .notEmpty()
    .withMessage("First name is required"),
  body("fullName.lastName")
    .isString()
    .notEmpty()
    .withMessage("Last name is required"),
  validationResults,
];


// Login Validator

const loginUserValidator = [
  // Either email or username allowed
  body("email").optional().isEmail().withMessage("Valid email is required"),

  body("username")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  (req, res, next) => {
    // Custom rule: At least one of email or username required
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({
        errors: [{ msg: "Either email or username is required" }],
      });
    }

    validationResults(req, res, next); // ✅ FIXED LINE
  },
];

// Add user Address ***************************************************

const addUserAddressValidations = [
    body('street')
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street is required'),
    body('city')
        .isString()
        .withMessage('City must be a string')
        .notEmpty()
        .withMessage('City is required'),
    body('state')
        .isString()
        .withMessage('State must be a string')
        .notEmpty()
        .withMessage('State is required'),
    body('zip')
        .isString()
        .withMessage('Pincode must be a string')
        .notEmpty()
        .withMessage('Pincode is required')
        .bail()
        .matches(/^\d{4,}$/)
        .withMessage('Pincode must be at least 4 digits'),
    body('country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
    body('phone')
        .optional()
        .isString()
        .withMessage('Phone must be a string')
        .bail()
        .matches(/^\d{10}$/)
        .withMessage('Phone must be a valid 10-digit number'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be a boolean'),
    validationResults
]


module.exports = {
  registerUserValidator,
  loginUserValidator,
  addUserAddressValidations
};
