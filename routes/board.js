const mongoose = require('mongoose');

const Board = mongoose.model('boards');

module.exports = app => {
  app.get('/board/new', (req, res) => {});
};
