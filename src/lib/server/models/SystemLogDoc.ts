import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ISystemLog extends Document {
  userId: string;
  userFullName: string;
  /** Primary app role for this actor: admin | issuer | user | unknown */
  userRole: string;
  actionRaw: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: string;
  ipAddress: string;
  browser: string;
  os: string;
  device: string;
  timestamp: Date;
}

const SystemLogSchema = new Schema<ISystemLog>(
  {
    userId: { type: String, required: true, index: true },
    userFullName: { type: String, required: true },
    userRole: { type: String, required: true, index: true, default: "unknown" },
    actionRaw: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    metadata: { type: String, required: true },
    ipAddress: { type: String, required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    device: { type: String, required: true },
    timestamp: { type: Date, required: true, index: true },
  },
  { timestamps: false },
);

export const SystemLogModel: Model<ISystemLog> =
  mongoose.models.SystemLogDoc ||
  mongoose.model<ISystemLog>("SystemLogDoc", SystemLogSchema);
