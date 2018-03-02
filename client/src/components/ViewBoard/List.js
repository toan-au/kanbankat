import React, { Component } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import DeleteButton from '../DeleteButton';
import NewTask from './NewTask';
import Task from './Task';

class List extends Component {
  renderTasks(tasks = []) {
    return tasks.map((task, index) => (
      <Task task={task} index={index} key={task._id} />
    ));
  }

  handleSubmit() {}

  render() {
    const { list, handleCreateTask, handleDeleteList } = this.props;
    return (
      <Droppable droppableId={list._id} type="TASK">
        {(provided, snapshot) => (
          <div
            className="list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <div className="list-header">
              <h5 onDoubleClick={() => alert('ouch!')}>{list.name}</h5>
              <DeleteButton handleClick={() => handleDeleteList(list._id)} />
            </div>
            <div className="tasks">
              {this.renderTasks(list.tasks)}
              {provided.placeholder}
              <NewTask handleSubmit={handleCreateTask} listId={list._id} />
            </div>
          </div>
        )}
      </Droppable>
    );
  }
}

export default List;
