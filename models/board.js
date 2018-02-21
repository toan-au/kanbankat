const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  name: String,
  order: Number,
  description: String
});

const ListSchema = new Schema({
  name: String,
  order: Number,
  tasks: [TaskSchema]
});

const BoardSchema = new Schema({
  name: String,
  lists: [ListSchema]
});

mongoose.model('boards', BoardSchema);
