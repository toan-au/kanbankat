import { ReactNode } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { AppDispatch, RootState } from "../state/store";
import { useDispatch } from "react-redux";
import { shiftListAsync, shiftTaskAsync } from "../state/boards/boards";
import { useSelector } from "react-redux";

interface AppDragDropContextProps {
  children: ReactNode;
}

function AppDragDropContext({ children }: AppDragDropContextProps) {
  const { activeBoard } = useSelector((state: RootState) => state.boards);
  const dispatch = useDispatch<AppDispatch>();

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { source, destination } = result;

    switch (result.type) {
      case "TASK": {
        const payload = {
          boardId: activeBoard._id,
          sourceListId: source.droppableId,
          sourceIndex: source.index,
          destinationListId: destination.droppableId,
          destinationIndex: destination.index,
        };
        dispatch(shiftTaskAsync(payload));
        break;
      }
      case "LIST": {
        console.log(result);
        const payload = {
          boardId: activeBoard._id,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        };

        dispatch(shiftListAsync(payload));
        break;
      }
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
  );
}

export default AppDragDropContext;
