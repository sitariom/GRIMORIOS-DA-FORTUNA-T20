
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GuildState, MultiGuildState, Wallet, Item, Base, Domain, LogEntry, Member, CurrencyType, LogCategory, BasePorte, BaseType, DomainBuilding, DomainUnit, PopularityType, NPC, NPCLocationType, GovernResult } from '../types';
import { RATES, PORTE_DATA, COURT_DATA, POPULARITY_LEVELS } from '../constants';
import { dbService } from '../services/db';

interface FeedbackMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface GuildContextType extends GuildState {
  isLoading: boolean;
  feedback: FeedbackMessage | null;
  guilds: GuildState[];
  activeGuildId: string;
  setActiveGuild: (id: string) => void;
  createNewGuild: (name: string) => void;
  importGuild: (data: string) => void;
  renameActiveGuild: (name: string) => void;
  deleteActiveGuild: () => void;
  addMember: (name: string) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  removeMember: (id: string) => void;
  deposit: (memberId: string, value: number, currency: CurrencyType, reason: string) => void;
  withdraw: (memberId: string, value: number, currency: CurrencyType, reason: string) => void;
  convertWallet: (amount: number, from: CurrencyType, to: CurrencyType) => void; 
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  sellItem: (itemId: string, qty: number, sellerId: string, percentage: number) => void;
  sellBatchItems: (itemIds: string[], sellerId: string, percentage: number) => void;
  withdrawItem: (itemId: string, memberId: string, reason: string, qty: number) => void;
  deleteItem: (itemId: string, qty: number) => void;
  deleteBatchItems: (itemIds: string[]) => void;
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
  exportLogs: () => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

const INITIAL_GUILD = (name: string): GuildState => ({
  id: crypto.randomUUID(),
  guildName: name,
  wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
  items: [],
  bases: [],
  domains: [],
  npcs: [],
  logs: [],
  members: [],
});

export const GuildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGuildId, setActiveGuildIdState] = useState<string>('');
  const [guilds, setGuilds] = useState<GuildState[]>([]);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Initialize DB & Migrate Legacy Data
  useEffect(() => {
    const init = async () => {
      try {
        const storedGuilds = await dbService.getAllGuilds();
        
        if (storedGuilds.length > 0) {
           const storedActiveId = await dbService.getActiveGuildId();
           setGuilds(storedGuilds);
           setActiveGuildIdState(storedActiveId && storedGuilds.find(g => g.id === storedActiveId) ? storedActiveId : storedGuilds[0].id);
        } else {
           // Tenta migrar do LocalStorage antigo
           const legacyData = localStorage.getItem('grimoire_fortuna_v1');
           let migrated = false;

           if (legacyData) {
               try {
                   const parsed = JSON.parse(legacyData);
                   if (parsed.guilds && Array.isArray(parsed.guilds) && parsed.guilds.length > 0) {
                       console.log("Migrando dados do LocalStorage para IndexedDB...");
                       for (const g of parsed.guilds) {
                           await dbService.saveGuild(g);
                       }
                       const initialId = parsed.activeGuildId || parsed.guilds[0].id;
                       await dbService.setActiveGuildId(initialId);
                       
                       setGuilds(parsed.guilds);
                       setActiveGuildIdState(initialId);
                       migrated = true;
                       notify("Dados antigos migrados com sucesso para o novo banco!", "success");
                   }
               } catch (e) {
                   console.error("Erro na migração:", e);
               }
           }

           if (!migrated) {
               const first = INITIAL_GUILD('Ordem do Cálice');
               await dbService.saveGuild(first);
               await dbService.setActiveGuildId(first.id);
               setGuilds([first]);
               setActiveGuildIdState(first.id);
           }
        }
      } catch (error) {
        console.error("Failed to load from DB", error);
        notify("Erro ao carregar dados do grimório.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const setActiveGuild = async (id: string) => {
    setActiveGuildIdState(id);
    await dbService.setActiveGuildId(id);
  };

  // Helper to update active guild and persist
  const updateActiveGuild = useCallback((updates: Partial<GuildState>) => {
    setGuilds(prevGuilds => {
      const newGuilds = prevGuilds.map(g => {
        if (g.id === activeGuildId) {
          const updated = { ...g, ...updates };
          dbService.saveGuild(updated); // Fire and forget persistence
          return updated;
        }
        return g;
      });
      return newGuilds;
    });
  }, [activeGuildId]);

  const activeGuild = guilds.find(g => g.id === activeGuildId) || (guilds[0] ?? INITIAL_GUILD('Loading...'));

  const createNewGuild = async (name: string) => {
    const g = INITIAL_GUILD(name);
    await dbService.saveGuild(g);
    await dbService.setActiveGuildId(g.id);
    setGuilds(prev => [...prev, g]);
    setActiveGuildIdState(g.id);
    notify(`Grimório "${name}" iniciado.`);
  };

  const renameActiveGuild = (name: string) => updateActiveGuild({ guildName: name });

  const deleteActiveGuild = async () => {
    if (guilds.length <= 1) return notify("O último grimório não pode ser queimado.", "error");
    
    await dbService.deleteGuild(activeGuildId);
    
    const remaining = guilds.filter(g => g.id !== activeGuildId);
    const nextId = remaining[0].id;
    
    await dbService.setActiveGuildId(nextId);
    setGuilds(remaining);
    setActiveGuildIdState(nextId);
    notify("Crônicas removidas com sucesso.");
  };

  const importGuild = async (json: string) => {
    try {
      const g = JSON.parse(json) as GuildState;
      if (!g.guildName) throw new Error();
      g.id = crypto.randomUUID();
      
      await dbService.saveGuild(g);
      await dbService.setActiveGuildId(g.id);
      
      setGuilds(prev => [...prev, g]);
      setActiveGuildIdState(g.id);
      notify("Conhecimento importado com sucesso.");
    } catch { notify("Pergaminho corrompido ou inválido.", "error"); }
  };

  const internalAddLog = (currentGuild: GuildState, category: LogCategory, details: string, value: number, mId: string): LogEntry[] => {
    const mName = currentGuild.members.find(m => m.id === mId)?.name || 'Sistema';
    return [{ id: crypto.randomUUID(), date: new Date().toISOString(), category, details, value, memberId: mId, memberName: mName }, ...currentGuild.logs];
  };

  const addMember = (name: string) => {
    const newMember: Member = { id: crypto.randomUUID(), name, status: 'Ativo' };
    const members = [...activeGuild.members, newMember];
    updateActiveGuild({ members, logs: internalAddLog(activeGuild, 'Sistema', `Membro ${name} alistado.`, 0, 'SYSTEM') });
    notify(`Membro ${name} registrado.`);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    updateActiveGuild({ members: activeGuild.members.map(m => m.id === id ? { ...m, ...updates } : m) });
  };

  const removeMember = (id: string) => {
    const memberName = activeGuild.members.find(m => m.id === id)?.name || 'Desconhecido';
    const members = activeGuild.members.filter(m => m.id !== id);
    updateActiveGuild({ 
      members,
      logs: internalAddLog(activeGuild, 'Sistema', `Baixa de Membro: ${memberName}`, 0, 'SYSTEM')
    });
    notify("Membro removido do grimório.");
  };

  const deposit = (mId: string, val: number, cur: CurrencyType, reason: string) => {
    if (!mId) return notify("Selecione um membro responsável.", "error");
    updateActiveGuild({
      wallet: { ...activeGuild.wallet, [cur]: activeGuild.wallet[cur] + val },
      logs: internalAddLog(activeGuild, 'Deposito', `+${val} ${cur}: ${reason}`, val * RATES[cur], mId)
    });
    notify("Tibares depositados.");
  };

  const withdraw = (mId: string, val: number, cur: CurrencyType, reason: string) => {
    if (!mId) return notify("Selecione um membro responsável.", "error");
    if (activeGuild.wallet[cur] < val) return notify("Cofre insuficiente para este saque.", "error");
    updateActiveGuild({
      wallet: { ...activeGuild.wallet, [cur]: activeGuild.wallet[cur] - val },
      logs: internalAddLog(activeGuild, 'Saque', `-${val} ${cur}: ${reason}`, -(val * RATES[cur]), mId)
    });
    notify("Saque realizado com sucesso.");
  };

  const convertWallet = (amt: number, from: CurrencyType, to: CurrencyType) => {
    if (activeGuild.wallet[from] < amt) return notify("Quantidade insuficiente para câmbio.", "error");
    
    const conv = Math.floor((amt * RATES[from]) / RATES[to]);
    if (conv === 0) return notify(`Quantidade insuficiente para gerar pelo menos 1 ${to}. Aumente a oferta.`, "error");

    const realCost = (conv * RATES[to]) / RATES[from];
    const remainder = amt - realCost;
    const details = remainder > 0 
        ? `Câmbio: ${realCost} ${from} (de ${amt}) por ${conv} ${to}. Troco: ${remainder} ${from}`
        : `Câmbio Direto: ${amt} ${from} por ${conv} ${to}`;

    updateActiveGuild({
      wallet: { ...activeGuild.wallet, [from]: activeGuild.wallet[from] - realCost, [to]: activeGuild.wallet[to] + conv },
      logs: internalAddLog(activeGuild, 'Conversao', details, 0, 'SYSTEM')
    });
    notify("Troca autorizada pela Casa de Câmbio.");
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    if (item.quantity <= 0) return notify("A quantidade deve ser maior que zero.", "error");
    if (item.value < 0) return notify("O valor não pode ser negativo.", "error");
    updateActiveGuild({ items: [...activeGuild.items, { ...item, id: crypto.randomUUID() }], logs: internalAddLog(activeGuild, 'Estoque', `Item Registrado: ${item.name} (${item.rarity})`, 0, 'SYSTEM') });
    notify("Item catalogado no arsenal.");
  };

  const updateItem = (id: string, up: Partial<Item>) => {
    if (up.quantity !== undefined && up.quantity < 0) return notify("Quantidade inválida.", "error");
    if (up.value !== undefined && up.value < 0) return notify("Valor inválido.", "error");
    updateActiveGuild({ items: activeGuild.items.map(i => i.id === id ? { ...i, ...up } : i) });
  };

  const sellItem = (id: string, qty: number, sId: string, p: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    if (!item || item.quantity < qty) return notify("Estoque insuficiente.", "error");
    if (item.isNonNegotiable) return notify("Este item é inalienável e não pode ser comercializado.", "error");
    
    const val = Math.floor(((item.value * qty) * (p / 100)));
    updateActiveGuild({
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + val },
      logs: internalAddLog(activeGuild, 'Venda', `Venda ${qty}x ${item.name} (${p}%)`, val, sId)
    });
    notify("Venda processada. Tibares de Prata adicionados.");
  };

  const sellBatchItems = (itemIds: string[], sellerId: string, percentage: number) => {
    let totalValue = 0;
    const newLogs: LogEntry[] = [];
    const sellerName = activeGuild.members.find(m => m.id === sellerId)?.name || 'Desconhecido';

    const itemsToProcess = activeGuild.items.filter(i => itemIds.includes(i.id) && !i.isNonNegotiable);
    
    if (itemsToProcess.length === 0) return notify("Nenhum item válido para venda selecionado.", "error");

    itemsToProcess.forEach(item => {
        const sellValue = Math.floor((item.value * item.quantity) * (percentage / 100));
        totalValue += sellValue;
        newLogs.push({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            category: 'Venda',
            details: `Venda Lote: ${item.quantity}x ${item.name} (${percentage}%)`,
            value: sellValue,
            memberId: sellerId,
            memberName: sellerName
        });
    });

    const itemsToKeep = activeGuild.items.filter(i => !itemsToProcess.find(p => p.id === i.id));

    updateActiveGuild({
        items: itemsToKeep,
        wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + totalValue },
        logs: [...newLogs, ...activeGuild.logs]
    });
    notify(`Lote vendido. T$ ${totalValue.toLocaleString()} adicionados.`);
  };

  const deleteBatchItems = (itemIds: string[]) => {
      const itemsToDelete = activeGuild.items.filter(i => itemIds.includes(i.id));
      if (itemsToDelete.length === 0) return;

      const newLogs: LogEntry[] = [];
      itemsToDelete.forEach(item => {
          newLogs.push({
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              category: 'Estoque',
              details: `Descarte Lote: ${item.name} (x${item.quantity})`,
              value: 0,
              memberId: 'SYSTEM',
              memberName: 'Sistema'
          });
      });

      const itemsToKeep = activeGuild.items.filter(i => !itemIds.includes(i.id));

      updateActiveGuild({
          items: itemsToKeep,
          logs: [...newLogs, ...activeGuild.logs]
      });
      notify(`${itemsToDelete.length} itens removidos do arsenal.`);
  };

  const withdrawItem = (id: string, mId: string, r: string, qty: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    if (!item || item.quantity < qty) return notify("Item não disponível na quantidade desejada.", "error");
    updateActiveGuild({
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
      logs: internalAddLog(activeGuild, 'Estoque', `Retirada ${qty}x ${item.name}: ${r}`, 0, mId)
    });
    notify("Item retirado do arsenal.");
  };

  const deleteItem = (id: string, qty: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    updateActiveGuild({ 
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - qty) } : i).filter(i => i.quantity > 0),
      logs: internalAddLog(activeGuild, 'Estoque', `Descarte: ${item?.name || 'Item'} (x${qty})`, 0, 'SYSTEM')
    });
    notify("Registro de item removido.");
  };

  const addBase = (name: string, porte: BasePorte, type: BaseType, paid: boolean) => {
    const cost = PORTE_DATA[porte].cost;
    if (paid && activeGuild.wallet.TS < cost) return notify("T$ insuficiente no cofre central.", "error");
    updateActiveGuild({
      bases: [...activeGuild.bases, { id: crypto.randomUUID(), name, porte, type, rooms: [], history: [`Fundada como ${porte} em ${new Date().toLocaleDateString()}`] }],
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
      logs: internalAddLog(activeGuild, 'Base', `Fundação de Base: ${name}`, paid ? -cost : 0, 'SYSTEM')
    });
    notify("Base estabelecida!");
  };

  const upgradeBase = (baseId: string, newPorte: BasePorte) => {
    const b = activeGuild.bases.find(x => x.id === baseId);
    if (!b) return;
    
    const currentCost = PORTE_DATA[b.porte].cost;
    const newCost = PORTE_DATA[newPorte].cost;
    const diff = newCost - currentCost;

    if (diff < 0) {
        if (b.rooms.length > PORTE_DATA[newPorte].slots) {
            return notify(`Impossível reduzir: A base possui ${b.rooms.length} cômodos, mas o porte ${PORTE_DATA[newPorte].label} suporta apenas ${PORTE_DATA[newPorte].slots}. Remova cômodos antes.`, "error");
        }
        updateActiveGuild({
            bases: activeGuild.bases.map(x => x.id === baseId ? { ...x, porte: newPorte, history: [...x.history, `Reduzida para ${newPorte} em ${new Date().toLocaleDateString()}`] } : x),
            logs: internalAddLog(activeGuild, 'Base', `Redução de Base: ${b.name} para ${newPorte}`, 0, 'SYSTEM')
        });
        notify("Base reestruturada (Redução de Porte).");
    } else {
        if (activeGuild.wallet.TS < diff) return notify("Saldo insuficiente para expansão.", "error");
        updateActiveGuild({
            bases: activeGuild.bases.map(x => x.id === baseId ? { ...x, porte: newPorte, history: [...x.history, `Expandida para ${newPorte} em ${new Date().toLocaleDateString()}`] } : x),
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - diff },
            logs: internalAddLog(activeGuild, 'Base', `Expansão de Base: ${b.name} para ${newPorte}`, -diff, 'SYSTEM')
        });
        notify("Propriedade expandida com sucesso.");
    }
  };

  const payBaseMaintenance = (id: string, type: 'Regular' | 'Extra', amt: number) => {
    if (activeGuild.wallet.TS < amt) return notify("T$ insuficiente no cofre.", "error");
    updateActiveGuild({
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - amt },
      logs: internalAddLog(activeGuild, 'Manutencao', `${type}: ${activeGuild.bases.find(x => x.id === id)?.name}`, -amt, 'SYSTEM')
    });
    notify("Obrigação financeira quitada.");
  };

  const collectBaseIncome = (id: string, amt: number) => {
    if (amt <= 0) return;
    updateActiveGuild({ wallet: { ...activeGuild.wallet, TO: activeGuild.wallet.TO + amt }, logs: internalAddLog(activeGuild, 'Base', `Renda de Propriedade: +${amt} TO`, amt * RATES.TO, 'SYSTEM') });
    notify("Renda coletada com sucesso.");
  };

  const demolishBase = (id: string) => {
    const updatedNPCs = activeGuild.npcs.map(npc => 
        npc.locationId === id ? { ...npc, locationType: 'Grupo' as NPCLocationType, locationId: '', locationName: 'Sem Teto (Base Destruída)' } : npc
    );

    updateActiveGuild({ 
        bases: activeGuild.bases.filter(b => b.id !== id), 
        npcs: updatedNPCs,
        logs: internalAddLog(activeGuild, 'Base', `Base Abandonada e Demolida`, 0, 'SYSTEM') 
    });
    notify("Propriedade removida. Funcionários realocados.");
  };

  const addNPC = (npc: Omit<NPC, 'id'>) => {
    if (npc.monthlyCost < 0) return notify("Custo não pode ser negativo.", "error");
    updateActiveGuild({ 
      npcs: [...activeGuild.npcs, { ...npc, id: crypto.randomUUID() }],
      logs: internalAddLog(activeGuild, 'NPC', `Contrato firmado: ${npc.name} (${npc.role})`, 0, 'SYSTEM')
    });
    notify(`${npc.name} contratado.`);
  };

  const updateNPC = (id: string, updates: Partial<NPC>) => {
    if (updates.monthlyCost !== undefined && updates.monthlyCost < 0) return notify("Custo não pode ser negativo.", "error");
    const old = activeGuild.npcs.find(n => n.id === id);
    if (!old) return;

    updateActiveGuild({ 
      npcs: activeGuild.npcs.map(n => n.id === id ? { ...n, ...updates } : n),
      logs: internalAddLog(activeGuild, 'NPC', `Renegociação de Contrato: ${old.name}`, 0, 'SYSTEM')
    });
    notify("Contrato renegociado.");
  };

  const removeNPC = (id: string) => {
    updateActiveGuild({ npcs: activeGuild.npcs.filter(n => n.id !== id) });
    notify("Contrato encerrado.");
  };

  const payAllNPCs = () => {
    const total = activeGuild.npcs.reduce((a, n) => a + n.monthlyCost, 0);
    if (activeGuild.wallet.TS < total) return notify("T$ insuficiente para pagar todos os especialistas.", "error");
    updateActiveGuild({
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - total },
      logs: internalAddLog(activeGuild, 'NPC', `Pagamento de Folha (${activeGuild.npcs.length} especialistas)`, -total, 'SYSTEM')
    });
    notify("Pagamentos realizados.");
  };

  const paySingleNPC = (npcId: string) => {
    const npc = activeGuild.npcs.find(n => n.id === npcId);
    if (!npc) return;
    
    if (activeGuild.wallet.TS < npc.monthlyCost) return notify("Saldo insuficiente em Tibares de Prata.", "error");

    updateActiveGuild({
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - npc.monthlyCost },
      logs: internalAddLog(activeGuild, 'NPC', `Pagamento Individual: ${npc.name} (${npc.role})`, -npc.monthlyCost, 'SYSTEM')
    });
    notify(`Salário de ${npc.name} pago com sucesso.`);
  };

  const addRoom = (id: string, name: string, cost: number, paid: boolean) => {
    const b = activeGuild.bases.find(x => x.id === id);
    if (!b) return;
    if (b.rooms.length >= PORTE_DATA[b.porte].slots) return notify("Limite de cômodos atingido para este porte.", "error");
    if (paid && activeGuild.wallet.TS < cost) return notify("T$ insuficiente para reforma.", "error");
    
    updateActiveGuild({
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
      bases: activeGuild.bases.map(b => b.id === id ? { ...b, rooms: [...b.rooms, { id: crypto.randomUUID(), name, furnitures: [] }] } : b),
      logs: internalAddLog(activeGuild, 'Investimento', `Novo Cômodo em ${b.name}: ${name}`, paid ? -cost : 0, 'SYSTEM')
    });
    notify("Obra finalizada.");
  };

  const removeRoom = (bId: string, rId: string) => {
    updateActiveGuild({ bases: activeGuild.bases.map(b => b.id === bId ? { ...b, rooms: b.rooms.filter(r => r.id !== rId) } : b) });
    notify("Cômodo removido.");
  };

  const addFurniture = (bId: string, rId: string, name: string, cost: number, paid: boolean) => {
    if (paid && activeGuild.wallet.TS < cost) return notify("T$ insuficiente para mobília.", "error");
    updateActiveGuild({
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
      bases: activeGuild.bases.map(b => b.id === bId ? { ...b, rooms: b.rooms.map(r => r.id === rId ? { ...r, furnitures: [...r.furnitures, { id: crypto.randomUUID(), name, cost }] } : r) } : b),
      logs: internalAddLog(activeGuild, 'Investimento', `Mobília Adquirida: ${name}`, paid ? -cost : 0, 'SYSTEM')
    });
    notify("Mobília instalada.");
  };

  const removeFurniture = (bId: string, rId: string, fId: string) => {
    updateActiveGuild({ bases: activeGuild.bases.map(b => b.id === bId ? { ...b, rooms: b.rooms.map(r => r.id === rId ? { ...r, furnitures: r.furnitures.filter(f => f.id !== fId) } : r) } : b) });
    notify("Mobília removida.");
  };

  const createDomain = (name: string, regent: string, terrain: string, paid: boolean) => {
    const cost = 5000;
    if (paid && activeGuild.wallet.TS < cost) return notify("T$ insuficiente para reivindicar domínio.", "error");
    updateActiveGuild({
      domains: [...activeGuild.domains, { id: crypto.randomUUID(), name, regent, level: 1, terrain, court: 'Inexistente', treasury: 0, popularity: 'Tolerado', fortification: 0, buildings: [], units: [] }],
      wallet: paid ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet,
      logs: internalAddLog(activeGuild, 'Dominio', `Reivindicação de Território: ${name}`, paid ? -cost : 0, 'SYSTEM')
    });
    notify("Território anexado ao grimório.");
  };

  const updateDomain = (id: string, up: Partial<Domain>) => {
    let updatedNPCs = activeGuild.npcs;
    if (up.name) {
        updatedNPCs = activeGuild.npcs.map(npc => 
            npc.locationId === id ? { ...npc, locationName: `Domínio: ${up.name}` } : npc
        );
    }
    
    updateActiveGuild({ 
        domains: activeGuild.domains.map(d => d.id === id ? { ...d, ...up } : d),
        npcs: updatedNPCs
    });
  };

  const levelUpDomain = (id: string) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d || d.level >= 7) return;
    const cost = d.level * 20;
    if (d.treasury < cost) return notify("Tesouro Real (LO) insuficiente para expansão.", "error");
    updateActiveGuild({
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, level: x.level + 1, treasury: x.treasury - cost } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Crescimento Territorial em ${d.name} (Nível ${d.level + 1})`, -cost * RATES.LO, 'SYSTEM')
    });
    notify("Fronteiras expandidas!");
  };

  const investDomain = (id: string, amt: number) => {
    if (activeGuild.wallet.LO < amt) return notify("Não há Lingotes de Ouro suficientes no cofre central.", "error");
    updateActiveGuild({
      wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO - amt },
      domains: activeGuild.domains.map(d => d.id === id ? { ...d, treasury: d.treasury + amt } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Investimento no Tesouro Real: ${amt} LO em ${activeGuild.domains.find(x => x.id === id)?.name}`, -amt * RATES.LO, 'SYSTEM')
    });
    notify("Transferência para o Tesouro Real concluída.");
  };

  const withdrawDomain = (id: string, amt: number) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d || d.treasury < amt) return notify("Tesouro real insuficiente para resgate.", "error");
    updateActiveGuild({
      wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO + amt },
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, treasury: x.treasury - amt } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Resgate do Tesouro Real: ${amt} LO de ${d.name}`, amt * RATES.LO, 'SYSTEM')
    });
    notify("Riquezas transferidas ao cofre central.");
  };

  const manageDomainTreasury = (id: string, amt: number, type: 'Income' | 'Expense', reason: string) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (type === 'Expense' && (!d || d.treasury < amt)) return notify("Tesouro insuficiente para o ajuste.", "error");
    updateActiveGuild({
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, treasury: type === 'Income' ? x.treasury + amt : x.treasury - amt } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Ajuste de Tesouro (${reason}): ${type === 'Income' ? '+' : '-'}${amt} LO`, (type === 'Income' ? amt : -amt) * RATES.LO, 'SYSTEM')
    });
  };

  const demolishDomain = (id: string) => {
    const updatedNPCs = activeGuild.npcs.map(npc => 
        npc.locationId === id ? { ...npc, locationType: 'Grupo' as NPCLocationType, locationId: '', locationName: 'Sem Teto (Domínio Destruído)' } : npc
    );

    updateActiveGuild({ 
        domains: activeGuild.domains.filter(d => d.id !== id), 
        npcs: updatedNPCs,
        logs: internalAddLog(activeGuild, 'Dominio', `Abandono de Território`, 0, 'SYSTEM') 
    });
    notify("O território foi entregue ao destino. Funcionários realocados.");
  };

  const governDomain = (id: string, roll: number): GovernResult | null => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d) return null;
    
    const regentPenalty = d.regent.trim() ? 0 : 5;
    const cd = 15 + (d.level * 2);
    const finalRoll = roll - regentPenalty;
    const succ = finalRoll >= cd;
    
    const details: string[] = [];
    details.push(`Resultado: ${roll} ${!d.regent.trim() ? '(-5 Sem Regente)' : ''} vs CD ${cd}`);
    
    let inc = d.level; details.push(`Arrecadação Base: +${inc} LO`);
    
    d.buildings.forEach(b => {
      if (b.name === 'Fazenda') { const v = Math.max(0, Math.floor(Math.random()*6+1)-2); if(v > 0) { inc+=v; details.push(`Fazenda: +${v} LO`); } }
      else if (b.name === 'Feira') { const v = Math.floor(Math.random()*4+1); inc+=v; details.push(`Feira: +${v} LO`); }
      else if (b.name === 'Mina') { const v = Math.floor(Math.random()*12+1); inc+=v; details.push(`Mina: +${v} LO`); }
    });

    if (!succ) { 
        inc = Math.floor(inc/2); 
        details.push(`FALHA NA GESTÃO: Arrecadação reduzida pela metade.`); 
    } else { 
        details.push(`SUCESSO NA GESTÃO`); 
    }

    const courtMaint = COURT_DATA[d.court].maintenance; 
    details.push(`Manutenção da Corte: -${courtMaint} LO`);
    
    const unitMaint = d.units.length; 
    if (unitMaint > 0) details.push(`Manutenção de Tropas (${d.units.length}): -${unitMaint} LO`);

    const totalMaint = courtMaint + unitMaint;
    const net = inc - totalMaint;
    
    const popChange = succ ? 0 : -1;
    const currentPopIndex = POPULARITY_LEVELS.indexOf(d.popularity);
    const newPopIndex = Math.max(0, Math.min(POPULARITY_LEVELS.length - 1, currentPopIndex + popChange));

    updateActiveGuild({
      domains: activeGuild.domains.map(x => x.id === id ? { 
        ...x, 
        treasury: Math.max(0, x.treasury + net), 
        popularity: POPULARITY_LEVELS[newPopIndex]
      } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Governança em ${d.name}: ${succ ? 'Sucesso' : 'Falha'} (Líquido: ${net > 0 ? '+' : ''}${net} LO)`, net * RATES.LO, 'SYSTEM')
    });

    notify(succ ? "Regência próspera." : "Gestão conturbada.", succ ? 'success' : 'error');
    return { income: inc, maintenance: totalMaint, net, success: succ, popularityChange: popChange, details };
  };

  const addDomainBuilding = (id: string, b: Omit<DomainBuilding, 'id'>, paid: boolean) => {
    const d = activeGuild.domains.find(x => x.id === id);
    if (!d) return;
    if (d.buildings.length >= d.level) return notify("Não há espaço para novas obras neste nível de domínio.", "error");
    if (paid && d.treasury < b.costLO) return notify("Tesouro Real insuficiente para a obra.", "error");
    
    updateActiveGuild({
      domains: activeGuild.domains.map(x => x.id === id ? { ...x, treasury: paid ? x.treasury - b.costLO : x.treasury, buildings: [...x.buildings, { ...b, id: crypto.randomUUID() }] } : x),
      logs: internalAddLog(activeGuild, 'Investimento', `Obra Realizada em ${d.name}: ${b.name}`, paid ? -b.costLO * RATES.LO : 0, 'SYSTEM')
    });
    notify("Obra finalizada no domínio.");
  };

  const removeDomainBuilding = (dId: string, bId: string) => {
    updateActiveGuild({ domains: activeGuild.domains.map(d => d.id === dId ? { ...d, buildings: d.buildings.filter(b => b.id !== bId) } : d) });
    notify("Construção demolida.");
  };

  const addDomainUnit = (dId: string, u: Omit<DomainUnit, 'id'>, paid: boolean) => {
    const d = activeGuild.domains.find(x => x.id === dId);
    if (paid && (!d || d.treasury < u.costLO)) return notify("Tesouro Real insuficiente para recrutamento.", "error");
    updateActiveGuild({
      domains: activeGuild.domains.map(x => x.id === dId ? { ...x, treasury: paid ? x.treasury - u.costLO : x.treasury, units: [...x.units, { ...u, id: crypto.randomUUID() }] } : x),
      logs: internalAddLog(activeGuild, 'Dominio', `Recrutamento de Legião (${u.name}) em ${d?.name}`, paid ? -u.costLO * RATES.LO : 0, 'SYSTEM')
    });
    notify("Legião alistada.");
  };

  const removeDomainUnit = (dId: string, uId: string) => {
    updateActiveGuild({ domains: activeGuild.domains.map(d => d.id === dId ? { ...d, units: d.units.filter(u => u.id !== uId) } : d) });
    notify("Tropa desmobilizada.");
  };

  const exportLogs = () => {
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeGuild.logs, null, 2));
    const node = document.createElement('a');
    node.setAttribute("href", data);
    node.setAttribute("download", `${activeGuild.guildName}_logs.json`);
    node.click();
    notify("Crônicas exportadas com sucesso.");
  };

  return (
    <GuildContext.Provider value={{
      ...activeGuild, isLoading, feedback, guilds, activeGuildId,
      setActiveGuild, createNewGuild, importGuild, renameActiveGuild, deleteActiveGuild,
      addMember, updateMember, removeMember, deposit, withdraw, convertWallet, addItem, updateItem, sellItem, sellBatchItems, withdrawItem, deleteItem, deleteBatchItems,
      addBase, upgradeBase, payBaseMaintenance, collectBaseIncome, demolishBase,
      addNPC, updateNPC, removeNPC, payAllNPCs, paySingleNPC, addRoom, removeRoom, addFurniture, removeFurniture,
      createDomain, updateDomain, investDomain, withdrawDomain, manageDomainTreasury, demolishDomain, levelUpDomain, governDomain,
      addDomainBuilding, removeDomainBuilding, addDomainUnit, removeDomainUnit, exportLogs, notify
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
