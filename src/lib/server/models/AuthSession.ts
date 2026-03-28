import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IAuthSession extends Document {
  sessionId: string;
  userId: string;
  secret: string; // token stored in cookie

  // Optional metadata used by the existing UI
  ip?: string;
  countryName?: string;
  clientName?: string;
  clientVersion?: string;
  osName?: string;
  osVersion?: string;
  deviceName?: string;

  current?: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AuthSessionSchema = new Schema<IAuthSession>(
  {
    sessionId: { type: String, unique: true, required: true, index: true },
    userId: { type: String, required: true, index: true },
    secret: { type: String, required: true, unique: true, index: true },

    ip: { type: String, required: false },
    countryName: { type: String, required: false },
    clientName: { type: String, required: false },
    clientVersion: { type: String, required: false },
    osName: { type: String, required: false },
    osVersion: { type: String, required: false },
    deviceName: { type: String, required: false },

    current: { type: Boolean, default: false, index: true },

    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

export const AuthSessionModel: Model<IAuthSession> =
  mongoose.models.AuthSession ||
  mongoose.model<IAuthSession>("AuthSession", AuthSessionSchema);

