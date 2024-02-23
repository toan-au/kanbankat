import React, { MouseEvent, useState } from "react";
import { SlOptionsVertical } from "react-icons/sl";
import { Link } from "react-router-dom";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import { deleteBoardAsync } from "../../state/boards.ts/boards";

function BoardListItem(props: { board: { _id: string; name: string } }) {
  const { _id, name } = props.board;
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const ref = useDetectClickOutside({ onTriggered: () => setShowMenu(false) });

  function handleMenuClick(e: MouseEvent) {
    e.preventDefault();
    setShowMenu(!showMenu);
  }

  function handleDeleteClick(e: MouseEvent, boardId: string) {
    e.preventDefault();
    dispatch(deleteBoardAsync(boardId));
  }

  return (
    <li ref={ref}>
      <Link
        to={`/board/${_id}`}
        className="block bg-blue-500 hover:bg-blue-400 w-52 h-32 px-1 text-center"
      >
        <div className="flex relative justify-between align-top items-start">
          <h3 className="text-white">{name}</h3>
          <button className="mt-2" onClick={handleMenuClick}>
            <SlOptionsVertical fontSize={17} />
          </button>
          {showMenu && (
            <div
              onClick={(e) => handleDeleteClick(e, _id)}
              className="flex flex-col bg-slate-300 px-2 py-1 board-list-item-menu "
            >
              <button className="text-xl text-left">Delete</button>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

export default BoardListItem;
