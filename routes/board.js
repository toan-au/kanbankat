const mongoose = require('mongoose');

const Board = mongoose.model('boards');

// TODO:
//  get all user's boards
//  get specific board      X
//  delete board            X
//  delete list             X
//  delete task             X
//  update list
//  update task
//  move task
//  move list

module.exports = app => {
  // *************
  // BOARD STUFF
  // *************
  app.post('/board/new', async (req, res) => {
    const { name } = req.body;
    const board = await new Board({ name }).save();
    res.send(board);
  });

  app.get('/board/:boardId', async (req, res) => {
    const board = await Board.findById(req.params.boardId);
    res.send(board);
  });

  app.delete('/board/:boardId', async (req, res) => {
    const board = await Board.find(req.params.boardId);
    res.send(board);
  });

  // *************
  // LIST STUFF
  // *************

  app.post('/board/list/:boardId/', async (req, res) => {
    const { name } = req.body;
    let board = await Board.findById(req.params.boardId);

    // add a list then subtract 1 from numLists
    board.lists.push({ name, order: board.numLists });
    board.numLists++;
    board = await board.save();
    res.send(board);
  });

  app.delete('/board/list/:boardId/:listId', async (req, res) => {
    const { boardId, listId } = req.params;
    let board = await Board.findById(boardId);

    // remove list then subtract form numLists
    board.lists.id(listId).remove();
    board.numLists--;
    board = await board.save();
    res.send(board);
  });

  // *************
  // TASK STUFF
  // *************

  app.post('/board/task/:boardId/:listId', async (req, res) => {
    const { name, description } = req.body;
    const { boardId, listId } = req.params;
    let board = await Board.findById(boardId);
    const list = await board.lists.id(listId);

    // push new task increment counter
    list.tasks.push({ name, description });
    list.numTasks++;
    board = await board.save();
    res.send(board);
  });

  app.delete('/board/task/:boardId/:listId/:taskId', async (req, res) => {
    const { boardId, listId, taskId } = req.params;
    let board = await Board.findById(boardId);
    const list = board.lists.id(listId);

    // remove a task decrement counter
    list.tasks.id(taskId).remove();
    list.numTasks--;
    board = await board.save();
    res.send(board);
  });
};
