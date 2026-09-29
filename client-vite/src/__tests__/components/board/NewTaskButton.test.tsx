import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { renderWithProviders } from "../../setup/renderWithProviders";
import { actAndFlush } from "../../setup/flushTimers";
import boardsReducer from "../../../state/boards/boards";
import NewTaskButton from "../../../components/board/NewTaskButton";

vi.mock("axios");
const mockedPost = vi.mocked(axios.post);

// createTaskAsync.fulfilled's reducer looks up the list by id in
// activeBoard.lists and pushes onto it without a not-found guard, so the
// store needs that list preloaded or the reducer throws once the mocked
// axios call resolves.
function preloadedState() {
  const base = boardsReducer(undefined, { type: "@@INIT" });
  return {
    boards: {
      ...base,
      activeBoard: { ...base.activeBoard, _id: "board-1", lists: [{ _id: "list-1", name: "List", tasks: [] }] },
    },
  };
}

describe("NewTaskButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPost.mockResolvedValue({
      data: { task: { _id: "task-1", name: "New task", content: "", color: "none" }, listId: "list-1" },
    });
  });

  it("shows the trigger button, hides the form initially", () => {
    renderWithProviders(<NewTaskButton boardId="board-1" listId="list-1" />, { preloadedState: preloadedState() });

    expect(screen.getByRole("button", { name: /add a task/i })).toBeVisible();
    expect(screen.getByPlaceholderText(/enter anything/i)).not.toBeVisible();
  });

  it("clicking the button reveals the form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewTaskButton boardId="board-1" listId="list-1" />, { preloadedState: preloadedState() });

    await actAndFlush(() => user.click(screen.getByRole("button", { name: /add a task/i })));

    expect(screen.getByPlaceholderText(/enter anything/i)).toBeVisible();
  });

  it("pressing Enter submits and POSTs the task, then clears the input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewTaskButton boardId="board-1" listId="list-1" />, { preloadedState: preloadedState() });

    await actAndFlush(() => user.click(screen.getByRole("button", { name: /add a task/i })));
    const input = screen.getByPlaceholderText(/enter anything/i);
    await actAndFlush(() => user.type(input, "Buy milk{Enter}"));

    expect(axios.post).toHaveBeenCalledWith("/api/board/board-1/list/list-1/task", { name: "Buy milk" });
    expect(input).toHaveValue("");
  });
});
