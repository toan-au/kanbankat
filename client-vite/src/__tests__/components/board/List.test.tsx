import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReactNode } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { renderWithProviders } from "../../setup/renderWithProviders";
import List from "../../../components/board/List";

vi.mock("axios");
const mockedPatch = vi.mocked(axios.patch);
const mockedDelete = vi.mocked(axios.delete);

// List (and the TaskList it renders) use react-beautiful-dnd's
// Draggable/Droppable, which require a real DragDropContext ancestor and
// DOM measurements react-beautiful-dnd can't do in jsdom. Stubbed here to
// just invoke the render-prop with a minimal `provided` shape, matching how
// the app actually renders once wrapped in a real DragDropContext.
vi.mock("react-beautiful-dnd", () => ({
  Draggable: ({ children }: { children: (provided: unknown) => ReactNode }) =>
    children({
      innerRef: vi.fn(),
      draggableProps: {},
      dragHandleProps: {},
    }),
  Droppable: ({ children }: { children: (provided: unknown) => ReactNode }) =>
    children({
      innerRef: vi.fn(),
      droppableProps: {},
      placeholder: null,
    }),
}));

const list = { _id: "list-1", name: "To Do", tasks: [] };

describe("List", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPatch.mockResolvedValue({ data: { ...list, name: "Renamed" } });
    mockedDelete.mockResolvedValue({ data: "list-1" });
  });

  it("renders the list name", () => {
    renderWithProviders(<List boardId="board-1" list={list} index={0} />);

    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("opening the menu, clicking Rename, editing and pressing Enter renames the list", async () => {
    const user = userEvent.setup();
    renderWithProviders(<List boardId="board-1" list={list} index={0} />);

    await user.click(screen.getByRole("button", { name: "" }));
    await user.click(screen.getByText("Rename"));

    const textbox = screen.getByDisplayValue("To Do");
    await user.clear(textbox);
    await user.type(textbox, "Doing{Enter}");

    expect(axios.patch).toHaveBeenCalledWith("/api/board/board-1/list/list-1", { name: "Doing" });
  });

  it("Shift+Enter does not submit the rename form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<List boardId="board-1" list={list} index={0} />);

    await user.click(screen.getByRole("button", { name: "" }));
    await user.click(screen.getByText("Rename"));

    const textbox = screen.getByDisplayValue("To Do");
    await user.type(textbox, "{Shift>}{Enter}{/Shift}");

    expect(axios.patch).not.toHaveBeenCalled();
  });

  it("clicking Delete in the menu removes the list", async () => {
    const user = userEvent.setup();
    renderWithProviders(<List boardId="board-1" list={list} index={0} />);

    await user.click(screen.getByRole("button", { name: "" }));
    await user.click(screen.getByText("Delete"));

    expect(axios.delete).toHaveBeenCalledWith("/api/board/board-1/list/list-1");
  });
});
