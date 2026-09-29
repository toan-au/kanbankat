import { act } from "@testing-library/react";

/**
 * Several components schedule a state update via `setTimeout(fn, 0)` (e.g.
 * focus-after-render), await a state setter's return value (which just
 * defers one microtask), or dispatch an async Redux thunk that resolves
 * after a mocked axios call. Those updates land outside `userEvent`'s own
 * act() scope once it has already closed, which React flags as "not
 * wrapped in act(...)".
 *
 * Calling `flushTimers()` *after* the triggering interaction isn't enough —
 * by the time it runs, the update may already have escaped into an
 * untracked scope. Instead, wrap the interaction itself (e.g. `user.click`)
 * together with an extra real-timer tick in one continuous `act()` call, so
 * anything it schedules has nowhere to escape to.
 */
export async function actAndFlush(interaction: () => Promise<unknown> | unknown) {
  await act(async () => {
    await interaction();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
