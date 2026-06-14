
import { GuildState } from '../types';

export interface GuildSummary {
  id: string;
  guild_name: string;
  updated_at: string;
  member_count?: number;
  domain_count?: number;
  wallet_summary?: string;
}

const REFRESH_THRESHOLD_SEC = 1800; // 30 minutos

const apiRequest = async (endpoint: string, options?: RequestInit) => {
  // Tenta renovar token antes de qualquer request
  await maybeRefreshToken();

  const method = options?.method || 'GET';
  const url = `/api/${endpoint}`;
  console.log('[DEBUG apiRequest]', method, url, ' | body length:', options?.body ? String(options.body).length : 0);

  const res = await fetch(url, options);
  console.log('[DEBUG apiRequest] RESPONSE |', method, url, ' | status:', res.status, ' | statusText:', res.statusText);
  console.log('[DEBUG apiRequest] X-Session-Token:', res.headers.get('X-Session-Token')?.substring(0, 20) || '(none)', ' | X-Token-Expires-In:', res.headers.get('X-Token-Expires-In') || '(none)');

  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.log('[DEBUG apiRequest] PARSE ERROR |', method, url, ' | status:', res.status, ' | body:', text.substring(0, 200));
    throw new Error(`Erro no Servidor: ${res.status} ${res.statusText}`);
  }

  if (!res.ok) {
    const errorMessage = data.error || `API Error: ${res.status} ${res.statusText}`;
    console.log('[DEBUG apiRequest] ERROR |', method, url, ' | status:', res.status, ' | message:', errorMessage, ' | data:', JSON.stringify(data).substring(0, 200));
    const error: any = new Error(errorMessage);
    error.status = res.status;
    error.type = data.type;
    throw error;
  }
  console.log('[DEBUG apiRequest] SUCCESS |', method, url, ' | status:', res.status);
  return { data, headers: res.headers };
};

function getToken(): string | null {
  return sessionStorage.getItem('guild_token') || localStorage.getItem('admin_token');
}

function getTokenStorage(): 'session' | 'local' | null {
  if (sessionStorage.getItem('guild_token')) return 'session';
  if (localStorage.getItem('admin_token')) return 'local';
  return null;
}

function getTokenExpiresAt(): number | null {
  const val = sessionStorage.getItem('guild_token_expires_at') || localStorage.getItem('admin_token_expires_at');
  return val ? Number(val) : null;
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
  localStorage.removeItem('active_guild_id');
}

async function maybeRefreshToken() {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return;

  const now = Math.floor(Date.now() / 1000);
  if (now < expiresAt - REFRESH_THRESHOLD_SEC) return; // ainda fresco

  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      // Token expirado e não renovável — limpa
      clearTokens();
      return;
    }
    const data = await res.json();
    if (data.token) {
      const storage = getTokenStorage() || 'session';
      setToken(data.token, storage);
      if (data.expiresIn) {
        const newExpiresAt = String(Math.floor(Date.now() / 1000) + data.expiresIn);
        if (storage === 'local') {
          localStorage.setItem('admin_token_expires_at', newExpiresAt);
        } else {
          sessionStorage.setItem('guild_token_expires_at', newExpiresAt);
        }
      }
    }
  } catch {
    // Falha na renovação — continua com token atual (pode expirar na request)
  }
}

export const dbService = {
  // --- USER METHODS ---

  async saveGuild(guild: GuildState, password?: string) {
    if (!password) throw new Error("Senha necessária para salvar no servidor.");
    const token = getToken();
    console.log('[DEBUG saveGuild] token present:', !!token, ' | password length:', password.length, ' | password (first 20 chars):', password.substring(0, 20), ' | id:', guild.id, ' | version:', guild.version, ' | quests:', guild.quests?.length);
    const payload = { ...guild, password };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let data;
    try {
      const response = await apiRequest('guilds', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      data = response.data;
      console.log('[DEBUG saveGuild] SUCCESS | id:', guild.id, ' | version:', guild.version);
    } catch (e: any) {
      console.log('[DEBUG saveGuild] ERROR | id:', guild.id, ' | version:', guild.version, ' | status:', e.status, ' | message:', e.message);
      throw e;
    }
    return data;
  },

  async deleteGuild(id: string, password?: string) {
    const token = getToken();
    if (!password && !token) throw new Error("Senha ou autenticação necessária para apagar.");
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

  async exportGuild(id: string): Promise<GuildState | null> {
    const token = getToken();
    if (!token) throw new Error("Autenticação necessária para exportar.");
    const { data } = await apiRequest(`guilds?id=${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return data;
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
    console.log('[DEBUG getGuild] id:', id, ' | password length:', password.length, ' | password (first 20 chars):', password.substring(0, 20));
    try {
      sessionStorage.removeItem('guild_token');
      const headers: Record<string, string> = {};
      headers['Authorization'] = `Bearer ${password}`;

      const { data, headers: respHeaders } = await apiRequest(`guilds?id=${id}`, {
        method: 'GET',
        headers,
      });

      const sessionToken = respHeaders.get('X-Session-Token');
      const expiresIn = respHeaders.get('X-Token-Expires-In');
      if (sessionToken) {
        console.log('[DEBUG getGuild] NEW JWT ISSUED | expiresIn:', expiresIn, ' | token (first 20 chars):', sessionToken.substring(0, 20));
        setToken(sessionToken, 'session');
        if (expiresIn) {
          const expiresAt = Math.floor(Date.now() / 1000) + Number(expiresIn);
          sessionStorage.setItem('guild_token_expires_at', String(expiresAt));
        }
        sessionStorage.removeItem('active_guild_key');
      } else {
        console.log('[DEBUG getGuild] NO NEW JWT — token was cleared earlier, session may fail on next refresh');
      }
      console.log('[DEBUG getGuild] SUCCESS | id:', id, ' | quests:', data?.quests?.length, ' | data keys:', Object.keys(data || {}));
      return data;
    } catch (e) {
      console.error("[DEBUG getGuild] ERROR | id:", id, ' | error:', e);
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
    const { data } = await apiRequest('admin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'change_admin_password', password: currentPass, newPassword: newPass })
    });
    return data;
  },

  async resetGuildPassword(adminPass: string, guildId: string, newGuildPass: string) {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const { data } = await apiRequest('admin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'reset_guild_password', password: adminPass, guildId, newPassword: newGuildPass })
    });
    return data;
  },

  async revokeAllSessions(adminPass: string) {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const { data } = await apiRequest('admin', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'revoke_all', password: adminPass })
    });
    return data;
  },

  // --- SESSION UTILS ---

  async setSession(id: string, password?: string) {
    if (id && password) {
      localStorage.setItem('active_guild_id', id);
    } else {
      clearTokens();
    }
  },

  async getSession(): Promise<{ id: string; token: string } | null> {
    const id = localStorage.getItem('active_guild_id');
    const token = getToken();
    if (id && token) return { id, token };
    const oldKey = sessionStorage.getItem('active_guild_key');
    if (id && oldKey) {
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
    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return true;
    return Math.floor(Date.now() / 1000) >= expiresAt;
  },

  async logout() {
    clearTokens();
  },
};
