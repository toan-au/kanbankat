import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Task {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface List {
  _id: string;
  name: string;
  tasks: Task[];
}

interface TaskShift {
  boardId: string;
  sourceListId: string;
  sourceIndex: number;
  destinationListId: string;
  destinationIndex: number;
}

interface ListShift {
  boardId: string;
  sourceIndex: number;
  destinationIndex: number;
}

interface BoardSummary {
  _id: string;
  name: string;
  about: string;
  user: string;
}

interface Board extends BoardSummary {
  lists: List[];
}

interface BoardsState {
  userBoards: BoardSummary[];
  archivedUserBoards: BoardSummary[];
  activeBoard: Board;
  fetchingBoards: boolean;
  fetchingBoard: boolean;
}

const initialState: BoardsState = {
  userBoards: [],
  archivedUserBoards: [],
  activeBoard: {
    lists: [],
    _id: "",
    name: "",
    about: "",
    user: "",
  },
  fetchingBoards: false,
  fetchingBoard: false,
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    startLoadingBoards(state: BoardsState) {
      state.fetchingBoards = true;
    },
    startLoadingBoard(state: BoardsState) {
      state.fetchingBoard = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // createBoardAsync.fulfilled
      .addCase(
        createBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          state.userBoards.push(action.payload);
        }
      )
      // getBoardsAsync.pending
      .addCase(getBoardsAsync.pending, (state) => {
        state.fetchingBoards = true;
      })
      // getBoardsAsync.fulfilled
      .addCase(
        getBoardsAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary[]>) => {
          state.userBoards = action.payload;
          state.fetchingBoards = false;
        }
      )
      // getArchivedBoardsAsync.fulfilled
      .addCase(
        getArchivedBoardsAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary[]>) => {
          state.archivedUserBoards = action.payload;
        }
      )
      // getBoardAsync.pending
      .addCase(getBoardAsync.pending, (state) => {
        state.fetchingBoard = true;
      })
      // getBoardAsync.fulfilled
      .addCase(
        getBoardAsync.fulfilled,
        (state, action: PayloadAction<Board>) => {
          state.activeBoard = action.payload;
          state.fetchingBoard = false;
        }
      )
      // renameBoardAsync.fulfilled
      .addCase(
        renameBoardAsync.fulfilled,
        (state, action: PayloadAction<Board>) => {
          const { _id, about, name, user } = action.payload;
          const id = state.userBoards.findIndex(
            (board) => board._id == action.payload._id
          );
          state.userBoards.splice(id, 1, { _id, about, name, user });
        }
      )
      // deleteBoardAsync.fulfilled
      .addCase(
        deleteBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          const boardIndex = state.userBoards.findIndex(
            (board) => board._id == action.payload._id
          );
          const board = state.userBoards.splice(boardIndex, 1)[0];
          state.archivedUserBoards.push(board);
        }
      )
      // destroyBoardAsync.fulfilled
      .addCase(
        destroyBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          state.archivedUserBoards = state.archivedUserBoards.filter(
            (board) => board._id != action.payload._id
          );
        }
      )
      // restoreBoardAsync.fulfilled
      .addCase(
        restoreBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          const boardIndex = state.archivedUserBoards.findIndex(
            (board) => board._id == action.payload._id
          );
          const board = state.archivedUserBoards.splice(boardIndex, 1)[0];
          state.userBoards.push(board);
        }
      )
      // createListAsync.fulfilled
      .addCase(
        createListAsync.fulfilled,
        (state, action: PayloadAction<List>) => {
          state.activeBoard.lists.push(action.payload);
        }
      )
      // deleteListAsync.fulfilled
      .addCase(
        deleteListAsync.fulfilled,
        (state, action: PayloadAction<string>) => {
          const index = state.activeBoard.lists.findIndex(
            (list) => list._id == action.payload
          );
          state.activeBoard.lists.splice(index, 1);
        }
      )
      // renameListAsync.fulfilled
      .addCase(
        renameListAsync.fulfilled,
        (state, action: PayloadAction<List>) => {
          const { _id, name } = action.payload;
          const index = state.activeBoard.lists.findIndex(
            (list) => list._id == _id
          );
          state.activeBoard.lists[index] = {
            ...state.activeBoard.lists[index],
            name,
          };
        }
      )
      .addCase(
        shiftListAsync.fulfilled,
        (state, action: PayloadAction<ListShift>) => {
          const { sourceIndex, destinationIndex } = action.payload;
          const list = state.activeBoard.lists.splice(sourceIndex, 1)[0];
          state.activeBoard.lists.splice(destinationIndex, 0, list);
        }
      )
      // createTaskAsync.fulfilled
      .addCase(
        createTaskAsync.fulfilled,
        (state, action: PayloadAction<{ task: Task; listId: string }>) => {
          const { task, listId } = action.payload;
          const listIndex = state.activeBoard.lists.findIndex(
            (list) => list._id == listId
          );

          state.activeBoard.lists[listIndex].tasks.push(task);
        }
      )
      // deleteTaskAsync.fulfilled
      .addCase(
        deleteTaskAsync.fulfilled,
        (state, action: PayloadAction<{ task: Task; listId: string }>) => {
          const { task, listId } = action.payload;
          const listIndex = state.activeBoard.lists.findIndex(
            (list) => list._id == listId
          );

          const taskIndex = state.activeBoard.lists[listIndex].tasks.findIndex(
            (t) => t._id == task._id
          );
          state.activeBoard.lists[listIndex].tasks.splice(taskIndex, 1);
        }
      )
      // renameTaskAsync.fulfilled
      .addCase(
        renameTaskAsync.fulfilled,
        (state, action: PayloadAction<{ task: Task; listId: string }>) => {
          const { task, listId } = action.payload;
          const listIndex = state.activeBoard.lists.findIndex(
            (list) => list._id == listId
          );

          const taskId = state.activeBoard.lists[listIndex].tasks.findIndex(
            (t) => t._id == task._id
          );
          state.activeBoard.lists[listIndex].tasks.splice(taskId, 1, task);
        }
      )
      .addCase(
        shiftTaskAsync.fulfilled,
        (state, action: PayloadAction<TaskShift>) => {
          const {
            sourceListId,
            sourceIndex,
            destinationListId,
            destinationIndex,
          } = action.payload;
          const board = state.activeBoard;

          // Find source and destination lsits
          const sourceListIndex = board.lists.findIndex(
            (list) => list._id == sourceListId
          );
          const destinationListIndex = board.lists.findIndex(
            (list) => list._id == destinationListId
          );

          // splice task from source
          const task = board.lists[sourceListIndex].tasks.splice(
            sourceIndex,
            1
          );

          // insert into destination
          board.lists[destinationListIndex].tasks.splice(
            destinationIndex,
            0,
            task[0]
          );
        }
      );
  },
});

