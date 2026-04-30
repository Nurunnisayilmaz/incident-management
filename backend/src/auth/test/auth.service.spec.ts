/// <reference types="jest" />

import { AuthService } from './auth.service';

// Mock models and utils
jest.mock('../models/user.entity', () => {
  const m: any = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn();
  };
  m.findById = jest.fn();
  m.findOne = jest.fn();
  return { __esModule: true, default: m };
});

jest.mock('../models/auth.session.entity', () => {
  const m: any = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn();
  };
  m.findOne = jest.fn();
  m.updateMany = jest.fn();
  return { __esModule: true, default: m };
});

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

import User from '../models/user.entity';
import AuthSession from '../models/auth.session.entity';
import { hashPassword, comparePasswords } from '../../utils/auth/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } from '../../utils/auth/jwt';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('hashes password and saves a new user', async () => {
      // Arrange
      const mockSave = jest.fn();
      const NewUser = jest.fn().mockImplementation(() => ({ save: mockSave }));
      (User as any).mockImplementation = NewUser;

      // Act
      const result = await AuthService.createUser('alice', 'a@example.com', 'secret');

      // Assert
      expect(hashPassword).toHaveBeenCalledWith('secret');
    });
  });

  describe('findUserByEmail', () => {
    it('calls User.findOne with email', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ username: 'bob' });

      const res = await AuthService.findUserByEmail('b@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'b@example.com' });
      expect(res).toEqual({ username: 'bob' });
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
      (AuthSession.findOne as jest.Mock).mockResolvedValue(null);
      const mockSave = jest.fn();
      (AuthSession as any).mockImplementation = jest.fn().mockImplementation(() => ({ save: mockSave }));

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
      (AuthSession.findOne as jest.Mock).mockResolvedValue({});
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
      (User.findById as jest.Mock).mockResolvedValue({ _id: 'uid1' });

      const res = await AuthService.validateToken(req as any);
      expect(verifyAccessToken).toHaveBeenCalledWith('atoken');
      expect(res).toEqual({ _id: 'uid1' });
    });

    it('throws when token missing', async () => {
      const req: any = { headers: {}, cookies: {} };
      await expect(AuthService.validateToken(req)).rejects.toThrow();
    });
  });
});
