import React, { Component } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import DeleteButton from '../DeleteButton';
import NewTask from './NewTask';
import Task from './Task';
import EditableLabel from './EditableLabel';
import { renameList } from '../../actions/boards';

class List extends Component {
  renderTasks(tasks = []) {
    return tasks.map((task, index) => (
      <Task
        task={task}
        index={index}
        key={task._id}
        onDelete={this.handleDeleteTask.bind(this)}
        onRename={this.handleRenameTask.bind(this)}
      />
    ));
  }

  handleDeleteTask(taskId) {
    this.props.onDeleteTask(this.props.list._id, taskId);
  }

  handleRenameList(listName) {
    this.props.onRenameList(this.props.list._id, listName);
  }

  handleRenameTask(taskId, description) {
    this.props.onRenameTask(this.props.list._id, taskId, description);
  }

  render() {
    const { list, handleCreateTask, handleDeleteList, index } = this.props;
    return (
      <Draggable draggableId={list._id} type="LIST" index={index}>
        {(provided, snapshot) => (
          <div>
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Droppable droppableId={list._id} type="TASK">
                {(provided, snapshot) => (
                  <div
                    className="list"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div className="list-header">
                      <EditableLabel
                        onRename={this.handleRenameList.bind(this)}
                        label={list.name}
                      >
                        <h5>{list.name}</h5>
                      </EditableLabel>
                      <DeleteButton
                        onClick={() => handleDeleteList(list._id)}
                      />
                    </div>
                    <div className="tasks">
                      {this.renderTasks(list.tasks)}
                      {provided.placeholder}
                      <NewTask
                        handleSubmit={handleCreateTask}
                        listId={list._id}
                      />
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
            {provided.placeholder}
          </div>
        )}
      </Draggable>
    );
  }
}

export default connect(null, { renameList })(List);
