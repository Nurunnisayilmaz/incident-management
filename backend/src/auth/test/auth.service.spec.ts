/// <reference types="jest" />

// Create mock repositories first
const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockSessionRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

// Mock AppDataSource before importing anything
jest.mock('../../utils/database', () => ({
  AppDataSource: {
    getRepository: jest.fn((entity: any) => {
      if (entity.name === 'User') {
        return mockUserRepository;
      }
      if (entity.name === 'AuthSession') {
        return mockSessionRepository;
      }
    }),
  },
}));

import { AuthService } from '../services/auth.service';
import { AppDataSource } from '../../utils/database';

// Mock the static repositories directly on the AuthService class
(AuthService as any).userRepo = mockUserRepository;
(AuthService as any).sessionRepo = mockSessionRepository;

jest.mock('@/utils/auth/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-pass'),
  comparePasswords: jest.fn(),
}));

jest.mock('@/utils/auth/jwt', () => ({
  generateAccessToken: jest.fn().mockReturnValue('access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
}));

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('session-uuid') }));

import { hashPassword, comparePasswords } from '../../utils/auth/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } from '../../utils/auth/jwt';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset repository mocks
    Object.values(mockUserRepository).forEach(mock => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear();
      }
    });
    Object.values(mockSessionRepository).forEach(mock => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear();
      }
    });
  });

  describe('createUser', () => {
    it('hashes password and saves a new user', async () => {
      // Arrange
      const mockUser = { username: 'alice', email: 'a@example.com', password: 'hashed-pass' };
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.createUser('alice', 'a@example.com', 'secret');

      // Assert
      expect(hashPassword).toHaveBeenCalledWith('secret');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it('calls User.findOne with email', async () => {
      const mockUser = { username: 'bob', email: 'b@example.com' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const res = await AuthService.findUserByEmail('b@example.com');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'b@example.com' } });
      expect(res).toEqual(mockUser);
    });
  });

  describe('getLoginUser', () => {
    it('returns user when credentials are valid', async () => {
      const user = { _id: 'u1', email: 'u@example.com', password: 'hashed' };
      (AuthService.findUserByEmail as any) = jest.fn().mockResolvedValue(user);
      (comparePasswords as jest.Mock).mockResolvedValue(true);

      const res = await AuthService.getLoginUser('u@example.com', 'pass');
      expect(res).toBe(user);
    });

    it('throws when user not found', async () => {
      (AuthService.findUserByEmail as any) = jest.fn().mockResolvedValue(null);
      await expect(AuthService.getLoginUser('no@example.com', 'p')).rejects.toThrow();
    });

    it('throws when password invalid', async () => {
      const user = { _id: 'u1', email: 'u@example.com', password: 'hashed' };
      (AuthService.findUserByEmail as any) = jest.fn().mockResolvedValue(user);
      (comparePasswords as jest.Mock).mockResolvedValue(false);
      await expect(AuthService.getLoginUser('u@example.com', 'wrong')).rejects.toThrow();
    });
  });

  describe('createAuthSession', () => {
    it('creates session and returns tokens', async () => {
      mockSessionRepository.findOne.mockResolvedValue(null);
      const mockSession = { userId: 'uid1', refreshToken: 'refresh-token', sessionId: 'session-uuid' };
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);

      const res = await AuthService.createAuthSession('uid1', 'u@example.com');
      expect(generateRefreshToken).toHaveBeenCalledWith('uid1');
      expect(generateAccessToken).toHaveBeenCalledWith('uid1', 'u@example.com');
      expect(res).toHaveProperty('accessToken');
      expect(res).toHaveProperty('refreshToken');
    });
  });

  describe('refreshAuthSession', () => {
    it('returns new access token when refresh token valid and session exists', async () => {
      (verifyRefreshToken as jest.Mock).mockResolvedValue({ sub: 'uid1' });
      mockSessionRepository.findOne.mockResolvedValue({ userId: 'uid1', refreshToken: 'rtoken' });
      (generateAccessToken as jest.Mock).mockReturnValue('new-access');

      const res = await AuthService.refreshAuthSession('rtoken');
      expect(res.accessToken).toBe('new-access');
      expect(res.userId).toBe('uid1');
    });

    it('throws when refresh token invalid', async () => {
      (verifyRefreshToken as jest.Mock).mockResolvedValue(null);
      await expect(AuthService.refreshAuthSession('bad')).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('returns user when token valid and user exists', async () => {
      const req: any = { headers: { authorization: 'Bearer atoken' }, cookies: {} };
      (verifyAccessToken as jest.Mock).mockResolvedValue({ sub: 'uid1' });
      const mockUser = { id: 'uid1', email: 'u@example.com' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const res = await AuthService.validateToken(req as any);
      expect(verifyAccessToken).toHaveBeenCalledWith('atoken');
      expect(res).toEqual(mockUser);
    });

    it('throws when token missing', async () => {
      const req: any = { headers: {}, cookies: {} };
      await expect(AuthService.validateToken(req)).rejects.toThrow();
    });
  });
});
