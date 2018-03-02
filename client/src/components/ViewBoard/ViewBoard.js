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

  handleDeleteList(boardId, listId) {
    const response = window.confirm(
      'Are you sure you want to delete this list?'
    );
    response && this.props.deleteList(boardId, listId);
  }

  // -- end handler methods --

  // required method for react-beautiful-dnd
  onDragEnd(result) {
    if (result.destination == null) {
      return;
    }
    this.props.shiftTask(result);
  }

  // return list of draggable elements, index determined by order from state
  renderTasks(tasks = []) {
    return tasks.map((task, index) => (
      <Task task={task} index={index} key={task._id} />
    ));
  }

  renderLists(lists = []) {
    return lists.map(list => (
      <Droppable droppableId={list._id} key={list._id} type="TASK">
        {(provided, snapshot) => (
          <div
            className="list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <div className="list-header">
              <h5 onDoubleClick={() => alert('ouch!')}>{list.name}</h5>
              <DeleteButton
                handleClick={() =>
                  this.handleDeleteList(this.props.board._id, list._id)
                }
              />
            </div>
            <div className="tasks">
              {this.renderTasks(list.tasks)}
              {provided.placeholder}
              <NewTask
                handleSubmit={this.handleCreateTask.bind(this)}
                listId={list._id}
              />
            </div>
          </div>
        )}
      </Droppable>
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
