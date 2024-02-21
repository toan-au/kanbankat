const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  description: { type: String, max: 255 },
  color: { type: String, default: "none" },
});

const ListSchema = new Schema({
  name: { type: String, required: true, max: 255 },
  tasks: [TaskSchema],
});

const def =
  "Double click to edit text. You can edit tasks, list names, and this about section!";
const BoardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true, max: 255 },
  about: { type: String, required: false, default: def },
  lists: [ListSchema],
  deleted: { type: Boolean, required: false, default: false },
  deletedOn: { type: Date },
});

mongoose.model("Board", BoardSchema);
