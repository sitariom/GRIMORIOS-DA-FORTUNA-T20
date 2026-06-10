
import { GuildState } from '../types';

export interface GuildSummary {
  id: string;
  guild_name: string;
  updated_at: string;
  member_count?: number;
  domain_count?: number;
  wallet_summary?: string;
}

const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const url = `/api/${endpoint}`;
  const res = await fetch(url, options);
  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Erro no Servidor: ${res.status} ${res.statusText}`);
  }

  if (!res.ok) {
    const errorMessage = data.error || `API Error: ${res.status} ${res.statusText}`;
    const error: any = new Error(errorMessage);
    error.status = res.status;
    error.type = data.type;
    throw error;
  }
  return { data, headers: res.headers };
};

function getToken(): string | null {
  return sessionStorage.getItem('guild_token') || localStorage.getItem('admin_token');
}

function setToken(token: string, storage: 'session' | 'local' = 'session') {
  if (storage === 'local') {
    localStorage.setItem('admin_token', token);
  } else {
    sessionStorage.setItem('guild_token', token);
  }
}

function clearTokens() {
  sessionStorage.removeItem('guild_token');
  sessionStorage.removeItem('guild_token_expires_at');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_token_expires_at');
}

export const dbService = {
  // --- USER METHODS ---

  async saveGuild(guild: GuildState, password?: string) {
    if (!password) throw new Error("Senha necessária para salvar no servidor.");
    const token = getToken();
    const payload = { ...guild, password };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await apiRequest('guilds', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  },

  async deleteGuild(id: string, password?: string) {
    if (!password) throw new Error("Senha necessária para apagar.");
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = `Bearer ${password}`;
    }
    await apiRequest(`guilds?id=${id}`, {
      method: 'DELETE',
      headers,
    });
  },

  async getAllGuilds(): Promise<GuildSummary[]> {
    try {
      const { data } = await apiRequest('guilds');
      return data;
    } catch (e: any) {
      if (e.message.includes('404')) {
        console.warn("API de guildas não encontrada (404).");
        return [];
      }
      console.error("Erro ao buscar lista de guildas:", e);
      return [];
    }
  },

  async getGuild(id: string, password?: string): Promise<GuildState | null> {
    if (!password) return null;
    try {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Authorization'] = `Bearer ${password}`;
      }

      const { data, headers: respHeaders } = await apiRequest(`guilds?id=${id}`, {
        method: 'GET',
        headers,
      });

      // Se recebeu JWT, armazena no lugar da senha
      const sessionToken = respHeaders.get('X-Session-Token');
      const expiresIn = respHeaders.get('X-Token-Expires-In');
      if (sessionToken) {
        setToken(sessionToken, 'session');
        if (expiresIn) {
          const expiresAt = Math.floor(Date.now() / 1000) + Number(expiresIn);
          sessionStorage.setItem('guild_token_expires_at', String(expiresAt));
        }
        // Remove senha do sessionStorage se ainda existir (migração)
        sessionStorage.removeItem('active_guild_key');
      }
      return data;
    } catch (e) {
      console.error("Erro ao carregar guilda:", e);
      throw e;
    }
  },

  async getMembers(id: string, status?: string) {
    const token = getToken();
    if (!token) throw new Error("Autenticação necessária");
    const query = status ? `members?status=${encodeURIComponent(status)}` : 'members';
    const { data } = await apiRequest(`guilds/${id}/${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return data;
  },

  async getDomains(id: string) {
    const token = getToken();
    if (!token) throw new Error("Autenticação necessária");
    const { data } = await apiRequest(`guilds/${id}/domains`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return data;
  },

  async getItems(id: string) {
    const token = getToken();
    if (!token) throw new Error("Autenticação necessária");
    const { data } = await apiRequest(`guilds/${id}/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return data;
  },

  async getWallet(id: string) {
    const token = getToken();
    if (!token) throw new Error("Autenticação necessária");
    const { data } = await apiRequest(`guilds/${id}/wallet`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return data;
  },

  // --- ADMIN METHODS ---

  async loginAdmin(password: string) {
    const { data } = await apiRequest('admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password })
    });
    if (data.token) {
      setToken(data.token, 'local');
      if (data.expiresIn) {
        const expiresAt = Math.floor(Date.now() / 1000) + data.expiresIn;
        localStorage.setItem('admin_token_expires_at', String(expiresAt));
      }
    }
    return data;
  },

  async changeAdminPassword(currentPass: string, newPass: string) {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiRequest('admin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'change_admin_password', password: currentPass, newPassword: newPass })
    });
  },

  async resetGuildPassword(adminPass: string, guildId: string, newGuildPass: string) {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiRequest('admin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'reset_guild_password', password: adminPass, guildId, newPassword: newGuildPass })
    });
  },

  async revokeAllSessions(adminPass: string) {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiRequest('admin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'revoke_all', password: adminPass })
    });
  },

  // --- SESSION UTILS ---

  async setSession(id: string, password?: string) {
    if (id && password) {
      localStorage.setItem('active_guild_id', id);
      // A senha NÃO é mais armazenada — apenas JWT via getGuild()
    } else {
      localStorage.removeItem('active_guild_id');
      clearTokens();
    }
  },

  async getSession(): Promise<{ id: string; token: string } | null> {
    const id = localStorage.getItem('active_guild_id');
    const token = getToken();
    if (id && token) return { id, token };
    // Fallback: se tem senha antiga, precisa relogar
    const oldKey = sessionStorage.getItem('active_guild_key');
    if (id && oldKey) {
      // Migração: tenta login e obtém JWT
      try {
        await this.getGuild(id, oldKey);
        const newToken = getToken();
        if (newToken) return { id, token: newToken };
      } catch {
        sessionStorage.removeItem('active_guild_key');
      }
    }
    return null;
  },

  async isTokenExpired(): Promise<boolean> {
    const expiresAt = sessionStorage.getItem('guild_token_expires_at') || localStorage.getItem('admin_token_expires_at');
    if (!expiresAt) return true;
    return Math.floor(Date.now() / 1000) >= Number(expiresAt);
  },

  async logout() {
    localStorage.removeItem('active_guild_id');
    clearTokens();
  }
};
