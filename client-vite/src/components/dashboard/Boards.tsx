import NewBoardButton from "./NewBoardButton";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state/store";
import { getBoardsAsync } from "../../state/boards.ts/boards";
import BoardListItem from "./BoardListItem";

function Boards() {
  const boards = useSelector((state: RootState) => state.boards);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getBoardsAsync());
  }, [dispatch]);

  return (
    <div className="pt-10">
      <ul className="flex flex-row flex-wrap gap-5 mb-5">
        {boards.userBoards.map((board) => (
          <BoardListItem key={board._id} board={board}></BoardListItem>
        ))}
        <li>
          <NewBoardButton></NewBoardButton>
        </li>
      </ul>
    </div>
  );
}

export default Boards;
