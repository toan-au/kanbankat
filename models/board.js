const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  description: { type: String, max: 255 },
  color: { type: String, default: 'none' }
});

const ListSchema = new Schema({
  name: { type: String, required: true, max: 255 },
  tasks: [TaskSchema]
});

const BoardSchema = new Schema({
  name: { type: String, required: true, max: 255 },
  lists: [ListSchema]
});

mongoose.model('boards', BoardSchema);
