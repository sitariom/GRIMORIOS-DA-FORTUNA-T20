
import { GuildState } from '../types';

export interface GuildSummary {
  id: string;
  guild_name: string;
  updated_at: string;
}

const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`/api/${endpoint}`, options);
  const text = await res.text();
  
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    // Se falhar o parse e o status for erro, lança erro com status
    throw new Error(`Erro no Servidor: ${res.status} ${res.statusText}`);
  }

  if (!res.ok) throw new Error(data.error || `API Error: ${res.status} ${res.statusText}`);
  return data;
};

export const dbService = {
  // --- USER METHODS ---

  async saveGuild(guild: GuildState, password?: string) {
    if (!password) throw new Error("Senha necessária para salvar no servidor.");
    const payload = { ...guild, password };
    await apiRequest('guilds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteGuild(id: string, password?: string) {
    if (!password) throw new Error("Senha necessária para apagar.");
    await apiRequest(`guilds?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${password}` }
    });
  },

  async getAllGuilds(): Promise<GuildSummary[]> {
    try {
      return await apiRequest('guilds');
    } catch (e: any) {
      // Silencia erro 404 (API não encontrada/Deploy incompleto) para não travar a UI inicial
      if (e.message.includes('404')) {
          console.warn("API de guildas não encontrada (404). Verifique se o backend está rodando.");
          return [];
      }
      console.error("Erro ao buscar lista de guildas:", e);
      // Retorna array vazio para não quebrar o map na UI
      return [];
    }
  },

  async getGuild(id: string, password?: string): Promise<GuildState | null> {
    if (!password) return null;
    try {
      const data = await apiRequest(`guilds?id=${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${password}` }
      });
      return data;
    } catch (e) {
      console.error("Erro ao carregar guilda:", e);
      throw e;
    }
  },

  // --- ADMIN METHODS ---

  async loginAdmin(password: string) {
    return apiRequest('admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password })
    });
  },

  async changeAdminPassword(currentPass: string, newPass: string) {
    return apiRequest('admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_admin_password', password: currentPass, newPassword: newPass })
    });
  },

  async resetGuildPassword(adminPass: string, guildId: string, newGuildPass: string) {
    return apiRequest('admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_guild_password', password: adminPass, guildId, newPassword: newGuildPass })
    });
  },

  // --- SESSION UTILS ---

  async setSession(id: string, password?: string) {
    if(id && password) {
        localStorage.setItem('active_guild_id', id);
        sessionStorage.setItem('active_guild_key', password);
    } else {
        localStorage.removeItem('active_guild_id');
        sessionStorage.removeItem('active_guild_key');
    }
  },

  async getSession(): Promise<{id: string, key: string} | null> {
    const id = localStorage.getItem('active_guild_id');
    const key = sessionStorage.getItem('active_guild_key');
    if (id && key) return { id, key };
    return null;
  }
};
