import { useState } from "react";

function NewCardButton() {
  const [editing, setEditing] = useState(false);

  function renderButton() {
    return (
      <button className="p-0.5" onClick={() => setEditing(!editing)}>
        Add new card
      </button>
    );
  }

  function renderForm() {
    return (
      <form>
        <input
          type="text"
          className="w-full rounded-sm p-0.5"
          placeholder="Enter card name..."
        />
      </form>
    );
  }

  return <>{editing ? renderForm() : renderButton()}</>;
}

export default NewCardButton;
