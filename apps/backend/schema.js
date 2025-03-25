import { body, param, validationResult } from "express-validator";

export const create_body = [
  body("wallet_address")
    .isString()
    .notEmpty()
    .withMessage("Wallet address is required"),
];
export const get_body = [
  param("id")
    .isString()
    .notEmpty()
    .withMessage("Wallet address is required"),
];

export const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error in validating request", status: false });
  }
};
