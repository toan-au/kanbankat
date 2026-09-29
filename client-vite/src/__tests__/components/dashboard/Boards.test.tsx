import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { renderWithProviders } from "../../setup/renderWithProviders";
import { actAndFlush } from "../../setup/flushTimers";
import boardsReducer from "../../../state/boards/boards";
import Boards from "../../../components/dashboard/Boards";

vi.mock("axios");
const mockedGet = vi.mocked(axios.get);

const defaultBoardsState = boardsReducer(undefined, { type: "@@INIT" });

describe("Boards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the user's boards on mount", async () => {
    mockedGet.mockResolvedValue({ data: [] });

    // Wrapping the render itself so the mocked response's fulfilled-action
    // re-render settles within act() before the test ends, instead of
    // leaking into the next test.
    await actAndFlush(() => {
      renderWithProviders(<Boards />);
    });

    expect(axios.get).toHaveBeenCalledWith("/api/boards");
  });

  it("shows the loading spinner while fetchingBoards is true", () => {
    mockedGet.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<Boards />, {
      preloadedState: { boards: { ...defaultBoardsState, fetchingBoards: true } },
    });

    // Spinner's alt text is correctly spelled ("Now loading..."); its visible
    // caption text has an existing typo ("Neow loading..."), so match on the
    // alt text instead of that.
    expect(screen.getByAltText(/now loading/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new board/i })).not.toBeInTheDocument();
  });

  it("renders each board plus the New board button once loaded", async () => {
    mockedGet.mockResolvedValue({
      data: [
        { _id: "b1", name: "Board One", about: "", user: "u1" },
        { _id: "b2", name: "Board Two", about: "", user: "u1" },
      ],
    });

    renderWithProviders(<Boards />);

    // BoardListItem also renders a hidden rename textarea pre-filled with the
    // same name, so scope the query to the visible heading to avoid matching
    // both.
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Board One" })).toBeInTheDocument()
    );
    expect(screen.getByRole("heading", { name: "Board Two" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new board/i })).toBeInTheDocument();
  });
});
