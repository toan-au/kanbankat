import { ReactNode } from "react";

interface SubmenuProps {
  children: ReactNode;
  showMenu: boolean;
  horizontalOffset?: number;
}

function Submenu(props: SubmenuProps) {
  const { children, showMenu, horizontalOffset } = props;

  return (
    <>
      {showMenu && (
        <div
          className="absolute flex flex-col bg-slate-300 px-2 py-1 board-list-item-menu"
          style={{ left: horizontalOffset }}
        >
          {children}
        </div>
      )}
    </>
  );
}

export default Submenu;
