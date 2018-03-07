import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { createBoard } from '../../actions/boards';
import { getUser } from '../../actions/user';
import NewBoard from './NewBoard';

const renderBoardList = (boards = []) => {
  return (
    <ul className="list-group mb-3">
      {boards.map(board => {
        return (
          <Link
            to={'/board/' + board.id}
            key={board.id}
            className="list-group-item clearfix"
          >
            {board.name}
          </Link>
        );
      })}
    </ul>
  );
};

const Boards = props => {
  const { user, createBoard, getUser } = props;
  const handleCreateBoard = async board => {
    await createBoard(board);

    // update the list of boards by retrieving user's list form api
    getUser();
  };
  return (
    <div className="container">
      <h1>Here are your boards</h1>
      {renderBoardList(user.boards)}
      <NewBoard handleCreateBoard={handleCreateBoard} />
    </div>
  );
};

const mapStateToProps = state => {
  return { user: state.user };
};

export default withRouter(
  connect(mapStateToProps, { createBoard, getUser })(Boards)
);
