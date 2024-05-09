import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state/store";
import { getArchivedBoardsAsync } from "../../state/boards/boards";
import Spinner from "../UI/Spinner";
import ArchivedBoardListItem from "./ArchivedBoardListItem";

function Boards() {
  const { archivedUserBoards, fetchingBoards } = useSelector(
    (state: RootState) => state.boards
  );
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(fetchingBoards);
  }, [fetchingBoards]);

  useEffect(() => {
    dispatch(getArchivedBoardsAsync());
  }, [dispatch]);

  return (
    <div className="mt-7">
      <h1 className="text-5xl mb-7">Archive</h1>
      {archivedUserBoards.length == 0 && (
        <span className="text-sm">Archived boards will appear here</span>
      )}
      <ul className="flex flex-row flex-wrap gap-5 mb-5">
        {loading && <Spinner />}
        {!loading &&
          archivedUserBoards.map((board) => (
            <ArchivedBoardListItem key={board._id} board={board} />
          ))}
      </ul>
    </div>
  );
}

export default Boards;
