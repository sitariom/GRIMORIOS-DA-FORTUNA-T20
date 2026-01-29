
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  GuildState, LogEntry, Wallet, Item, Base, Domain, NPC, Quest, CalendarState, Member, 
  CurrencyType, LogCategory, MemberStatus, ItemType, ItemRarity, BasePorte, BaseType, 
  DomainBuilding, DomainUnit, GovernResult, CourtType, PopularityType, NPCRelationship, NPCLocationType 
} from '../types';
import { RATES, PORTE_DATA, COURT_DATA } from '../constants';
import { dbService, GuildSummary } from '../services/db';

interface Feedback {
    type: 'success' | 'error' | 'info';
    text: string;
}

interface GuildContextData {
   activeGuildId: string | null;
   guildName: string;
   wallet: Wallet;
   members: Member[];
   items: Item[];
   bases: Base[];
   domains: Domain[];
   npcs: NPC[];
   logs: LogEntry[];
   calendar: CalendarState;
   quests: Quest[];
   isAuthenticated: boolean;
   isLoading: boolean;
   isAdmin: boolean;
   feedback: Feedback | null;
   guildList: GuildSummary[];

   loginToGuild: (id: string, password: string) => Promise<boolean>;
   logout: () => void;
   loginAsAdmin: (password: string) => Promise<boolean>;
   createNewGuild: (name: string, password: string) => Promise<void>;
   deleteGuildById: (id: string) => Promise<void>;
   importGuild: (json: string, password: string) => Promise<void>;
   exportGuildData: (id: string) => Promise<void>;
   exportLogs: () => void;
   changeAdminPassword: (old: string, newP: string) => Promise<void>;
   resetGuildPassword: (guildId: string, newPass: string) => Promise<void>;

   deposit: (memberId: string, amount: number, currency: CurrencyType, reason: string) => void;
   withdraw: (memberId: string, amount: number, currency: CurrencyType, reason: string) => void;
   convertWallet: (amount: number, from: CurrencyType, to: CurrencyType) => void;
   
   addMember: (name: string) => void;
   removeMember: (id: string) => void;
   updateMember: (id: string, data: Partial<Member>) => void;
   transferGoldToMember: (memberId: string, amount: number, currency: CurrencyType) => void;
   transferGoldFromMember: (memberId: string, amount: number, currency: CurrencyType) => void;
   updateMemberWallet: (memberId: string, amount: number, currency: CurrencyType, type: 'add' | 'remove') => void;
   transferItemFromMember: (itemId: string, memberId: string, qty: number) => void;
   deleteItemFromMember: (memberId: string, itemId: string, qty: number) => void;
   createItemForMember: (memberId: string, itemData: Omit<Item, 'id'>) => void;

   addItem: (item: Omit<Item, 'id'>) => void;
   updateItem: (id: string, data: Partial<Item>) => void;
   sellItem: (id: string, qty: number, memberId: string, percent: number) => void;
   sellBatchItems: (ids: string[], memberId: string, percent: number) => void;
   withdrawItem: (id: string, memberId: string, reason: string, qty: number) => void;
   deleteItem: (id: string, qty: number) => void;
   deleteBatchItems: (ids: string[]) => void;

   addBase: (name: string, porte: BasePorte, type: BaseType, payCost: boolean) => void;
   upgradeBase: (id: string, newPorte: BasePorte) => void;
   payBaseMaintenance: (id: string, type: string, cost: number) => void;
   collectBaseIncome: (id: string, amount: number) => void;
   demolishBase: (id: string) => void;
   addRoom: (baseId: string, name: string, cost: number, pay: boolean) => void;
   removeRoom: (baseId: string, roomId: string) => void;
   addFurniture: (baseId: string, roomId: string, name: string, cost: number, pay: boolean) => void;
   removeFurniture: (baseId: string, roomId: string, furnId: string) => void;

   createDomain: (name: string, regent: string, terrain: string, payCost: boolean) => void;
   updateDomain: (id: string, data: Partial<Domain>) => void;
   investDomain: (id: string, amount: number) => void;
   withdrawDomain: (id: string, amount: number) => void;
   manageDomainTreasury: (id: string, amount: number, type: 'Income' | 'Expense', reason: string) => void;
   demolishDomain: (id: string) => void;
   governDomain: (id: string, roll: number) => GovernResult;
   levelUpDomain: (id: string) => void;
   addDomainBuilding: (id: string, building: Omit<DomainBuilding, 'id'>, pay: boolean) => void;
   removeDomainBuilding: (id: string, buildId: string) => void;
   addDomainUnit: (id: string, unit: Omit<DomainUnit, 'id'>, pay: boolean) => void;
   removeDomainUnit: (id: string, unitId: string) => void;

   advanceDate: (days: number) => void;
   setGameDate: (day: number, month: number, year: number) => void;
   toggleNimbDay: (state: boolean) => void;

