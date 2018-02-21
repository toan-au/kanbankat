const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  name: { type: String, required: true, max: 100 },
  description: { type: String, max: 255 },
  order: Number,
  description: String
});

const ListSchema = new Schema({
  name: { type: String, required: true, max: 255 },
  order: Number,
  numTasks: { default: 0, type: Number },
  tasks: [TaskSchema]
});

const BoardSchema = new Schema({
  name: { type: String, required: true, max: 255 },
  numLists: { default: 0, type: Number },
  lists: [ListSchema]
});

mongoose.model('boards', BoardSchema);
