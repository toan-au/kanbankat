import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../state/store";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBoardAsync } from "../state/boards.ts/boards";

function Board() {
  const board = useSelector((state: RootState) => state.boards);
  const dispatch = useDispatch<AppDispatch>();
  const { boardId } = useParams();

  useEffect(() => {
    boardId && dispatch(getBoardAsync(boardId));
  }, [boardId]);

  return <main id="board" className="container mx-auto"></main>;
}

export default Board;
