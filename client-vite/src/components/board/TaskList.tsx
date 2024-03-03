import Task from "./Task";

interface TaskType {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface TaskListProps {
  tasks: TaskType[];
}

function TaskList({ tasks }: TaskListProps) {
  return (
    <>
      {tasks.map((task) => (
        <Task key={task._id} task={task}></Task>
      ))}
    </>
  );
}

export default TaskList;
