import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

const renderBoardList = (boards = []) => {
  return (
    <ul className="list-group">
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
  return (
    <div className="container">
      <h1>Here are your boards</h1>
      {renderBoardList(props.user.boards)}
    </div>
  );
};

const mapStateToProps = state => {
  return { user: state.user };
};

export default withRouter(connect(mapStateToProps)(Boards));
