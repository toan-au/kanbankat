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

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "",
});

function TaskList({ tasks, listId }: TaskListProps) {
  return (
    <Droppable droppableId={listId} direction="vertical" type="TASK">
      {(provided, snapshot) => (
        <ul
          className="min-h-10"
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}
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
