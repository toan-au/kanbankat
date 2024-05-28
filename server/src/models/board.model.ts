import mongoose from "mongoose";
import { BoardDocument } from "../types";

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
});

const BoardModel = mongoose.model<BoardDocument>("Board", baordSchema);
export default BoardModel;
