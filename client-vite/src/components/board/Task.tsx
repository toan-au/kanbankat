import { FocusEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
import Submenu from "../ui/submenu/Submenu";
import IconMenuButton from "../ui/submenu/IconMenuButton";
import { useDetectClickOutside } from "react-detect-click-outside";
import ReactTextareaAutosize from "react-textarea-autosize";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state/store";
import { deleteTaskAsync, renameTaskAsync } from "../../state/boards/boards";
import { hideShroud, showShroud } from "../../state/ui/ui";
import { DraggableProvided } from "react-beautiful-dnd";
import ColorPallete from "../ui/submenu/ColorPallete";

interface Task {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface TaskProps {
  task: Task;
  listId: string;
  innerRef: (element: HTMLElement | null) => void;
  provided: DraggableProvided;
}

function Task({ task, listId, innerRef, provided }: TaskProps) {
  const activeBoard = useSelector(
    (state: RootState) => state.boards.activeBoard
  );
  // const userLabels = useSelector(
  //   (state: RootState) => state.currentUser.labels
  // );
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [inputText, setInputText] = useState(task.name);
  const parentRef = useDetectClickOutside({
    onTriggered: handleOutsideClick,
  }); 
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    showMenu ? dispatch(showShroud()) : dispatch(hideShroud());
  }, [showMenu, dispatch]);

  function handleOutsideClick() {
    setShowMenu(false);
    setEditing(false);
  }

  function handleFocus(e: FocusEvent<HTMLTextAreaElement>) {
    e.target.select();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key == "Enter" && !e.shiftKey) {
      const payload = {
        boardId: activeBoard._id,
        listId,
        taskId: task._id,
        name: inputText,
      };
      dispatch(renameTaskAsync(payload));
      setEditing(false);
    }
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
    setEditing(false);
    setShowMenu(false);
  }

  return (
    <div
      ref={innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <div
        className={`relative flex bg-white shadow-lg border-2 rounded-sm px-2 py-3 mb-1.5 items-start group ${
          showMenu && "z-50"
        }`}
        ref={parentRef}
      >
        <div className="flex-1 leading-6 break-words max-w-[calc(100%-20px)]">
          {!editing && task.name}
          <ReactTextareaAutosize
            hidden={!editing}
            ref={textAreaRef}
            className="resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          ></ReactTextareaAutosize>
        </div>
        <button
          className="text-transparent ml-auto p-0.5 group-hover:text-slate-400"
          onClick={handleShowMenu}
        >
          <FaPen />
        </button>
        {showMenu && (
          <Submenu showMenu={showMenu} horizontalOffset={305}>
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
            <ColorPallete labels={activeBoard.labels}/>
          </Submenu>
        )}
      </div>
    </div>
  );
}

export default Task;
