import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";

vi.mock("axios");
const mockedGet = vi.mocked(axios.get);
const mockedPost = vi.mocked(axios.post);
const mockedPatch = vi.mocked(axios.patch);

import boardsReducer, {
  createBoardAsync,
  getBoardsAsync,
  getArchivedBoardsAsync,
  getBoardAsync,
  renameBoardAsync,
  deleteBoardAsync,
  destroyBoardAsync,
  restoreBoardAsync,
  createListAsync,
  deleteListAsync,
  renameListAsync,
  shiftListAsync,
  createTaskAsync,
  deleteTaskAsync,
  renameTaskAsync,
  shiftTaskAsync,
} from "../../../state/boards/boards";

// `lists: []` is included so these literals structurally satisfy the (not
// exported) Board type wherever a thunk's payload requires it; it's harmless
// for the BoardSummary-shaped state fields since Board extends BoardSummary.
function makeBoard(overrides: Partial<{ _id: string; name: string; about: string; user: string }> = {}) {
  // `never[]` (an empty array with no inferred element type) is structurally
  // assignable to any List[] the real Board type expects.
  return { _id: "board-1", name: "Board One", about: "", user: "user-1", lists: [] as never[], ...overrides };
}

function initialBoardsState() {
  return boardsReducer(undefined, { type: "@@INIT" });
}

// Immer auto-freezes state produced by the reducer, so tests that need to
// seed activeBoard.lists build a fresh (unfrozen) state object rather than
// mutating the reducer's initial output directly.
function stateWithLists(lists: unknown[]) {
  const base = initialBoardsState();
  return { ...base, activeBoard: { ...base.activeBoard, lists } } as typeof base;
}

