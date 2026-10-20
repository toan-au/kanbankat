import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { Request } from 'express';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get(UsersController);
  });

  describe('me', () => {
    it('returns the authenticated user from the request', () => {
      const user = { id: 'user-1', displayName: 'Ada' } as User;
      const req = { user } as unknown as Request;

      expect(controller.me(req)).toBe(user);
    });
  });
});
