
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { 
  GuildState, LogEntry, Wallet, Item, Base, Domain, NPC, Quest, CalendarState, Member, 
  CurrencyType, LogCategory, MemberStatus, ItemType, ItemRarity, BasePorte, BaseType, 
  DomainBuilding, DomainUnit, CourtType, PopularityType, NPCRelationship, NPCLocationType,
  PointOfInterest, ReputationEntry, PointOfInterestType, ReputationTargetType, QuestStatus,
  DomainActionType, ActionResult
} from '../types';
import { RATES, PORTE_DATA, COURT_DATA, POPULARITY_LEVELS } from '../constants';
import { dbService, GuildSummary } from '../services/db';
import {
  useFinancialActions,
  useMemberActions,
  useItemActions,
  useBaseActions,
  useDomainActions,
  useNPCActions,
  useCalendarActions,
  useQuestActions,
  useReputationActions
} from './hooks';

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
   pointsOfInterest: PointOfInterest[];
   reputations: ReputationEntry[];
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
   bulkUpdateMembers: (updater: (members: Member[]) => Member[]) => void;
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

    addBase: (name: string, porte: BasePorte, type: BaseType, method: 'construct' | 'buy' | 'reward', rollResult?: number) => void;
    upgradeBase: (id: string, newPorte: BasePorte, method: 'roll' | 'reward', rollResult?: number) => void;
    reformBase: (id: string, newType: BaseType, method: 'roll' | 'reward', rollResult?: number) => void;
    repairRoom: (baseId: string, roomId: string, pay: boolean) => void;
    payBaseMaintenance: (id: string, type: string, cost: number, skip?: boolean) => void;
   collectBaseIncome: (id: string, amount: number) => void;
   demolishBase: (id: string) => void;
    addRoom: (baseId: string, name: string, method: 'roll' | 'reward', rollResult?: number) => void;
   removeRoom: (baseId: string, roomId: string) => void;
    addFurniture: (baseId: string, roomId: string, name: string, cost: number, pay: boolean) => void;
    removeFurniture: (baseId: string, roomId: string, furnId: string) => void;
    moveFurniture: (baseId: string, fromRoomId: string, toRoomId: string, furnitureId: string) => void;
    addGargula: (baseId: string, pay: boolean) => void;
    removeGargula: (baseId: string) => void;
    createBusiness: (name: string) => void;
    levelUpBusiness: (baseId: string) => void;
    addBusinessAsset: (baseId: string, assetName: string) => void;
    removeBusinessAsset: (baseId: string, assetName: string) => void;
    collectBusinessIncome: (baseId: string, rollResult?: number) => void;

   createDomain: (
      name: string,
      regent: string,
      terrain: string,
      payCost: boolean,
      isMystic?: boolean,
      revolt?: boolean,
      hasWaterAccess?: boolean,
      hasMysticElement?: boolean,
      isNatureBoundRace?: boolean,
      isSubterraneanBoundRace?: boolean,
      coexistingDomainId?: string
    ) => void;
   updateDomain: (id: string, data: Partial<Domain>) => void;
   investDomain: (id: string, amount: number) => void;
   withdrawDomain: (id: string, amount: number) => void;
   manageDomainTreasury: (id: string, amount: number, type: 'Income' | 'Expense', reason: string) => void;
   demolishDomain: (id: string) => void;
   levelUpDomain: (id: string) => void;
   addDomainBuilding: (id: string, building: Omit<DomainBuilding, 'id'>, pay: boolean) => void;
   removeDomainBuilding: (id: string, buildId: string) => void;
   addDomainUnit: (id: string, unit: Omit<DomainUnit, 'id'>, pay: boolean) => void;
   removeDomainUnit: (id: string, unitId: string) => void;
   executeDomainAction: (id: string, action: DomainActionType, phase: 'pay' | 'success', params?: { value?: number; diceResult?: number }) => ActionResult;
   getDomainMaxLevel: (domain: { terrain: string; isNatureBoundRace?: boolean; isSubterraneanBoundRace?: boolean; hasWaterAccess?: boolean }) => number;
   getDomainMagicPotential: (domain: { terrain: string; hasMysticElement?: boolean }) => number;
   payMaintenance: (id: string) => ActionResult;
   getMaintenanceCost: (domain: Domain) => number;
   computeFortification: (buildings: DomainBuilding[]) => number;
   applyEvent: (id: string, eventName: string, effect: string) => ActionResult;
   applyRandomEvent: (id: string, event: { name: string; description: string; impact: string; effect: string; range: number[] }, boonChoice?: 'lo' | 'popularity' | 'modifier', invasionRoll?: number, penaltyValue?: number, loAmount?: number) => ActionResult;
   resolveRevolt: (id: string, testSuccess: boolean) => ActionResult;
   addAdvisor: (id: string, advisor: import('../types').DomainAdvisor) => void;
   removeAdvisor: (id: string, advisorId: string) => void;
   updateAdvisor: (id: string, advisorId: string, data: Partial<import('../types').DomainAdvisor>, newDomainId?: string) => void;
   addPendingTask: (id: string, task: Omit<import('../types').DomainPendingTask, 'id'>) => void;
   updatePendingTask: (id: string, taskId: string, data: Partial<import('../types').DomainPendingTask> & { note?: string }) => void;
   removePendingTask: (id: string, taskId: string) => void;
   resolveCaravan: (id: string, taskId: string, profitLO: number) => void;
   applyBattleOutcome: (
       id: string,
       lostLO: number,
       lostUnitIds: string[],
       lostBuildingIds: string[],
       loseLevel: boolean
   ) => ActionResult;
   resetDomainTurn: (id: string) => void;
   resetAllDomainsTurns: () => void;

   advanceDate: (days: number) => void;
   setGameDate: (day: number, month: number, year: number) => void;
   toggleNimbDay: (state: boolean) => void;

    addNPC: (npc: Omit<NPC, 'id'>) => void;
    updateNPC: (id: string, data: Partial<NPC>) => void;
    removeNPC: (id: string) => void;
    payAllNPCs: () => void;
    paySingleNPC: (id: string) => void;
    interactWithNPC: (npcId: string, memberId: string, alignsWithLikes: boolean) => void;
    decreaseAffinity: (npcId: string, memberId: string) => void;
    toggleActiveAffinity: (memberId: string, npcId: string) => void;
    completeUltimateQuest: (npcId: string, memberId: string) => void;

   addQuest: (quest: Omit<Quest, 'id'>) => void;
   updateQuest: (id: string, quest: Partial<Quest>) => void;
   updateQuestStatus: (id: string, status: QuestStatus) => void;
   deleteQuest: (id: string) => void;

   addPointOfInterest: (poi: Omit<PointOfInterest, 'id'>) => void;
   updatePointOfInterest: (id: string, data: Partial<PointOfInterest>) => void;
   removePointOfInterest: (id: string) => void;

   addReputation: (rep: Omit<ReputationEntry, 'id'>) => void;
   updateReputation: (id: string, data: Partial<ReputationEntry>) => void;
   removeReputation: (id: string) => void;

   notify: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const GuildContext = createContext<GuildContextData | undefined>(undefined);