describe("boards reducer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("own reducers (startLoadingBoards/startLoadingBoard) set the loading flags", () => {
    // NOTE: boards.ts never exports `boardsSlice.actions`, so these two
    // reducers have no action creators available outside this module and are
    // currently unreachable dead code from the rest of the app. Dispatched
    // here via their raw RTK-generated action type strings to document the
    // reducer behavior itself, not to claim they're actually wired up.
    let state = initialBoardsState();
    state = boardsReducer(state, { type: "boards/startLoadingBoards" });
    expect(state.fetchingBoards).toBe(true);

    state = boardsReducer(state, { type: "boards/startLoadingBoard" });
    expect(state.fetchingBoard).toBe(true);
  });

  it("createBoardAsync.fulfilled appends the new board to userBoards", () => {
    const board = makeBoard();
    const state = boardsReducer(
      initialBoardsState(),
      createBoardAsync.fulfilled(board, "req-1", "Board One")
    );

    expect(state.userBoards).toEqual([board]);
  });

  it("getBoardsAsync.pending sets fetchingBoards, .fulfilled replaces userBoards and clears it", () => {
    let state = boardsReducer(initialBoardsState(), getBoardsAsync.pending("req-1", undefined));
    expect(state.fetchingBoards).toBe(true);

    const boards = [makeBoard({ _id: "b1" }), makeBoard({ _id: "b2" })];
    state = boardsReducer(state, getBoardsAsync.fulfilled(boards, "req-1", undefined));

    expect(state.userBoards).toEqual(boards);
    expect(state.fetchingBoards).toBe(false);
  });

  it("getArchivedBoardsAsync.fulfilled replaces archivedUserBoards (no pending/fetchingBoards handling)", () => {
    const archived = [makeBoard({ _id: "archived-1" })];
    const state = boardsReducer(
      initialBoardsState(),
      getArchivedBoardsAsync.fulfilled(archived, "req-1", undefined)
    );

    expect(state.archivedUserBoards).toEqual(archived);
    // Existing gap: unlike getBoardsAsync, there's no .pending handler here,
    // so fetchingBoards is left untouched by this thunk.
    expect(state.fetchingBoards).toBe(false);
  });

  it("getBoardAsync.pending sets fetchingBoard, .fulfilled sets activeBoard and clears it", () => {
    let state = boardsReducer(initialBoardsState(), getBoardAsync.pending("req-1", "board-1"));
    expect(state.fetchingBoard).toBe(true);

    const board = makeBoard();
    state = boardsReducer(state, getBoardAsync.fulfilled(board, "req-1", "board-1"));

    expect(state.activeBoard).toEqual(board);
    expect(state.fetchingBoard).toBe(false);
  });

  it("renameBoardAsync.fulfilled replaces the matching board summary in userBoards", () => {
    const original = makeBoard({ _id: "board-1", name: "Old Name" });
    let state: ReturnType<typeof boardsReducer> = { ...initialBoardsState(), userBoards: [original] };

    const renamed = makeBoard({ _id: "board-1", name: "New Name" });
    state = boardsReducer(
      state,
      renameBoardAsync.fulfilled(renamed, "req-1", { boardId: "board-1", name: "New Name" })
    );

    expect(state.userBoards).toEqual([{ _id: "board-1", name: "New Name", about: "", user: "user-1" }]);
  });

  it("deleteBoardAsync.fulfilled moves the board from userBoards to archivedUserBoards", () => {
    const board = makeBoard({ _id: "board-1" });
    let state: ReturnType<typeof boardsReducer> = { ...initialBoardsState(), userBoards: [board] };

    state = boardsReducer(state, deleteBoardAsync.fulfilled(board, "req-1", "board-1"));

    expect(state.userBoards).toEqual([]);
    expect(state.archivedUserBoards).toEqual([board]);
  });

  it("destroyBoardAsync.fulfilled removes the board from archivedUserBoards", () => {
    const board = makeBoard({ _id: "board-1" });
    let state: ReturnType<typeof boardsReducer> = { ...initialBoardsState(), archivedUserBoards: [board] };

    state = boardsReducer(state, destroyBoardAsync.fulfilled(board, "req-1", "board-1"));

    expect(state.archivedUserBoards).toEqual([]);
  });

  it("restoreBoardAsync.fulfilled moves the board from archivedUserBoards back to userBoards", () => {
    const board = makeBoard({ _id: "board-1" });
    let state: ReturnType<typeof boardsReducer> = { ...initialBoardsState(), archivedUserBoards: [board] };

    state = boardsReducer(state, restoreBoardAsync.fulfilled(board, "req-1", "board-1"));

    expect(state.archivedUserBoards).toEqual([]);
    expect(state.userBoards).toEqual([board]);
  });

  it("createListAsync.fulfilled pushes the new list onto activeBoard.lists", () => {
    const newList = { _id: "list-1", name: "To Do", tasks: [] };
    let state = initialBoardsState();

    state = boardsReducer(
      state,
      createListAsync.fulfilled(newList, "req-1", { boardId: "board-1", listName: "To Do" })
    );

    expect(state.activeBoard.lists).toEqual([newList]);
  });

  it("deleteListAsync.fulfilled removes the list matching the returned id", () => {
    const list = { _id: "list-1", name: "To Do", tasks: [] };
    let state = stateWithLists([list]);

    state = boardsReducer(
      state,
      deleteListAsync.fulfilled("list-1", "req-1", { boardId: "board-1", listId: "list-1" })
    );

    expect(state.activeBoard.lists).toEqual([]);
  });

  it("renameListAsync.fulfilled updates the matching list's name", () => {
    const list = { _id: "list-1", name: "Old", tasks: [] };
    let state = stateWithLists([list]);

    state = boardsReducer(
      state,
      renameListAsync.fulfilled({ ...list, name: "New" }, "req-1", {
        boardId: "board-1",
        listId: "list-1",
        name: "New",
      })
    );

    expect(state.activeBoard.lists[0].name).toBe("New");
  });

  it("shiftListAsync.fulfilled reorders lists from sourceIndex to destinationIndex", () => {
    const listA = { _id: "a", name: "A", tasks: [] };
    const listB = { _id: "b", name: "B", tasks: [] };
    const listC = { _id: "c", name: "C", tasks: [] };
    let state = stateWithLists([listA, listB, listC]);

    const shift = { boardId: "board-1", sourceIndex: 0, destinationIndex: 2 };
    state = boardsReducer(state, shiftListAsync.fulfilled(shift, "req-1", shift));

    expect(state.activeBoard.lists).toEqual([listB, listC, listA]);
  });

  it("createTaskAsync.fulfilled pushes the task onto the matching list", () => {
    const list: { _id: string; name: string; tasks: unknown[] } = { _id: "list-1", name: "To Do", tasks: [] };
    let state = stateWithLists([list]);

    const task = { _id: "task-1", name: "Task", content: "", color: "none" };
    state = boardsReducer(
      state,
      createTaskAsync.fulfilled({ task, listId: "list-1" }, "req-1", {
        boardId: "board-1",
        listId: "list-1",
        name: "Task",
      })
    );

    expect(state.activeBoard.lists[0].tasks).toEqual([task]);
  });

  it("deleteTaskAsync.fulfilled removes the matching task", () => {
    const task = { _id: "task-1", name: "Task", content: "", color: "none" };
    const list = { _id: "list-1", name: "To Do", tasks: [task] };
    let state = stateWithLists([list]);

    state = boardsReducer(
      state,
      deleteTaskAsync.fulfilled({ task, listId: "list-1" }, "req-1", {
        boardId: "board-1",
        listId: "list-1",
        taskId: "task-1",
      })
    );

    expect(state.activeBoard.lists[0].tasks).toEqual([]);
  });

  it("renameTaskAsync.fulfilled replaces the matching task in place", () => {
    const task = { _id: "task-1", name: "Old", content: "", color: "none" };
    const list = { _id: "list-1", name: "To Do", tasks: [task] };
    let state = stateWithLists([list]);

    const renamed = { ...task, name: "New" };
    state = boardsReducer(
      state,
      renameTaskAsync.fulfilled({ task: renamed, listId: "list-1" }, "req-1", {
        boardId: "board-1",
        listId: "list-1",
        taskId: "task-1",
        name: "New",
      })
    );

    expect(state.activeBoard.lists[0].tasks).toEqual([renamed]);
  });

  it("shiftTaskAsync.fulfilled moves a task within the same list", () => {
    const t1 = { _id: "t1", name: "t1", content: "", color: "none" };
    const t2 = { _id: "t2", name: "t2", content: "", color: "none" };
    const list = { _id: "list-1", name: "To Do", tasks: [t1, t2] };
    let state = stateWithLists([list]);

    const shift = {
      boardId: "board-1",
      sourceListId: "list-1",
      sourceIndex: 0,
      destinationListId: "list-1",
      destinationIndex: 1,
    };
    state = boardsReducer(state, shiftTaskAsync.fulfilled(shift, "req-1", shift));

    expect(state.activeBoard.lists[0].tasks).toEqual([t2, t1]);
  });

  it("shiftTaskAsync.fulfilled moves a task between lists", () => {
    const t1 = { _id: "t1", name: "t1", content: "", color: "none" };
    const sourceList = { _id: "list-1", name: "Source", tasks: [t1] };
    const destList: { _id: string; name: string; tasks: unknown[] } = { _id: "list-2", name: "Dest", tasks: [] };
    let state = stateWithLists([sourceList, destList]);

    const shift = {
      boardId: "board-1",
      sourceListId: "list-1",
      sourceIndex: 0,
      destinationListId: "list-2",
      destinationIndex: 0,
    };
    state = boardsReducer(state, shiftTaskAsync.fulfilled(shift, "req-1", shift));

    expect(state.activeBoard.lists[0].tasks).toEqual([]);
    expect(state.activeBoard.lists[1].tasks).toEqual([t1]);
  });
});

