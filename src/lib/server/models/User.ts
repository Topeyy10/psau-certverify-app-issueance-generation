import mongoose, { type Document, type Model, Schema } from "mongoose";

export type UserRole = "admin" | "issuer" | "user";

export interface IUser extends Document {
  userId: string;
  email: string;
  name: string;
  labels: UserRole[];
  status: boolean; // true = active, false = blocked
  emailVerification: boolean;
  passwordHash: string;
  prefs: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, unique: true, required: true, index: true },
    email: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, index: true },
    labels: { type: [String], required: true, default: ["user"] },
    status: { type: Boolean, required: true, default: true, index: true },
    emailVerification: { type: Boolean, required: true, default: false, index: true },
    passwordHash: { type: String, required: true },
    prefs: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const UserModel: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

