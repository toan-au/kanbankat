import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { renderWithProviders } from "../../setup/renderWithProviders";
import { actAndFlush } from "../../setup/flushTimers";
import ArchivedBoards from "../../../components/dashboard/ArchivedBoards";

vi.mock("axios");
const mockedGet = vi.mocked(axios.get);

describe("ArchivedBoards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches archived boards (deleted=true) on mount", async () => {
    mockedGet.mockResolvedValue({ data: [] });

    await actAndFlush(() => {
      renderWithProviders(<ArchivedBoards />);
    });

    expect(axios.get).toHaveBeenCalledWith("/api/boards", { params: { deleted: true } });
  });

  it("shows the empty-state message when there are no archived boards", async () => {
    mockedGet.mockResolvedValue({ data: [] });

    renderWithProviders(<ArchivedBoards />);

    await waitFor(() =>
      expect(screen.getByText(/archived boards will appear here/i)).toBeInTheDocument()
    );
  });

  it("renders each archived board", async () => {
    mockedGet.mockResolvedValue({
      data: [{ _id: "b1", name: "Old Board", about: "", user: "u1" }],
    });

    renderWithProviders(<ArchivedBoards />);

    await waitFor(() => expect(screen.getByText("Old Board")).toBeInTheDocument());
    expect(screen.queryByText(/archived boards will appear here/i)).not.toBeInTheDocument();
  });
});
