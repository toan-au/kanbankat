import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  getBoard,
  shiftTask,
  createList,
  createTask
} from '../../actions/boards';
import { withRouter } from 'react-router-dom';
import BackButton from '../BackButton';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import NewList from './NewList';
import NewTask from './NewTask';

class ViewBoard extends Component {
  componentDidMount() {
    this.props.getBoard(this.props.match.params.boardId);
  }

  handleCreateTask(listId, task) {
    this.props.createTask(this.props.board._id, listId, task);
  }

  handleCreateList(list) {
    this.props.createList(this.props.board._id, list);
  }

  onDragEnd(result) {
    if (result.destination == null) {
      return;
    }
    this.props.shiftTask(result);
  }

  // return list of draggable elements, index determined by order from state
  renderTasks(tasks = []) {
    return tasks.map((task, index) => (
      <Draggable
        draggableId={task._id}
        key={task._id}
        type="TASK"
        index={index}
      >
        {(provided, snapshot) => {
          const style = {
            backgroundColor: snapshot.isDragging && '#ddd',
            boxShadow:
              snapshot.isDragging &&
              //credit to material design box shadows
              '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
            ...provided.draggableProps.style
          };
          return (
            <div>
              <div
                className="task"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={style}
              >
                <p>{task.description}</p>
              </div>
              {provided.placeholder}
            </div>
          );
        }}
      </Draggable>
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
            <h5 className="list-header">{list.name}</h5>
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
        <div className="ViewBoard container-fluid">
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

export default withRouter(
  connect(mapStateToProps, { getBoard, shiftTask, createList, createTask })(
    ViewBoard
  )
);
