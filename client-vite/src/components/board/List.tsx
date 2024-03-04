import { FaPen, FaTrash } from "react-icons/fa6";
import MoreOptionsButton from "../UI/MoreOptionsButton";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { deleteListAsync, renameListAsync } from "../../state/boards/boards";
import { AppDispatch } from "../../state/store";
import NewTaskButton from "./NewTaskButton";
import TaskList from "./TaskList";
import Submenu from "../UI/submenu/Submenu";
import IconMenuButton from "../UI/submenu/IconMenuButton";

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
}

function List({ boardId, list }: ListProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const ref = useDetectClickOutside({ onTriggered: handleOutsideClick });
  const dispatch = useDispatch<AppDispatch>();
  const focusRef = useRef<HTMLInputElement>(null);

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

  function renderRenameForm() {
    return (
      <form
        className="p-0 m-0 text-blue-950"
        onSubmit={(e) => handleRenameListSubmit(e)}
        hidden={!editing}
      >
        <input
          type="text"
          ref={focusRef}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </form>
    );
  }

  function renderName() {
    return <span className="text-white">{displayName}</span>;
  }

  return (
    <div className="w-64 min-w-64 bg-blue-500 p-2 relative h-fit">
      <div className="info flex">
        <div>{editing ? renderRenameForm() : renderName()}</div>
        <div className="ml-auto" ref={ref}>
          <MoreOptionsButton onClick={handleMenuClick} />
          {openMenu && (
            <Submenu showMenu={openMenu}>
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
      <div>
        <TaskList tasks={list.tasks} listId={list._id} />
      </div>
      <NewTaskButton boardId={boardId} listId={list._id} />
    </div>
  );
}

export default List;
