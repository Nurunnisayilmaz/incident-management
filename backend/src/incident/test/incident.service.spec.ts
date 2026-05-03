/// <reference types="jest" />

// Create mock repository first
const mockIncidentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
};

const mockAuditLogRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

// Mock AppDataSource before importing anything
jest.mock('@/utils/database', () => ({
  AppDataSource: {
    getRepository: jest.fn((entity: any) => {
      if (entity.name === 'Incident') {
        return mockIncidentRepository;
      }
      if (entity.name === 'IncidentAuditLog') {
        return mockAuditLogRepository;
      }
    }),
  },
  runTransaction: jest.fn(),
}));

// Mock cache operations
jest.mock('@/utils/cache', () => ({
  cache: {
    deleteSmart: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock cache keys
jest.mock('@/utils/cache/keys', () => ({
  cacheKeys: {
    incidents: {
      key: jest.fn().mockReturnValue('incidents:cache:key'),
      ttl: 300,
      deleteSmart: jest.fn(),
    },
  },
}));

// Mock pagination utility
jest.mock('@/utils/pagination/pagination', () => ({
  paginate: jest.fn(),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  getLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
  }),
}));

// Mock socket
jest.mock('@/utils/socket', () => ({
  getIO: jest.fn().mockReturnValue({
    emit: jest.fn(),
  }),
}));

// Mock typeorm ILike before importing the service
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  ILike: jest.fn((value) => ({ _type: 'like', _value: value })),
}));

// Now import everything after mocks are set up
import { IncidentService } from '../services/incident.service';
import { runTransaction } from '../../utils/database';
import { cache } from '../../utils/cache';
import { cacheKeys } from '../../utils/cache/keys';
import { paginate } from '../../utils/pagination/pagination';
import { getIO } from '../../utils/socket';
import { Incident } from '../models/incident.entity';
import type { IncidentInputDto } from '../dto/incident.input.dto';
import { IncidentStatusEnum } from '../models/enums/incident-status.enum';
import { IncidentSeverityEnum } from '../models/enums/incident-severity.enum';

// Mock the static repository directly on the IncidentService class
(IncidentService as any).repo = mockIncidentRepository;

// Mock the audit log service repository
const IncidentAuditLogService = require('../services/incident-audit-log.service').IncidentAuditLogService;
(IncidentAuditLogService as any).repo = mockAuditLogRepository;

