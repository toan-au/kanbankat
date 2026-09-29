import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { renderWithProviders } from "../../setup/renderWithProviders";
import BoardListItem from "../../../components/dashboard/BoardListItem";

vi.mock("axios");
const mockedPatch = vi.mocked(axios.patch);
const mockedDelete = vi.mocked(axios.delete);

const board = { _id: "board-1", name: "Board One" };

describe("BoardListItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPatch.mockResolvedValue({ data: { ...board } });
    mockedDelete.mockResolvedValue({ data: { ...board } });
  });

  it("renders the board name", () => {
    renderWithProviders(<BoardListItem board={board} />);

    // A hidden rename textarea is also pre-filled with the same name, so
    // scope the query to the visible heading.
    expect(screen.getByRole("heading", { name: "Board One" })).toBeInTheDocument();
  });

  it("opening the menu and clicking Archive dispatches deleteBoardAsync (DELETE /api/board/:id)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BoardListItem board={board} />);

    await user.click(screen.getByRole("button", { name: "" })); // MoreOptionsButton has no accessible name
    await user.click(screen.getByText("Archive"));

    expect(axios.delete).toHaveBeenCalledWith("/api/board/board-1");
  });

  it("opening the menu, clicking Rename, editing and pressing Enter dispatches renameBoardAsync", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BoardListItem board={board} />);

    await user.click(screen.getByRole("button", { name: "" }));
    await user.click(screen.getByText("Rename"));

    const textbox = screen.getByRole("textbox");
    await user.clear(textbox);
    await user.type(textbox, "Renamed Board{Enter}");

    expect(axios.patch).toHaveBeenCalledWith("/api/board/board-1", { name: "Renamed Board" });
  });
});
