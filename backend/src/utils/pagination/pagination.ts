import { Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { PaginatedResponse } from './interfaces';
import { PaginationMetadata } from './types';
import envvars from '@/config/envvars';

export async function paginate<T extends Object>(
  repository: Repository<T>,
  page: number = 1,
  limit: number = 10,
  where: FindOptionsWhere<T> = {},
  options: FindManyOptions<T> = {}
): Promise<PaginatedResponse<T>> {

  const enforcedLimit = enforceMaxLimit(limit);
  const skip = (page - 1) * enforcedLimit;

  const [items, totalItems] = await repository.findAndCount({
    where,
    skip,
    take: enforcedLimit,
    ...options,
  });

  return {
    items,
    pagination: getPaginationMetadata(totalItems, skip, enforcedLimit, page),
  };
}

function enforceMaxLimit(limit: number): number {
  const maxLimit = envvars.pagination.maxLimit;
  return Math.min(limit, maxLimit);
}

function getPaginationMetadata(
  totalItems: number,
  offset: number,
  limit: number,
  page: number
): PaginationMetadata {
  return {
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    pageSize: limit,
    hasNextPage: offset + limit < totalItems,
    hasPrevPage: page > 1,
  };
}