describe('IncidentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset repository mocks
    Object.values(mockIncidentRepository).forEach(mock => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear();
      }
    });
    Object.values(mockAuditLogRepository).forEach(mock => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear();
      }
    });
  });

  describe('create', () => {
    it('creates and saves a new incident', async () => {
      // Arrange
      const dto: IncidentInputDto = {
        title: 'Test Incident',
        description: 'Test Description',
        service: 'payment',
        severity: IncidentSeverityEnum.HIGH,
      };

      const mockIncident = {
        id: 1,
        ...dto,
        status: IncidentStatusEnum.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          create: jest.fn().mockReturnValue(mockIncident),
          save: jest.fn().mockResolvedValue(mockIncident),
        }),
      };

      (runTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockManager);
      });

      // Act
      const result = await IncidentService.create(dto);

      // Assert
      expect(runTransaction).toHaveBeenCalled();
      expect(mockManager.getRepository).toHaveBeenCalledWith(Incident);
      expect(result).toEqual(mockIncident);
      expect(cache.deleteSmart).toHaveBeenCalledWith(cacheKeys.incidents);
      expect(getIO().emit).toHaveBeenCalledWith('incident:created', mockIncident);
    });
  });

  describe('getList', () => {
    it('returns cached result when available', async () => {
      // Arrange
      const cachedResult = { data: [], total: 0, page: 1, limit: 10 };
      (cache.get as jest.Mock).mockResolvedValue(cachedResult);

      // Act
      const result = await IncidentService.getList(1, 10);

      // Assert
      expect(cache.get).toHaveBeenCalledWith('incidents:cache:key');
      expect(result).toEqual(cachedResult);
      expect(paginate).not.toHaveBeenCalled();
    });

    it('fetches from database when not cached', async () => {
      // Arrange
      const dbResult = {
        data: [{ id: 1, title: 'Test Incident' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      (cache.get as jest.Mock).mockResolvedValue(null);
      (paginate as jest.Mock).mockResolvedValue(dbResult);

      // Act
      const result = await IncidentService.getList(1, 10);

      // Assert
      expect(paginate).toHaveBeenCalledWith(
        mockIncidentRepository,
        1,
        10,
        {},
        { order: { createdAt: 'DESC' } }
      );
      expect(cache.set).toHaveBeenCalledWith('incidents:cache:key', dbResult, 300);
      expect(result).toEqual(dbResult);
    });

    it('applies search filter', async () => {
      // Arrange
      const dbResult = { data: [], total: 0, page: 1, limit: 10 };
      (cache.get as jest.Mock).mockResolvedValue(null);
      (paginate as jest.Mock).mockResolvedValue(dbResult);

      // Act
      await IncidentService.getList(1, 10, 'test search');

      // Assert
      expect(paginate).toHaveBeenCalledWith(
        mockIncidentRepository,
        1,
        10,
        { service: { _type: 'like', _value: '%test search%' } },
        { order: { createdAt: 'DESC' } }
      );
    });

    it('applies status filter', async () => {
      // Arrange
      const dbResult = { data: [], total: 0, page: 1, limit: 10 };
      (cache.get as jest.Mock).mockResolvedValue(null);
      (paginate as jest.Mock).mockResolvedValue(dbResult);

      // Act
      await IncidentService.getList(1, 10, undefined, IncidentStatusEnum.RESOLVED);

      // Assert
      expect(paginate).toHaveBeenCalledWith(
        mockIncidentRepository,
        1,
        10,
        { status: IncidentStatusEnum.RESOLVED },
        { order: { createdAt: 'DESC' } }
      );
    });

    it('applies all filters', async () => {
      // Arrange
      const dbResult = { data: [], total: 0, page: 1, limit: 10 };
      (cache.get as jest.Mock).mockResolvedValue(null);
      (paginate as jest.Mock).mockResolvedValue(dbResult);

      // Act
      await IncidentService.getList(
        1,
        10,
        'payment', // service search
        IncidentStatusEnum.INVESTIGATING,
        IncidentSeverityEnum.CRITICAL
      );

      // Assert
      expect(paginate).toHaveBeenCalledWith(
        mockIncidentRepository,
        1,
        10,
        {
          service: { _type: 'like', _value: '%payment%' },
          status: IncidentStatusEnum.INVESTIGATING,
          severity: IncidentSeverityEnum.CRITICAL,
        },
        { order: { createdAt: 'DESC' } }
      );
    });
  });

  describe('getIncident', () => {
    it('returns incident when found', async () => {
      // Arrange
      const mockIncident = { id: 1, title: 'Test Incident' };
      mockIncidentRepository.findOne.mockResolvedValue(mockIncident);

      // Act
      const result = await IncidentService.getIncident(1);

      // Assert
      expect(mockIncidentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockIncident);
    });

    it('returns null when incident not found', async () => {
      // Arrange
      mockIncidentRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await IncidentService.getIncident(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates incident successfully', async () => {
      // Arrange
      const existingIncident = {
        id: 1,
        title: 'Old Title',
        description: 'Old Description',
        service: 'payment',
        severity: IncidentSeverityEnum.LOW,
      };

      const updateDto = {
        title: 'New Title',
        severity: IncidentSeverityEnum.HIGH,
      };

      const updatedIncident = {
        ...existingIncident,
        ...updateDto,
        updatedAt: new Date(),
      };

      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(existingIncident),
          merge: jest.fn().mockReturnValue(updatedIncident),
          save: jest.fn().mockResolvedValue(updatedIncident),
        }),
      };

      (runTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockManager);
      });

      // Act
      const result = await IncidentService.update(1, 'user-1', updateDto);

      // Assert
      expect(runTransaction).toHaveBeenCalled();
      expect(mockManager.getRepository).toHaveBeenCalledWith(Incident);
      expect(result).toEqual(updatedIncident);
      expect(cache.deleteSmart).toHaveBeenCalledWith(cacheKeys.incidents);
      expect(getIO().emit).toHaveBeenCalledWith('incident:updated', updatedIncident);
    });

    it('throws error when incident not found', async () => {
      // Arrange
      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
        }),
      };

      (runTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockManager);
      });

      // Act & Assert
      await expect(IncidentService.update(999, 'user-1', { title: 'New Title' })).rejects.toThrow('Incident not found');

      jest.spyOn(IncidentAuditLogService, 'logChanges').mockResolvedValue(undefined);
    });
  });

  describe('softDelete', () => {
    it('soft deletes incident successfully', async () => {
      // Arrange
      const existingIncident = { id: 1, title: 'Test Incident' };

      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(existingIncident),
          softDelete: jest.fn().mockResolvedValue(undefined),
        }),
      };

      (runTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockManager);
      });

      // Act
      await IncidentService.softDelete(1);

      // Assert
      expect(runTransaction).toHaveBeenCalled();
      expect(mockManager.getRepository).toHaveBeenCalledWith(Incident);
      expect(mockManager.getRepository().softDelete).toHaveBeenCalledWith(1);
      expect(cache.deleteSmart).toHaveBeenCalledWith(cacheKeys.incidents);
      expect(getIO().emit).toHaveBeenCalledWith('incident:deleted', { id: 1 });
    });

    it('throws error when incident not found', async () => {
      // Arrange
      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
        }),
      };

      (runTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockManager);
      });

      // Act & Assert
      await expect(IncidentService.softDelete(999)).rejects.toThrow('Incident not found');
    });
  });
});