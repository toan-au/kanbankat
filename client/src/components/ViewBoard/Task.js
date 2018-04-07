import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import DeleteButton from '../DeleteButton';

const Task = props => {
  const { task, index, onDelete } = props;

  const handleDelete = taskId => {
    onDelete(taskId);
  };

  return (
    <Draggable draggableId={task._id} type="TASK" index={index}>
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
              className="Task"
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={style}
            >
              <div>
                <div style={{ position: 'relative' }}>
                  <DeleteButton onClick={() => handleDelete(task._id)} />
                </div>
                <p>{task.description}</p>
              </div>
            </div>
            {provided.placeholder}
          </div>
        );
      }}
    </Draggable>
  );
};

export default Task;
