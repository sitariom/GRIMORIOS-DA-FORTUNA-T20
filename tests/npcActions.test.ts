import { useNPCActions } from '../context/hooks/useNPCActions';
import { GuildState, NPC, Member } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES UNITÁRIOS DE ALIADOS E COMITIVA ===");

let mockSavedState: GuildState | null = null;
const initialGuildState: GuildState = {
  id: 'test-guild-id',
  guildName: 'Guilda de Teste',
  version: 1,
  wallet: { TC: 0, TS: 10000, TO: 0, LO: 0 },
  items: [],
  bases: [],
  domains: [],
  npcs: [],
  logs: [],
  members: [
    {
      id: 'member-1',
      name: 'Valdor',
      status: 'Ativo',
      wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
      inventory: []
    },
    {
      id: 'member-2',
      name: 'Lysandra',
      status: 'Ativo',
      wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
      inventory: []
    }
  ],
  calendar: { day: 1, month: 0, year: 1420, dayOfWeek: 0, isNimbDay: false },
  quests: [],
  pointsOfInterest: [],
  reputations: []
};

const triggerSave = (state: GuildState) => {
  mockSavedState = state;
};
const notify = (text: string, type?: 'success' | 'error' | 'info') => {
  // console.log(`[Notify - ${type || 'info'}]: ${text}`);
};
const internalAddLog = (guild: GuildState, category: any, details: string, value: number, memberId: string) => {
  return [{ id: 'log-1', date: new Date().toISOString(), category, details, value, memberId, memberName: 'System' }];
};

// 1. Criar o hook
let deps = { activeGuild: initialGuildState, triggerSave, notify, internalAddLog };
let actions = useNPCActions(deps);

// Teste 1: Adicionar NPC com atributos T20
console.log("Teste 1: Adicionar NPC com T20 Parceiro attributes...");
actions.addNPC({
  name: "Gimli, o Anão",
  role: "Guia Subterrâneo",
  monthlyCost: 500,
  locationType: "Livre",
  locationName: "Reino de Namalkar",
  relationship: "Contratado",
  tier: "Veterano",
  allyType: "Combatente",
  bonusDescription: "+2 em testes de Sobrevivência em masmorras",
  status: "Ativo",
  likes: "Cerveja, Ouro",
  dislikes: "Orcs"
});

assert(mockSavedState !== null, "O estado devia ter sido salvo");
assert(mockSavedState!.npcs.length === 1, "NPC devia ter sido adicionado");
assert(mockSavedState!.npcs[0].name === "Gimli, o Anão", "Nome incorreto");
assert(mockSavedState!.npcs[0].relationship === "Contratado", "Vínculo incorreto");
assert(mockSavedState!.npcs[0].tier === "Veterano", "Patamar incorreto");
assert(mockSavedState!.npcs[0].allyType === "Combatente", "Tipo de parceiro incorreto");
assert(mockSavedState!.npcs[0].locationName === "Reino de Namalkar", "Localização livre incorreta");
console.log("✅ Teste 1 passou.");

// Atualizar estado para os próximos testes
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);

// Teste 2: Folha Salarial - Pagar contratado ativo
console.log("Teste 2: Pagar folha salarial de contratado ativo...");
actions.payAllNPCs();
assert(mockSavedState!.wallet.TS === 9500, "Custo mensal de 500 devia ser debitado (10000 -> 9500)");
console.log("✅ Teste 2 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);

// Teste 3: Folha Salarial - Não pagar contratado inativo/morto/em missão
console.log("Teste 3: Não pagar contratado com status não Ativo (Em Missao)...");
// Mudar status para 'Em Missao'
actions.updateNPC(mockSavedState!.npcs[0].id, { status: "Em Missao" });
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);

const previousTS = mockSavedState!.wallet.TS;
actions.payAllNPCs();
// O saldo TS deve continuar 9500 pois o NPC não está ativo
assert(mockSavedState!.wallet.TS === previousTS, "Custo mensal não devia ser debitado para contratado inativo");
console.log("✅ Teste 3 passou.");