describe("boards async thunks (axios call shape)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createBoardAsync POSTs to /api/board with the board name", async () => {
    mockedPost.mockResolvedValue({ data: makeBoard() });
    const thunk = createBoardAsync("Board One");
    const dispatch = vi.fn();
    await thunk(dispatch, () => ({}), undefined);

    expect(mockedPost).toHaveBeenCalledWith("/api/board", { name: "Board One" });
  });

  it("getArchivedBoardsAsync GETs /api/boards with deleted=true as a query param", async () => {
    mockedGet.mockResolvedValue({ data: [] });
    const thunk = getArchivedBoardsAsync();
    const dispatch = vi.fn();
    await thunk(dispatch, () => ({}), undefined);

    expect(mockedGet).toHaveBeenCalledWith("/api/boards", { params: { deleted: true } });
  });

  it("restoreBoardAsync PATCHes deleted:false", async () => {
    mockedPatch.mockResolvedValue({ data: makeBoard() });
    const thunk = restoreBoardAsync("board-1");
    const dispatch = vi.fn();
    await thunk(dispatch, () => ({}), undefined);

    expect(mockedPatch).toHaveBeenCalledWith("/api/board/board-1", { deleted: false });
  });

  it("shiftListAsync fires the PATCH but resolves with the shift payload without awaiting the response (existing fire-and-forget behavior)", async () => {
    // axios.patch is never resolved/rejected here, yet the thunk still
    // fulfills immediately because the call isn't awaited in the thunk body.
    mockedPatch.mockReturnValue(new Promise(() => {}));
    const store = configureStore({ reducer: { boards: boardsReducer } });
    const shift = { boardId: "board-1", sourceIndex: 0, destinationIndex: 1 };

    const payload = await store.dispatch(shiftListAsync(shift)).unwrap();

    expect(mockedPatch).toHaveBeenCalledWith("/api/board/board-1/lists", shift);
    expect(payload).toEqual(shift);
  });

  it("shiftTaskAsync fires the PATCH but resolves with the shift payload without awaiting the response (existing fire-and-forget behavior)", async () => {
    mockedPatch.mockReturnValue(new Promise(() => {}));
    // shiftTaskAsync.fulfilled's reducer looks up both lists by id without a
    // not-found guard, so they need to be preloaded or it throws.
    const store = configureStore({
      reducer: { boards: boardsReducer },
      preloadedState: {
        boards: stateWithLists([
          { _id: "list-1", name: "Source", tasks: [{ _id: "t1", name: "t1", content: "", color: "none" }] },
          { _id: "list-2", name: "Dest", tasks: [] },
        ]),
      },
    });
    const shift = {
      boardId: "board-1",
      sourceListId: "list-1",
      sourceIndex: 0,
      destinationListId: "list-2",
      destinationIndex: 0,
    };

    const payload = await store.dispatch(shiftTaskAsync(shift)).unwrap();

    expect(mockedPatch).toHaveBeenCalledWith("/api/board/board-1/lists/tasks", shift);
    expect(payload).toEqual(shift);
  });
});
