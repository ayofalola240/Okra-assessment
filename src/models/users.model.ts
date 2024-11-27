import mongoose from "mongoose";

enum UserRole {
  User = "user",
  Admin = "admin",
}

enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

// Interface for User attributes (input data)
interface UserAttrs {
  email: string;
  firstName: string;
  lastName: string;
  userName?: string;
  age?: number;
  phoneNumber?: string;
  gender?: Gender;
  dob: Date;
  roles?: UserRole[];
  address?: {
    lga: string;
    city: string;
    state: string;
  };
}

// Interface for User Model
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Interface for User Document (what's stored in MongoDB)
interface UserDoc extends mongoose.Document {
  email: string;
  firstName: string;
  lastName: string;
  userName?: string;
  dob: Date;
  age?: number;
  phoneNumber?: string;
  gender?: Gender;
  roles?: UserRole[];
  address?: {
    lga: string;
    city: string;
    state: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    age: Number,
    userName: String,
    phoneNumber: String,
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.User],
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.Other,
    },
    address: {
      lga: String,
      city: String,
      state: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// Pre-Save Hook
userSchema.pre("save", async function (next) {
  const user = this as unknown as UserDoc;

  try {
    // Format phone number
    const phoneNumber = user.phoneNumber;
    if (phoneNumber && phoneNumber.startsWith("0") && phoneNumber.length === 11) {
      user.phoneNumber = `234${phoneNumber.slice(1)}`;
    }

    // Calculate and set age based on DOB
    if (user.dob) {
      const now = new Date();
      const age = now.getFullYear() - user.dob.getFullYear();
      const monthDiff = now.getMonth() - user.dob.getMonth();

      // Adjust age if the current date is before the user's birthday
      user.age = monthDiff < 0 || (monthDiff === 0 && now.getDate() < user.dob.getDate()) ? age - 1 : age;
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Static build method for User model
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User, UserDoc, UserRole, Gender };
