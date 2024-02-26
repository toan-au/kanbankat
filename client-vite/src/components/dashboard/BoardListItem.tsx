import React, {
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { SlOptionsVertical } from "react-icons/sl";
import { Link } from "react-router-dom";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import {
  deleteBoardAsync,
  renameBoardAsync,
} from "../../state/boards.ts/boards";
import { FaPen, FaTrash } from "react-icons/fa6";

function BoardListItem(props: { board: { _id: string; name: string } }) {
  const { _id, name } = props.board;
  const [showMenu, setShowMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const ref = useDetectClickOutside({ onTriggered: handleOutsideClick });
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(name);
  }, [name]);

  function handleOutsideClick() {
    setShowMenu(false);
    setEditing(false);
  }

  function handleMenuClick(e: MouseEvent) {
    e.preventDefault();
    setShowMenu(!showMenu);
  }

  function handleRenameClick(e: MouseEvent, boardId: string) {
    e.preventDefault();
    setEditing(true);
    setTimeout(() => {
      setShowMenu(false);
      renameRef.current && renameRef.current.focus();
    }, 0);
  }

  function handleRenameSubmit(e: FormEvent, boardId: string) {
    e.preventDefault();
    const payload = {
      boardId,
      name: displayName,
    };
    dispatch(renameBoardAsync(payload));
  }

  function handleDeleteClick(e: MouseEvent, boardId: string) {
    e.preventDefault();
    dispatch(deleteBoardAsync(boardId));
  }

  return (
    <li ref={ref}>
      <div className="block bg-blue-500 hover:bg-blue-400 w-52 h-32 text-center">
        <div className="flex flex-col relative h-full">
          <button className="px-1 py-2 self-end" onClick={handleMenuClick}>
            <SlOptionsVertical fontSize={17} />
          </button>
          <div className="mt-3 px-2">
            <h3 className="text-white" hidden={editing}>
              {name}
            </h3>
            <form
              action=""
              hidden={!editing}
              onSubmit={(e) => handleRenameSubmit(e, _id)}
            >
              <input
                ref={renameRef}
                type="text"
                className="text-center"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              ></input>
            </form>
          </div>
          {showMenu && (
            <div className="flex flex-col bg-slate-300 px-2 py-1 board-list-item-menu ">
              <button
                className="text-md text-left"
                onClick={(e) => handleRenameClick(e, _id)}
              >
                <FaPen className="inline text-xs mr-2" />
                Rename
              </button>
              <button
                className="text-md text-left"
                onClick={(e) => handleDeleteClick(e, _id)}
              >
                <FaTrash className="inline text-xs mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default BoardListItem;