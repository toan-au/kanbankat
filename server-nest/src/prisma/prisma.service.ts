import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Standard Nest+Prisma wiring, no branching logic to it -- not a TDD
// subject in the same way AuthService etc. are, same call made on
// src/main.ts's bootstrap() in Stage 1.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
