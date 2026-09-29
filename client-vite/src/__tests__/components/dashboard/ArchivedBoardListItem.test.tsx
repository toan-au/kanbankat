import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { renderWithProviders } from "../../setup/renderWithProviders";
import { actAndFlush } from "../../setup/flushTimers";
import ArchivedBoardListItem from "../../../components/dashboard/ArchivedBoardListItem";

vi.mock("axios");
const mockedPatch = vi.mocked(axios.patch);
const mockedDelete = vi.mocked(axios.delete);

const board = { _id: "board-1", name: "Board One" };

describe("ArchivedBoardListItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPatch.mockResolvedValue({ data: { ...board } });
    mockedDelete.mockResolvedValue({ data: { ...board } });
  });

  it("renders the board name", () => {
    renderWithProviders(<ArchivedBoardListItem board={board} />);

    expect(screen.getByText("Board One")).toBeInTheDocument();
  });

  it("opening the menu and clicking Restore dispatches restoreBoardAsync (PATCH deleted:false)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ArchivedBoardListItem board={board} />);

    await actAndFlush(() => user.click(screen.getByRole("button", { name: "" })));
    await actAndFlush(() => user.click(screen.getByText("Restore")));

    expect(axios.patch).toHaveBeenCalledWith("/api/board/board-1", { deleted: false });
  });

  it("opening the menu and clicking Delete dispatches destroyBoardAsync (DELETE /api/board/destroy/:id)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ArchivedBoardListItem board={board} />);

    await actAndFlush(() => user.click(screen.getByRole("button", { name: "" })));
    await actAndFlush(() => user.click(screen.getByText("Delete")));

    expect(axios.delete).toHaveBeenCalledWith("/api/board/destroy/board-1");
  });
});
