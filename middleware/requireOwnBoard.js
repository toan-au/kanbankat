module.exports = (req, res, next) => {
  const match = req.user.boards.filter(b => b.id === req.params.boardId);
  console.log(match);
  match.length == 0
    ? res.status(401).send({ error: 'this is not your board' })
    : next();
};
