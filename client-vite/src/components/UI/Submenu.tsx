import { ReactNode } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";

interface SubmenuProps {
  children: ReactNode;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
}

function Submenu(props: SubmenuProps) {
  const { children, showMenu, setShowMenu } = props;
  const ref = useDetectClickOutside({ onTriggered: handleOutsideClick });

  function handleOutsideClick() {
    setShowMenu(false);
  }

  return (
    <>
      {showMenu && (
        <div
          ref={ref}
          className="flex flex-col bg-slate-300 px-2 py-1 board-list-item-menu "
        >
          {children}
        </div>
      )}
    </>
  );
}

export default Submenu;
