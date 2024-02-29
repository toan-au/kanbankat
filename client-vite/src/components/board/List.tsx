import { FaPen, FaTrash } from "react-icons/fa6";
import MoreOptionsButton from "../UI/MoreOptionsButton";
import { useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { deleteListAsync } from "../../state/boards/boards";
import { AppDispatch } from "../../state/store";

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
  const ref = useDetectClickOutside({ onTriggered: handleOutsideClick });
  const dispatch = useDispatch<AppDispatch>();

  function handleMenuClick() {
    setOpenMenu(!openMenu);
  }

  function handleOutsideClick() {
    setOpenMenu(false);
  }

  function handleDelete() {
    const payload = { boardId, listId: list._id };
    dispatch(deleteListAsync(payload));
  }

  return (
    <div className="w-60 bg-blue-500 p-2 relative h-fit" ref={ref}>
      <div className="info flex text-white">
        {list.name}
        <div className="ml-auto">
          <MoreOptionsButton onClick={handleMenuClick} />
        </div>
      </div>
      <div>Add new card</div>
      {openMenu && (
        <div className="flex flex-col bg-slate-300 px-2 py-1 board-list-item-menu ">
          <button className="text-md text-left">
            <FaPen className="inline text-xs mr-2" />
            Rename
          </button>
          <button className="text-md text-left" onClick={handleDelete}>
            <FaTrash className="inline text-xs mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default List;
