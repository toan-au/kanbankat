import React from 'react';
import { connect } from 'react-redux';

const renderBoardList = (boards = []) => {
  return (
    <ul className="list-group">
      {boards.map(board => {
        return (
          <li className="list-group-item" key={board}>
            {board}
          </li>
        );
      })}
    </ul>
  );
};

const Boards = props => {
  return (
    <div className="container">
      <h1>Here are your boards</h1>
      {console.log(props.user)}
      {renderBoardList(props.user.boardNames)}
    </div>
  );
};

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps)(Boards);
