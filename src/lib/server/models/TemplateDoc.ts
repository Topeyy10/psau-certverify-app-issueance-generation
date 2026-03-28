import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ITemplate extends Omit<Document, "_id"> {
  _id: string;
  author: string;
  name: string;
  coverFileId: string;
  jsonFileId: string;
  width: number;
  height: number;
  paper: string;
  isPortrait: unknown;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    _id: { type: String, required: true },
    author: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    coverFileId: { type: String, required: true },
    jsonFileId: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    paper: { type: String, required: true },
    isPortrait: { type: Schema.Types.Mixed, required: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const TemplateModel: Model<ITemplate> =
  mongoose.models.TemplateDoc ||
  mongoose.model<ITemplate>("TemplateDoc", TemplateSchema);
