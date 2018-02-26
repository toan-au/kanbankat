import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const renderBoardList = (boards = []) => {
  return (
    <ul className="list-group">
      {boards.map(board => {
        return (
          <Link
            to={'/board/' + board.id}
            key={board.id}
            className="list-group-item"
          >
            {board.name}
          </Link>
        );
      })}
    </ul>
  );
};

const Boards = props => {
  return (
    <div className="container">
      <h1>Here are your boards</h1>
      <Link to="/aye/123">click me</Link>
      {console.log(props.user)}
      {renderBoardList(props.user.boards)}
    </div>
  );
};

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps)(Boards);
