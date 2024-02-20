import { Link } from "react-router-dom";
import NewBoardButton from "./NewBoardButton";

function Boards() {
  return (
    <div className="pt-10">
      <ul className="flex flex-row gap-5 mb-5">
        <li>
          <Link
            to="/boards/1"
            className="block bg-blue-500 hover:bg-blue-400 w-52 h-32 p-2 text-center"
          >
            <h3 className="text-white">Board 1</h3>
          </Link>
        </li>
        <li>
          <Link
            to="/boards/1"
            className="block bg-blue-500 hover:bg-blue-400 w-52 h-32 p-2"
          >
            <h3 className="text-white">Board 2</h3>
          </Link>
        </li>
        <li>
          <Link
            to="/boards/1"
            className="block bg-blue-500 hover:bg-blue-400 w-52 h-32 p-2"
          >
            <h3 className="text-white">Board 3</h3>
          </Link>
        </li>
        <li>
          <NewBoardButton></NewBoardButton>
        </li>
      </ul>
    </div>
  );
}

export default Boards;
