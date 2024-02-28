import { useRef, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import Button from "../UI/Button";

interface NewBoardButtonProps {
  placeholder?: string;
  onSave: (value: string) => void;
}

function NewBoardButton(props: NewBoardButtonProps) {
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    props.onSave(value);
    setEditing(false);
    setValue("");
  }

  async function handleClick() {
    await setEditing(true);
    nameRef.current && nameRef.current.focus();
  }

  return (
    <>
      {!editing && (
        <button
          id="new-board-button"
          className={`flex items-center justify-center border-dashed border-4 border-blue-950 w-52 h-32 p-2 text-gray-800 hover:text-white after:bg-blue-500`}
          onClick={handleClick}
        >
          <FiPlusCircle size="40" />
        </button>
      )}
      {editing && (
        <div className="flex flex-col items-center justify-start bg-blue-500 w-52 h-32 text-gray-800 gap-2 p-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <input
              type="text"
              ref={nameRef}
              placeholder={props.placeholder}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="border-2 p-1 mb-2 border-slate-500 box-border w-full"
            />
            <div className="flex w-full justify-between">
              <Button variant="inverse" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="inverse" type="submit" onClick={handleSave}>
                Save
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default NewBoardButton;
