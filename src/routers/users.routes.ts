import express from "express";
import { body, param } from "express-validator";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserDetails,
  getUsersByCityWithAvgAge,
  updateUserDetails,
} from "../controllers/users.controllers";
import { validateRequest } from "../middlewares";
import { Gender } from "../models/users.model";

const router = express.Router();

router.post(
  "/create-user",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("firstName").isString().withMessage("First name must be a string"),
    body("lastName").isString().withMessage("Last name must be a string"),
    body("userName").optional().isString().withMessage("Username must be a string"),
    body("gender")
      .optional()
      .isIn(Object.values(Gender))
      .withMessage(`Gender must be one of ${Object.values(Gender).join(", ")}`),
    body("phoneNumber").optional().isString().withMessage("Phone number must be a string"),
    body("roles").optional().isArray().withMessage("Roles must be an array"),
    body("address.lga").optional().isString().withMessage("LGA must be a string"),
    body("address.city").optional().isString().withMessage("City must be a string"),
    body("address.state").optional().isString().withMessage("State must be a string"),
    body("dob")
      .notEmpty()
      .withMessage("Date of birth is required")
      .isISO8601()
      .withMessage("Date of birth must be a valid ISO8601 date")
      .custom((dob) => {
        const dateOfBirth = new Date(dob);
        const today = new Date();

        if (dateOfBirth >= today) {
          throw new Error("Date of birth must be in the past");
        }
        return true;
      }),
  ],
  validateRequest,
  createUser
);

router.put(
  "/update-user/:id",
  [
    param("id").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid User ID"),
    body("firstName").optional().isString().withMessage("First name must be a string"),
    body("lastName").optional().isString().withMessage("Last name must be a string"),
    body("userName").optional().isString().withMessage("Username must be a string"),
    body("age").optional().isInt({ min: 0 }).withMessage("Age must be a positive"),
    body("gender")
      .optional()
      .isIn(Object.values(Gender))
      .withMessage(`Gender must be one of ${Object.values(Gender).join(", ")}`),
    body("phoneNumber").optional().isString().withMessage("Phone number must be a string"),
    body("address.lga").optional().isString().withMessage("LGA must be a string"),
    body("address.city").optional().isString().withMessage("City must be a string"),
    body("address.state").optional().isString().withMessage("State must be a string"),
  ],
  validateRequest,
  updateUserDetails
);

router.get(
  "/get-user/:id",
  [param("id").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid User ID")],
  validateRequest,
  getUserDetails
);
router.get("/get-all-users", getAllUsers);

router.delete(
  "/delete-user/:id",
  [param("id").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid User ID")],
  validateRequest,
  deleteUser
);

router.get("/city-stats", getUsersByCityWithAvgAge);

export default router;
