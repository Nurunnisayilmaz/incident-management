/// <reference types="jest" />

import { UserService } from './user.service';

// Mock dependencies
jest.mock('../models/user.entity', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../utils/pagination', () => ({
  paginateMongoose: jest.fn(),
}));

jest.mock('../../utils/cache', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

import User from '../models/user.entity';
import { paginateMongoose } from '../../utils/pagination';
import { cache } from '../../utils/cache';
import { cacheKeys } from '../../utils/cache/keys';

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('returns user when found', async () => {
      const mockUser = { _id: '1', username: 'alice' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await UserService.getUserById('1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res).toBe(mockUser);
    });

    it('returns null when not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await UserService.getUserById('missing');

      expect(User.findById).toHaveBeenCalledWith('missing');
      expect(res).toBeNull();
    });
  });

  describe('getUserList', () => {
    it('returns cached value when present and does not call pagination', async () => {
      const cached = { items: ['a'] };
      (cache.get as jest.Mock).mockResolvedValue(cached);

      const result = await UserService.getUserList(1, 10, undefined);

      const expectedKey = cacheKeys.users.key({ page: 1, limit: 10 });
      expect(cache.get).toHaveBeenCalledWith(expectedKey);
      expect(paginateMongoose).not.toHaveBeenCalled();
      expect(result).toBe(cached);
    });

    it('calls paginateMongoose and sets cache when cache miss', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      const paginated = { docs: [{ username: 'bob' }], total: 1 };
      (paginateMongoose as jest.Mock).mockResolvedValue(paginated);

      const result = await UserService.getUserList(2, 5, 'bob');

      expect(cache.get).toHaveBeenCalled();
      expect(paginateMongoose).toHaveBeenCalledWith(
        User,
        2,
        5,
        expect.objectContaining({ $or: expect.any(Array) }),
        expect.objectContaining({ sort: { createdAt: -1 }, select: '-password' })
      );

      const expectedKey = cacheKeys.users.key({ page: 2, limit: 5 });
      expect(cache.set).toHaveBeenCalledWith(expectedKey, paginated, cacheKeys.users.ttl);
      expect(result).toBe(paginated);
    });
  });
});
