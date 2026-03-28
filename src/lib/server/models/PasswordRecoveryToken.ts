import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IPasswordRecoveryToken extends Document {
  userId: string;
  secret: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt?: Date;
}

const PasswordRecoveryTokenSchema =
  new Schema<IPasswordRecoveryToken>(
    {
      userId: { type: String, required: true, index: true },
      secret: { type: String, required: true, unique: true, index: true },
      expiresAt: { type: Date, required: true, index: true },
      usedAt: { type: Date, required: false },
    },
    { timestamps: true },
  );

export const PasswordRecoveryTokenModel: Model<IPasswordRecoveryToken> =
  mongoose.models.PasswordRecoveryToken ||
  mongoose.model<IPasswordRecoveryToken>(
    "PasswordRecoveryToken",
    PasswordRecoveryTokenSchema,
  );

