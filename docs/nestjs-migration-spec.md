# Backend Rewrite: Express/Mongoose → NestJS/PostgreSQL/JWT

Status: **Planned, not started.** No code from this spec exists yet.

## Why

The current backend (`server/`) is Express + Mongoose, with `List` and `Task` modeled
as subdocuments embedded inside a single `Board` document. That was a reasonable
starting point, but the domain is highly relational (User ↔ Board ↔ List ↔ Task ↔
Label, all with real referential structure), and the embedded-document model means
every task edit rewrites the entire parent board document. PostgreSQL, accessed
through a proper NestJS module structure, fits this domain better.

This is a from-scratch rewrite, not a port. The current app has no live deployment
and no real user data (README says "Live Demo: Coming Soon"), so there is nothing to
migrate — this spec covers schema and application design only, no data migration.

**Explicitly not a goal of this migration:** real-time collaborative editing between
different users on the same board (Google-Docs-style). That problem needs operational
transforms/CRDTs and websockets regardless of which database sits underneath, and
neither PostgreSQL nor this rewrite solves it. If multi-user concurrent editing
becomes an actual near-term feature, it needs its own design pass — don't assume this
migration bought you any of that.

## Decisions

Settled after a full design-review session (see conversation history for the full
reasoning behind each; summarized here for reference).

| Area | Decision | Why |
|---|---|---|
| Database | PostgreSQL | Relational fit for the domain; avoids embedded-document write amplification. Not "ACID for concurrency" — Mongo already had that at the document level, and it doesn't solve collaborative editing anyway. |
| Data migration | None | No live deployment, no real data exists. Fresh schema. |
| Rewrite strategy | Big-bang | App is small (4 resources, ~18 controller functions), solo-maintained. A strangler-fig migration running two frameworks side by side would cost more coordination than it saves. |
| Frontend scope | Untouched, except what JWT forces | `client-vite` keeps its existing structure; only the auth-state handling changes (see Stage 5). |
| ORM | Prisma | Best migration/type-safety DX of the options considered (TypeORM, Drizzle, MikroORM) for a solo dev. |
| List/Task ordering | Fractional (lexicographic) position column | Standard approach for drag-and-drop apps (Figma/Notion/Linear-style). Reorders touch one row; no cascading renumber like an integer-position scheme, no recursive walk like a linked-list scheme. |
| Auth token shape | Access + refresh JWT pair | Short-lived access token (small blast radius if leaked) + longer-lived refresh token matching the current 30-day "stay logged in" UX. |
| Token storage (client) | Refresh token in an httpOnly cookie; access token in memory only (Redux state, never persisted) | Keeps most of JWT's stateless-verification benefit without localStorage's XSS-exposed token storage. |
| OAuth | Passport Google/GitHub strategies unchanged | `@nestjs/passport` supports OAuth-strategy-then-JWT-issuance natively. Only the last step of the callback changes: issue a token pair instead of creating a session. |
| Refresh token revocation | DB-tracked, rotated on every use | A `RefreshToken` table (`userId`, token hash, issued-at, used/revoked). Enables real "log out" and "log out everywhere," and lets a replayed-old-token be detected as a compromise signal. Pure stateless refresh tokens (no DB tracking) would make "log out" meaningless once a token has leaked. |
| Module structure | One NestJS module per resource (Users, Boards, Lists, Tasks, Labels, Auth) | Matches Nest convention. Lists/Tasks services can still call into BoardsService for ownership checks, so the board "aggregate" boundary isn't lost, just organized per Nest idiom. |
| Request validation | `class-validator` + DTOs + a global `ValidationPipe` | Closes a real, currently-open gap (today, nothing validates `req.body` at all). Chosen over Zod specifically to stay consistent with Nest's own conventions rather than introduce a second validation paradigm. |
| DB testing | Real, ephemeral PostgreSQL via `testcontainers` | Mirrors the `mongodb-memory-server` pattern already used in `server/src/__tests__/setup/`. Since referential integrity is the stated reason for this whole migration, mocking the DB layer in tests would undermine the point. Requires a Docker daemon in dev and CI — accepted, since Docker Compose is already the dev-Postgres plan. |
| Postgres hosting | Docker Compose (dev), Heroku Postgres (prod) | Matches the existing `heroku-postbuild` deploy target already in `package.json`. |

## Target architecture

### Schema (Prisma)

Normalized relational tables, replacing the embedded `Board.lists[].tasks[]` structure:

