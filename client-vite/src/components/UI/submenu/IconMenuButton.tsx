import { MouseEvent, ReactNode } from "react";

interface IconMenuButtonProps {
  text: string;
  icon: ReactNode;
  onClick: (e: MouseEvent) => void;
}

function IconMenuButton(props: IconMenuButtonProps) {
  const { onClick, text, icon } = props;
  function handleClick(e: MouseEvent) {
    onClick(e);
  }

  return (
    <button className="flex text-md text-left" onClick={(e) => handleClick(e)}>
      <span className="inline text-xs mr-2 self-center">{icon}</span>
      {text}
    </button>
  );
}

export default IconMenuButton;
