import { useSelector } from "react-redux";
import { RootState } from "../../state/store";

function Overlay() {
  const { showShroud } = useSelector((state: RootState) => state.ui);

  return (
    <>
      <div
        hidden={!showShroud}
        className="z-20 absolute w-full h-full bg-slate-800 opacity-60"
      ></div>
    </>
  );
}

export default Overlay;
