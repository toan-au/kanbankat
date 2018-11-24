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
      <div className="grid">
        {boards.map(board => {
          return (
            <div className="">
              <div className="board-card card clearfix ">
                <div className="card-body">
                  <h5 className="card-title">{board.name}</h5>
                  <div className="card-text">{console.log(board)}</div>
                  <button className="btn btn-danger pull-left">Delete</button>
                  <Link to={'/board/' + board.id} key={board.id}>
                    <button className="btn btn-primary pull-right">View</button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        <NewBoard handleCreateBoard={this.handleCreateBoard} />
      </div>
    );
  };

  render() {
    const { user, getUser } = this.props;

    return (
      <div className="Boards">
        <div className="container">
          <h2 className="title mb-3">My boards</h2>
          {this.renderBoardList(user.boards)}
        </div>
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
