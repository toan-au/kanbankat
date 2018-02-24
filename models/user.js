const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  boardIds: [String],
  boardNames: [String]
});

mongoose.model('users', userSchema);