const initialGuildState: GuildState = {
    id: '',
    guildName: '',
    version: 0,
    wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
    items: [],
    bases: [],
    domains: [],
    npcs: [],
    logs: [],
    members: [],
    calendar: { day: 1, month: 0, year: 1420, dayOfWeek: 0, isNimbDay: false },
    quests: [],
    pointsOfInterest: [],
    reputations: []
};

const sanitizeGuildData = (data: any): GuildState => {
    const safeData = { ...initialGuildState, ...data };
    
    safeData.version = typeof safeData.version === 'number' ? safeData.version : 0;

    safeData.wallet = {
        TC: typeof safeData.wallet?.TC === 'number' ? safeData.wallet.TC : 0,
        TS: typeof safeData.wallet?.TS === 'number' ? safeData.wallet.TS : 0,
        TO: typeof safeData.wallet?.TO === 'number' ? safeData.wallet.TO : 0,
        LO: typeof safeData.wallet?.LO === 'number' ? safeData.wallet.LO : 0
    };

    safeData.calendar = {
        day: typeof safeData.calendar?.day === 'number' ? safeData.calendar.day : 1,
        month: typeof safeData.calendar?.month === 'number' ? safeData.calendar.month : 0,
        year: typeof safeData.calendar?.year === 'number' ? safeData.calendar.year : 1420,
        dayOfWeek: typeof safeData.calendar?.dayOfWeek === 'number' ? safeData.calendar.dayOfWeek : 0,
        isNimbDay: !!safeData.calendar?.isNimbDay
    };

    const sanitizeItem = (item: any): Item => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || 'Item Sem Nome',
        type: item.type || 'Consumivel',
        rarity: item.rarity || 'Comum',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        value: typeof item.value === 'number' ? item.value : 0,
        origin: item.origin || '',
        encounter: item.encounter || '',
        isQuestItem: !!item.isQuestItem,
        isNonNegotiable: !!item.isNonNegotiable
    });

    safeData.items = (Array.isArray(safeData.items) ? safeData.items : []).map(sanitizeItem);

    safeData.bases = (Array.isArray(safeData.bases) ? safeData.bases : []).map((b: any) => ({
        ...b,
        gargulas: typeof b.gargulas === 'number' ? b.gargulas : 0,
        security: typeof b.security === 'number' ? b.security : undefined,
        rooms: (Array.isArray(b.rooms) ? b.rooms : []).map((r: any) => ({
            ...r,
            isDamaged: !!r.isDamaged,
            cost: typeof r.cost === 'number' ? r.cost : undefined,
            furnitures: (Array.isArray(r.furnitures) ? r.furnitures : []).map((f: any) => ({
                ...f,
                cost: typeof f.cost === 'number' ? f.cost : 0
            }))
        }))
    }));

    safeData.npcs = (Array.isArray(safeData.npcs) ? safeData.npcs : []).map((n: any) => ({
        ...n,
        locationType: n.locationType || 'Grupo',
        locationName: n.locationName || 'Em Comitiva',
        locationId: n.locationId || '',
        relationship: n.relationship || 'Contratado',
        status: n.status || 'Ativo',
        tier: n.tier || 'N/A',
        allyType: n.allyType || 'N/A',
        bonusDescription: n.bonusDescription || '',
        likes: n.likes || '',
        dislikes: n.dislikes || '',
        affinityByMember: n.affinityByMember && typeof n.affinityByMember === 'object' ? n.affinityByMember : {},
        ultimateQuestDone: n.ultimateQuestDone && typeof n.ultimateQuestDone === 'object' ? n.ultimateQuestDone : {}
    }));

    safeData.logs = Array.isArray(safeData.logs) ? safeData.logs : [];
    safeData.pointsOfInterest = Array.isArray(safeData.pointsOfInterest) ? safeData.pointsOfInterest : [];
    safeData.reputations = Array.isArray(safeData.reputations) ? safeData.reputations : [];

    safeData.quests = (Array.isArray(safeData.quests) ? safeData.quests : []).map((q: any) => ({
        ...q,
        rewardGold: typeof q.rewardGold === 'number' ? q.rewardGold : 0,
        rewardCurrency: q.rewardCurrency || 'TS',
        rewardXP: q.rewardXP || '',
        assignedMemberIds: Array.isArray(q.assignedMemberIds) ? q.assignedMemberIds : []
    }));
    
    safeData.members = (Array.isArray(safeData.members) ? safeData.members : []).map((m: any) => ({
        ...m,
        status: m.status || 'Ativo',
        wallet: {
            TC: typeof m.wallet?.TC === 'number' ? m.wallet.TC : 0,
            TS: typeof m.wallet?.TS === 'number' ? m.wallet.TS : 0,
            TO: typeof m.wallet?.TO === 'number' ? m.wallet.TO : 0,
            LO: typeof m.wallet?.LO === 'number' ? m.wallet.LO : 0
        },
        inventory: (Array.isArray(m.inventory) ? m.inventory : []).map(sanitizeItem),
        divinePoints: typeof m.divinePoints === 'number' ? m.divinePoints : 0,
        activeAffinityNpcId: m.activeAffinityNpcId || undefined
    }));

    safeData.domains = (Array.isArray(safeData.domains) ? safeData.domains : []).map((d: any) => ({
        ...d,
        revolt: d.revolt === undefined ? false : d.revolt,
        fortification: typeof d.fortification === 'number' ? d.fortification : 0,
        advisors: (Array.isArray(d.advisors) ? d.advisors : []).map((a: any) => ({
            id: a.id || crypto.randomUUID(),
            name: a.name || 'Conselheiro',
            role: a.role || 'Senescal',
            skill: a.skill || 'Nobreza',
            associatedId: a.associatedId || undefined,
            associatedType: a.associatedType || undefined
        })),
        buildings: Array.isArray(d.buildings) ? d.buildings.map((b: any) => ({
            ...b,
            fortificationBonus: b.fortificationBonus || 0,
            requires: Array.isArray(b.requires) ? b.requires : [],
            skill: b.skill || 'Nobreza',
            income: b.income || ''
        })) : [],
        units: Array.isArray(d.units) ? d.units.map((u: any) => ({
            ...u,
            maintenance: u.maintenance || 0,
            defense: u.defense || 15,
            damage: u.damage || '1d6',
            speed: u.speed || 9,
            requires: u.requires || ''
        })) : [],
        pendingTasks: Array.isArray(d.pendingTasks) ? d.pendingTasks.map((t: any) => ({
            id: t.id || crypto.randomUUID(),
            name: t.name || '',
            description: t.description || '',
            status: t.status || 'Pendente',
            progress: typeof t.progress === 'number' ? t.progress : 0,
            history: Array.isArray(t.history) ? t.history : []
        })) : [],
        cashFlow: Array.isArray(d.cashFlow) ? d.cashFlow.map((cf: any) => ({
            id: cf.id || crypto.randomUUID(),
            date: cf.date || new Date().toISOString(),
            type: cf.type || 'Entrada',
            amount: typeof cf.amount === 'number' ? cf.amount : 0,
            reason: cf.reason || ''
        })) : []
    }));

    return safeData;
};

