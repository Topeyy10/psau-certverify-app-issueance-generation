import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IEmailVerificationToken extends Document {
  userId: string;
  secret: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt?: Date;
}

const EmailVerificationTokenSchema =
  new Schema<IEmailVerificationToken>(
    {
      userId: { type: String, required: true, index: true },
      secret: { type: String, required: true, unique: true, index: true },
      expiresAt: { type: Date, required: true, index: true },
      usedAt: { type: Date, required: false },
    },
    { timestamps: true },
  );

export const EmailVerificationTokenModel: Model<IEmailVerificationToken> =
  mongoose.models.EmailVerificationToken ||
  mongoose.model<IEmailVerificationToken>(
    "EmailVerificationToken",
    EmailVerificationTokenSchema,
  );

