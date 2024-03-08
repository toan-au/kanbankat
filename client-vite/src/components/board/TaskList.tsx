import { Draggable, Droppable } from "react-beautiful-dnd";
import Task from "./Task";

interface TaskType {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface TaskListProps {
  tasks: TaskType[];
  listId: string;
}

function TaskList({ tasks, listId }: TaskListProps) {
  return (
    <Droppable droppableId={listId} direction="vertical" type="TASK">
      {(provided) => (
        <ul
          className="min-h-1"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {(provided) => (
                <Task
                  task={task}
                  listId={listId}
                  innerRef={provided.innerRef}
                  provided={provided}
                />
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
}

export default TaskList;
