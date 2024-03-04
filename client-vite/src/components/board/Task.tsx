import { useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
import Submenu from "../UI/submenu/Submenu";
import IconMenuButton from "../UI/submenu/IconMenuButton";
import { useDetectClickOutside } from "react-detect-click-outside";

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
  const [showMenu, setShowMenu] = useState(false);
  const parentRef = useDetectClickOutside({
    onTriggered: handleOutsideClick,
  });

  function handleOutsideClick() {
    setShowMenu(false);
  }

  function handleShowMenu() {
    setShowMenu(!showMenu);
  }

  function handleRenameClick() {}

  function handleDeleteClick() {}

  return (
    <>
      <div
        className="relative flex bg-slate-100 px-0.5 py-1 my-1 rounded-sm items-start group"
        key={task._id}
        ref={parentRef}
      >
        <div className="flex-1 leading-6 break-words max-w-[calc(100%-20px)]">
          {task.content}
        </div>
        <button
          className="text-transparent ml-auto p-0.5 group-hover:text-slate-400"
          onClick={handleShowMenu}
        >
          <FaPen />
        </button>
        {showMenu && (
          <Submenu showMenu={showMenu} horizontalOffset={248}>
            <IconMenuButton
              icon={<FaPen />}
              onClick={handleRenameClick}
              text="Rename"
            />
            <IconMenuButton
              icon={<FaTrash />}
              onClick={handleDeleteClick}
              text="Delete"
            />
          </Submenu>
        )}
      </div>
    </>
  );
}

export default Task;