// Teste 4: Folha Salarial - Pagar apenas Contratados (Ignorar Aliados e outros vínculos)
console.log("Teste 4: Não pagar folha para parceiros com vínculo 'Aliado'...");
// Registrar um novo NPC como Aliado
actions.addNPC({
  name: "Aragorn",
  role: "Patrulheiro",
  monthlyCost: 1000,
  locationType: "Grupo",
  locationName: "Em Comitiva",
  relationship: "Aliado",
  tier: "Mestre",
  allyType: "Assassino",
  status: "Ativo"
});
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);

const tsBeforeAliadoPay = mockSavedState!.wallet.TS;
actions.payAllNPCs();
assert(mockSavedState!.wallet.TS === tsBeforeAliadoPay, "Não devia cobrar salário de Aliado");
console.log("✅ Teste 4 passou.");

// Teste 5: Afinidades - Interagir e ganhar PA
console.log("Teste 5: Aumentar afinidade por interações comuns (+1 PA) e alinhadas (+2 PA)...");
const gimliId = mockSavedState!.npcs.find(n => n.name === "Gimli, o Anão")!.id;
// Interação normal (+1)
actions.interactWithNPC(gimliId, "member-1", false);
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
assert(mockSavedState!.npcs.find(n => n.id === gimliId)!.affinityByMember?.["member-1"] === 1, "Devia acumular 1 PA");

// Interação com gostos (+2)
actions.interactWithNPC(gimliId, "member-1", true);
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
assert(mockSavedState!.npcs.find(n => n.id === gimliId)!.affinityByMember?.["member-1"] === 3, "Devia acumular +2 PA, total 3");
console.log("✅ Teste 5 passou.");

// Teste 6: Afinidades - Teto de 7 PA
console.log("Teste 6: Garantir limite máximo de 7 PA...");
// Executar interações extras para estourar o limite
actions.interactWithNPC(gimliId, "member-1", true); // +2 -> 5
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
actions.interactWithNPC(gimliId, "member-1", true); // +2 -> 7
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
actions.interactWithNPC(gimliId, "member-1", true); // +2 -> 7 (deve capar em 7)
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);

assert(mockSavedState!.npcs.find(n => n.id === gimliId)!.affinityByMember?.["member-1"] === 7, "PA devia estar limitado em 7");
console.log("✅ Teste 6 passou.");

// Teste 7: Afinidades - Benefício Ativo (Apenas 1 por aventureiro)
console.log("Teste 7: Habilitar e alternar benefícios de afinidade ativa (limite de 1 por membro)...");
const aragornId = mockSavedState!.npcs.find(n => n.name === "Aragorn")!.id;

// Ativar Gimli para Valdor
actions.toggleActiveAffinity("member-1", gimliId);
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
assert(mockSavedState!.members.find(m => m.id === "member-1")!.activeAffinityNpcId === gimliId, "Gimli devia ser a afinidade ativa de Valdor");

// Ativar Aragorn para Valdor (deve substituir Gimli)
actions.toggleActiveAffinity("member-1", aragornId);
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
assert(mockSavedState!.members.find(m => m.id === "member-1")!.activeAffinityNpcId === aragornId, "Aragorn devia ter substituído Gimli na afinidade ativa de Valdor");

// Desativar afinidade
actions.toggleActiveAffinity("member-1", aragornId);
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
assert(mockSavedState!.members.find(m => m.id === "member-1")!.activeAffinityNpcId === undefined, "Afinidade de Valdor devia estar limpa");
console.log("✅ Teste 7 passou.");

// Teste 8: Última Demanda
console.log("Teste 8: Completar Última Demanda somente com 7 PA...");
// Tentar com Aragorn (0 PA)
actions.completeUltimateQuest(aragornId, "member-1");
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
assert(!mockSavedState!.npcs.find(n => n.id === aragornId)!.ultimateQuestDone?.["member-1"], "Não devia completar Última Demanda com Aragorn");

// Tentar com Gimli (7 PA)
actions.completeUltimateQuest(gimliId, "member-1");
deps.activeGuild = mockSavedState!;
actions = useNPCActions(deps);
assert(mockSavedState!.npcs.find(n => n.id === gimliId)!.ultimateQuestDone?.["member-1"] === true, "Devia completar Última Demanda com Gimli");
console.log("✅ Teste 8 passou.");

console.log("=== TODOS OS TESTES UNITÁRIOS DE ALIADOS E COMITIVA PASSARAM COM SUCESSO ===");
