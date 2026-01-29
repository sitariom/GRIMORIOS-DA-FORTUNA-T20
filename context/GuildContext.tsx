
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { GuildState, Item, Base, Domain, LogEntry, Member, CurrencyType, LogCategory, BasePorte, BaseType, DomainBuilding, DomainUnit, NPC, GovernResult, CalendarState, Quest, QuestStatus } from '../types';
import { RATES, PORTE_DATA, COURT_DATA, POPULARITY_LEVELS, ARTON_MONTHS, ARTON_WEEKDAYS } from '../constants';
import { dbService, GuildSummary } from '../services/db';

interface FeedbackMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface GuildContextType extends GuildState {
  isLoading: boolean;
  feedback: FeedbackMessage | null;
  
  // Auth & List
  guildList: GuildSummary[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  guildPassword?: string;
  refreshGuildList: () => void;
  loginToGuild: (id: string, password: string) => Promise<boolean>;
  loginAsAdmin: (password: string) => Promise<boolean>;
  logout: () => void;

  activeGuildId: string;
  createNewGuild: (name: string, password: string) => Promise<void>;
  importGuild: (data: string, password: string) => Promise<void>;
  exportGuildData: (guildId: string) => Promise<void>;
  renameActiveGuild: (name: string) => void;
  deleteActiveGuild: () => void;
  deleteGuildById: (id: string) => Promise<void>;
  
  // Admin Actions
  changeAdminPassword: (oldP: string, newP: string) => Promise<void>;
  resetGuildPassword: (guildId: string, newP: string) => Promise<void>;

  // Actions
  addMember: (name: string) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  removeMember: (id: string) => void;
  
  // Inventory & Money (Guild to Member)
  deposit: (memberId: string, value: number, currency: CurrencyType, reason: string) => void;
  withdraw: (memberId: string, value: number, currency: CurrencyType, reason: string) => void;
  transferGoldToMember: (memberId: string, value: number, currency: CurrencyType) => void;
  transferGoldFromMember: (memberId: string, value: number, currency: CurrencyType) => void;
  convertWallet: (amount: number, from: CurrencyType, to: CurrencyType) => void; 
  
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  sellItem: (itemId: string, qty: number, sellerId: string, percentage: number) => void;
  sellBatchItems: (itemIds: string[], sellerId: string, percentage: number) => void;
  withdrawItem: (itemId: string, memberId: string, reason: string, qty: number) => void;
  transferItemToMember: (itemId: string, memberId: string, qty: number) => void;
  transferItemFromMember: (itemId: string, memberId: string, qty: number) => void;
  memberDiscardItem: (itemId: string, memberId: string, qty: number) => void;
  deleteItem: (itemId: string, qty: number) => void;
  deleteBatchItems: (itemIds: string[]) => void;
  
  // Bases & NPCs
  addBase: (name: string, porte: BasePorte, type: BaseType, initialCostPaid: boolean) => void;
  upgradeBase: (baseId: string, newPorte: BasePorte) => void;
  payBaseMaintenance: (baseId: string, type: 'Regular' | 'Extra', amount: number) => void;
  collectBaseIncome: (baseId: string, amountTO: number) => void;
  demolishBase: (baseId: string) => void;
  addNPC: (npc: Omit<NPC, 'id'>) => void;
  updateNPC: (id: string, updates: Partial<NPC>) => void;
  removeNPC: (npcId: string) => void;
  payAllNPCs: () => void;
  paySingleNPC: (npcId: string) => void;
  addRoom: (baseId: string, name: string, cost: number, isPaid: boolean) => void;
  removeRoom: (baseId: string, roomId: string) => void;
  addFurniture: (baseId: string, roomId: string, name: string, cost: number, isPaid: boolean) => void;
  removeFurniture: (baseId: string, roomId: string, furnitureId: string) => void;
  
  // Domains
  createDomain: (name: string, regent: string, terrain: string, paidCost: boolean) => void;
  updateDomain: (id: string, updates: Partial<Domain>) => void;
  investDomain: (domainId: string, amountLO: number) => void; 
  withdrawDomain: (domainId: string, amountLO: number) => void; 
  manageDomainTreasury: (domainId: string, amountLO: number, type: 'Income' | 'Expense', reason: string) => void; 
  demolishDomain: (id: string) => void;
  levelUpDomain: (id: string) => void;
  governDomain: (domainId: string, rollResult: number) => GovernResult | null;
  addDomainBuilding: (domainId: string, building: Omit<DomainBuilding, 'id'>, paidWithTreasury: boolean) => void;
  removeDomainBuilding: (domainId: string, buildingId: string) => void;
  addDomainUnit: (domainId: string, unit: Omit<DomainUnit, 'id'>, paidWithTreasury: boolean) => void;
  removeDomainUnit: (domainId: string, unitId: string) => void;
  
  // New Features
  advanceDate: (days: number) => void;
  addQuest: (quest: Omit<Quest, 'id' | 'status'>) => void;
  updateQuestStatus: (questId: string, newStatus: QuestStatus) => void;
  deleteQuest: (questId: string) => void;

  exportLogs: () => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

const EMPTY_GUILD: GuildState = {
  id: '',
  guildName: '',
  wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
  items: [],
  bases: [],
  domains: [],
  npcs: [],
  logs: [],
  members: [],
  calendar: { day: 1, month: 0, year: 1420, dayOfWeek: 0 },
  quests: []
};

const INITIAL_GUILD_FACTORY = (name: string): GuildState => ({
  ...EMPTY_GUILD,
  id: crypto.randomUUID(),
  guildName: name,
});

export const GuildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGuild, setActiveGuild] = useState<GuildState>(EMPTY_GUILD);
  const [guildList, setGuildList] = useState<GuildSummary[]>([]);
  const [password, setPassword] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const list = await dbService.getAllGuilds();
        setGuildList(list);

