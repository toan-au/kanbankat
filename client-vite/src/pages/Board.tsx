import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../state/store";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBoardAsync } from "../state/boards.ts/boards";
import NewBoardButton from "../components/dashboard/NewBoardButton";

function Board() {
  const { activeBoard } = useSelector((state: RootState) => state.boards);
  const dispatch = useDispatch<AppDispatch>();
  const { boardId } = useParams();

  useEffect(() => {
    boardId && dispatch(getBoardAsync(boardId));
  }, [boardId]);

  return (
    <main id="board" className="p-10 mx-auto">
      <div id="board-info" className="flex align-top justify-start gap-5">
        <div className="w-60 bg-blue-300 p-2">
          <span className="font-bold">{activeBoard.name}</span>
          <hr className="my-2" />
          <p>{activeBoard.about}</p>
        </div>
        <NewBoardButton
          placeholder="Enter a list name"
          onSave={() => alert("new")}
          hoverColor="bg-slate-300"
        ></NewBoardButton>
      </div>
    </main>
  );
}

export default Board;
