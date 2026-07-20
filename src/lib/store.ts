import { createRequire } from "node:module";

export interface Alert {
  id: string;
  ticker: string;
  threshold?: number;
  percent?: number;
  createdAt: number;
}

export interface UserData {
  watchlist: string[];
  alerts: Alert[];
  quietHoursStart: string;
  quietHoursEnd: string;
  cooldownDuration: number;
  summaryTime: string;
  lastAlertTime: number;
}

const DEFAULT_USER_DATA: UserData = {
  watchlist: [],
  alerts: [],
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  cooldownDuration: 30,
  summaryTime: "08:00",
  lastAlertTime: 0,
};

export interface UserStore {
  getUser(userId: string): Promise<UserData>;
  setUser(userId: string, data: UserData): Promise<void>;
  getAllUserIds(): Promise<string[]>;
}

class RedisUserStore implements UserStore {
  private client: any;
  private prefix = "cw:user:";

  constructor(url: string) {
    const require = createRequire(import.meta.url);
    const ioredis = require("ioredis");
    const Redis = ioredis.default ?? ioredis.Redis ?? ioredis;
    this.client = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
  }

  async getUser(userId: string): Promise<UserData> {
    const raw = await this.client.get(this.prefix + userId);
    if (!raw) return { ...DEFAULT_USER_DATA, watchlist: [], alerts: [] };
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_USER_DATA, ...parsed, watchlist: [...(parsed.watchlist ?? [])], alerts: [...(parsed.alerts ?? [])] };
    } catch {
      return { ...DEFAULT_USER_DATA, watchlist: [], alerts: [] };
    }
  }

  async setUser(userId: string, data: UserData): Promise<void> {
    await this.client.set(this.prefix + userId, JSON.stringify({ ...data, watchlist: [...data.watchlist], alerts: [...data.alerts] }));
  }

  async getAllUserIds(): Promise<string[]> {
    const keys = await this.client.keys(this.prefix + "*");
    return keys.map((k: string) => k.slice(this.prefix.length));
  }
}

class MemoryUserStore implements UserStore {
  private store = new Map<string, UserData>();

  async getUser(userId: string): Promise<UserData> {
    const data = this.store.get(userId);
    if (data) {
      return { ...data, watchlist: [...data.watchlist], alerts: [...data.alerts] };
    }
    return { ...DEFAULT_USER_DATA, watchlist: [], alerts: [] };
  }

  async setUser(userId: string, data: UserData): Promise<void> {
    this.store.set(userId, { ...data, watchlist: [...data.watchlist], alerts: [...data.alerts] });
  }

  async getAllUserIds(): Promise<string[]> {
    return [...this.store.keys()];
  }
}

let globalStore: UserStore | null = null;

export function resolveUserStore(
  env: { REDIS_URL?: string } = process.env,
  make: (url: string) => UserStore = (url) => new RedisUserStore(url),
): UserStore {
  if (globalStore) return globalStore;
  if (env.REDIS_URL) {
    globalStore = make(env.REDIS_URL);
  } else {
    globalStore = new MemoryUserStore();
  }
  return globalStore;
}

export function resetUserStore(): void {
  globalStore = null;
}
