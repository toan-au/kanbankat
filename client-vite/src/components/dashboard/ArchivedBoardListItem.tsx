import { MouseEvent, useEffect, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import {
  destroyBoardAsync,
  restoreBoardAsync,
} from "../../state/boards/boards";
import { FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import MoreOptionsButton from "../ui/MoreOptionsButton";
import Submenu from "../ui/submenu/Submenu";
import IconMenuButton from "../ui/submenu/IconMenuButton";

function ArchivedBoardListItem(props: {
  board: { _id: string; name: string };
}) {
  const { _id, name } = props.board;
  const [showMenu, setShowMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const ref = useDetectClickOutside({ onTriggered: handleOutsideClick });

  useEffect(() => {
    setDisplayName(name);
  }, [name]);

  function handleOutsideClick() {
    setShowMenu(false);
  }

  function handleMenuClick() {
    setShowMenu(!showMenu);
  }

  function handleRestoreClick(e: MouseEvent, boardId: string) {
    e.stopPropagation();
    dispatch(restoreBoardAsync(boardId));
  }

  function handleDeleteClick(e: MouseEvent, boardId: string) {
    e.stopPropagation();
    dispatch(destroyBoardAsync(boardId));
  }

  function handleBoardClick() {
    navigate(`/board/${_id}`);
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
            <h3 className="select-none text-lg font-bold break-words ">
              {displayName}
            </h3>
          </div>
          <div className="ml-auto p-2">
            <MoreOptionsButton onClick={handleMenuClick} />
          </div>
          {showMenu && (
            <Submenu showMenu={showMenu}>
              <IconMenuButton
                icon={<FaTrash />}
                onClick={(e) => handleRestoreClick(e, _id)}
                text="Restore"
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

export default ArchivedBoardListItem;
