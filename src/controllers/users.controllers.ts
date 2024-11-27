import { Request, Response, NextFunction } from "express";
import { User } from "../models/users.model";
import { BadRequestError, NotFoundError } from "../errors";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, dob, phoneNumber, roles, gender, address } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }
    // Create the user
    const user = User.build({ email, firstName, lastName, dob, phoneNumber, gender, roles, address });
    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    const errorMessage = error instanceof Error ? error.message : "Error creating user";
    next(new BadRequestError(errorMessage));
  }
};

export const updateUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;

    // Allowed fields for update
    const allowedFields = ["firstName", "lastName", "phoneNumber", "userName", "address", "gender"];
    const user = await User.findById(userId);

    if (!user) {
      throw new BadRequestError("User not found");
    }

    // Update allowed fields
    allowedFields.forEach((field) => {
      if (field === "address" && req.body.address) {
        // Merge existing address with the new properties
        user.address = {
          ...user.address,
          ...req.body.address,
        };
      } else if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });
    await user.save();
    res.status(200).json({ message: "User details updated successfully", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    const errorMessage = error instanceof Error ? error.message : "Error updating user details";
    next(new BadRequestError(errorMessage));
  }
};

export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError();
    }
    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.log("Error retrieving user:", JSON.stringify(error));
    const errorMessage = error instanceof Error ? error.message : "Error retrieving user:";
    next(new BadRequestError(errorMessage));
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const users = await User.find().skip(skip).limit(limit);

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      message: "Users fetched successfully",
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : "Error deleting user";
    next(new BadRequestError(errorMessage));
  }
};

export const getUsersByCityWithAvgAge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await User.aggregate([
      {
        $group: {
          _id: "$address.city", // Group by city
          averageAge: { $avg: "$age" }, // Calculate average age
          totalUsers: { $sum: 1 }, // Count users
          users: {
            $push: {
              name: { $concat: ["$firstName", " ", "$lastName"] }, // Combine first and last name
              city: "$address.city",
              gender: "$gender",
              age: "$age",
            },
          },
        },
      },
      { $sort: { totalUsers: -1 } }, // Sort by total users descending
      {
        $project: {
          city: "$_id", // Rename _id to city
          averageAge: 1,
          totalUsers: 1,
          users: 1,
          _id: 0, // Exclude _id from the final output
        },
      },
    ]);

    res.status(200).json({
      message: "City statistics fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error in aggregation:", error);
    next(error);
  }
};