        const session = await dbService.getSession();
        if (session) {
            await loginToGuild(session.id, session.key);
        }
      } catch (error) {
        console.error("Init Error", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const refreshGuildList = async () => {
      try {
        const list = await dbService.getAllGuilds();
        setGuildList(list);
      } catch (e) {
        console.error("Failed to refresh list", e);
      }
  };

  // --- AUTH ---

  const loginToGuild = async (id: string, key: string): Promise<boolean> => {
      setIsLoading(true);
      try {
          const guild = await dbService.getGuild(id, key);
          if (guild) {
              // Ensure new fields exist for old saves
              const sanitizedGuild = {
                  ...guild,
                  calendar: guild.calendar || { day: 1, month: 0, year: 1420, dayOfWeek: 0 },
                  quests: guild.quests || [],
                  members: guild.members.map(m => ({
                      ...m,
                      wallet: m.wallet || { TC: 0, TS: 0, TO: 0, LO: 0 },
                      inventory: m.inventory || []
                  }))
              };
              setActiveGuild(sanitizedGuild);
              setPassword(key);
              setIsAuthenticated(true);
              dbService.setSession(id, key);
              return true;
          }
          return false;
      } catch (e) {
          notify("Acesso negado: Senha incorreta ou erro de servidor.", "error");
          return false;
      } finally {
          setIsLoading(false);
      }
  };

  const loginAsAdmin = async (pwd: string): Promise<boolean> => {
      setIsLoading(true);
      try {
          await dbService.loginAdmin(pwd);
          setIsAdmin(true);
          setAdminPassword(pwd);
          notify("Modo Administrador Ativado", "info");
          return true;
      } catch (e) {
          notify("Senha de Administrador Incorreta", "error");
          return false;
      } finally {
          setIsLoading(false);
      }
  };

  const logout = () => {
      setActiveGuild(EMPTY_GUILD);
      setPassword('');
      setIsAuthenticated(false);
      dbService.setSession('', '');
      refreshGuildList();
  };

  // --- ADMIN ACTIONS ---

  const changeAdminPassword = async (oldP: string, newP: string) => {
      try {
          await dbService.changeAdminPassword(oldP, newP);
          setAdminPassword(newP);
          notify("Senha de Administrador alterada.");
      } catch (e) {
          notify("Falha ao alterar senha de admin.", "error");
      }
  };

  const resetGuildPassword = async (guildId: string, newP: string) => {
      if(!isAdmin) return;
      try {
          await dbService.resetGuildPassword(adminPassword, guildId, newP);
          notify("Senha da guilda redefinida.");
      } catch (e) {
          notify("Erro ao redefinir senha.", "error");
      }
  };

  // --- SAVE ---

  const triggerSave = useCallback((newState: GuildState) => {
      setActiveGuild(newState);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
          if (password && newState.id) {
              dbService.saveGuild(newState, password).catch(err => {
                  console.error(err);
                  notify("Falha ao salvar automaticamente (Verifique conexão).", "error");
              });
          }
      }, 2000);
  }, [password]);

  // --- GUILD MANAGEMENT ---

  const createNewGuild = async (name: string, pwd: string) => {
    setIsLoading(true);
    try {
        const g = INITIAL_GUILD_FACTORY(name);
        await dbService.saveGuild(g, pwd);
        await refreshGuildList();
        if(!isAdmin) {
            await loginToGuild(g.id, pwd);
        }
        notify(`Grimório "${name}" forjado.`);
    } catch(e) {
        notify("Erro ao criar guilda. Servidor indisponível?", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const deleteActiveGuild = async () => {
    if (!isAuthenticated) return;
    try {
        await dbService.deleteGuild(activeGuild.id, password);
        notify("Grimório queimado e esquecido.");
        logout();
    } catch (e) {
        notify("Erro ao deletar.", "error");
    }
  };

  const deleteGuildById = async (id: string) => {
      if(!isAdmin) return;
      try {
          await dbService.deleteGuild(id, adminPassword);
          notify("Guilda removida pelo administrador.");
          refreshGuildList();
      } catch (e) {
          notify("Erro ao deletar guilda.", "error");
      }
  };

  const importGuild = async (json: string, pwd: string) => {
    try {
      const g = JSON.parse(json) as GuildState;
      if (!g.guildName) throw new Error();
      g.id = crypto.randomUUID(); 
      // Sanitize on import too
      g.calendar = g.calendar || { day: 1, month: 0, year: 1420, dayOfWeek: 0 };
      g.quests = g.quests || [];
      g.members = g.members.map(m => ({ ...m, wallet: m.wallet || {TC:0, TS:0, TO:0, LO:0}, inventory: m.inventory || [] }));

      await dbService.saveGuild(g, pwd);
      await refreshGuildList();
      
      notify("Backup restaurado com sucesso.");
    } catch { notify("Arquivo inválido ou erro de servidor.", "error"); }
  };

  const exportGuildData = async (guildId: string) => {
      setIsLoading(true);
      try {
          const pwd = isAdmin ? adminPassword : password;
          const data = await dbService.getGuild(guildId, pwd);
          
          if(data) {
              const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
              const node = document.createElement('a');
              node.setAttribute("href", jsonString);
              node.setAttribute("download", `BACKUP_${data.guildName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
              node.click();
              notify("Backup gerado.");
          }
      } catch (e) {
          notify("Erro ao gerar backup.", "error");
      } finally {
          setIsLoading(false);
      }
  };

  // --- ACTIONS WRAPPERS ---
  const renameActiveGuild = (name: string) => triggerSave({ ...activeGuild, guildName: name });

  const internalAddLog = (currentGuild: GuildState, category: LogCategory, details: string, value: number, mId: string): LogEntry[] => {
    const mName = currentGuild.members.find(m => m.id === mId)?.name || 'Sistema';
    return [{ id: crypto.randomUUID(), date: new Date().toISOString(), category, details, value, memberId: mId, memberName: mName }, ...currentGuild.logs];
  };

  const addMember = (name: string) => {
    const newMember: Member = { id: crypto.randomUUID(), name, status: 'Ativo', wallet: {TC:0,TS:0,TO:0,LO:0}, inventory: [] };
    triggerSave({ ...activeGuild, members: [...activeGuild.members, newMember], logs: internalAddLog(activeGuild, 'Sistema', `Membro ${name} alistado.`, 0, 'SYSTEM') });
    notify(`Membro ${name} registrado.`);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    triggerSave({ ...activeGuild, members: activeGuild.members.map(m => m.id === id ? { ...m, ...updates } : m) });
  };

  const removeMember = (id: string) => {
    const memberName = activeGuild.members.find(m => m.id === id)?.name || 'Desconhecido';
    triggerSave({ 
      ...activeGuild,
      members: activeGuild.members.filter(m => m.id !== id),
      logs: internalAddLog(activeGuild, 'Sistema', `Baixa de Membro: ${memberName}`, 0, 'SYSTEM')
    });
    notify("Membro removido.");
  };

  const deposit = (mId: string, val: number, cur: CurrencyType, reason: string) => {
    if (!mId) return notify("Selecione um membro.", "error");
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, [cur]: activeGuild.wallet[cur] + val },
      logs: internalAddLog(activeGuild, 'Deposito', `+${val} ${cur}: ${reason}`, val * RATES[cur], mId)
    });
    notify("Tibares depositados.");
  };

  const withdraw = (mId: string, val: number, cur: CurrencyType, reason: string) => {
    if (!mId) return notify("Selecione um membro.", "error");
    if (activeGuild.wallet[cur] < val) return notify("Cofre insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, [cur]: activeGuild.wallet[cur] - val },
      logs: internalAddLog(activeGuild, 'Saque', `-${val} ${cur}: ${reason}`, -(val * RATES[cur]), mId)
    });
    notify("Saque realizado.");
  };

  const convertWallet = (amt: number, from: CurrencyType, to: CurrencyType) => {
    if (activeGuild.wallet[from] < amt) return notify("Saldo insuficiente.", "error");
    const conv = Math.floor((amt * RATES[from]) / RATES[to]);
    if (conv === 0) return notify(`Quantidade insuficiente para gerar 1 ${to}.`, "error");
    const realCost = (conv * RATES[to]) / RATES[from];
    const remainder = amt - realCost;
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, [from]: activeGuild.wallet[from] - realCost, [to]: activeGuild.wallet[to] + conv },
      logs: internalAddLog(activeGuild, 'Conversao', `Câmbio: ${realCost} ${from} -> ${conv} ${to}. Troco: ${remainder}`, 0, 'SYSTEM')
    });
    notify("Troca autorizada.");
  };

  // --- NEW: MEMBER WALLET & INVENTORY ---

  const transferGoldToMember = (memberId: string, val: number, cur: CurrencyType) => {
      const member = activeGuild.members.find(m => m.id === memberId);
      if(!member) return notify("Membro não encontrado", "error");
      if(activeGuild.wallet[cur] < val) return notify("Cofre da Guilda insuficiente", "error");

      const updatedMembers = activeGuild.members.map(m => {
          if(m.id === memberId) return { ...m, wallet: { ...m.wallet, [cur]: m.wallet[cur] + val } };
          return m;
      });

      triggerSave({
          ...activeGuild,
          members: updatedMembers,
          wallet: { ...activeGuild.wallet, [cur]: activeGuild.wallet[cur] - val },
          logs: internalAddLog(activeGuild, 'Saque', `Repasse: ${val} ${cur} para ${member.name}`, -(val * RATES[cur]), memberId)
      });
      notify(`Transferência para ${member.name} realizada.`);
  };

  const transferGoldFromMember = (memberId: string, val: number, cur: CurrencyType) => {
      const member = activeGuild.members.find(m => m.id === memberId);
      if(!member) return notify("Membro não encontrado", "error");
      if(member.wallet[cur] < val) return notify("Carteira do membro insuficiente", "error");

      const updatedMembers = activeGuild.members.map(m => {
          if(m.id === memberId) return { ...m, wallet: { ...m.wallet, [cur]: m.wallet[cur] - val } };
          return m;
      });

      triggerSave({
          ...activeGuild,
          members: updatedMembers,
          wallet: { ...activeGuild.wallet, [cur]: activeGuild.wallet[cur] + val },
          logs: internalAddLog(activeGuild, 'Deposito', `Devolução: ${val} ${cur} de ${member.name}`, (val * RATES[cur]), memberId)
      });
      notify(`Devolução de ${member.name} recebida.`);
  };

  const transferItemToMember = (itemId: string, memberId: string, qty: number) => {
      const member = activeGuild.members.find(m => m.id === memberId);
      const item = activeGuild.items.find(i => i.id === itemId);
      if(!member || !item || item.quantity < qty) return notify("Operação inválida", "error");

      // 1. Remove from Guild
      const updatedGuildItems = activeGuild.items.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0);
      
      // 2. Add to Member
      const memberItem = member.inventory.find(i => i.name === item.name && i.rarity === item.rarity); // Match by name/rarity logic or ID? Usually create new instance or stack.
      let newInventory = [...member.inventory];
      if (memberItem) {
          newInventory = newInventory.map(i => i.id === memberItem.id ? { ...i, quantity: i.quantity + qty } : i);
      } else {
          newInventory.push({ ...item, id: crypto.randomUUID(), quantity: qty });
      }

      triggerSave({
          ...activeGuild,
          items: updatedGuildItems,
          members: activeGuild.members.map(m => m.id === memberId ? { ...m, inventory: newInventory } : m),
          logs: internalAddLog(activeGuild, 'Estoque', `Entrega: ${qty}x ${item.name} para ${member.name}`, 0, memberId)
      });
      notify(`Item entregue a ${member.name}.`);
  };

  const transferItemFromMember = (itemId: string, memberId: string, qty: number) => {
      const member = activeGuild.members.find(m => m.id === memberId);
      if(!member) return;
      const item = member.inventory.find(i => i.id === itemId);
      if(!item || item.quantity < qty) return notify("Item não encontrado no inventário do membro", "error");

      // 1. Remove from Member
      const newInventory = member.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0);

      // 2. Add to Guild
      const guildItem = activeGuild.items.find(i => i.name === item.name && i.rarity === item.rarity);
      let newGuildItems = [...activeGuild.items];
      if(guildItem) {
          newGuildItems = newGuildItems.map(i => i.id === guildItem.id ? { ...i, quantity: i.quantity + qty } : i);
      } else {
          newGuildItems.push({ ...item, id: crypto.randomUUID(), quantity: qty });
      }

      triggerSave({
          ...activeGuild,
          members: activeGuild.members.map(m => m.id === memberId ? { ...m, inventory: newInventory } : m),
          items: newGuildItems,
          logs: internalAddLog(activeGuild, 'Estoque', `Retorno: ${qty}x ${item.name} de ${member.name}`, 0, memberId)
      });
      notify("Item devolvido ao cofre.");
  };

  const memberDiscardItem = (itemId: string, memberId: string, qty: number) => {
      const member = activeGuild.members.find(m => m.id === memberId);
      if(!member) return;
      const item = member.inventory.find(i => i.id === itemId);
      if(!item || item.quantity < qty) return notify("Erro", "error");

      const newInventory = member.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0);
      
      triggerSave({
          ...activeGuild,
          members: activeGuild.members.map(m => m.id === memberId ? { ...m, inventory: newInventory } : m),
          logs: internalAddLog(activeGuild, 'Estoque', `Descarte: ${qty}x ${item.name} por ${member.name}`, 0, memberId)
      });
      notify("Item descartado pelo aventureiro.");
  };

  // --- EXISTING ITEMS ACTIONS ---

  const addItem = (item: Omit<Item, 'id'>) => {
    triggerSave({ ...activeGuild, items: [...activeGuild.items, { ...item, id: crypto.randomUUID() }], logs: internalAddLog(activeGuild, 'Estoque', `Item: ${item.name}`, 0, 'SYSTEM') });
    notify("Item catalogado.");
  };

  const updateItem = (id: string, up: Partial<Item>) => {
    triggerSave({ ...activeGuild, items: activeGuild.items.map(i => i.id === id ? { ...i, ...up } : i) });
  };

  const sellItem = (id: string, qty: number, sId: string, p: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    if (!item || item.quantity < qty) return notify("Estoque insuficiente.", "error");
    const val = Math.floor(((item.value * qty) * (p / 100)));
    triggerSave({
      ...activeGuild,
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + val },
      logs: internalAddLog(activeGuild, 'Venda', `Venda ${qty}x ${item.name} (${p}%)`, val, sId)
    });
    notify("Venda processada.");
  };

  const sellBatchItems = (itemIds: string[], sellerId: string, percentage: number) => {
    let totalValue = 0;
    const newLogs: LogEntry[] = [];
    const sellerName = activeGuild.members.find(m => m.id === sellerId)?.name || 'Desconhecido';
    const itemsToProcess = activeGuild.items.filter(i => itemIds.includes(i.id) && !i.isNonNegotiable);
    if (itemsToProcess.length === 0) return notify("Nenhum item válido.", "error");

    itemsToProcess.forEach(item => {
        const sellValue = Math.floor((item.value * item.quantity) * (percentage / 100));
        totalValue += sellValue;
        newLogs.push({ id: crypto.randomUUID(), date: new Date().toISOString(), category: 'Venda', details: `Venda Lote: ${item.quantity}x ${item.name}`, value: sellValue, memberId: sellerId, memberName: sellerName });
    });
    const itemsToKeep = activeGuild.items.filter(i => !itemsToProcess.find(p => p.id === i.id));
    triggerSave({ ...activeGuild, items: itemsToKeep, wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + totalValue }, logs: [...newLogs, ...activeGuild.logs] });
    notify(`Lote vendido: T$ ${totalValue}.`);
  };

  const deleteBatchItems = (itemIds: string[]) => {
      const itemsToKeep = activeGuild.items.filter(i => !itemIds.includes(i.id));
      triggerSave({ ...activeGuild, items: itemsToKeep });
      notify("Itens descartados.");
  };

  const withdrawItem = (id: string, mId: string, r: string, qty: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    if (!item || item.quantity < qty) return notify("Erro estoque.", "error");
    triggerSave({
      ...activeGuild,
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
      logs: internalAddLog(activeGuild, 'Estoque', `Retirada ${qty}x ${item.name}: ${r}`, 0, mId)
    });
    notify("Item retirado.");
  };

  const deleteItem = (id: string, qty: number) => {
    triggerSave({ ...activeGuild, items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - qty) } : i).filter(i => i.quantity > 0) });
    notify("Item removido.");
  };

  // --- BASES & DOMAINS WRAPPERS (Unchanged logic, just forwarding) ---
  const addBase = (name: string, porte: BasePorte, type: BaseType, paid: boolean) => {
    const cost = PORTE_DATA[porte].cost;
    if (paid && activeGuild.wallet.TS < cost) return notify("T$ insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      bases: [...activeGuild.bases, { id: crypto.randomUUID(), name, porte, type, rooms: [], history: [`Fundada em ${new Date().toLocaleDateString()}`] }],
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
      logs: internalAddLog(activeGuild, 'Base', `Fundação: ${name}`, paid ? -cost : 0, 'SYSTEM')
    });
    notify("Base estabelecida!");
  };

  const upgradeBase = (baseId: string, newPorte: BasePorte) => {
    const b = activeGuild.bases.find(x => x.id === baseId);
    if (!b) return;
    const cost = PORTE_DATA[newPorte].cost - PORTE_DATA[b.porte].cost;
    if (cost > 0 && activeGuild.wallet.TS < cost) return notify("Saldo insuficiente.", "error");
    
    triggerSave({
        ...activeGuild,
        bases: activeGuild.bases.map(x => x.id === baseId ? { ...x, porte: newPorte } : x),
        wallet: cost > 0 ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
        logs: internalAddLog(activeGuild, 'Base', `Upgrade: ${b.name}`, -cost, 'SYSTEM')
    });
    notify("Base atualizada.");
  };

  const payBaseMaintenance = (id: string, type: 'Regular' | 'Extra', amt: number) => {
    if (activeGuild.wallet.TS < amt) return notify("T$ insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - amt },
      logs: internalAddLog(activeGuild, 'Manutencao', `${type}: Base`, -amt, 'SYSTEM')
    });
    notify("Pago.");
  };

  const collectBaseIncome = (id: string, amt: number) => {
    triggerSave({ ...activeGuild, wallet: { ...activeGuild.wallet, TO: activeGuild.wallet.TO + amt }, logs: internalAddLog(activeGuild, 'Base', `Lucros`, amt * RATES.TO, 'SYSTEM') });
    notify("Lucros coletados.");
  };

  const demolishBase = (id: string) => {
    triggerSave({ ...activeGuild, bases: activeGuild.bases.filter(b => b.id !== id), logs: internalAddLog(activeGuild, 'Base', `Demolição`, 0, 'SYSTEM') });
    notify("Base demolida.");
  };

  const addNPC = (npc: Omit<NPC, 'id'>) => {
    triggerSave({ ...activeGuild, npcs: [...activeGuild.npcs, { ...npc, id: crypto.randomUUID() }], logs: internalAddLog(activeGuild, 'NPC', `Contrato: ${npc.name}`, 0, 'SYSTEM') });
    notify("NPC Adicionado.");
  };

  const updateNPC = (id: string, updates: Partial<NPC>) => {
    triggerSave({ ...activeGuild, npcs: activeGuild.npcs.map(n => n.id === id ? { ...n, ...updates } : n) });
    notify("NPC Atualizado.");
  };

  const removeNPC = (id: string) => {
    triggerSave({ ...activeGuild, npcs: activeGuild.npcs.filter(n => n.id !== id) });
    notify("NPC Removido.");
  };

  const payAllNPCs = () => {
    const total = activeGuild.npcs.reduce((a, n) => a + n.monthlyCost, 0);
    if (activeGuild.wallet.TS < total) return notify("T$ Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - total },
      logs: internalAddLog(activeGuild, 'NPC', `Folha de Pagamento`, -total, 'SYSTEM')
    });
    notify("Folha paga.");
  };

  const paySingleNPC = (npcId: string) => {
    const npc = activeGuild.npcs.find(n => n.id === npcId);
    if (!npc) return;
    if (activeGuild.wallet.TS < npc.monthlyCost) return notify("T$ Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - npc.monthlyCost },
      logs: internalAddLog(activeGuild, 'NPC', `Pagamento: ${npc.name}`, -npc.monthlyCost, 'SYSTEM')
    });
    notify("Pago.");
  };

  const addRoom = (id: string, name: string, cost: number, paid: boolean) => {
    if (paid && activeGuild.wallet.TS < cost) return notify("Saldo insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
      bases: activeGuild.bases.map(b => b.id === id ? { ...b, rooms: [...b.rooms, { id: crypto.randomUUID(), name, furnitures: [] }] } : b),
      logs: internalAddLog(activeGuild, 'Investimento', `Cômodo: ${name}`, paid ? -cost : 0, 'SYSTEM')
    });
    notify("Cômodo construído.");
  };

  const removeRoom = (bId: string, rId: string) => {
    triggerSave({ ...activeGuild, bases: activeGuild.bases.map(b => b.id === bId ? { ...b, rooms: b.rooms.filter(r => r.id !== rId) } : b) });
    notify("Cômodo removido.");
  };

  const addFurniture = (bId: string, rId: string, name: string, cost: number, paid: boolean) => {
    if (paid && activeGuild.wallet.TS < cost) return notify("Saldo insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
      bases: activeGuild.bases.map(b => b.id === bId ? { ...b, rooms: b.rooms.map(r => r.id === rId ? { ...r, furnitures: [...r.furnitures, { id: crypto.randomUUID(), name, cost }] } : r) } : b),
      logs: internalAddLog(activeGuild, 'Investimento', `Mobília: ${name}`, paid ? -cost : 0, 'SYSTEM')
    });
    notify("Mobília instalada.");
  };

  const removeFurniture = (bId: string, rId: string, fId: string) => {
    triggerSave({ ...activeGuild, bases: activeGuild.bases.map(b => b.id === bId ? { ...b, rooms: b.rooms.map(r => r.id === rId ? { ...r, furnitures: r.furnitures.filter(f => f.id !== fId) } : r) } : b) });
    notify("Mobília removida.");
  };

  const createDomain = (name: string, regent: string, terrain: string, paid: boolean) => {
    if (paid && activeGuild.wallet.TS < 5000) return notify("T$ insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      domains: [...activeGuild.domains, { id: crypto.randomUUID(), name, regent, level: 1, terrain, court: 'Inexistente', treasury: 0, popularity: 'Tolerado', fortification: 0, buildings: [], units: [] }],
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - 5000 } : activeGuild.wallet,
      logs: internalAddLog(activeGuild, 'Dominio', `Novo Domínio: ${name}`, paid ? -5000 : 0, 'SYSTEM')
    });
    notify("Domínio criado.");
  };

  const updateDomain = (id: string, up: Partial<Domain>) => {
    triggerSave({ ...activeGuild, domains: activeGuild.domains.map(d => d.id === id ? { ...d, ...up } : d) });
  };

  const investDomain = (id: string, amt: number) => {
    if (activeGuild.wallet.LO < amt) return notify("LO Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO - amt },
      domains: activeGuild.domains.map(d => d.id === id ? { ...d, treasury: d.treasury + amt } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Investimento`, -amt * RATES.LO, 'SYSTEM')
    });
    notify("Investido.");
  };

  const withdrawDomain = (id: string, amt: number) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d || d.treasury < amt) return notify("Tesouro Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO + amt },
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, treasury: x.treasury - amt } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Resgate`, amt * RATES.LO, 'SYSTEM')
    });
    notify("Resgatado.");
  };

  const manageDomainTreasury = (id: string, amt: number, type: 'Income' | 'Expense', reason: string) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (type === 'Expense' && (!d || d.treasury < amt)) return notify("Tesouro Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, treasury: type === 'Income' ? x.treasury + amt : x.treasury - amt } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Tesouro: ${reason}`, (type === 'Income' ? amt : -amt) * RATES.LO, 'SYSTEM')
    });
  };

  const demolishDomain = (id: string) => {
    triggerSave({ ...activeGuild, domains: activeGuild.domains.filter(d => d.id !== id) });
    notify("Domínio abandonado.");
  };

  const levelUpDomain = (id: string) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d) return;
    const cost = d.level * 20;
    if (d.treasury < cost) return notify("Tesouro Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, level: x.level + 1, treasury: x.treasury - cost } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Level Up: ${d.name}`, -cost * RATES.LO, 'SYSTEM')
    });
    notify("Nível aumentado.");
  };

  const governDomain = (id: string, roll: number): GovernResult | null => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d) return null;
    
    const regentPenalty = d.regent.trim() ? 0 : 5;
    const cd = 15 + (d.level * 2);
    const finalRoll = roll - regentPenalty;
    const succ = finalRoll >= cd;
    
    let inc = d.level;
    d.buildings.forEach(b => {
      if (b.name === 'Fazenda') { const v = Math.max(0, Math.floor(Math.random()*6+1)-2); if(v > 0) inc+=v; }
      else if (b.name === 'Feira') inc += Math.floor(Math.random()*4+1);
      else if (b.name === 'Mina') inc += Math.floor(Math.random()*12+1);
    });

    if (!succ) inc = Math.floor(inc/2);

    const totalMaint = COURT_DATA[d.court].maintenance + d.units.length;
    const net = inc - totalMaint;
    
    const popChange = succ ? 0 : -1;
    const currentPopIndex = POPULARITY_LEVELS.indexOf(d.popularity);
    const newPopIndex = Math.max(0, Math.min(POPULARITY_LEVELS.length - 1, currentPopIndex + popChange));

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, treasury: Math.max(0, x.treasury + net), popularity: POPULARITY_LEVELS[newPopIndex] } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Governo: ${succ ? 'Sucesso' : 'Falha'}`, net * RATES.LO, 'SYSTEM')
    });

    notify(succ ? "Gestão próspera." : "Tempos difíceis.", succ ? 'success' : 'error');
    return { income: inc, maintenance: totalMaint, net, success: succ, popularityChange: popChange, details: [`Roll ${finalRoll} vs CD ${cd}`, `Renda: ${inc}`, `Custo: ${totalMaint}`] };
  };

  const addDomainBuilding = (id: string, b: Omit<DomainBuilding, 'id'>, paid: boolean) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d) return;
    if (paid && d.treasury < b.costLO) return notify("Tesouro Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, treasury: paid ? x.treasury - b.costLO : x.treasury, buildings: [...x.buildings, { ...b, id: crypto.randomUUID() }] } : x),
      logs: internalAddLog(activeGuild, 'Investimento', `Obra: ${b.name}`, paid ? -b.costLO * RATES.LO : 0, 'SYSTEM')
    });
    notify("Construído.");
  };

  const removeDomainBuilding = (dId: string, bId: string) => {
    triggerSave({ ...activeGuild, domains: activeGuild.domains.map(d => d.id === dId ? { ...d, buildings: d.buildings.filter(b => b.id !== bId) } : d) });
    notify("Demolido.");
  };

  const addDomainUnit = (dId: string, u: Omit<DomainUnit, 'id'>, paid: boolean) => {
    const d = activeGuild.domains.find(x => x.id === dId);
    if (paid && (!d || d.treasury < u.costLO)) return notify("Tesouro Insuficiente.", "error");
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(x => x.id === dId ? { ...x, treasury: paid ? x.treasury - u.costLO : x.treasury, units: [...x.units, { ...u, id: crypto.randomUUID() }] } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Tropa: ${u.name}`, paid ? -u.costLO * RATES.LO : 0, 'SYSTEM')
    });
    notify("Recrutado.");
  };

  const removeDomainUnit = (dId: string, uId: string) => {
    triggerSave({ ...activeGuild, domains: activeGuild.domains.map(d => d.id === dId ? { ...d, units: d.units.filter(u => u.id !== uId) } : d) });
    notify("Dispensado.");
  };

  // --- CALENDAR FEATURES ---

  const advanceDate = (days: number) => {
      let { day, month, year, dayOfWeek } = activeGuild.calendar;
      let newDay = day + days;
      let newMonth = month;
      let newYear = year;
      let newWeekDay = (dayOfWeek + days) % 7;
      let costDeducted = 0;
      let logMessages: string[] = [];

      // Logic: 360 days (12 months x 30 days)
      while (newDay > 30) {
          newDay -= 30;
          newMonth++;
          
          // Month Rollover Logic - Trigger Maintenance
          const totalBaseMaint = activeGuild.bases.reduce((acc, b) => acc + PORTE_DATA[b.porte].maintenance, 0);
          const totalNpcMaint = activeGuild.npcs.reduce((acc, n) => acc + n.monthlyCost, 0);
          const monthlyTotal = totalBaseMaint + totalNpcMaint;

          costDeducted += monthlyTotal;
          logMessages.push(`Virada de Mês (${ARTON_MONTHS[newMonth-1] || 'Ano Novo'}): Manutenção -${monthlyTotal} T$`);

          if (newMonth >= 12) {
              newMonth = 0;
              newYear++;
              logMessages.push(`Ano Novo! Bem-vindo a ${newYear}.`);
          }
      }

      let newWallet = { ...activeGuild.wallet };
      if (costDeducted > 0) {
          if (newWallet.TS >= costDeducted) {
              newWallet.TS -= costDeducted;
          } else {
              logMessages.push("ALERTA: Cofre insuficiente para manutenção automática!");
              // Optional: Deduct what is possible or go negative? Keeping it safe, just alerting for now in this MVP
          }
      }

      const newLogs = logMessages.map(msg => ({
          id: crypto.randomUUID(), 
          date: new Date().toISOString(), 
          category: 'Calendario' as LogCategory, 
          details: msg, 
          value: msg.includes('Manutenção') ? -costDeducted : 0, 
          memberId: 'SYSTEM', 
          memberName: 'Tempo'
      }));

      triggerSave({
          ...activeGuild,
          calendar: { day: newDay, month: newMonth, year: newYear, dayOfWeek: newWeekDay },
          wallet: newWallet,
          logs: [...newLogs, ...activeGuild.logs]
      });
      
      notify(`${days} dia(s) se passaram.`);
  };

  // --- QUESTS FEATURES ---

  const addQuest = (quest: Omit<Quest, 'id' | 'status'>) => {
      triggerSave({
          ...activeGuild,
          quests: [...activeGuild.quests, { ...quest, id: crypto.randomUUID(), status: 'Disponivel' }],
          logs: internalAddLog(activeGuild, 'Quest', `Nova Missão: ${quest.title}`, 0, 'SYSTEM')
      });
      notify("Missão afixada no quadro.");
  };

  const updateQuestStatus = (questId: string, newStatus: QuestStatus) => {
      const quest = activeGuild.quests.find(q => q.id === questId);
      if (!quest) return;

      let newWallet = activeGuild.wallet;
      let newLogs = [];

      if (newStatus === 'Concluida' && quest.status !== 'Concluida') {
          // Auto reward distribution logic
          newWallet = { ...newWallet, TS: newWallet.TS + quest.rewardGold };
          newLogs.push({
              id: crypto.randomUUID(), date: new Date().toISOString(), 
              category: 'Quest' as LogCategory, details: `Recompensa Missão "${quest.title}"`, 
              value: quest.rewardGold, memberId: 'SYSTEM', memberName: 'Guilda'
          });
          notify(`Missão Concluída! T$ ${quest.rewardGold} adicionados.`);
      }

      triggerSave({
          ...activeGuild,
          quests: activeGuild.quests.map(q => q.id === questId ? { ...q, status: newStatus } : q),
          wallet: newWallet,
          logs: [...newLogs, ...activeGuild.logs]
      });
  };

  const deleteQuest = (questId: string) => {
      triggerSave({ ...activeGuild, quests: activeGuild.quests.filter(q => q.id !== questId) });
      notify("Missão removida.");
  };

  const exportLogs = () => {
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeGuild.logs, null, 2));
    const node = document.createElement('a');
    node.setAttribute("href", data);
    node.setAttribute("download", `${activeGuild.guildName}_logs.json`);
    node.click();
    notify("Logs exportados.");
  };

  return (
    <GuildContext.Provider value={{
      ...activeGuild, isLoading, feedback,
      guildList, isAuthenticated, isAdmin, guildPassword: password, refreshGuildList, loginToGuild, loginAsAdmin, logout,
      activeGuildId: activeGuild.id,
      createNewGuild, importGuild, exportGuildData, renameActiveGuild, deleteActiveGuild, deleteGuildById,
      changeAdminPassword, resetGuildPassword,
      addMember, updateMember, removeMember, deposit, withdraw, convertWallet, 
      transferGoldToMember, transferGoldFromMember,
      
      addItem, updateItem, sellItem, sellBatchItems, withdrawItem, 
      transferItemToMember, transferItemFromMember, memberDiscardItem,
      deleteItem, deleteBatchItems,
      
      addBase, upgradeBase, payBaseMaintenance, collectBaseIncome, demolishBase,
      addNPC, updateNPC, removeNPC, payAllNPCs, paySingleNPC, addRoom, removeRoom, addFurniture, removeFurniture,
      createDomain, updateDomain, investDomain, withdrawDomain, manageDomainTreasury, demolishDomain, levelUpDomain, governDomain,
      addDomainBuilding, removeDomainBuilding, addDomainUnit, removeDomainUnit, 
      
      advanceDate, addQuest, updateQuestStatus, deleteQuest,
      
      exportLogs, notify
    }}>
      {children}
    </GuildContext.Provider>
  );
};

export const useGuild = () => {
  const c = useContext(GuildContext);
  if (!c) throw new Error("useGuild deve ser usado dentro de um GuildProvider");
  return c;
};
