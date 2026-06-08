/**
 * migration.test.ts
 * Testa a sanitização de dados de guildas antigas para o novo formato.
 * Garante retrocompatibilidade.
 */
import { GuildState, Domain, NPC, Member, Quest, Item } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES DE MIGRAÇÃO DE DADOS ANTIGOS ===");

// Simula a função sanitizeGuildData do GuildContext (inline, sem dependências React)
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
    safeData.items = (Array.isArray(safeData.items) ? safeData.items : []).map(sanitizeItem);
    safeData.bases = (Array.isArray(safeData.bases) ? safeData.bases : []).map((b: any) => ({
        ...b,
        gargulas: typeof b.gargulas === 'number' ? b.gargulas : 0,
        rooms: (Array.isArray(b.rooms) ? b.rooms : []).map((r: any) => ({
            ...r,
            isDamaged: !!r.isDamaged,
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

// --- Dados da guilda antiga fornecidos pelo usuário ---
const oldGuildData: any = {
  "id": "d7adb250-0532-41b8-99ea-44da916409d1",
  "guildName": "Espada Magia e Ressaca S.A.",
  "version": 188,
  "wallet": { "TC": 0, "TS": 3919, "TO": 2840, "LO": 0 },
  "items": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Bálsamo Restaurador",
      "type": "Consumivel",
      "value": 25,
      "origin": "Estoque Geral",
      "rarity": "Comum",
      "quantity": 15,
      "encounter": "",
      "isQuestItem": false,
      "isNonNegotiable": false
    }
  ],
  "bases": [
    {
      "id": "1ececcd2-b200-435b-be53-35b254f91aa5",
      "name": "Escola Numeromântica de Candeh'ssa",
      "type": "CentroDePoder",
      "porte": "Basica",
      "rooms": [
        {
          "id": "b8b31d5f-b75b-459a-9ebb-6af0fe8c678d",
          "name": "Pátio de Treinamento",
          "furnitures": [{ "id": "1b661f66-ea70-4f7e-a5ce-7d28091d0206", "cost": 0, "name": "Armadura decorativa" }]
        }
      ],
      "history": ["Fundada como Basica em 1/20/2026"]
    }
  ],
  "domains": [
    {
      "id": "5e446365-d8b8-4737-9fb4-c35d9feec34a",
      "name": "Candeh'ssa",
      "court": "Inexistente",
      "level": 1,
      "units": [],
      "regent": "Valkária",
      "terrain": "Planície",
      "treasury": 0,
      "buildings": [],
      "popularity": "Tolerado",
      "fortification": 0
      // NOTE: 'revolt' and 'advisors' are intentionally missing to simulate old format
    }
  ] as any[],
  "npcs": [
    {
      "id": "c10702dd-12ed-4909-99ec-a2281a40486f",
      "name": "Sharin",
      "role": "Recrutada para Candeh'ssa",
      "locationId": "",
      "monthlyCost": 0,
      "locationName": "Em Comitiva",
      "locationType": "Grupo",
      "relationship": "Parceiro"
      // NOTE: 'status', 'tier', 'allyType', etc. are intentionally missing
    }
  ] as any[],
  "logs": [],
  // NOTE: 'members', 'quests', 'pointsOfInterest', 'reputations', 'calendar' are intentionally missing
};

// === TESTES ===

console.log("Teste 1: Sanitizando guilda antiga sem campos obrigatórios do novo formato...");
const result = sanitizeGuildData(oldGuildData);
assert(result !== null && result !== undefined, "O resultado não pode ser null/undefined");
console.log("✅ Teste 1 passou: sanitização completou sem erros.");

console.log("Teste 2: GuildState - Campos de topo obrigatórios...");
assert(result.id === "d7adb250-0532-41b8-99ea-44da916409d1", "ID deve ser preservado");
assert(result.guildName === "Espada Magia e Ressaca S.A.", "guildName deve ser preservado");
assert(result.version === 188, "version deve ser preservada");
assert(Array.isArray(result.members), "members deve ser um array");
assert(Array.isArray(result.quests), "quests deve ser um array");
assert(Array.isArray(result.pointsOfInterest), "pointsOfInterest deve ser um array");
assert(Array.isArray(result.reputations), "reputations deve ser um array");
assert(Array.isArray(result.logs), "logs deve ser um array");
console.log("✅ Teste 2 passou: campos de topo presentes.");

console.log("Teste 3: Wallet da guilda...");
assert(result.wallet.TC === 0, "TC deve ser 0");
assert(result.wallet.TS === 3919, "TS deve ser 3919");
assert(result.wallet.TO === 2840, "TO deve ser 2840");
assert(result.wallet.LO === 0, "LO deve ser 0");
console.log("✅ Teste 3 passou: wallet correta.");

console.log("Teste 4: Calendar default quando ausente...");
assert(typeof result.calendar.day === 'number', "calendar.day deve ser número");
assert(typeof result.calendar.month === 'number', "calendar.month deve ser número");
assert(typeof result.calendar.year === 'number', "calendar.year deve ser número");
assert(typeof result.calendar.dayOfWeek === 'number', "calendar.dayOfWeek deve ser número");
assert(typeof result.calendar.isNimbDay === 'boolean', "calendar.isNimbDay deve ser boolean");
console.log("✅ Teste 4 passou: calendar inicializado com defaults.");

console.log("Teste 5: Domains - advisors ausente deve ser inicializado como array vazio...");
const domain: Domain = result.domains[0];
assert(domain !== undefined, "Deve existir ao menos 1 domínio");
assert(Array.isArray(domain.advisors), "domain.advisors deve ser um array");
assert(domain.advisors.length === 0, "domain.advisors deve ser vazio (campo ausente no formato antigo)");
assert(domain.revolt === false, "domain.revolt deve ser false quando ausente");
assert(Array.isArray(domain.buildings), "domain.buildings deve ser array");
assert(Array.isArray(domain.units), "domain.units deve ser array");
// This is the critical test - calling .length should NOT crash
const _ = domain.advisors.length; 
console.log("✅ Teste 5 passou: domain.advisors pode ser acessado sem crash.");

console.log("Teste 6: NPCs - campos novos devem ser inicializados...");
const npc: NPC = result.npcs[0];
assert(npc !== undefined, "Deve existir ao menos 1 NPC");
assert(npc.status === 'Ativo', "npc.status deve default para 'Ativo'");
assert(npc.tier === 'N/A', "npc.tier deve default para 'N/A'");
assert(npc.allyType === 'N/A', "npc.allyType deve default para 'N/A'");
assert(npc.bonusDescription === '', "npc.bonusDescription deve default para ''");
assert(npc.likes === '', "npc.likes deve default para ''");
assert(npc.dislikes === '', "npc.dislikes deve default para ''");
assert(typeof npc.affinityByMember === 'object', "npc.affinityByMember deve ser objeto");
assert(typeof npc.ultimateQuestDone === 'object', "npc.ultimateQuestDone deve ser objeto");
assert(npc.relationship === 'Parceiro', "npc.relationship original deve ser preservado");
console.log("✅ Teste 6 passou: campos de NPC corretamente inicializados.");

console.log("Teste 7: Items - campos devem ser sanitizados...");
const item = result.items[0];
assert(item !== undefined, "Deve existir ao menos 1 item");
assert(item.name === "Bálsamo Restaurador", "nome do item deve ser preservado");
assert(item.origin === "Estoque Geral", "origin do item deve ser preservado");
assert(item.isQuestItem === false, "isQuestItem deve ser false");
assert(item.isNonNegotiable === false, "isNonNegotiable deve ser false");
assert(item.encounter === '', "encounter deve ser '' (vazio)");
console.log("✅ Teste 7 passou: itens corretamente sanitizados.");

console.log("Teste 8: Bases - furnitures e rooms sanitizados...");
const base = result.bases[0];
assert(base !== undefined, "Deve existir ao menos 1 base");
assert(Array.isArray(base.rooms), "base.rooms deve ser array");
assert(base.rooms[0].furnitures !== undefined, "rooms[0].furnitures deve existir");
assert(typeof base.gargulas === 'number', "base.gargulas deve ser número");
console.log("✅ Teste 8 passou: bases corretamente sanitizadas.");

console.log("Teste 9: Members ausentes devem ser array vazio...");
assert(Array.isArray(result.members), "members deve ser array");
assert(result.members.length === 0, "members deve ser vazio (ausente no formato antigo)");
console.log("✅ Teste 9 passou: members ausentes inicializados como array vazio.");

console.log("Teste 10: Quests ausentes devem ser array vazio...");
assert(Array.isArray(result.quests), "quests deve ser array");
assert(result.quests.length === 0, "quests deve ser vazio (ausente no formato antigo)");
console.log("✅ Teste 10 passou: quests ausentes inicializados como array vazio.");

console.log("=== TODOS OS TESTES DE MIGRAÇÃO PASSARAM COM SUCESSO! ===");
