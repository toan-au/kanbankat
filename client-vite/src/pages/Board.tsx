import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../state/store";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { createListAsync, getBoardAsync } from "../state/boards/boards";
import NewBoardButton from "../components/dashboard/NewBoardButton";
import List from "../components/board/List";

function Board() {
  const { activeBoard } = useSelector((state: RootState) => state.boards);
  const dispatch = useDispatch<AppDispatch>();
  const { boardId } = useParams();

  useEffect(() => {
    boardId && dispatch(getBoardAsync(boardId));
  }, [boardId]);

  function handleNewList(value: string) {
    const payload = { boardId: activeBoard._id, listName: value };
    dispatch(createListAsync(payload));
  }

  return (
    <main id="board" className="p-10 mx-auto">
      <div id="board-info" className="flex align-top justify-start gap-5">
        <div className="w-60 bg-blue-500 p-2 text-white">
          <span className="font-bold">{activeBoard.name}</span>
          <hr className="my-2" />
          <p>{activeBoard.about}</p>
        </div>
        {activeBoard.lists.map((list) => (
          <List key={list._id} boardId={activeBoard._id} list={list} />
        ))}
        <NewBoardButton
          placeholder="Enter a list name"
          onSave={(value) => handleNewList(value)}
        ></NewBoardButton>
      </div>
    </main>
  );
}

export default Board;
