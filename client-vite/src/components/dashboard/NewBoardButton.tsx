import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import Button from "../UI/Button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import { createBoardAsync } from "../../state/boards.ts/boards";

function NewBoardButton() {
  const [newBoardName, setNewBoardName] = useState("");
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  function handleSave() {
    dispatch(createBoardAsync(newBoardName));
    setEditing(false);
    setNewBoardName("");
  }

  return (
    <>
      {!editing && (
        <button
          id="new-board-button"
          className="flex items-center justify-center border-dashed border-4 border-blue-950 w-52 h-32 p-2 text-gray-800 hover:text-white"
          onClick={() => setEditing(true)}
        >
          <FiPlusCircle size="40" />
        </button>
      )}
      {editing && (
        <div className="flex flex-col items-center justify-start bg-blue-500 w-52 h-32 text-gray-800 gap-2 p-2">
          <input
            type="text"
            value={newBoardName}
            onChange={(event) => setNewBoardName(event.target.value)}
            className="border-2 p-1 border-slate-500 box-border w-full"
          />
          <div className="flex w-full justify-between">
            <Button variant="inverse" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="inverse" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default NewBoardButton;
