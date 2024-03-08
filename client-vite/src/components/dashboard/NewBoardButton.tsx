import { KeyboardEvent, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import ReactTextareaAutosize from "react-textarea-autosize";

interface NewBoardButtonProps {
  placeholder?: string;
  text: string;
  onSave: (value: string) => void;
}

function NewBoardButton(props: NewBoardButtonProps) {
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const nameRef = useRef<HTMLTextAreaElement>(null);

  function handleSave() {
    props.onSave(value);
    setEditing(false);
    setValue("");
  }

  async function handleClick() {
    await setEditing(true);
    nameRef.current && nameRef.current.focus();
  }

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter": {
        handleSave();
        break;
      }
      case "Escape":
        setEditing(false);
        setValue("");
        break;
    }
  }

  return (
    <>
      {!editing && (
        <button
          id="new-board-button"
          className={`flex items-center justify-center border-dashed border-4 rounded-md border-catBlack text-catBlack bg-white w-60 min-w-52 h-fit max-h-32 p-2`}
          onClick={handleClick}
        >
          <FiPlus size="30" className="mr-1" />
          <span className="font-bold text-lg">{props.text}</span>
        </button>
      )}
      {editing && (
        <div
          className="flex flex-col items-center justify-start min-w-60 bg-white rounded-md w-60 h-fit text-gray-800 gap-2 p-1"
          onKeyDown={handleKeyDown}
        >
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <ReactTextareaAutosize
              ref={nameRef}
              placeholder={props.placeholder}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className=" p-1 mb-2 w-full rounded-md font-bold text-lg resize-none max-h-20"
            />
            <div className="flex w-full justify-between">
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button
                type="submit"
                className="p-1 bg-blue-200 rounded-lg p-2"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default NewBoardButton;
