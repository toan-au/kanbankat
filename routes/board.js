const mongoose = require('mongoose');

const Board = mongoose.model('boards');

module.exports = app => {
  app.get('/board/new', async (req, res) => {
    const { name } = req.body;
    const board = await new Board({ name });
    res.send(board);
  });
};
