import mongoose, { type Document, type Model, Schema } from "mongoose";

/** String `_id` (certificate id from client); omit default ObjectId typing from Document. */
export interface ICertificate extends Omit<Document, "_id"> {
  _id: string;
  issuer: string;
  recipientFullName: string;
  recipientEmail: string;
  fileId: string;
  status: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    _id: { type: String, required: true },
    issuer: { type: String, required: true, index: true },
    recipientFullName: { type: String, required: true, index: true },
    recipientEmail: { type: String, required: true },
    fileId: { type: String, required: true },
    status: { type: String, required: true, default: "0", index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const CertificateModel: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);
