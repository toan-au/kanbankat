import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import EditableLabel from './EditableLabel';
import DropDown from '../DropDown';

const Task = props => {
  const { task, index, onDelete, onRename, onTag } = props;

  const handleDelete = () => {
    onDelete(task._id);
  };

  const handleRename = description => {
    onRename(task._id, description);
  };

  const handleTag = color => {
    onTag(task._id, color);
  };

  const renderColorOptions = () => {
    const colors = ['none', 'green', 'red', 'blue', 'purple'];
    return colors.map(c => (
      <a key={c} className={'dropdown-item ' + c} onClick={() => handleTag(c)}>
        Tag {c}
      </a>
    ));
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
              className={'Task ' + task.color}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={style}
            >
              <div>
                <div style={{ position: 'relative' }}>
                  <DropDown>
                    <a className="dropdown-item" onClick={handleDelete}>
                      Delete
                    </a>
                    <div className="dropdown-divider" />
                    {renderColorOptions()}
                  </DropDown>
                </div>
                <EditableLabel label={task.description} onRename={handleRename}>
                  <p>{task.description}</p>
                </EditableLabel>
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