   addNPC: (npc: Omit<NPC, 'id'>) => void;
   updateNPC: (id: string, data: Partial<NPC>) => void;
   removeNPC: (id: string) => void;
   payAllNPCs: () => void;
   paySingleNPC: (id: string) => void;

   addQuest: (quest: Omit<Quest, 'id'>) => void;
   updateQuest: (id: string, quest: Partial<Quest>) => void;
   updateQuestStatus: (id: string, status: any) => void;
   deleteQuest: (id: string) => void;

   notify: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const GuildContext = createContext<GuildContextData | undefined>(undefined);

const initialGuildState: GuildState = {
    id: '',
    guildName: '',
    wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
    items: [],
    bases: [],
    domains: [],
    npcs: [],
    logs: [],
    members: [],
    calendar: { day: 1, month: 0, year: 1420, dayOfWeek: 0, isNimbDay: false },
    quests: []
};

// Helper para garantir compatibilidade com guildas antigas e prevenir crashes
const sanitizeGuildData = (data: any): GuildState => {
    return {
        ...initialGuildState, // Carrega defaults primeiro
        ...data,              // Sobrescreve com dados salvos
        // Garante que arrays e objetos cruciais existam, mesmo se ausentes no save antigo
        wallet: { ...initialGuildState.wallet, ...(data.wallet || {}) },
        items: data.items || [],
        bases: data.bases || [],
        domains: data.domains || [],
        npcs: data.npcs || [],
        logs: data.logs || [],
        members: data.members || [],
        calendar: data.calendar || initialGuildState.calendar,
        quests: data.quests || []
    };
};

export const GuildProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeGuild, setActiveGuild] = useState<GuildState>(initialGuildState);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [guildList, setGuildList] = useState<GuildSummary[]>([]);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [sessionKey, setSessionKey] = useState<string>('');

    // --- Helpers ---
    const notify = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
        setFeedback({ text, type });
        setTimeout(() => setFeedback(null), 3000);
    }, []);

    const fetchGuilds = useCallback(async () => {
        setIsLoading(true);
        try {
            const list = await dbService.getAllGuilds();
            setGuildList(list);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const triggerSave = useCallback(async (newState: GuildState) => {
        setActiveGuild(newState);
        if (isAuthenticated && sessionKey) {
            try {
                await dbService.saveGuild(newState, sessionKey);
            } catch (e) {
                console.error("Auto-save failed", e);
                notify("Erro ao salvar automaticamente", "error");
            }
        }
    }, [isAuthenticated, sessionKey, notify]);

    // --- Internal Helpers ---
    const internalAddLog = (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string): LogEntry[] => {
        const member = guild.members.find(m => m.id === memberId);
        const memberName = member ? member.name : (memberId === 'system' ? 'Sistema' : 'Desconhecido');
        const newLog: LogEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            category,
            details,
            value,
            memberId,
            memberName
        };
        return [newLog, ...guild.logs];
    };

    // --- Auth & Lifecycle ---

    useEffect(() => {
        const init = async () => {
            await fetchGuilds();
            const session = await dbService.getSession();
            if (session) {
                try {
                    const guildData = await dbService.getGuild(session.id, session.key);
                    if (guildData) {
                        const safeData = sanitizeGuildData(guildData);
                        setActiveGuild(safeData);
                        setSessionKey(session.key);
                        setIsAuthenticated(true);
                    }
                } catch {
                    dbService.setSession(''); // Clear invalid session
                }
            }
            setIsLoading(false);
        };
        init();
    }, [fetchGuilds]);

    const loginToGuild = async (id: string, password: string) => {
        setIsLoading(true);
        try {
            const guildData = await dbService.getGuild(id, password);
            if (guildData) {
                const safeData = sanitizeGuildData(guildData);
                setActiveGuild(safeData);
                setSessionKey(password);
                setIsAuthenticated(true);
                await dbService.setSession(id, password);
                notify("Bem-vindo de volta!");
                return true;
            }
        } catch (e) {
            notify("Senha incorreta ou guilda não encontrada.", "error");
        } finally {
            setIsLoading(false);
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setSessionKey('');
        setActiveGuild(initialGuildState);
        dbService.setSession('');
        notify("Desconectado com sucesso.");
    };

    const loginAsAdmin = async (password: string) => {
        try {
            await dbService.loginAdmin(password);
            setIsAdmin(true);
            notify("Acesso administrativo concedido.");
            return true;
        } catch (e) {
            notify("Senha administrativa incorreta.", "error");
            return false;
        }
    };

    const createNewGuild = async (name: string, password: string) => {
        const id = crypto.randomUUID();
        const newGuild: GuildState = {
            ...initialGuildState,
            id,
            guildName: name
        };
        try {
            await dbService.saveGuild(newGuild, password);
            await fetchGuilds();
            notify("Nova guilda fundada!");
        } catch (e) {
            notify("Erro ao criar guilda", "error");
        }
    };

    const deleteGuildById = async (id: string) => {
        if (!sessionKey && !isAdmin) return;
        try {
            await dbService.deleteGuild(id, sessionKey || 'admin-placeholder-if-needed');
            await fetchGuilds();
            notify("Guilda removida dos registros.");
        } catch(e) {
            notify("Erro ao remover guilda.", "error");
        }
    };

    const importGuild = async (json: string, password: string) => {
        try {
            const parsed = JSON.parse(json);
            if (!parsed.id || !parsed.guildName) throw new Error("Formato inválido");
            const safeData = sanitizeGuildData(parsed);
            await dbService.saveGuild(safeData, password);
            await fetchGuilds();
            notify("Guilda importada com sucesso.");
        } catch (e) {
            notify("Falha na importação. Verifique o arquivo.", "error");
        }
    };

    const exportGuildData = async (id: string) => {
        const g = guildList.find(x => x.id === id);
        if(!g) return;
        let data = activeGuild.id === id ? activeGuild : null;
        if (!data) {
             notify("Apenas a guilda ativa pode ser exportada neste momento.", "info");
             return;
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${data.guildName}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportLogs = () => {
        const blob = new Blob([JSON.stringify(activeGuild.logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs_${activeGuild.guildName}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const changeAdminPassword = async (old: string, newP: string) => {
        try {
            await dbService.changeAdminPassword(old, newP);
            notify("Senha de administrador atualizada.");
        } catch (e) {
            notify("Erro ao alterar senha de admin.", "error");
        }
    };

    const resetGuildPassword = async (guildId: string, newPass: string) => {
        notify("Funcionalidade requer implementação segura de admin.", "info");
    };

    // --- Financial Actions ---

    const deposit = (memberId: string, amount: number, currency: CurrencyType, reason: string) => {
        const newWallet = { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] + amount };
        const valueInTS = amount * RATES[currency];
        triggerSave({
            ...activeGuild,
            wallet: newWallet,
            logs: internalAddLog(activeGuild, 'Deposito', `${reason} (${amount} ${currency})`, valueInTS, memberId)
        });
        notify("Depósito realizado.");
    };

    const withdraw = (memberId: string, amount: number, currency: CurrencyType, reason: string) => {
        if (activeGuild.wallet[currency] < amount) return notify("Fundos insuficientes.", "error");
        const newWallet = { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] - amount };
        const valueInTS = amount * RATES[currency];
        triggerSave({
            ...activeGuild,
            wallet: newWallet,
            logs: internalAddLog(activeGuild, 'Saque', `${reason} (${amount} ${currency})`, -valueInTS, memberId)
        });
        notify("Saque realizado.");
    };

    const convertWallet = (amount: number, from: CurrencyType, to: CurrencyType) => {
        if (activeGuild.wallet[from] < amount) return notify("Saldo insuficiente para conversão.", "error");
        
        const rate = RATES[from] / RATES[to];
        const converted = Math.floor(amount * rate);
        if (converted <= 0) return notify("Valor convertido é zero.", "error");

        const actualConverted = Math.floor((amount * RATES[from]) / RATES[to]);
        const actualCost = (actualConverted * RATES[to]) / RATES[from];

        if (actualConverted === 0) return notify("Quantidade insuficiente para gerar 1 unidade da moeda destino.", "error");

        const newWallet = { 
            ...activeGuild.wallet, 
            [from]: activeGuild.wallet[from] - actualCost,
            [to]: activeGuild.wallet[to] + actualConverted
        };

        triggerSave({
            ...activeGuild,
            wallet: newWallet,
            logs: internalAddLog(activeGuild, 'Conversao', `Cambio: ${actualCost} ${from} -> ${actualConverted} ${to}`, 0, 'system')
        });
        notify("Câmbio realizado com sucesso.");
    };

    // --- Member Actions ---

    const addMember = (name: string) => {
        const newMember: Member = {
            id: crypto.randomUUID(),
            name,
            status: 'Ativo',
            wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
            inventory: []
        };
        triggerSave({
            ...activeGuild,
            members: [...activeGuild.members, newMember],
            logs: internalAddLog(activeGuild, 'Membro', `Novo aventureiro: ${name}`, 0, 'system')
        });
        notify("Aventureiro alistado!");
    };

    const removeMember = (id: string) => {
        const m = activeGuild.members.find(x => x.id === id);
        if(!m) return;
        triggerSave({
            ...activeGuild,
            members: activeGuild.members.filter(x => x.id !== id),
            logs: internalAddLog(activeGuild, 'Membro', `Aventureiro removido: ${m.name}`, 0, 'system')
        });
        notify("Aventureiro removido.");
    };

    const updateMember = (id: string, data: Partial<Member>) => {
        triggerSave({
            ...activeGuild,
            members: activeGuild.members.map(m => m.id === id ? { ...m, ...data } : m)
        });
    };

    const transferGoldToMember = (memberId: string, amount: number, currency: CurrencyType) => {
        if (activeGuild.wallet[currency] < amount) return notify("Fundos insuficientes no cofre.", "error");
        
        const updatedMembers = activeGuild.members.map(m => {
            if (m.id === memberId) {
                return { ...m, wallet: { ...m.wallet, [currency]: m.wallet[currency] + amount } };
            }
            return m;
        });

        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] - amount },
            members: updatedMembers,
            logs: internalAddLog(activeGuild, 'Saque', `Transferência para membro (${amount} ${currency})`, -(amount * RATES[currency]), memberId)
        });
        notify("Transferência realizada.");
    };

    const transferGoldFromMember = (memberId: string, amount: number, currency: CurrencyType) => {
        const member = activeGuild.members.find(m => m.id === memberId);
        if (!member || member.wallet[currency] < amount) return notify("Membro não possui fundos suficientes.", "error");

        const updatedMembers = activeGuild.members.map(m => {
            if (m.id === memberId) {
                return { ...m, wallet: { ...m.wallet, [currency]: m.wallet[currency] - amount } };
            }
            return m;
        });

        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] + amount },
            members: updatedMembers,
            logs: internalAddLog(activeGuild, 'Deposito', `Transferência de membro (${amount} ${currency})`, (amount * RATES[currency]), memberId)
        });
        notify("Transferência recebida.");
    };

    const updateMemberWallet = (memberId: string, amount: number, currency: CurrencyType, type: 'add' | 'remove') => {
        const updatedMembers = activeGuild.members.map(m => {
            if (m.id === memberId) {
                const current = m.wallet[currency];
                const newVal = type === 'add' ? current + amount : Math.max(0, current - amount);
                return { ...m, wallet: { ...m.wallet, [currency]: newVal } };
            }
            return m;
        });
        triggerSave({ ...activeGuild, members: updatedMembers });
        notify("Carteira do membro atualizada.");
    };

    const transferItemFromMember = (itemId: string, memberId: string, qty: number) => {
        const member = activeGuild.members.find(m => m.id === memberId);
        if(!member) return;
        const item = member.inventory.find(i => i.id === itemId);
        if(!item || item.quantity < qty) return notify("Item não encontrado no inventário do membro", "error");
  
        const newInventory = member.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0);
  
        const guildItem = activeGuild.items.find(i => i.name === item.name && i.rarity === item.rarity && i.type === item.type);
        let newGuildItems = [...activeGuild.items];
        if(guildItem) {
            newGuildItems = newGuildItems.map(i => i.id === guildItem.id ? { ...i, quantity: i.quantity + qty } : i);
        } else {
            const { id, ...itemProps } = item;
            newGuildItems.push({ ...itemProps, id: crypto.randomUUID(), quantity: qty });
        }
  
        triggerSave({
            ...activeGuild,
            members: activeGuild.members.map(m => m.id === memberId ? { ...m, inventory: newInventory } : m),
            items: newGuildItems,
            logs: internalAddLog(activeGuild, 'Estoque', `Retorno: ${qty}x ${item.name} de ${member.name}`, 0, memberId)
        });
        notify("Item devolvido ao cofre.");
    };

    const deleteItemFromMember = (memberId: string, itemId: string, qty: number) => {
        const updatedMembers = activeGuild.members.map(m => {
            if (m.id === memberId) {
                const newInv = m.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0);
                return { ...m, inventory: newInv };
            }
            return m;
        });
        triggerSave({ ...activeGuild, members: updatedMembers });
        notify("Item removido do inventário do membro.");
    };

    const createItemForMember = (memberId: string, itemData: Omit<Item, 'id'>) => {
        const newItem = { ...itemData, id: crypto.randomUUID() };
        const updatedMembers = activeGuild.members.map(m => {
            if (m.id === memberId) {
                return { ...m, inventory: [...m.inventory, newItem] };
            }
            return m;
        });
        triggerSave({ ...activeGuild, members: updatedMembers });
        notify("Item adicionado ao inventário do membro.");
    };

    // --- Item Actions (Guild) ---

    const addItem = (item: Omit<Item, 'id'>) => {
        const existing = activeGuild.items.find(i => i.name === item.name && i.type === item.type && i.rarity === item.rarity);
        let newItems = [];
        if (existing) {
            newItems = activeGuild.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i);
        } else {
            newItems = [...activeGuild.items, { ...item, id: crypto.randomUUID() }];
        }
        triggerSave({
            ...activeGuild,
            items: newItems,
            logs: internalAddLog(activeGuild, 'Estoque', `Item Registrado: ${item.quantity}x ${item.name}`, item.value * item.quantity, 'system')
        });
        notify("Item registrado no arsenal.");
    };

    const updateItem = (id: string, data: Partial<Item>) => {
        triggerSave({
            ...activeGuild,
            items: activeGuild.items.map(i => i.id === id ? { ...i, ...data } : i)
        });
        notify("Item atualizado.");
    };

    const sellItem = (id: string, qty: number, memberId: string, percent: number) => {
        const item = activeGuild.items.find(i => i.id === id);
        if (!item || item.quantity < qty) return notify("Quantidade inválida.", "error");

        const value = Math.floor((item.value * qty) * (percent / 100));
        
        triggerSave({
            ...activeGuild,
            items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + value },
            logs: internalAddLog(activeGuild, 'Venda', `Venda ${qty}x ${item.name} (${percent}%)`, value, memberId)
        });
        notify(`Venda realizada: +T$ ${value}`);
    };

    const sellBatchItems = (ids: string[], memberId: string, percent: number) => {
        let totalValue = 0;
        let newItems = [...activeGuild.items];
        const logDetails: string[] = [];

        ids.forEach(id => {
            const item = newItems.find(i => i.id === id);
            if (item) {
                const val = Math.floor((item.value * item.quantity) * (percent / 100));
                totalValue += val;
                logDetails.push(`${item.quantity}x ${item.name}`);
                newItems = newItems.filter(i => i.id !== id);
            }
        });

        triggerSave({
            ...activeGuild,
            items: newItems,
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + totalValue },
            logs: internalAddLog(activeGuild, 'Venda', `Venda em Lote: ${logDetails.length} itens`, totalValue, memberId)
        });
        notify(`Lote vendido: +T$ ${totalValue}`);
    };

    const withdrawItem = (id: string, memberId: string, reason: string, qty: number) => {
        const item = activeGuild.items.find(i => i.id === id);
        if (!item || item.quantity < qty) return notify("Quantidade inválida.", "error");

        const member = activeGuild.members.find(m => m.id === memberId);
        let updatedMembers = activeGuild.members;
        if (member) {
             updatedMembers = activeGuild.members.map(m => {
                 if (m.id === memberId) {
                     const existingItem = m.inventory.find(i => i.name === item.name && i.type === item.type);
                     let newInv = [];
                     if (existingItem) {
                         newInv = m.inventory.map(i => i.id === existingItem.id ? { ...i, quantity: i.quantity + qty } : i);
                     } else {
                         const { id, ...props } = item;
                         newInv = [...m.inventory, { ...props, id: crypto.randomUUID(), quantity: qty }];
                     }
                     return { ...m, inventory: newInv };
                 }
                 return m;
             });
        }

        triggerSave({
            ...activeGuild,
            items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
            members: updatedMembers,
            logs: internalAddLog(activeGuild, 'Estoque', `Retirada: ${qty}x ${item.name} -> ${member ? member.name : 'Desconhecido'} (${reason})`, 0, memberId)
        });
        notify("Item retirado do arsenal.");
    };

    const deleteItem = (id: string, qty: number) => {
        const item = activeGuild.items.find(i => i.id === id);
        if (!item) return;
        triggerSave({
            ...activeGuild,
            items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
            logs: internalAddLog(activeGuild, 'Estoque', `Descarte: ${qty}x ${item.name}`, 0, 'system')
        });
        notify("Item descartado.");
    };

    const deleteBatchItems = (ids: string[]) => {
        triggerSave({
            ...activeGuild,
            items: activeGuild.items.filter(i => !ids.includes(i.id)),
            logs: internalAddLog(activeGuild, 'Estoque', `Descarte em Lote: ${ids.length} itens`, 0, 'system')
        });
        notify("Itens descartados.");
    };

    // --- Base Actions ---

    const addBase = (name: string, porte: BasePorte, type: BaseType, payCost: boolean) => {
        const cost = PORTE_DATA[porte].cost;
        if (payCost && activeGuild.wallet.TS < cost) return notify("Fundos insuficientes (T$).", "error");
        
        const newBase: Base = {
            id: crypto.randomUUID(),
            name,
            porte,
            type,
            rooms: [],
            history: []
        };

        const newWallet = payCost ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;
        
        triggerSave({
            ...activeGuild,
            bases: [...activeGuild.bases, newBase],
            wallet: newWallet,
            logs: payCost ? internalAddLog(activeGuild, 'Investimento', `Fundação Base: ${name} (${porte})`, -cost, 'system') : activeGuild.logs
        });
        notify("Nova base estabelecida!");
    };

    const upgradeBase = (id: string, newPorte: BasePorte) => {
        const base = activeGuild.bases.find(b => b.id === id);
        if (!base) return;
        const currentCost = PORTE_DATA[base.porte].cost;
        const newCost = PORTE_DATA[newPorte].cost;
        const diff = newCost - currentCost;

        if (diff > 0 && activeGuild.wallet.TS < diff) return notify("Fundos insuficientes.", "error");

        const newWallet = diff > 0 ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - diff } : activeGuild.wallet;

        triggerSave({
            ...activeGuild,
            bases: activeGuild.bases.map(b => b.id === id ? { ...b, porte: newPorte } : b),
            wallet: newWallet,
            logs: diff > 0 ? internalAddLog(activeGuild, 'Investimento', `Upgrade Base: ${base.name} (${newPorte})`, -diff, 'system') : activeGuild.logs
        });
        notify("Base atualizada!");
    };

    const payBaseMaintenance = (id: string, type: string, cost: number) => {
        if (activeGuild.wallet.TS < cost) return notify("Fundos insuficientes.", "error");
        
        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost },
            logs: internalAddLog(activeGuild, 'Manutencao', `Manutenção Base: ${type}`, -cost, 'system')
        });
        notify("Manutenção paga.");
    };

    const collectBaseIncome = (id: string, amount: number) => {
        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, TO: activeGuild.wallet.TO + amount },
            logs: internalAddLog(activeGuild, 'Base', `Renda Empreendimento`, amount * 10, 'system') // Value in TS approx
        });
        notify("Lucros coletados.");
    };

    const demolishBase = (id: string) => {
        triggerSave({
            ...activeGuild,
            bases: activeGuild.bases.filter(b => b.id !== id),
            logs: internalAddLog(activeGuild, 'Base', `Base demolida/abandonada`, 0, 'system')
        });
        notify("Base removida.");
    };

    const addRoom = (baseId: string, name: string, cost: number, pay: boolean) => {
        if (pay && activeGuild.wallet.TS < cost) return notify("Fundos insuficientes.", "error");
        
        const newWallet = pay ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;
        
        triggerSave({
            ...activeGuild,
            bases: activeGuild.bases.map(b => b.id === baseId ? { ...b, rooms: [...b.rooms, { id: crypto.randomUUID(), name, furnitures: [] }] } : b),
            wallet: newWallet,
            logs: pay ? internalAddLog(activeGuild, 'Investimento', `Construção Cômodo: ${name}`, -cost, 'system') : activeGuild.logs
        });
        notify("Cômodo construído.");
    };

    const removeRoom = (baseId: string, roomId: string) => {
        triggerSave({
            ...activeGuild,
            bases: activeGuild.bases.map(b => b.id === baseId ? { ...b, rooms: b.rooms.filter(r => r.id !== roomId) } : b)
        });
        notify("Cômodo removido.");
    };

    const addFurniture = (baseId: string, roomId: string, name: string, cost: number, pay: boolean) => {
        if (pay && activeGuild.wallet.TS < cost) return notify("Fundos insuficientes.", "error");
        
        const newWallet = pay ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;

        triggerSave({
            ...activeGuild,
            bases: activeGuild.bases.map(b => b.id === baseId ? { 
                ...b, 
                rooms: b.rooms.map(r => r.id === roomId ? { ...r, furnitures: [...r.furnitures, { id: crypto.randomUUID(), name, cost }] } : r) 
            } : b),
            wallet: newWallet,
            logs: pay ? internalAddLog(activeGuild, 'Investimento', `Mobília: ${name}`, -cost, 'system') : activeGuild.logs
        });
        notify("Mobília adicionada.");
    };

    const removeFurniture = (baseId: string, roomId: string, furnId: string) => {
        triggerSave({
            ...activeGuild,
            bases: activeGuild.bases.map(b => b.id === baseId ? { 
                ...b, 
                rooms: b.rooms.map(r => r.id === roomId ? { ...r, furnitures: r.furnitures.filter(f => f.id !== furnId) } : r) 
            } : b)
        });
        notify("Mobília removida.");
    };

    // --- Domain Actions ---

    const createDomain = (name: string, regent: string, terrain: string, payCost: boolean) => {
        const cost = 5000;
        if (payCost && activeGuild.wallet.TS < cost) return notify("Fundos insuficientes.", "error");
        
        const newDomain: Domain = {
            id: crypto.randomUUID(),
            name,
            regent,
            level: 1,
            terrain,
            court: 'Inexistente',
            treasury: 0,
            popularity: 'Tolerado',
            fortification: 0,
            buildings: [],
            units: []
        };

        const newWallet = payCost ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;
        
        triggerSave({
            ...activeGuild,
            domains: [...activeGuild.domains, newDomain],
            wallet: newWallet,
            logs: payCost ? internalAddLog(activeGuild, 'Investimento', `Fundação Domínio: ${name}`, -cost, 'system') : activeGuild.logs
        });
        notify("Domínio estabelecido!");
    };

    const updateDomain = (id: string, data: Partial<Domain>) => {
        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { ...d, ...data } : d)
        });
    };

    const investDomain = (id: string, amount: number) => {
        if (activeGuild.wallet.LO < amount) return notify("Falta Lingotes de Ouro no cofre.", "error");

        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO - amount },
            domains: activeGuild.domains.map(d => d.id === id ? { ...d, treasury: d.treasury + amount } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Investimento em Domínio`, -(amount * 1000), 'system')
        });
        notify("Tesouro Real abastecido.");
    };

    const withdrawDomain = (id: string, amount: number) => {
        const domain = activeGuild.domains.find(d => d.id === id);
        if (!domain || domain.treasury < amount) return notify("Fundo insuficiente no domínio.", "error");

        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO + amount },
            domains: activeGuild.domains.map(d => d.id === id ? { ...d, treasury: d.treasury - amount } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Saque do Domínio`, (amount * 1000), 'system')
        });
        notify("Lingotes transferidos ao cofre.");
    };

    const manageDomainTreasury = (id: string, amount: number, type: 'Income' | 'Expense', reason: string) => {
        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { 
                ...d, 
                treasury: type === 'Income' ? d.treasury + amount : Math.max(0, d.treasury - amount) 
            } : d)
        });
        notify(`Tesouro do domínio atualizado (${type}).`);
    };

    const demolishDomain = (id: string) => {
        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.filter(d => d.id !== id),
            logs: internalAddLog(activeGuild, 'Dominio', `Domínio perdido/abandonado`, 0, 'system')
        });
        notify("Domínio removido.");
    };

    const governDomain = (id: string, roll: number) => {
        const domain = activeGuild.domains.find(d => d.id === id);
        if (!domain) throw new Error("Domínio não encontrado");
        
        const maintenance = COURT_DATA[domain.court].maintenance + domain.units.length + Math.floor(domain.buildings.length / 2);
        
        const totalResult = roll + domain.level + (domain.popularity === 'Adorado' ? 2 : 0);
        const success = totalResult >= 15;
        
        let income = domain.level * 2;
        if (success) income += domain.level; 

        const net = income - maintenance;

        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { ...d, treasury: Math.max(0, d.treasury + net) } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Governo: ${domain.name} (Res: ${totalResult})`, net * 1000, 'system')
        });

        return {
            income,
            maintenance,
            net,
            success,
            popularityChange: success ? 0 : -1,
            details: [
                `Resultado do Teste: ${totalResult} (CD 15)`,
                `Renda Gerada: ${income} LO`,
                `Manutenção Total: ${maintenance} LO`,
                success ? 'O povo está satisfeito.' : 'Houve problemas na gestão.'
            ]
        };
    };

    const levelUpDomain = (id: string) => {
        const domain = activeGuild.domains.find(d => d.id === id);
        if (!domain) return;
        const cost = domain.level * 20;
        
        if (domain.treasury < cost) return notify("Tesouro Real insuficiente.", "error");

        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { ...d, level: d.level + 1, treasury: d.treasury - cost } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Domínio ${domain.name} evoluiu para Nível ${domain.level + 1}`, 0, 'system')
        });
        notify("Domínio evoluiu!");
    };

    const addDomainBuilding = (id: string, building: Omit<DomainBuilding, 'id'>, pay: boolean) => {
        const domain = activeGuild.domains.find(d => d.id === id);
        if (!domain) return;
        
        if (pay && domain.treasury < building.costLO) return notify("Tesouro Real insuficiente.", "error");

        const newTreasury = pay ? domain.treasury - building.costLO : domain.treasury;

        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { 
                ...d, 
                treasury: newTreasury,
                buildings: [...d.buildings, { ...building, id: crypto.randomUUID() }] 
            } : d)
        });
        notify("Construção finalizada.");
    };

    const removeDomainBuilding = (id: string, buildId: string) => {
        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { 
                ...d, 
                buildings: d.buildings.filter(b => b.id !== buildId)
            } : d)
        });
        notify("Construção demolida.");
    };

    const addDomainUnit = (id: string, unit: Omit<DomainUnit, 'id'>, pay: boolean) => {
        const domain = activeGuild.domains.find(d => d.id === id);
        if (!domain) return;
        
        if (pay && domain.treasury < unit.costLO) return notify("Tesouro Real insuficiente.", "error");

        const newTreasury = pay ? domain.treasury - unit.costLO : domain.treasury;

        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { 
                ...d, 
                treasury: newTreasury,
                units: [...d.units, { ...unit, id: crypto.randomUUID() }] 
            } : d)
        });
        notify("Unidade recrutada.");
    };

    const removeDomainUnit = (id: string, unitId: string) => {
        triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { 
                ...d, 
                units: d.units.filter(u => u.id !== unitId)
            } : d)
        });
        notify("Unidade dispensada.");
    };

    // --- NPC Actions ---

    const addNPC = (npc: Omit<NPC, 'id'>) => {
        triggerSave({
            ...activeGuild,
            npcs: [...activeGuild.npcs, { ...npc, id: crypto.randomUUID() }]
        });
        notify("NPC Registrado.");
    };

    const updateNPC = (id: string, data: Partial<NPC>) => {
        triggerSave({
            ...activeGuild,
            npcs: activeGuild.npcs.map(n => n.id === id ? { ...n, ...data } : n)
        });
        notify("NPC Atualizado.");
    };

    const removeNPC = (id: string) => {
        triggerSave({
            ...activeGuild,
            npcs: activeGuild.npcs.filter(n => n.id !== id)
        });
        notify("NPC Removido.");
    };

    const payAllNPCs = () => {
        const totalCost = activeGuild.npcs.reduce((acc, n) => acc + (n.monthlyCost || 0), 0);
        if (activeGuild.wallet.TS < totalCost) return notify("Fundos insuficientes para folha completa.", "error");

        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - totalCost },
            logs: internalAddLog(activeGuild, 'Manutencao', `Pagamento Folha Salarial`, -totalCost, 'system')
        });
        notify("Todos os salários pagos.");
    };

    const paySingleNPC = (id: string) => {
        const npc = activeGuild.npcs.find(n => n.id === id);
        if (!npc) return;
        if (activeGuild.wallet.TS < npc.monthlyCost) return notify("Fundos insuficientes.", "error");

        triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - npc.monthlyCost },
            logs: internalAddLog(activeGuild, 'Manutencao', `Pagamento: ${npc.name}`, -npc.monthlyCost, 'system')
        });
        notify(`Salário de ${npc.name} pago.`);
    };

    // --- Calendar Actions ---

    const advanceDate = (days: number) => {
        let { day, month, year, dayOfWeek } = activeGuild.calendar;
        let totalDays = day + days;

        while (totalDays > 30) {
            totalDays -= 30;
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }
        }
        while (totalDays < 1) {
            totalDays += 30;
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }
        }
        
        const newDayOfWeek = (dayOfWeek + days) % 7;
        const normalizedWeekDay = newDayOfWeek < 0 ? newDayOfWeek + 7 : newDayOfWeek;

        triggerSave({
            ...activeGuild,
            calendar: { ...activeGuild.calendar, day: totalDays, month, year, dayOfWeek: normalizedWeekDay }
        });
    };

    const setGameDate = (day: number, month: number, year: number) => {
        triggerSave({
            ...activeGuild,
            calendar: { ...activeGuild.calendar, day, month, year }
        });
    };

    const toggleNimbDay = (state: boolean) => {
        triggerSave({
            ...activeGuild,
            calendar: { ...activeGuild.calendar, isNimbDay: state }
        });
    };

    // --- Quest Actions ---

    const addQuest = (quest: Omit<Quest, 'id'>) => {
        triggerSave({
            ...activeGuild,
            quests: [...activeGuild.quests, { ...quest, id: crypto.randomUUID(), status: 'Disponivel' }]
        });
        notify("Missão publicada.");
    };

    const updateQuest = (id: string, data: Partial<Quest>) => {
        triggerSave({
            ...activeGuild,
            quests: activeGuild.quests.map(q => q.id === id ? { ...q, ...data } : q)
        });
        notify("Missão atualizada.");
    };

    const updateQuestStatus = (id: string, status: any) => {
        triggerSave({
            ...activeGuild,
            quests: activeGuild.quests.map(q => q.id === id ? { ...q, status } : q)
        });
    };

    const deleteQuest = (id: string) => {
        triggerSave({
            ...activeGuild,
            quests: activeGuild.quests.filter(q => q.id !== id)
        });
        notify("Missão removida.");
    };

    return (
        <GuildContext.Provider value={{
            activeGuildId: activeGuild.id,
            guildName: activeGuild.guildName,
            wallet: activeGuild.wallet,
            members: activeGuild.members,
            items: activeGuild.items,
            bases: activeGuild.bases,
            domains: activeGuild.domains,
            npcs: activeGuild.npcs,
            logs: activeGuild.logs,
            calendar: activeGuild.calendar,
            quests: activeGuild.quests,
            isAuthenticated,
            isLoading,
            isAdmin,
            feedback,
            guildList,
            loginToGuild,
            logout,
            loginAsAdmin,
            createNewGuild,
            deleteGuildById,
            importGuild,
            exportGuildData,
            exportLogs,
            changeAdminPassword,
            resetGuildPassword,
            deposit,
            withdraw,
            convertWallet,
            addMember,
            removeMember,
            updateMember,
            transferGoldToMember,
            transferGoldFromMember,
            updateMemberWallet,
            transferItemFromMember,
            deleteItemFromMember,
            createItemForMember,
            addItem,
            updateItem,
            sellItem,
            sellBatchItems,
            withdrawItem,
            deleteItem,
            deleteBatchItems,
            addBase,
            upgradeBase,
            payBaseMaintenance,
            collectBaseIncome,
            demolishBase,
            addRoom,
            removeRoom,
            addFurniture,
            removeFurniture,
            createDomain,
            updateDomain,
            investDomain,
            withdrawDomain,
            manageDomainTreasury,
            demolishDomain,
            governDomain,
            levelUpDomain,
            addDomainBuilding,
            removeDomainBuilding,
            addDomainUnit,
            removeDomainUnit,
            advanceDate,
            setGameDate,
            toggleNimbDay,
            addNPC,
            updateNPC,
            removeNPC,
            payAllNPCs,
            paySingleNPC,
            addQuest,
            updateQuest,
            updateQuestStatus,
            deleteQuest,
            notify
        }}>
            {children}
        </GuildContext.Provider>
    );
};

export const useGuild = () => {
  const context = useContext(GuildContext);
  if (context === undefined) {
    throw new Error('useGuild must be used within a GuildProvider');
  }
  return context;
};