// BOARD ACTIONS

export const createBoardAsync = createAsyncThunk(
  "boards/createBoardAsync",
  async (name: string) => {
    const response = await axios.post("/api/board", { name });
    const newBoard: Board = response.data;
    return newBoard;
  }
);

export const getBoardsAsync = createAsyncThunk<Board[]>(
  "boards/getBoardsAsync",
  async () => {
    const response = await axios.get("/api/boards");
    const boards: Board[] = response.data;
    return boards;
  }
);

export const getArchivedBoardsAsync = createAsyncThunk<Board[]>(
  "boards/getArchivedBoardsAsync",
  async () => {
    const response = await axios.get("/api/boards", { 
      params: { deleted: true}
    });
    const boards: Board[] = response.data;
    return boards;
  }
);

export const getBoardAsync = createAsyncThunk(
  "boards/getBoardAsync",
  async (boardId: string) => {
    const response = await axios.get(`/api/board/${boardId}`);
    const board: Board = response.data;
    return board;
  }
);

export const renameBoardAsync = createAsyncThunk<
  Board,
  { boardId: string; name: string }
>("boards/renameBoardAsync", async ({ boardId, name }) => {
  const response = await axios.patch(`/api/board/${boardId}`, { name });
  const board: Board = response.data;
  return board;
});

