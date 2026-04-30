import { CacheKeyEntry, PaginatedCacheKey } from "./types";

export const cacheKeys = {
    users: {
        key: (params: PaginatedCacheKey) =>
            `/users?page=${params.page}&limit=${params.limit}`,
        ttl: 60,
    } satisfies CacheKeyEntry<PaginatedCacheKey, string>,

    incidents: {
        key: (params: PaginatedCacheKey) =>
            `/incidents?page=${params.page}&limit=${params.limit}`,
        ttl: 60,
    } satisfies CacheKeyEntry<PaginatedCacheKey, string>,
};
