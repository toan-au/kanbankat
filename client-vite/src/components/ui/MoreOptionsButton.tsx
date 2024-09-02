import { SlOptionsVertical } from "react-icons/sl";

interface MoreOptionsButtonProps {
  onClick: () => void;
}

function MoreOptionsButton({ onClick }: MoreOptionsButtonProps) {
  function handleClick() {
    onClick();
  }

  return (
    <button className="more-options-button px-1 py-2" onClick={handleClick}>
      <SlOptionsVertical fontSize={17} />
    </button>
  );
}

export default MoreOptionsButton;
