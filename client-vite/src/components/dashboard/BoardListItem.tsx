import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import { deleteBoardAsync, renameBoardAsync } from "../../state/boards/boards";
import { FaPen, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import MoreOptionsButton from "../UI/MoreOptionsButton";
import Submenu from "../UI/submenu/Submenu";
import IconMenuButton from "../UI/submenu/IconMenuButton";
import ReactTextareaAutosize from "react-textarea-autosize";

function BoardListItem(props: { board: { _id: string; name: string } }) {
  const { _id, name } = props.board;
  const [showMenu, setShowMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const ref = useDetectClickOutside({ onTriggered: handleOutsideClick });
  const renameRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDisplayName(name);
  }, [name]);

  function handleOutsideClick() {
    setShowMenu(false);
    setEditing(false);
  }

  function handleMenuClick() {
    setShowMenu(!showMenu);
  }

  function handleRenameClick(e: MouseEvent) {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      setShowMenu(false);
      renameRef.current && renameRef.current.focus();
    }, 0);
  }

  function handleRename() {
    const payload = {
      boardId: _id,
      name: displayName,
    };
    dispatch(renameBoardAsync(payload));
    setEditing(false);
  }

  function handleDeleteClick(e: MouseEvent, boardId: string) {
    e.stopPropagation();
    dispatch(deleteBoardAsync(boardId));
  }

  function handleBoardClick() {
    navigate(`/board/${_id}`);
  }

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter": {
        handleRename();
        break;
      }
      case "Escape": {
        break;
      }
    }
  }

  return (
    <li
      ref={ref}
      className="board-list-item border-solid border-0 border-gray-300 bg-white cursor-pointer rounded-md"
    >
      <div className="block w-64 h-32">
        <div className="flex relative h-full">
          <div
            className="h-full w-[calc(100%-0.5em-33px)] p-2 overflow-clip"
            onClick={handleBoardClick}
          >
            <h3
              className="select-none text-lg font-bold break-words "
              hidden={editing}
            >
              {displayName}
            </h3>
            <form hidden={!editing} onClick={(e) => e.stopPropagation()}>
              <ReactTextareaAutosize
                className=" mb-2 w-full rounded-md font-bold text-lg resize-none max-h-28"
                ref={renameRef}
                value={displayName}
                onKeyDown={handleKeyDown}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </form>
          </div>
          <div className="ml-auto p-2">
            <MoreOptionsButton onClick={handleMenuClick} />
          </div>
          {showMenu && (
            <Submenu showMenu={showMenu}>
              <IconMenuButton
                icon={<FaPen />}
                onClick={handleRenameClick}
                text="Rename"
              />
              <IconMenuButton
                icon={<FaTrash />}
                onClick={(e) => handleDeleteClick(e, _id)}
                text="Delete"
              />
            </Submenu>
          )}
        </div>
      </div>
    </li>
  );
}

export default BoardListItem;
