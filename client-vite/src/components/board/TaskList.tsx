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
    <>
      {tasks.map((task) => (
        <Task key={task._id} task={task} listId={listId}></Task>
      ))}
    </>
  );
}

export default TaskList;
