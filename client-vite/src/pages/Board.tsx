import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../state/store";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createListAsync, getBoardAsync } from "../state/boards/boards";
import NewBoardButton from "../components/dashboard/NewBoardButton";
import List from "../components/board/List";
import { Droppable } from "react-beautiful-dnd";
import Spinner from "../components/ui/Spinner";
import TitleBar from "@/components/board/TitleBar";

function Board() {
  const { activeBoard, fetchingBoard } = useSelector(
    (state: RootState) => state.boards
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { boardId } = useParams();

  useEffect(() => {
    setLoading(fetchingBoard);
  }, [fetchingBoard]);

  useEffect(() => {
    boardId && dispatch(getBoardAsync(boardId));
  }, [boardId, dispatch]);

  function handleNewList(value: string) {
    const payload = { boardId: activeBoard._id, listName: value };
    dispatch(createListAsync(payload));
  }

  // function renderInfo() {
  //   return (
  //     <div className="w-60 min-w-60 bg-blue-500 p-2 text-white h-fit">
  //       <span className="font-bold">{activeBoard.name}</span>
  //       <hr className="my-2" />
  //       <p>{activeBoard.about}</p>
  //     </div>
  //   );
  // }

  function renderLists() {
    return (
      <>
        <TitleBar />
        <Droppable
          droppableId={activeBoard._id}
          direction="horizontal"
          type="LIST"
        >
          {(provided) => (
            <ul
              className="flex flex-1 align-top justify-start overflow-x-auto gap-4 max-w-full px-5 py-5"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {/* {renderInfo()} */}
              {activeBoard.lists.map((list, index) => (
                <List
                  key={list._id}
                  boardId={activeBoard._id}
                  list={list}
                  index={index}
                />
              ))}
              {provided.placeholder}
              <NewBoardButton
                text="New list"
                placeholder="Enter a list name"
                onSave={handleNewList}
              ></NewBoardButton>
            </ul>
          )}
        </Droppable>
      </>
    );
  }

  return (
    <main id="board" className="mx-auto flex flex-col">
      {loading && (
        <div className="px-5 py-5">
          <Spinner />
        </div>
      )}
      {!loading && renderLists()}
    </main>
  );
}

export default Board;
