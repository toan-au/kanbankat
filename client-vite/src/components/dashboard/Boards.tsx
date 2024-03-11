import NewBoardButton from "./NewBoardButton";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state/store";
import { createBoardAsync, getBoardsAsync } from "../../state/boards/boards";
import BoardListItem from "./BoardListItem";
import Spinner from "../UI/Spinner";

function Boards() {
  const { userBoards, fetchingBoards } = useSelector(
    (state: RootState) => state.boards
  );
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetchingBoards) {
      setLoading(true);
    } else {
      setTimeout(() => setLoading(false), 400);
    }
  }, [fetchingBoards]);

  useEffect(() => {
    dispatch(getBoardsAsync());
  }, [dispatch]);

  function handleSave(value: string) {
    dispatch(createBoardAsync(value));
  }

  return (
    <div className="mt-7">
      <h1 className="text-5xl mb-7">Your boards</h1>
      <ul className="flex flex-row flex-wrap gap-5 mb-5">
        {loading && <Spinner />}
        {!loading &&
          userBoards.map((board) => (
            <BoardListItem key={board._id} board={board}></BoardListItem>
          ))}
        {!loading && (
          <li>
            <NewBoardButton
              text="New board"
              placeholder="Enter a board name"
              onSave={handleSave}
            ></NewBoardButton>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Boards;