- **User** — `id`, `googleId`, `githubId`, `displayName`, timestamps
- **Board** — `id`, `userId` (FK), `name`, `about`, `deleted`, `deletedOn`, timestamps
- **List** — `id`, `boardId` (FK), `name`, `position` (fractional), `deleted`, `deletedOn`, timestamps
- **Task** — `id`, `listId` (FK), `name`, `content`, `color`, `position` (fractional), timestamps
- **Label** — `id`, `boardId` (FK), `text`, `hexColour`, timestamps
- **RefreshToken** — `id`, `userId` (FK), `tokenHash`, `issuedAt`, `usedAt`, `revokedAt`

Every foreign key gets a real constraint — no more of the current `LabelDocument.name`
vs. actual `text` field mismatch, no more `Board` missing a declared `labels` field,
no more `baordSchema` typo (this doesn't survive the rewrite).

### Module layout

```
src/
  auth/          # Passport strategies, JWT issuance, refresh rotation, guards
  users/
  boards/
  lists/
  tasks/
  labels/
  prisma/        # PrismaService, module wiring
```

Each resource module: a Prisma-backed service, a controller with DTOs, guards applied
per-route, and its own test suite built alongside it (not after).

### Auth flow

1. Login: Passport OAuth strategy unchanged (Google/GitHub).
2. Callback: instead of `req.login()` + session cookie, issue an access token
   (short-lived) and a refresh token (long-lived), write the refresh token's hash to
   the `RefreshToken` table, set it as an httpOnly cookie, return the access token in
   the response body.
3. Requests: `Authorization: Bearer <access token>` header, verified statelessly by a
   `JwtAuthGuard` (replaces `requireLogin`). Board ownership is a `BoardOwnerGuard`
   doing a real Prisma query (replaces `requireOwnBoard`'s array scan on `req.user`).
4. Access token expiry: client's Axios interceptor catches a 401, calls
   `POST /auth/refresh` (cookie sent automatically), retries the original request once.
5. Refresh: server validates the refresh cookie against the `RefreshToken` table,
   issues a new pair, marks the old refresh token used, writes the new one. A replayed
   already-used token is treated as a compromise signal.
6. Logout: delete (or mark revoked) the current refresh token's row, clear the cookie.
   "Log out everywhere" — delete all rows for that `userId`.

### Testing

Same shape as the existing `mongodb-memory-server` setup, swapped to
`testcontainers`: `beforeAll` starts an ephemeral Postgres container and runs
`prisma migrate deploy` against it, `afterEach` truncates tables, `afterAll` tears the
container down. One consistent setup used both locally and in CI (a Docker daemon is
assumed available in both).

## Staged plan

Executed as a long-lived integration branch (`rewrite/nestjs`), with small PRs merging
into it stage by stage — TDD throughout, not a big-bang code dump. The existing
Express `server/` keeps running, untouched, until Stage 6. One final PR merges
`rewrite/nestjs` into `master` at cutover.

### Stage 1 — Infrastructure
Scaffold the Nest app in a fresh directory. Docker Compose with a Postgres service.
Prisma installed and connected. `testcontainers` test harness stood up. No business
logic yet. Done when `npm test` can spin up a container, run a migration, and tear
down clean.

### Stage 2 — Schema
Design and commit the Prisma schema described above. First migration.

### Stage 3 — Auth module
Passport strategies ported. JWT issuance + refresh rotation + `RefreshToken` table.
`JwtAuthGuard` and `BoardOwnerGuard`. Auth DTOs. Tests alongside.

### Stage 4 — Resource modules
Users → Boards → Lists → Tasks → Labels, in that dependency order. Business logic
re-derived for relational operations (e.g. `shiftLists`/`shiftTask` become a single
`UPDATE` on the fractional `position` column instead of an array splice). Tests
alongside each module.

### Stage 5 — Frontend touch-up
Axios response interceptor for the 401 → refresh → retry flow. Redux `currentUser`
slice holds the access token in memory instead of deriving "logged in" from session
cookie existence. Login/logout dispatch updated for the new endpoints. Nothing else in
`client-vite` changes.

### Stage 6 — Cutover
Full smoke test against the new server. Swap root scripts and `heroku-postbuild` to
the new app. Delete the old Express `server/` code. Update `CLAUDE.md` to describe the
new stack.

## Open / explicitly deferred

- Production Postgres provisioning specifics beyond "Heroku Postgres" (instance size,
  backup policy) — decide when actually ready to deploy, not blocking this migration.
- Real-time collaborative editing — out of scope entirely (see "Why" above).
- Whether to keep `services/` as a layer distinct from controllers for every resource,
  or fold simple ones into the controller — Nest's convention effectively settles this
  by forcing a service per resource; no separate decision needed.
