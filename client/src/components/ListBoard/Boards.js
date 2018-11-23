import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { createBoard, deleteBoard } from '../../actions/boards';
import { getUser } from '../../actions/user';
import NewBoard from './NewBoard';
import DeleteButton from '../DeleteButton';

class Boards extends Component {
  handleDeleteBoard = async boardId => {
    const deleteConfirm = window.confirm(
      'Are you sure you want to delete this board? This cannot be undone'
    );
    deleteConfirm && (await this.props.deleteBoard(boardId));

    // refresh list of boards
    this.props.getUser();
  };

  handleCreateBoard = async board => {
    await this.props.createBoard(board);

    // update the list of boards by retrieving user's list form api
    this.props.getUser();
  };

  renderBoardList = (boards = []) => {
    return (
      <ul className="list-group mb-3">
        {boards.map(board => {
          return (
            <Link to={'/board/' + board.id} key={board.id}>
              <li className="list-group-item clearfix">
                {board.name}
                <DeleteButton
                  onClick={() => this.handleDeleteBoard(board.id)}
                />
              </li>
            </Link>
          );
        })}
      </ul>
    );
  };

  render() {
    const { user, getUser } = this.props;

    return (
      <div className="container Boards">
        <h2 className="title">My boards</h2>
        {this.renderBoardList(user.boards)}
        <NewBoard handleCreateBoard={this.handleCreateBoard} />
      </div>
    );
  }
}
const mapStateToProps = state => {
  return { user: state.user };
};

export default withRouter(
  connect(
    mapStateToProps,
    { createBoard, getUser, deleteBoard }
  )(Boards)
);
