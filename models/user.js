const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boardRepSchema = new Schema({
  id: String,
  name: String
});

const userSchema = new Schema({
  googleId: String,
  boards: [boardRepSchema]
});

mongoose.model('users', userSchema);
