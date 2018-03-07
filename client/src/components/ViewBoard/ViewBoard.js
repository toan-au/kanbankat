import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/boards';
import { withRouter } from 'react-router-dom';
import BackButton from '../BackButton';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import NewList from './NewList';
import List from './List';

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
    // if dropped outside of droppable element then return
    // decide whether a TASK or LIST was shifted and use appropriate action creator
    if (result.destination == null) {
      return;
    } else if (result.type === 'TASK') {
      this.props.shiftTask(result);
    } else if (result.type === 'LIST') {
      this.props.shiftList(result);
    }
  }

  renderLists(lists = []) {
    return lists.map((list, index) => (
      <List
        list={list}
        key={list._id}
        index={index}
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
          <Droppable
            droppableId={this.props.match.params.boardId}
            type="LIST"
            direction="horizontal"
          >
            {(provided, snapshot) => (
              <div ref={provided.innerRef} type="LIST" className="lists">
                {provided.placeholder}
                {this.renderLists(this.props.board.lists)}
                <NewList handleSubmit={this.handleCreateList.bind(this)} />
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    );
  }
}

const mapStateToProps = state => {
  return { board: state.board };
};

export default withRouter(connect(mapStateToProps, actions)(ViewBoard));
