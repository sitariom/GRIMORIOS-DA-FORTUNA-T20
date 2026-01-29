
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GuildState } from '../types';

interface GrimoireDB extends DBSchema {
  guilds: {
    key: string;
    value: GuildState;
  };
  settings: {
    key: string;
    value: string;
  };
}

const DB_NAME = 'GrimoireFortunaDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<GrimoireDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<GrimoireDB>(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase<GrimoireDB>) {
        if (!db.objectStoreNames.contains('guilds')) {
          db.createObjectStore('guilds', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
};

export const dbService = {
  async saveGuild(guild: GuildState) {
    const db = await getDB();
    await db.put('guilds', guild);
  },

  async deleteGuild(id: string) {
    const db = await getDB();
    await db.delete('guilds', id);
  },

  async getAllGuilds(): Promise<GuildState[]> {
    const db = await getDB();
    return db.getAll('guilds');
  },

  async getGuild(id: string): Promise<GuildState | undefined> {
    const db = await getDB();
    return db.get('guilds', id);
  },

  async setActiveGuildId(id: string) {
    const db = await getDB();
    await db.put('settings', id, 'activeGuildId');
  },

  async getActiveGuildId(): Promise<string | undefined> {
    const db = await getDB();
    return db.get('settings', 'activeGuildId');
  }
};
