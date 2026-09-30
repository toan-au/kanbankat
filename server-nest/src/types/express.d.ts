import { User as PrismaUser } from '@prisma/client';

// Passport's own types declare an empty Express.User interface, meant to be
// augmented by the app (declaration merging) with whatever shape req.user
// actually is once JwtStrategy.validate() (or a Passport OAuth strategy)
// populates it. Same pattern the old Express app used in
// server/src/types.d.ts, just against Prisma's User instead of a Mongoose
// document.
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends PrismaUser {}
  }
}

// @types/cookie-parser types req.cookies as Record<string, any> (it can't
// know an app's cookie shape); narrowing it to the one cookie this app
// actually sets gives real type safety instead of an any-then-cast pattern
// at every read site.
declare module 'express' {
  interface Request {
    cookies: { refreshToken?: string };
    // Set by pino-http's genReqId (see src/common/request-id.ts) before any
    // route handler runs.
    id?: string;
  }
}

export {};
