import { FaPen, FaTrash } from "react-icons/fa6";
import MoreOptionsButton from "../UI/MoreOptionsButton";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { deleteListAsync, renameListAsync } from "../../state/boards/boards";
import { AppDispatch } from "../../state/store";
import NewTaskButton from "./NewTaskButton";
import TaskList from "./TaskList";
import Submenu from "../UI/submenu/Submenu";
import IconMenuButton from "../UI/submenu/IconMenuButton";
import { Draggable } from "react-beautiful-dnd";
import ReactTextareaAutosize from "react-textarea-autosize";

interface Task {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface List {
  _id: string;
  name: string;
  tasks: Task[];
}

interface ListProps {
  boardId: string;
  list: List;
  index: number;
}

function List({ boardId, list, index }: ListProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const ref = useDetectClickOutside({ onTriggered: handleOutsideClick });
  const dispatch = useDispatch<AppDispatch>();
  const focusRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDisplayName(list.name);
  }, [list.name]);

  function handleMenuClick() {
    setOpenMenu(!openMenu);
  }

  function handleOutsideClick() {
    setOpenMenu(false);
    setEditing(false);
  }

  function handleDelete() {
    const payload = { boardId, listId: list._id };
    dispatch(deleteListAsync(payload));
  }

  function handleRenameClick() {
    setEditing(!editing);
    setTimeout(() => {
      focusRef.current?.focus();
    }, 0);
  }

  function handleRenameListSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { boardId, listId: list._id, name: displayName };
    dispatch(renameListAsync(payload));
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter": {
        if (e.shiftKey) break;
        handleRenameListSubmit(e as FormEvent);
        break;
      }
      case "Escape": {
        setEditing(false);
        break;
      }
    }
  }

  function renderRenameForm() {
    return (
      <form
        className="p-0 m-0 text-blue-950"
        onSubmit={(e) => handleRenameListSubmit(e)}
        onClick={(e) => e.stopPropagation()}
        hidden={!editing}
      >
        <ReactTextareaAutosize
          className="rounded-md resize-none font-bold w-full"
          ref={focusRef}
          value={displayName}
          onKeyDown={handleKeyDown}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </form>
    );
  }

  function renderName() {
    return <span className="font-bold break-words">{displayName}</span>;
  }

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided) => (
        <div
          className="w-64 min-w-64 bg-white rounded-md p-2 relative h-fit"
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
        >
          <div className="flex">
            <div className="w-[calc(100%-33px)] mb-4">
              {editing ? renderRenameForm() : renderName()}
            </div>
            <div className="relative ml-auto -top-1" ref={ref}>
              <MoreOptionsButton onClick={handleMenuClick} />
              {openMenu && (
                <Submenu
                  showMenu={openMenu}
                  horizontalOffset={33}
                  verticalOffset={-8}
                >
                  <IconMenuButton
                    icon={<FaPen />}
                    onClick={handleRenameClick}
                    text="Rename"
                  />
                  <IconMenuButton
                    icon={<FaTrash />}
                    onClick={handleDelete}
                    text="Delete"
                  />
                </Submenu>
              )}
            </div>
          </div>
          <div className="mb-2">
            <TaskList tasks={list.tasks} listId={list._id} />
          </div>
          <NewTaskButton boardId={boardId} listId={list._id} />
        </div>
      )}
    </Draggable>
  );
}

export default List;
