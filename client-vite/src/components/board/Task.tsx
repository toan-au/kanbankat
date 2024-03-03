import { FaPen } from "react-icons/fa6";

interface Task {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface TaskProps {
  task: Task;
}

function Task({ task }: TaskProps) {
  return (
    <div
      className="flex bg-slate-100 px-0.5 py-1 my-1 rounded-sm items-start"
      key={task._id}
    >
      <div className="flex-1 leading-6 break-words max-w-[calc(100%-20px)]">
        {task.content}
      </div>
      <button className="ml-auto p-0.5 text-slate-400">
        <FaPen />
      </button>
    </div>
  );
}

export default Task;
