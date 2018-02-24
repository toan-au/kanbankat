const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  boards: [String]
});

mongoose.model('users', userSchema);
