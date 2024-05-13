const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  name: { type: String, max: 255 },
  content: { type: String, max: 10_000 },
  color: { type: String, default: "none" },
});

const ListSchema = new Schema({
  name: { type: String, required: true, max: 255 },
  tasks: [TaskSchema],
  deleted: { type: Boolean, required: false, default: false },
  deletedOn: { type: Date },
});

const BoardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true, max: 255 },
  about: { type: String, required: false, default: "" },
  lists: [ListSchema],
  deleted: { type: Boolean, required: false, default: false },
  deletedOn: { type: Date },
});

mongoose.model("Board", BoardSchema);
