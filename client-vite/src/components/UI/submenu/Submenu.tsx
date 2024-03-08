import { ReactNode } from "react";

interface SubmenuProps {
  children: ReactNode;
  showMenu: boolean;
  horizontalOffset?: number;
  verticalOffset?: number;
}

function Submenu(props: SubmenuProps) {
  const { children, showMenu, horizontalOffset, verticalOffset } = props;

  return (
    <>
      {showMenu && (
        <div
          className="absolute flex flex-col px-2 py-1 board-list-item-menu"
          style={{ left: horizontalOffset, top: verticalOffset }}
        >
          {children}
        </div>
      )}
    </>
  );
}

export default Submenu;
