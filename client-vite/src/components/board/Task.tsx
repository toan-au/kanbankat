import { useRef, useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
import Submenu from "../UI/submenu/Submenu";
import IconMenuButton from "../UI/submenu/IconMenuButton";
import { useDetectClickOutside } from "react-detect-click-outside";
import ReactTextareaAutosize from "react-textarea-autosize";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state/store";
import { deleteTaskAsync } from "../../state/boards/boards";

interface Task {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface TaskProps {
  task: Task;
  listId: string;
}

function Task({ task, listId }: TaskProps) {
  const activeBoard = useSelector(
    (state: RootState) => state.boards.activeBoard
  );
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [inputText, setInputText] = useState(task.content);

  const parentRef = useDetectClickOutside({
    onTriggered: handleOutsideClick,
  });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  function handleOutsideClick() {
    setShowMenu(false);
    setEditing(false);
  }

  function handleShowMenu() {
    setShowMenu(!showMenu);
  }

  function handleEditClick() {
    setEditing(true);
    setTimeout(() => textAreaRef.current?.focus(), 0);
  }

  function handleDeleteClick() {
    const payload = { boardId: activeBoard._id, listId, taskId: task._id };
    dispatch(deleteTaskAsync(payload));
  }

  return (
    <>
      <div
        className="relative flex bg-slate-100 px-0.5 py-1 my-1 rounded-sm items-start group"
        key={task._id}
        ref={parentRef}
      >
        <div className="flex-1 leading-6 break-words max-w-[calc(100%-20px)]">
          {!editing && task.content}
          <ReactTextareaAutosize
            hidden={!editing}
            ref={textAreaRef}
            className="resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></ReactTextareaAutosize>
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
              onClick={handleEditClick}
              text="Edit"
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
