const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');

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
  app.get('/api/test', (req, res) => res.send({ test: true }));
  // *************
  // BOARD STUFF
  // *************

  // create a new board
  app.post('/api/board', requireLogin, async (req, res) => {
    const { name } = req.body;
    const board = await new Board({ name }).save();

    // attach board to user then persist to DB
    req.user.boardIds.push(board._id);
    req.user.boardNames.push(board.name);
    await req.user.save();
    res.send(board);
  });

  // get list of user's boards
  app.get('/api/boards', async (req, res) => {
    const boards = await Board.find({ _id: { $in: req.user.boardIds } });
    res.send(boards);
  });

  // get a specific board
  app.get('/api/board/:boardId', requireLogin, async (req, res) => {
    const board = await Board.findById(req.params.boardId);
    res.send(board);
  });

  // delete a board
  app.delete('/api/board/:boardId', requireLogin, async (req, res) => {
    console.log(req.params.boardId);
    const board = await Board.findByIdAndRemove(req.params.boardId);
    // remove id from boardIds
    let idx = req.user.boardIds.indexOf(board._id);
    req.user.boardIds.splice(idx, 1);

    // remove name from boardNames
    idx = req.user.boardNames.indexOf(board.name);
    req.user.boardNames.splice(idx, 1);

    const user = await req.user.save();
    res.send(user);
  });

  // *************
  // LIST STUFF
  // *************

  // create a new list
  app.post('/api/board/list/:boardId/', async (req, res) => {
    const { name } = req.body;
    let board = await Board.findById(req.params.boardId);

    // add a list then subtract 1 from numLists
    board.lists.push({ name, order: board.numLists });
    board.numLists++;
    board = await board.save();
    res.send(board);
  });

  // delete a list
  app.delete('/api/board/list/:boardId/:listId', async (req, res) => {
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

  // create a new task
  app.post('/api/board/task/:boardId/:listId', async (req, res) => {
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

  // delete a task
  app.delete('/api/board/task/:boardId/:listId/:taskId', async (req, res) => {
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
