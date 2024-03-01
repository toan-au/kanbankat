import { FormEvent, useRef, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import { createTaskAsync } from "../../state/boards/boards";

interface NewCardButtonProps {
  boardId: string;
  listId: string;
}

function NewCardButton({ boardId, listId }: NewCardButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const focusRef = useRef<HTMLInputElement>(null);
  const outsideClickRef = useDetectClickOutside({
    onTriggered: handleOutsideClick,
  });

  function handleOutsideClick() {
    setEditing(false);
  }

  function handleEditClick() {
    setEditing(!editing);
    setTimeout(() => focusRef.current?.focus(), 0);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { boardId, listId, content };
    dispatch(createTaskAsync(payload));
    setEditing(false);
  }

  function renderButton() {
    return (
      <button
        className="p-0.5 w-full text-left"
        onClick={handleEditClick}
        hidden={editing}
      >
        Add new card
      </button>
    );
  }

  function renderForm() {
    return (
      <form hidden={!editing} onSubmit={(e) => handleSubmit(e)}>
        <input
          type="text"
          ref={focusRef}
          className="w-full rounded-sm p-0.5"
          placeholder="Enter anything..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </form>
    );
  }

  return (
    <div ref={outsideClickRef}>
      {renderButton()}
      {renderForm()}
    </div>
  );
}

export default NewCardButton;
