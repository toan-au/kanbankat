import React, { MouseEvent, useState } from "react";
import { SlOptionsVertical } from "react-icons/sl";
import { Link } from "react-router-dom";

function BoardListItem(props: { board: { _id: string; name: string } }) {
  const { _id, name } = props.board;
  const [showMenu, setShowMenu] = useState(false);

  function handleMenuClick(e: MouseEvent) {
    e.preventDefault();
    setShowMenu(true);
  }

  function handleDeleteClick(e: MouseEvent) {
    e.preventDefault();
  }

  return (
    <li>
      <Link
        to={`/boards/${_id}`}
        className="block bg-blue-500 hover:bg-blue-400 w-52 h-32 p-2 text-center"
      >
        <div className="flex relative">
          <h3 className="text-white">{name}</h3>
          <button onClick={handleMenuClick}>
            <SlOptionsVertical className="absolute right-0 top-1" />
          </button>
          {showMenu && (
            <div
              onClick={handleDeleteClick}
              className="absolute right-0 block bg-white p-1"
            >
              <button>Delete</button>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

export default BoardListItem;
