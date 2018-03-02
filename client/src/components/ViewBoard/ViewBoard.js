import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/boards';
import { withRouter } from 'react-router-dom';
import BackButton from '../BackButton';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import NewList from './NewList';
import NewTask from './NewTask';
import DeleteButton from '../DeleteButton';
import Task from './Task';
import List from './List';

const { getBoard, shiftTask, createList, createTask, deleteList } = actions;
class ViewBoard extends Component {
  componentDidMount() {
    this.props.getBoard(this.props.match.params.boardId);
  }

  // Handler methods for interactive elements

  handleCreateTask(listId, task) {
    this.props.createTask(this.props.board._id, listId, task);
  }

  handleCreateList(list) {
    this.props.createList(this.props.board._id, list);
  }

  handleDeleteList(listId) {
    const response = window.confirm(
      'Are you sure you want to delete this list?'
    );
    response && this.props.deleteList(this.props.board._id, listId);
  }

  // -- end handler methods --

  // required method for react-beautiful-dnd
  onDragEnd(result) {
    if (result.destination == null) {
      return;
    }
    this.props.shiftTask(result);
  }

  renderLists(lists = []) {
    return lists.map(list => (
      <List
        list={list}
        key={list._id}
        handleCreateTask={this.handleCreateTask.bind(this)}
        handleDeleteList={this.handleDeleteList.bind(this)}
      />
    ));
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <div className="ViewBoard container-full">
          <div className="container">
            <BackButton />
            <h1>{this.props.board.name}</h1>
          </div>
          <div className="lists">
            {this.renderLists(this.props.board.lists)}
            <NewList handleSubmit={this.handleCreateList.bind(this)} />
          </div>
        </div>
      </DragDropContext>
    );
  }
}

const mapStateToProps = state => {
  return { board: state.board };
};

export default withRouter(connect(mapStateToProps, actions)(ViewBoard));