export const GuildProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeGuild, setActiveGuild] = useState<GuildState>(initialGuildState);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [guildList, setGuildList] = useState<GuildSummary[]>([]);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [sessionKey, setSessionKey] = useState<string>('');
    const [adminPassword, setAdminPassword] = useState<string>('');
    const syncIntervalRef = useRef<number | null>(null);
    const saveChainRef = useRef<Promise<void>>(Promise.resolve());
    const saveEpochRef = useRef(0);
    const versionRef = useRef(0);

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

    const syncGuild = useCallback(async () => {
        if (!isAuthenticated || !activeGuild.id || !sessionKey) return;
        
        try {
            const remoteData = await dbService.getGuild(activeGuild.id, sessionKey);
            if (remoteData) {
                const safeRemote = sanitizeGuildData(remoteData);
                setActiveGuild(prev => {
                    if (safeRemote.version > prev.version) {
                        return safeRemote;
                    }
                    return prev;
                });
            }
        } catch (e) {
            console.error("Erro de sincronização:", e);
        }
    }, [isAuthenticated, activeGuild.id, sessionKey]);

    useEffect(() => {
        if (isAuthenticated) {
            syncIntervalRef.current = window.setInterval(syncGuild, 5000);
        } else {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        }
        return () => {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        };
    }, [isAuthenticated, syncGuild]);

    useEffect(() => {
        versionRef.current = activeGuild.version || 0;
    }, [activeGuild.id, activeGuild.version]);

    const triggerSave = useCallback(async (newState: GuildState) => {
        const baseVersion = versionRef.current || 0;
        const versionedState = { ...newState, version: baseVersion + 1 };
        versionRef.current = versionedState.version;
        setActiveGuild(versionedState);

        if (!isAuthenticated || !sessionKey) return;

        const epoch = saveEpochRef.current;
        saveChainRef.current = saveChainRef.current
            .then(async () => {
                if (saveEpochRef.current !== epoch) return;
                await dbService.saveGuild(versionedState, sessionKey);
            })
            .catch(async (e: any) => {
                if (saveEpochRef.current !== epoch) return;
                console.error("Save failed", e);

                if (e.status === 409) {
                    saveEpochRef.current++;
                    saveChainRef.current = Promise.resolve();
                    notify("Conflito de edição detectado! Sincronizando dados...", "error");
                    const freshData = await dbService.getGuild(versionedState.id, sessionKey);
                    if (freshData) {
                        const safe = sanitizeGuildData(freshData);
                        versionRef.current = safe.version || 0;
                        setActiveGuild(safe);
                    }
                    return;
                }

                notify("Erro ao salvar automaticamente", "error");
            });
    }, [isAuthenticated, sessionKey, notify]);

    const internalAddLog = useCallback((guild: GuildState, category: LogCategory, details: string, value: number, memberId: string): LogEntry[] => {
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
    }, []);

    // Hook deps
    const hookDeps = { activeGuild, triggerSave, notify, internalAddLog };

    // Finance actions
    const { deposit, withdraw, convertWallet } = useFinancialActions(hookDeps);

    // Member actions
    const {
        addMember, removeMember, updateMember, bulkUpdateMembers,
        transferGoldToMember, transferGoldFromMember, updateMemberWallet,
        transferItemFromMember, deleteItemFromMember, createItemForMember
    } = useMemberActions(hookDeps);

    // Item actions
    const { addItem, updateItem, sellItem, sellBatchItems, withdrawItem, deleteItem, deleteBatchItems } = useItemActions(hookDeps);

    // Base actions
    const {
        addBase, upgradeBase, payBaseMaintenance, collectBaseIncome, demolishBase,
        addRoom, removeRoom, addFurniture, removeFurniture, reformBase, repairRoom,
        moveFurniture, addGargula, removeGargula,
        createBusiness, levelUpBusiness, addBusinessAsset, removeBusinessAsset,
        collectBusinessIncome
    } = useBaseActions(hookDeps);

    // Domain actions
    const {
        createDomain, updateDomain, investDomain, withdrawDomain, manageDomainTreasury,
        demolishDomain, levelUpDomain,
        addDomainBuilding, removeDomainBuilding, addDomainUnit, removeDomainUnit,
        executeDomainAction, payMaintenance, getMaintenanceCost, computeFortification,
        applyEvent, applyRandomEvent, resolveRevolt, addAdvisor, removeAdvisor, updateAdvisor, addPendingTask, updatePendingTask, removePendingTask,
        resolveCaravan, applyBattleOutcome, resetDomainTurn, resetAllDomainsTurns,
        getDomainMaxLevel, getDomainMagicPotential
    } = useDomainActions(hookDeps);

    // NPC actions
    const { 
        addNPC, updateNPC, removeNPC, payAllNPCs, paySingleNPC,
        interactWithNPC, decreaseAffinity, toggleActiveAffinity, completeUltimateQuest
    } = useNPCActions(hookDeps);

    // Calendar actions
    const { advanceDate, setGameDate, toggleNimbDay } = useCalendarActions(hookDeps);

    // Quest actions
    const { addQuest, updateQuest, updateQuestStatus, deleteQuest } = useQuestActions(hookDeps);

    // Reputation actions
    const {
        addPointOfInterest, updatePointOfInterest, removePointOfInterest,
        addReputation, updateReputation, removeReputation
    } = useReputationActions(hookDeps);

    // Placeholder para os métodos que não vieram do useDomainActions
    // (A correção é que eles estão lá, mas no retorno do const { ... } )

    const hasInitializedRef = useRef(false);
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;
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
                } catch (e) {
                    console.error("Erro ao carregar sessão inicial:", e);
                    dbService.setSession('');
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
        setAdminPassword('');
        setActiveGuild(initialGuildState);
        dbService.setSession('');
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        notify("Desconectado com sucesso.");
    };

    const loginAsAdmin = async (password: string) => {
        try {
            await dbService.loginAdmin(password);
            setIsAdmin(true);
            setAdminPassword(password);
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
            guildName: name,
            version: 1
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
            await dbService.deleteGuild(id, sessionKey);
            await fetchGuilds();
            if (activeGuild.id === id) logout();
            notify("Guilda removida dos registros.");
        } catch(e) {
            notify("Erro ao remover guilda. Verifique as credenciais.", "error");
        }
    };

    const importGuild = async (json: string, password: string) => {
        try {
            const parsed = JSON.parse(json);
            if (!parsed.id || !parsed.guildName) throw new Error("Formato inválido");
            const safeData = sanitizeGuildData(parsed);
            safeData.version = (safeData.version || 0) + 1; 
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
        try {
            await dbService.resetGuildPassword(adminPassword, guildId, newPass);
            notify("Senha da guilda redefinida com sucesso.");
        } catch (e) {
            notify("Erro ao redefinir senha da guilda. Verifique as credenciais de admin.", "error");
        }
    };

    return (
        <GuildContext.Provider value={{
            activeGuildId: activeGuild.id,
            guildName: activeGuild.guildName,
            wallet: activeGuild.wallet,
            members: activeGuild.members || [],
            items: activeGuild.items || [],
            bases: activeGuild.bases || [],
            domains: activeGuild.domains || [],
            npcs: activeGuild.npcs || [],
            logs: activeGuild.logs || [],
            calendar: activeGuild.calendar || initialGuildState.calendar,
            quests: activeGuild.quests || [],
            pointsOfInterest: activeGuild.pointsOfInterest || [],
            reputations: activeGuild.reputations || [],
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
            bulkUpdateMembers,
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
            reformBase,
            repairRoom,
            payBaseMaintenance,
            collectBaseIncome,
            demolishBase,
            addRoom,
            removeRoom,
            addFurniture,
            removeFurniture,
            moveFurniture,
            addGargula,
            removeGargula,
            createBusiness,
            levelUpBusiness,
            addBusinessAsset,
            removeBusinessAsset,
            collectBusinessIncome,
            createDomain,
            updateDomain,
            investDomain,
            withdrawDomain,
            manageDomainTreasury,
            demolishDomain,
            levelUpDomain,
            addDomainBuilding,
            removeDomainBuilding,
            addDomainUnit,
            removeDomainUnit,
            executeDomainAction,
            payMaintenance,
            getMaintenanceCost,
            computeFortification,
            applyEvent,
            applyRandomEvent,
            resolveRevolt,
            addAdvisor,
            removeAdvisor,
            updateAdvisor,
            addPendingTask,
            updatePendingTask,
            removePendingTask,
            resolveCaravan,
            applyBattleOutcome,
            resetDomainTurn,
            resetAllDomainsTurns,
            getDomainMaxLevel,
            getDomainMagicPotential,

            advanceDate,
            setGameDate,
            toggleNimbDay,
            addNPC,
            updateNPC,
            removeNPC,
            payAllNPCs,
            paySingleNPC,
            interactWithNPC,
            decreaseAffinity,
            toggleActiveAffinity,
            completeUltimateQuest,
            addQuest,
            updateQuest,
            updateQuestStatus,
            deleteQuest,
            addPointOfInterest,
            updatePointOfInterest,
            removePointOfInterest,
            addReputation,
            updateReputation,
            removeReputation,
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
