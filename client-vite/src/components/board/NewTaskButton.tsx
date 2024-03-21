import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import { createTaskAsync } from "../../state/boards/boards";
import TextareaAutosize from "react-textarea-autosize";
import { FaPlus } from "react-icons/fa6";

interface NewTaskButtonProps {
  boardId: string;
  listId: string;
}

function NewTaskButton({ boardId, listId }: NewTaskButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const focusRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
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

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key == "Enter" && !e.shiftKey) {
      handleSubmit(e as FormEvent);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { boardId, listId, name: content };
    dispatch(createTaskAsync(payload));
    setContent("");
  }

  function renderButton() {
    return (
      <button
        className=" p-0.5 py-1 w-full text-sm text-catBlack rounded-full text-center hover:bg-catLightBlue hover:text-white relative"
        onClick={handleEditClick}
        hidden={editing}
      >
        <FaPlus className="inline relative -top-0.5 mr-1"></FaPlus>
        Add a Task
      </button>
    );
  }

  function renderForm() {
    return (
      <form hidden={!editing} ref={formRef} onSubmit={(e) => handleSubmit(e)}>
        <TextareaAutosize
          ref={focusRef}
          className="w-full rounded-sm p-0.5 h-fit resize-none"
          placeholder="Enter anything..."
          value={content}
          onKeyDown={(e) => handleKeyDown(e)}
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

export default NewTaskButton;
