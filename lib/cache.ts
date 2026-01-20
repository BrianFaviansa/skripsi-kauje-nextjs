import redis from "./redis";

const DEFAULT_TTL = 60; // 60 seconds

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } catch (error) {
    console.warn(`Cache get error for key ${key}:`, error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  data: unknown,
  ttlSeconds: number = DEFAULT_TTL,
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.warn(`Cache set error for key ${key}:`, error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`Cache delete error for key ${key}:`, error);
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn(`Cache delete pattern error for ${pattern}:`, error);
  }
}

// Cache key generators
export const CacheKeys = {
  // News
  newsList: (page: number, limit: number, query?: string) =>
    `news:list:${page}:${limit}:${query || "all"}`,
  newsItem: (id: string) => `news:item:${id}`,
  newsPattern: () => "news:*",

  // Jobs
  jobsList: (page: number, limit: number, query?: string) =>
    `jobs:list:${page}:${limit}:${query || "all"}`,
  jobsItem: (id: string) => `jobs:item:${id}`,
  jobsPattern: () => "jobs:*",

  // Forums
  forumsList: (page: number, limit: number, query?: string) =>
    `forums:list:${page}:${limit}:${query || "all"}`,
  forumsItem: (id: string) => `forums:item:${id}`,
  forumsPattern: () => "forums:*",

  // Collaborations
  collaborationsList: (page: number, limit: number, query?: string) =>
    `collaborations:list:${page}:${limit}:${query || "all"}`,
  collaborationsItem: (id: string) => `collaborations:item:${id}`,
  collaborationsPattern: () => "collaborations:*",

  // Products
  productsList: (page: number, limit: number, query?: string) =>
    `products:list:${page}:${limit}:${query || "all"}`,
  productsItem: (id: string) => `products:item:${id}`,
  productsPattern: () => "products:*",

  // Users
  usersList: (page: number, limit: number, query?: string) =>
    `users:list:${page}:${limit}:${query || "all"}`,
  usersItem: (id: string) => `users:item:${id}`,
  usersPattern: () => "users:*",
};

// TTL values in seconds
export const CacheTTL = {
  SHORT: 30, // 30 seconds - for frequently changing data
  MEDIUM: 60, // 1 minute - for lists
  LONG: 300, // 5 minutes - for individual items
  VERY_LONG: 3600, // 1 hour - for static data
};