export const deleteBoardAsync = createAsyncThunk(
  "boards/deleteBoardAsync",
  async (boardId: string) => {
    const response = await axios.delete(`/api/board/${boardId}`);
    return response.data;
  }
);

export const destroyBoardAsync = createAsyncThunk(
  "boards/destroyBoardAsync",
  async (boardId: string) => {
    const response = await axios.delete(`/api/board/destroy/${boardId}`);
    return response.data;
  }
);

export const restoreBoardAsync = createAsyncThunk(
  "boards/restoreBoardAsync",
  async (boardId: string) => {
    const response = await axios.patch(`/api/board/${boardId}`, {
      deleted: false,
    });
    return response.data;
  }
);

// LIST ACTIONS

export const createListAsync = createAsyncThunk<
  List,
  { boardId: string; listName: string }
>("boards/createListAsync", async ({ boardId, listName }) => {
  const response = await axios.post(`/api/board/${boardId}/list`, {
    name: listName,
  });
  const list: List = response.data;
  return list;
});

export const deleteListAsync = createAsyncThunk<
  string,
  { boardId: string; listId: string }
>("boards/deleteListAsync", async ({ boardId, listId }) => {
  const response = await axios.delete(`/api/board/${boardId}/list/${listId}`);
  const id = response.data;
  return id;
});

export const renameListAsync = createAsyncThunk<
  List,
  { boardId: string; listId: string; name: string }
>("boards/renameListAsync", async ({ boardId, listId, name }) => {
  const response = await axios.patch(`/api/board/${boardId}/list/${listId}`, {
    name,
  });
  const list: List = response.data;
  return list;
});

export const shiftListAsync = createAsyncThunk<ListShift, ListShift>(
  "boards/shiftListAsync",
  async (listShift: ListShift) => {
    axios.patch(`/api/board/${listShift.boardId}/lists`, listShift);
    return listShift;
  }
);

export const createTaskAsync = createAsyncThunk<
  { task: Task; listId: string },
  { boardId: string; listId: string; name: string }
>("boards/createTaskAsync", async ({ boardId, listId, name }) => {
  const response = await axios.post(
    `/api/board/${boardId}/list/${listId}/task`,
    {
      name,
    }
  );
  const res: { task: Task; listId: string } = response.data;
  return res;
});

export const deleteTaskAsync = createAsyncThunk<
  { task: Task; listId: string },
  { boardId: string; listId: string; taskId: string }
>("boards/deleteTaskAsync", async ({ boardId, listId, taskId }) => {
  const response = await axios.delete(
    `/api/board/${boardId}/list/${listId}/task/${taskId}`
  );

  const res: { task: Task; listId: string } = response.data;
  return res;
});

export const renameTaskAsync = createAsyncThunk<
  { task: Task; listId: string },
  { boardId: string; listId: string; taskId: string; name: string }
>("boards/renameTaskAsync", async ({ boardId, listId, name, taskId }) => {
  const response = await axios.patch(
    `/api/board/${boardId}/list/${listId}/task/${taskId}`,
    {
      name,
    }
  );
  const res: { task: Task; listId: string } = response.data;
  return res;
});

export const shiftTaskAsync = createAsyncThunk<TaskShift, TaskShift>(
  "boards/shiftTaskAsync",
  async (taskShift: TaskShift) => {
    axios.patch(`/api/board/${taskShift.boardId}/lists/tasks`, taskShift);
    return taskShift;
  }
);

export default boardsSlice.reducer;
