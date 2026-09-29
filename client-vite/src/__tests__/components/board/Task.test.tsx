import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { DraggableProvided } from "react-beautiful-dnd";
import { renderWithProviders } from "../../setup/renderWithProviders";
import boardsReducer from "../../../state/boards/boards";
import Task from "../../../components/board/Task";

vi.mock("axios");
const mockedPatch = vi.mocked(axios.patch);
const mockedDelete = vi.mocked(axios.delete);

const task = { _id: "task-1", name: "Buy milk", content: "", color: "none" };

// Task only spreads draggableProps/dragHandleProps and calls innerRef; the
// rest of react-beautiful-dnd's DraggableProvided isn't exercised, so a
// minimal shape is cast to the real type rather than typed loosely.
const fakeProvided = {
  draggableProps: {},
  dragHandleProps: {},
  innerRef: vi.fn(),
} as unknown as DraggableProvided;

// renameTaskAsync.fulfilled/deleteTaskAsync.fulfilled reducers look up the
// list (then the task) by id in activeBoard.lists without a not-found guard,
// so the store needs the matching list+task preloaded or the reducer throws
// once the mocked axios call resolves.
function boardsStateWithActiveBoard(boardId: string, listId: string) {
  const base = boardsReducer(undefined, { type: "@@INIT" });
  return {
    ...base,
    activeBoard: { ...base.activeBoard, _id: boardId, lists: [{ _id: listId, name: "List", tasks: [task] }] },
  };
}

describe("Task", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPatch.mockResolvedValue({ data: { task, listId: "list-1" } });
    mockedDelete.mockResolvedValue({ data: { task, listId: "list-1" } });
  });

  it("renders the task name", () => {
    renderWithProviders(
      <Task task={task} listId="list-1" innerRef={vi.fn()} provided={fakeProvided} />,
      { preloadedState: { boards: boardsStateWithActiveBoard("board-1", "list-1") } }
    );

    // A hidden rename textarea is also pre-filled with the same name, so
    // pick out the visible occurrence rather than assuming there's only one.
    const matches = screen.getAllByText("Buy milk");
    expect(matches.some((el) => el.tagName.toLowerCase() !== "textarea")).toBe(true);
  });

  it("toggling the menu dispatches showShroud/hideShroud", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(
      <Task task={task} listId="list-1" innerRef={vi.fn()} provided={fakeProvided} />,
      { preloadedState: { boards: boardsStateWithActiveBoard("board-1", "list-1") } }
    );

    expect(store.getState().ui.showShroud).toBe(false);

    await user.click(screen.getByRole("button", { name: "" }));
    expect(store.getState().ui.showShroud).toBe(true);

    await user.click(screen.getByRole("button", { name: "" }));
    expect(store.getState().ui.showShroud).toBe(false);
  });

  it("editing via the menu and pressing Enter renames the task", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Task task={task} listId="list-1" innerRef={vi.fn()} provided={fakeProvided} />,
      { preloadedState: { boards: boardsStateWithActiveBoard("board-1", "list-1") } }
    );

    await user.click(screen.getByRole("button", { name: "" }));
    await user.click(screen.getByText("Edit"));

    const textbox = screen.getByDisplayValue("Buy milk");
    await user.clear(textbox);
    await user.type(textbox, "Buy oat milk{Enter}");

    expect(axios.patch).toHaveBeenCalledWith("/api/board/board-1/list/list-1/task/task-1", {
      name: "Buy oat milk",
    });
  });

  it("clicking Delete in the menu removes the task", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Task task={task} listId="list-1" innerRef={vi.fn()} provided={fakeProvided} />,
      { preloadedState: { boards: boardsStateWithActiveBoard("board-1", "list-1") } }
    );

    await user.click(screen.getByRole("button", { name: "" }));
    await user.click(screen.getByText("Delete"));

    expect(axios.delete).toHaveBeenCalledWith("/api/board/board-1/list/list-1/task/task-1");
  });
});
