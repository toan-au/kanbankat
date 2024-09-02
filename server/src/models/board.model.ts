import mongoose from "mongoose";
import Label from "./label.model";
import { BoardDocument } from "../types";

const defaultLabels = [
  { text: "Label 1", hexColour: "#2196F3" }, // Blue
  { text: "Label 2", hexColour: "#4CAF50" }, // Green
  { text: "Label 3", hexColour: "#FF9800" }, // Orange
  { text: "Label 4", hexColour: "#F44336" }, // Red
  { text: "Label 5", hexColour: "#9C27B0" }, // Purple
  { text: "Label 6", hexColour: "#673AB7" }, // Deep Purple
];

const taskSchema = new mongoose.Schema({
  name: { type: String, max: 255 },
  content: { type: String, max: 10_000 },
  color: { type: String, default: "none" },
});

const listSchema = new mongoose.Schema({
  name: { type: String, required: true, max: 255 },
  tasks: [taskSchema],
  deleted: { type: Boolean, required: false, default: false },
  deletedOn: { type: Date },
});

const baordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true, max: 255 },
  about: { type: String, required: false, default: "" },
  lists: [listSchema],
  deleted: { type: Boolean, required: false, default: false },
  deletedOn: { type: Date },
  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
    },
  ],
});

baordSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const labels = await Label.insertMany(
        defaultLabels.map((label) => ({ ...label, board: this._id }))
      );

      // Add the label IDs to the user's labels array
      this.labels = labels.map((label) => label._id);
      next();
    }
  } catch (err: any) {
    return next(err);
  }
});

baordSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await Label.deleteMany({ user: this._id });
    next();
  }
);

const BoardModel = mongoose.model<BoardDocument>("Board", baordSchema);
export default BoardModel;
