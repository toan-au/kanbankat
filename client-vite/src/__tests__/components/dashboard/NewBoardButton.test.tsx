import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { actAndFlush } from "../../setup/flushTimers";
import NewBoardButton from "../../../components/dashboard/NewBoardButton";

describe("NewBoardButton", () => {
  it("shows the trigger button with the given text initially", () => {
    render(<NewBoardButton text="New board" onSave={vi.fn()} />);

    expect(screen.getByRole("button", { name: /new board/i })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("clicking the button reveals the form", async () => {
    const user = userEvent.setup();
    render(<NewBoardButton text="New board" onSave={vi.fn()} />);

    await actAndFlush(() => user.click(screen.getByRole("button", { name: /new board/i })));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("submitting via Enter calls onSave with the typed value and resets the form", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<NewBoardButton text="New board" onSave={onSave} />);

    await actAndFlush(() => user.click(screen.getByRole("button", { name: /new board/i })));
    await actAndFlush(() => user.type(screen.getByRole("textbox"), "My Board{Enter}"));

    expect(onSave).toHaveBeenCalledWith("My Board");
    // Editing mode closes and the trigger button reappears
    expect(screen.getByRole("button", { name: /new board/i })).toBeInTheDocument();
  });

  it("pressing Escape cancels without calling onSave", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<NewBoardButton text="New board" onSave={onSave} />);

    await actAndFlush(() => user.click(screen.getByRole("button", { name: /new board/i })));
    await actAndFlush(() => user.type(screen.getByRole("textbox"), "Abandoned{Escape}"));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /new board/i })).toBeInTheDocument();
  });
});
