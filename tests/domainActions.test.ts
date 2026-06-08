import { useDomainActions } from '../context/hooks/useDomainActions';
import { GuildState, Domain, PopularityType, NPC } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES UNITÁRIOS DE DOMÍNIOS ===");

// 1. Configurar estado inicial da guilda para testes
let mockSavedState: GuildState | null = null;
const initialGuildState: GuildState = {
  id: 'test-guild-id',
  guildName: 'Guilda de Teste',
  version: 1,
  wallet: { TC: 0, TS: 10000, TO: 0, LO: 100 },
  items: [],
  bases: [],
  domains: [
    {
      id: 'domain-1',
      name: 'Vila da Fortuna',
      regent: 'Folk Steelheart',
      level: 1,
      terrain: 'Planície',
      isMystic: false,
      court: 'Inexistente',
      treasury: 50,
      popularity: 'Tolerado',
      fortification: 0,
      buildings: [
        { id: 'b-caravanserai', name: 'Caravançará', description: '', costLO: 10, benefit: '', fortificationBonus: 0, requires: [], skill: '', income: '' }
      ],
      units: [],
      advisors: [],
      pendingTasks: [],
      revolt: false
    }
  ],
  npcs: [
    { id: 'npc-1', name: 'Barnaby', role: 'Ferreiro', monthlyCost: 10, locationType: 'Grupo', locationName: 'Grupo' }
  ],
  logs: [],
  members: [
    { id: 'member-1', name: 'Sir Galahad', status: 'Ativo', wallet: { TC: 0, TS: 0, TO: 0, LO: 0 }, inventory: [] }
  ],
  calendar: { day: 1, month: 0, year: 1420, dayOfWeek: 0, isNimbDay: false },
  quests: [],
  pointsOfInterest: [],
  reputations: []
};

// Instanciar dependências do hook
const triggerSave = (state: GuildState) => {
  mockSavedState = state;
};
const notify = (text: string, type?: 'success' | 'error' | 'info') => {
  // console.log(`[Notify - ${type || 'info'}]: ${text}`);
};
const internalAddLog = (guild: GuildState, category: any, details: string, value: number, memberId: string) => {
  return [{ id: 'log-1', date: new Date().toISOString(), category, details, value, memberId, memberName: 'System' }];
};

// Criar o hook
let deps = { activeGuild: initialGuildState, triggerSave, notify, internalAddLog };
let actions = useDomainActions(deps);

// Teste 1: Criação de Domínio com custo
console.log("Teste 1: Criação de Domínio (Tentativa de Reivindicação)...");
actions.createDomain("Novo Feudo", "Herói de Arton", "Planície", true, false);
assert(mockSavedState !== null, "O estado devia ter sido salvo");
assert(mockSavedState!.wallet.TS === 5000, "Deveria deduzir T$ 5.000 (10000 -> 5000)");
assert(mockSavedState!.domains.length === 2, "Deveria ter criado o segundo domínio");
assert(mockSavedState!.domains[1].name === "Novo Feudo", "Nome do domínio incorreto");
console.log("✅ Teste 1 passou.");

// Resetar deps com o novo estado
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// Teste 2: Ação Governar - Custo unificado e Fluxo de duas etapas
console.log("Teste 2: Ação Governar (Custo Unificado e Fluxo de Duas Etapas)...");
// Fase 1: Pagar
let actionRes = actions.executeDomainAction('domain-1', 'govern', 'pay');
assert(actionRes.success === true, "Ação Governar devia ser declarada com sucesso");
assert(mockSavedState!.domains.find(d => d.id === 'domain-1')!.treasury === 30, "Devia cobrar Nível 1 * 20 = 20 LO do tesouro do domínio (50 -> 30)");
assert(mockSavedState!.domains.find(d => d.id === 'domain-1')!.level === 1, "O nível do domínio NÃO devia subir na fase 'pay'");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// Fase 2: Sucesso
actionRes = actions.executeDomainAction('domain-1', 'govern', 'success');
assert(actionRes.success === true, "A fase success devia completar com sucesso");
const updatedDomain = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(updatedDomain.level === 2, "O nível do domínio devia subir para 2");
assert(updatedDomain.popularity === 'Popular', "A popularidade devia subir para 'Popular' (Tolerado -> Popular)");
console.log("✅ Teste 2 passou.");

// Resetar deps
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// Teste 3: Caravanas (Dispatcher e CD de Nobreza)
console.log("Teste 3: Despachar Caravana...");
// Enviar caravana com 10 LO investidos e 2 dados d4
actionRes = actions.executeDomainAction('domain-1', 'caravan', 'pay', { value: 10, diceResult: 2 });
assert(actionRes.success === true, "Deveria despachar caravana com sucesso");
const domainAfterCaravan = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterCaravan.treasury === 20, "Deveria deduzir 10 LO do tesouro (30 -> 20)");
assert(domainAfterCaravan.pendingTasks!.length === 1, "Deveria adicionar uma tarefa pendente");
assert(domainAfterCaravan.pendingTasks![0].name.includes("Caravana"), "Nome da tarefa pendente inválido");
assert(domainAfterCaravan.pendingTasks![0].description.includes("CD Nobreza: 22"), "A CD de Nobreza deveria ser 22 (20 + 2 dados)");
console.log("✅ Teste 3 passou.");

// Resetar deps
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// Teste 4: Caravanas (Resolver lucro)
console.log("Teste 4: Resolver Lucro da Caravana...");
const taskId = mockSavedState!.domains.find(d => d.id === 'domain-1')!.pendingTasks![0].id;
actions.resolveCaravan('domain-1', taskId, 18); // Lucro total retornado de 18 LO (inicial 10 + 8 lucro)
const domainAfterResolve = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterResolve.treasury === 38, "Deveria somar o lucro ao tesouro (20 + 18 = 38 LO)");
assert(domainAfterResolve.pendingTasks!.length === 0, "Deveria remover a tarefa pendente");
console.log("✅ Teste 4 passou.");

// Resetar deps
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// Teste 5: Batalha Simplificada e perdas
console.log("Teste 5: Assistente de Batalhas e perdas...");
// Adicionar construções e unidades para testar perdas
const domainWithMilitary: Domain = {
  ...mockSavedState!.domains.find(d => d.id === 'domain-1')!,
  level: 3,
  buildings: [
    { id: 'b-def', name: 'Muralha', description: 'Defensiva', costLO: 10, benefit: 'Fortificação +5', fortificationBonus: 5, requires: [], skill: 'Guerra', income: '' },
    { id: 'b-com', name: 'Bazar', description: 'Comercial', costLO: 5, benefit: 'Mercado', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' }
  ],
  units: [
    { id: 'u-1', name: 'Soldados', type: 'Infantaria', power: 2, costLO: 4, maintenance: 0.5, defense: 15, damage: '1d8', speed: 9, requires: '' },
    { id: 'u-2', name: 'Arqueiros', type: 'Atiradores', power: 1.5, costLO: 3, maintenance: 0.5, defense: 13, damage: '1d6', speed: 9, requires: '' }
  ]
};

deps.activeGuild = {
  ...mockSavedState!,
  domains: mockSavedState!.domains.map(d => d.id === 'domain-1' ? domainWithMilitary : d)
};
actions = useDomainActions(deps);

// Aplicar perdas de Batalha: Derrota por 5+
// LO perdido: 5, unidades perdidas: todas, construções destruídas: nenhuma, perde nível: sim
actions.applyBattleOutcome('domain-1', 5, ['u-1', 'u-2'], [], true);

const domainAfterBattle = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterBattle.level === 2, "Deveria perder 1 nível (3 -> 2)");
assert(domainAfterBattle.treasury === 33, "Deveria deduzir 5 LO do tesouro (38 -> 33)");
assert(domainAfterBattle.units.length === 0, "Deveria perder todas as unidades selecionadas");
assert(domainAfterBattle.buildings.length === 2, "As construções deveriam estar intactas");
console.log("✅ Teste 5 passou.");

// Resetar deps
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// Teste 6: Fluxo de Caixa Local e updatePendingTask
console.log("Teste 6: Fluxo de Caixa Local e updatePendingTask...");
// Verificar que as transações criaram lançamentos no cashFlow
const domainWithFlow = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainWithFlow.cashFlow !== undefined, "Deveria possuir cashFlow inicializado");
assert(domainWithFlow.cashFlow!.length > 0, "Deveria possuir transações no extrato");

// Investir e verificar cashFlow
actions.investDomain('domain-1', 20);

// Refresh state
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

const domainAfterNewInvest = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterNewInvest.cashFlow!.some(tx => tx.reason === "Aporte da Guilda" && tx.amount === 20), "Deveria possuir o lançamento do novo investimento no cashFlow");

// Adicionar uma pendência manual e atualizá-la
actions.addPendingTask('domain-1', {
  name: 'Obras da Muralha',
  description: 'Elevar fortificação',
  status: 'Pendente',
  progress: 0,
  history: []
});

// Refresh state
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

const domainWithTask = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
const manualTaskId = domainWithTask.pendingTasks!.find(t => t.name === 'Obras da Muralha')!.id;

actions.updatePendingTask('domain-1', manualTaskId, {
  status: 'Em Progresso',
  progress: 45,
  note: 'Pedras e cimento entregues no canteiro'
});

// Refresh state
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

const domainAfterUpdate = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
const updatedManualTask = domainAfterUpdate.pendingTasks!.find(t => t.id === manualTaskId)!;
assert(updatedManualTask.status === 'Em Progresso', "O status devia ser 'Em Progresso'");
assert(updatedManualTask.progress === 45, "O progresso devia ser 45%");
assert(updatedManualTask.history!.length === 2, "O histórico devia ter 2 entradas");
assert(updatedManualTask.history![1].details === 'Pedras e cimento entregues no canteiro', "O detalhe do histórico está incorreto");
console.log("✅ Teste 6 passou.");

// Teste 7: Gestão Persistente de Ações de Domínio e Reinicialização de Turno
console.log("Teste 7: Gestão Persistente de Ações de Domínio e Reinicialização de Turno...");

// 1. Garantir que as ações iniciais são 2
let domain7 = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
domain7.actionsRemaining = 2; // Garantir inicialização para o teste
domain7.court = 'Inexistente'; // Corte comum (limite 2)
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// 2. Executar ação e verificar decremento (2 -> 1)
actions.executeDomainAction('domain-1', 'govern', 'pay');
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainAfterAct = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterAct.actionsRemaining === 1, `Deveria ter consumido 1 ação (2 -> 1). Atual: ${domainAfterAct.actionsRemaining}`);

// 3. Adicionar uma construção (com custo) e verificar decremento (1 -> 0)
actions.addDomainBuilding('domain-1', {
  name: 'Bazar',
  description: 'Mercado comercial',
  costLO: 1,
  benefit: 'Bônus de Nobreza',
  fortificationBonus: 0,
  requires: [],
  skill: 'Nobreza',
  income: ''
}, true); // pay = true
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainAfterBuilding = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterBuilding.actionsRemaining === 0, `Deveria ter consumido 1 ação pela construção (1 -> 0). Atual: ${domainAfterBuilding.actionsRemaining}`);

// 4. Tentar executar ação sem ações restantes (deve falhar)
let failRes = actions.executeDomainAction('domain-1', 'govern', 'pay');
assert(failRes.success === false, "Deveria falhar ao governar sem ações no turno");

// 5. Tentar adicionar construção sem ações restantes (deve falhar e não adicionar)
let buildingsCountBefore = domainAfterBuilding.buildings.length;
actions.addDomainBuilding('domain-1', {
  name: 'Estrada',
  description: 'Comercial',
  costLO: 1,
  benefit: 'Movimentação',
  fortificationBonus: 0,
  requires: [],
  skill: 'Nobreza',
  income: ''
}, true);
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainAfterBuildingFail = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterBuildingFail.buildings.length === buildingsCountBefore, "Não deveria ter adicionado a construção sem ações suficientes");

// 6. Reiniciar o turno do domínio
actions.resetDomainTurn('domain-1');
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainAfterReset = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterReset.actionsRemaining === 2, `Deveria ter reestabelecido para o máximo baseado na corte (2). Atual: ${domainAfterReset.actionsRemaining}`);

// 7. Testar limite de 3 ações para corte Rica
domainAfterReset.court = 'Rica';
domainAfterReset.actionsRemaining = 3;
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
actions.resetDomainTurn('domain-1');
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainRicaReset = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainRicaReset.actionsRemaining === 3, `Deveria ter reestabelecido para o máximo de corte Rica (3). Atual: ${domainRicaReset.actionsRemaining}`);

// 8. Testar reinicialização de todos os domínios simultaneamente (resetAllDomainsTurns)
domainRicaReset.actionsRemaining = 0;
let domainSecond = mockSavedState!.domains[1];
domainSecond.actionsRemaining = 0;
domainSecond.court = 'Inexistente'; // max 2
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

actions.resetAllDomainsTurns();

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domain1Reset = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
let domain2Reset = mockSavedState!.domains[1];
assert(domain1Reset.actionsRemaining === 3, `Deveria ter reestabelecido o domínio Rica para 3 ações. Atual: ${domain1Reset.actionsRemaining}`);
assert(domain2Reset.actionsRemaining === 2, `Deveria ter reestabelecido o domínio Inexistente para 2 ações. Atual: ${domain2Reset.actionsRemaining}`);

console.log("✅ Teste 7 passou.");

// Teste 8: Gestão de Conselheiros (Nomear, Editar, Mover, Dispensar e Vínculos com Membros/NPCs)
console.log("Teste 8: Gestão de Conselheiros (Nomear, Editar, Mover, Dispensar e Vínculos com Membros/NPCs)...");

// 1. Alterar a corte para Comum para permitir 1 conselheiro
let domainForAdvisor = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
domainForAdvisor.court = 'Comum';
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// 2. Tentar adicionar conselheiro com vínculo a NPC
actions.addAdvisor('domain-1', {
  id: 'adv-npc',
  name: 'Barnaby',
  role: 'Senescal',
  skill: 'Nobreza',
  associatedId: 'npc-1',
  associatedType: 'NPC'
});

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterAdvisor = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterAdvisor.advisors.length === 1, "Deveria ter adicionado 1 conselheiro");
assert(domainAfterAdvisor.advisors[0].associatedId === 'npc-1', "Deveria estar vinculado ao npc-1");

// Verificar se a localização do NPC foi atualizada para o domínio
let npcAfterAdv = mockSavedState!.npcs.find(n => n.id === 'npc-1')!;
assert(npcAfterAdv.locationType === 'Dominio', "A localização do NPC deveria ser 'Dominio'");
assert(npcAfterAdv.locationId === 'domain-1', "O ID da localização do NPC deveria ser 'domain-1'");

// 3. Atualizar o conselheiro (Mudar cargo/perícia)
actions.updateAdvisor('domain-1', 'adv-npc', {
  role: 'Mago da Corte',
  skill: 'Misticismo'
});

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterUpdateAdv = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterUpdateAdv.advisors[0].role === 'Mago da Corte', "O cargo deveria ter mudado para Mago da Corte");
assert(domainAfterUpdateAdv.advisors[0].skill === 'Misticismo', "A perícia deveria ter mudado para Misticismo");

// 4. Mover o conselheiro para o segundo domínio
let secondDomain = mockSavedState!.domains[1];
secondDomain.court = 'Comum'; // Permitir 1 conselheiro
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

actions.updateAdvisor('domain-1', 'adv-npc', {}, secondDomain.id);

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let sourceDomainFinal = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
let targetDomainFinal = mockSavedState!.domains.find(d => d.id === secondDomain.id)!;
assert(sourceDomainFinal.advisors.length === 0, "O domínio de origem não deveria ter mais o conselheiro");
assert(targetDomainFinal.advisors.length === 1, "O domínio de destino deveria ter o conselheiro");

// Verificar se a localização do NPC atualizou para o novo domínio
let npcAfterMove = mockSavedState!.npcs.find(n => n.id === 'npc-1')!;
assert(npcAfterMove.locationId === secondDomain.id, "A localização do NPC deveria ter mudado para o novo domínio");

// 5. Dispensar o conselheiro e verificar reset da localização do NPC
actions.removeAdvisor(secondDomain.id, 'adv-npc');

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let targetDomainRemoved = mockSavedState!.domains.find(d => d.id === secondDomain.id)!;
assert(targetDomainRemoved.advisors.length === 0, "Deveria ter removido o conselheiro do domínio");

let npcAfterRemove = mockSavedState!.npcs.find(n => n.id === 'npc-1')!;
assert(npcAfterRemove.locationType === 'Grupo', "A localização do NPC deveria ter retornado para 'Grupo'");
assert(npcAfterRemove.locationId === undefined, "O ID da localização do NPC deveria ser indefinido");

console.log("✅ Teste 8 passou.");

// Teste 9: Resolução Interativa de Revolta (testSuccess: true e false)
console.log("Teste 9: Resolução Interativa de Revolta...");

// Configurar domínio em revolta com construções e treasury > 0
let domainRevolt = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
domainRevolt.revolt = true;
domainRevolt.popularity = 'Odiado';
domainRevolt.court = 'Inexistente';
domainRevolt.treasury = 40;
domainRevolt.buildings = [
  { id: 'b-r1', name: 'Taverna', description: 'Local de lazer', costLO: 3, benefit: 'Popularidade', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { id: 'b-r2', name: 'Quartel', description: 'Militar', costLO: 5, benefit: 'Recrutamento', fortificationBonus: 2, requires: [], skill: 'Guerra', income: '' }
];
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// 9a. SUCESSO: revolta suprimida, popularidade volta para Tolerado
let revolveSuccess = actions.resolveRevolt('domain-1', true);
assert(revolveSuccess.success === true, "resolveRevolt(true) devia retornar success=true");
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainAfterSuccessRevolt = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterSuccessRevolt.revolt === false, "A revolta devia ter sido suprimida");
assert(domainAfterSuccessRevolt.popularity === 'Tolerado', "A popularidade devia ter retornado para Tolerado");

// 9b. FALHA com construções: última construção é destruída, revolta continua
domainAfterSuccessRevolt.revolt = true;
domainAfterSuccessRevolt.popularity = 'Odiado';
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let revolteFail = actions.resolveRevolt('domain-1', false);
assert(revolteFail.success === false, "resolveRevolt(false) devia retornar success=false");
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainAfterFailRevolt = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterFailRevolt.buildings.length === 1, `A última construção devia ter sido destruída (2 -> 1). Atual: ${domainAfterFailRevolt.buildings.length}`);
assert(domainAfterFailRevolt.buildings[0].name === 'Taverna', "A construção restante devia ser a Taverna (a primeira)");
assert(domainAfterFailRevolt.revolt === true, "A revolta devia continuar ativa");

// 9c. FALHA sem construções: 2d4 LO saqueados do tesouro
domainAfterFailRevolt.buildings = [];
domainAfterFailRevolt.revolt = true;
const treasuryBefore = domainAfterFailRevolt.treasury;
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let revolteFailNoBuild = actions.resolveRevolt('domain-1', false);
assert(revolteFailNoBuild.success === false, "resolveRevolt(false) sem construções devia retornar success=false");
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainAfterSack = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
const lostLO = treasuryBefore - domainAfterSack.treasury;
assert(lostLO >= 2 && lostLO <= 8, `Deveria ter saqueado entre 2 e 8 LO (2d4). Saqueados: ${lostLO}`);
assert(domainAfterSack.cashFlow!.some(tx => tx.reason.includes("Saque de Revolta")), "Devia ter registrado a transação de saque no fluxo de caixa");

console.log("✅ Teste 9 passou.");

// 10. Teste de Normalização de Terrenos
console.log("Teste 10: Normalização de Terrenos...");
const maxColinas = actions.getDomainMaxLevel({ terrain: "colinas" });
assert(maxColinas === 5, `Colinas devia ter nível máximo 5 (retornou ${maxColinas})`);
const maxPlanicie = actions.getDomainMaxLevel({ terrain: "PLANÍCIE" });
assert(maxPlanicie === 6, `PLANÍCIE devia ter nível máximo 6 (retornou ${maxPlanicie})`);
const maxFloresta = actions.getDomainMaxLevel({ terrain: "floresta", isNatureBoundRace: true });
assert(maxFloresta === 6, `floresta com raça natural devia ter nível máximo 6 (retornou ${maxFloresta})`);
const maxSubtWater = actions.getDomainMaxLevel({ terrain: "subterrâneo", hasWaterAccess: true });
assert(maxSubtWater === 3, `subterrâneo com água devia ter nível máximo 3 (retornou ${maxSubtWater})`);
console.log("✅ Teste 10 passou.");

// 11. Teste de Limite Militar baseado no nível do domínio
console.log("Teste 11: Limite de Unidades Militares...");
let domain11 = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
domain11.level = 1;
domain11.units = [
  { id: 'u-ex', name: 'Soldados', type: 'Infantaria', power: 2, costLO: 4, maintenance: 0.5, defense: 15, damage: '1d8', speed: 9, requires: '' }
];
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

// Tentar adicionar outra unidade via addDomainUnit (deve falhar/notify)
const notifiedError = { value: false };
const notifyMock = (text: string, type?: string) => {
  if (type === 'error' && text.includes("Limite máximo de unidades militares atingido")) {
    notifiedError.value = true;
  }
};
const depsWithMockNotify = { ...deps, notify: notifyMock };
const actionsWithMock = useDomainActions(depsWithMockNotify);

actionsWithMock.addDomainUnit('domain-1', {
  name: 'Arqueiros', type: 'À Distância', power: 2, costLO: 2, maintenance: 0.5, defense: 15, damage: '1d8', speed: 9, requires: ''
}, false);
assert(notifiedError.value === true, "Deveria notificar erro ao tentar adicionar unidade acima do limite");

// Tentar convocar camponeses via conscript (deve falhar)
let conscriptRes = actions.executeDomainAction('domain-1', 'conscript', 'pay');
assert(conscriptRes.success === false, "Deveria falhar a convocação de camponeses (conscript) se já atingiu o limite de unidades");
assert(conscriptRes.message.includes("Limite máximo de unidades militares atingido"), "Mensagem de erro incorreta para limite militar no conscript");
console.log("✅ Teste 11 passou.");

// Teste 12: Regressão - Perda de tropas e reset de NPCs na manutenção e rebaixamento de corte
console.log("Teste 12: Regressão - Perda de tropas e reset de NPCs na manutenção e rebaixamento de corte...");

// Configurar estado com corte Rica, 1 unidade e 2 conselheiros vinculados a NPCs
let testNPCs: NPC[] = [
  { id: 'npc-1', name: 'Barnaby', role: 'Ferreiro', monthlyCost: 10, locationType: 'Dominio', locationId: 'domain-1', locationName: 'Vila da Fortuna' },
  { id: 'npc-2', name: 'Alora', role: 'Alquimista', monthlyCost: 15, locationType: 'Dominio', locationId: 'domain-1', locationName: 'Vila da Fortuna' }
];

let domain12: Domain = {
  ...mockSavedState!.domains.find(d => d.id === 'domain-1')!,
  court: 'Rica',
  treasury: 0, // Sem tesouro para falhar a manutenção
  units: [
    { id: 'u-maint-1', name: 'Soldados', type: 'Infantaria', power: 2, costLO: 4, maintenance: 0.5, defense: 15, damage: '1d8', speed: 9, requires: '' }
  ],
  advisors: [
    { id: 'adv-npc-1', name: 'Barnaby', role: 'Senescal', skill: 'Nobreza', associatedId: 'npc-1', associatedType: 'NPC' },
    { id: 'adv-npc-2', name: 'Alora', role: 'Mago da Corte', skill: 'Misticismo', associatedId: 'npc-2', associatedType: 'NPC' }
  ],
  actionsRemaining: 2
};

deps.activeGuild = {
  ...mockSavedState!,
  domains: mockSavedState!.domains.map(d => d.id === 'domain-1' ? domain12 : d),
  npcs: testNPCs
};
actions = useDomainActions(deps);

// Caso A: Rebaixamento manual de corte (Rica -> Comum).
// Comum permite no máximo 1 conselheiro. O segundo conselheiro ('adv-npc-2' com 'npc-2') será removido.
// 'npc-2' deve retornar para 'Grupo'
let decreaseRes = actions.executeDomainAction('domain-1', 'decreaseCourt', 'success');
assert(decreaseRes.success === true, "Deveria reduzir a corte manual com sucesso");

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterManualDecrease = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterManualDecrease.court === 'Comum', "A corte devia ser Comum");
assert(domainAfterManualDecrease.advisors.length === 1, "Devia sobrar apenas 1 conselheiro");
assert(domainAfterManualDecrease.advisors[0].id === 'adv-npc-1', "O conselheiro Barnaby devia ser mantido");

let npc1AfterManual = mockSavedState!.npcs.find(n => n.id === 'npc-1')!;
let npc2AfterManual = mockSavedState!.npcs.find(n => n.id === 'npc-2')!;
assert(npc1AfterManual.locationType === 'Dominio', "Barnaby devia continuar no domínio");
assert(npc2AfterManual.locationType === 'Grupo', "Alora devia ter retornado ao grupo");

// Caso B: Falha na manutenção por tesouro insuficiente.
// Vamos configurar a corte de volta para Rica com os 2 conselheiros e a unidade.
// O custo de manutenção da corte Rica é 4 LO. O tesouro é 0 LO.
// A manutenção vai falhar: a corte cai para Comum (permite 1 conselheiro), unidades são disbandadas (units = []),
// e o conselheiro excedente (Alora) tem seu NPC resetado para o 'Grupo'.
domain12.court = 'Rica';
domain12.treasury = 0;
domain12.units = [
  { id: 'u-maint-1', name: 'Soldados', type: 'Infantaria', power: 2, costLO: 4, maintenance: 0.5, defense: 15, damage: '1d8', speed: 9, requires: '' }
];
domain12.advisors = [
  { id: 'adv-npc-1', name: 'Barnaby', role: 'Senescal', skill: 'Nobreza', associatedId: 'npc-1', associatedType: 'NPC' },
  { id: 'adv-npc-2', name: 'Alora', role: 'Mago da Corte', skill: 'Misticismo', associatedId: 'npc-2', associatedType: 'NPC' }
];

deps.activeGuild = {
  ...mockSavedState!,
  domains: mockSavedState!.domains.map(d => d.id === 'domain-1' ? domain12 : d),
  npcs: testNPCs
};
actions = useDomainActions(deps);

let maintRes = actions.payMaintenance('domain-1');
assert(maintRes.success === false, "A manutenção devia falhar por falta de fundos");

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterFailedMaint = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterFailedMaint.court === 'Comum', "A corte devia ter caído para Comum");
assert(domainAfterFailedMaint.units.length === 0, "Todas as tropas deviam ter sido perdidas");
assert(domainAfterFailedMaint.advisors.length === 1, "Devia sobrar apenas 1 conselheiro");

let npc1AfterMaint = mockSavedState!.npcs.find(n => n.id === 'npc-1')!;
let npc2AfterMaint = mockSavedState!.npcs.find(n => n.id === 'npc-2')!;
assert(npc1AfterMaint.locationType === 'Dominio', "Barnaby devia continuar no domínio");
assert(npc2AfterMaint.locationType === 'Grupo', "Alora devia ter retornado ao grupo");

console.log("✅ Teste 12 passou.");

// Teste 13: Pré-requisito de Unidades sem Construções no Domínio
console.log("Teste 13: Pré-requisito de Unidades sem Construções no Domínio...");

let domain13: Domain = {
  ...mockSavedState!.domains.find(d => d.id === 'domain-1')!,
  level: 2,
  buildings: [], // Sem construções no domínio
  units: []      // Sem unidades
};

let errorNotified = { value: false };
const mockNotify13 = (text: string, type?: string) => {
  if (type === 'error' && text.includes("Construção necessária")) {
    errorNotified.value = true;
  }
};

const deps13 = {
  ...deps,
  activeGuild: {
    ...mockSavedState!,
    domains: mockSavedState!.domains.map(d => d.id === 'domain-1' ? domain13 : d)
  },
  notify: mockNotify13
};

const actions13 = useDomainActions(deps13);

// Tentar recrutar Milícia que exige "Campo de Treinamento" (deve falhar)
actions13.addDomainUnit('domain-1', {
  name: 'Milícia',
  type: 'Infantaria',
  power: 1,
  costLO: 1,
  maintenance: 0.25,
  defense: 16,
  damage: '1d8+1',
  speed: 9,
  requires: 'Campo de Treinamento'
}, false);

assert(errorNotified.value === true, "Deveria ter disparado erro de construção necessária");
console.log("✅ Teste 13 passou.");

// Teste 14: Caos Temporário no Governo (-5 nas Ações) e Reinicialização
console.log("Teste 14: Caos Temporário no Governo e Reinicialização...");

let domain14: Domain = {
  ...mockSavedState!.domains.find(d => d.id === 'domain-1')!,
  court: 'Rica',
  treasury: 0, // Sem tesouro para forçar falha
  tempCaosPenalty: false
};

deps.activeGuild = {
  ...mockSavedState!,
  domains: mockSavedState!.domains.map(d => d.id === 'domain-1' ? domain14 : d)
};
actions = useDomainActions(deps);

// Pagar manutenção (deve falhar e aplicar caos)
actions.payMaintenance('domain-1');

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterFailedMaint14 = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterFailedMaint14.tempCaosPenalty === true, "Deveria ter aplicado a penalidade de caos (tempCaosPenalty: true)");

// Reiniciar o turno do domínio (deve limpar o caos)
actions.resetDomainTurn('domain-1');

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterReset14 = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterReset14.tempCaosPenalty === false, "Deveria ter limpado o caos no resetDomainTurn");

// Forçar falha de manutenção de novo
domainAfterReset14.court = 'Rica';
domainAfterReset14.treasury = 0;
deps.activeGuild = {
  ...mockSavedState!,
  domains: mockSavedState!.domains.map(d => d.id === 'domain-1' ? domainAfterReset14 : d)
};
actions = useDomainActions(deps);
actions.payMaintenance('domain-1');

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainFailedAgain = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainFailedAgain.tempCaosPenalty === true, "Deveria ter aplicado a penalidade de caos novamente");

// Reiniciar todos os turnos (deve limpar o caos de todos)
actions.resetAllDomainsTurns();

deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterAllReset = mockSavedState!.domains.find(d => d.id === 'domain-1')!;
assert(domainAfterAllReset.tempCaosPenalty === false, "Deveria ter limpado o caos no resetAllDomainsTurns");

console.log("✅ Teste 14 passou.");

// Teste 15: Regras de Domínios Místicos, Coexistência, Eventos e Ameaças
console.log("Teste 15: Regras de Domínios Místicos, Coexistência, Eventos e Ameaças...");

// 1. Criar um domínio místico
let domainMistico: Domain = {
  id: 'domain-mystic-1',
  name: 'Torre de Vidro',
  regent: 'Sylas',
  level: 1,
  terrain: 'Floresta',
  isMystic: true,
  court: 'Inexistente',
  treasury: 10,
  popularity: 'N/A',
  fortification: 0,
  buildings: [],
  units: [],
  advisors: [],
  pendingTasks: [],
  revolt: false,
  magicPowerLevel: 1,
  isNatureBoundRace: false
};

// 2. Verificar que o nível máximo de domínio místico sem coexistência na floresta é seu potencial mágico = 6 (sem Elemento Místico)
let maxLvlMystic = actions.getDomainMaxLevel(domainMistico);
assert(maxLvlMystic === 6, `O nível máximo devia ser 6. Retornado: ${maxLvlMystic}`);

// 3. Adicionar Elemento Místico -> potencial místico devia subir para 7
domainMistico.hasMysticElement = true;
maxLvlMystic = actions.getDomainMaxLevel(domainMistico);
assert(maxLvlMystic === 7, `O nível máximo devia ser 7. Retornado: ${maxLvlMystic}`);

// 4. Coexistência: Adicionar um domínio civil no mesmo terreno (Nível 2)
let domainCivil: Domain = {
  id: 'domain-civil-1',
  name: 'Vila da Floresta',
  regent: 'Varian',
  level: 2,
  terrain: 'Floresta',
  isMystic: false,
  court: 'Inexistente',
  treasury: 20,
  popularity: 'Tolerado',
  fortification: 0,
  buildings: [],
  units: [],
  advisors: [],
  pendingTasks: [],
  revolt: false,
  isNatureBoundRace: false
};

// Vinculando coexistência no domínio místico
domainMistico.coexistingDomainId = 'domain-civil-1';

deps.activeGuild = {
  ...mockSavedState!,
  domains: [domainMistico, domainCivil]
};
actions = useDomainActions(deps);

// Max level devia cair para potencial - nível civil (7 - 2 = 5)
maxLvlMystic = actions.getDomainMaxLevel(domainMistico);
assert(maxLvlMystic === 5, `O nível máximo com coexistência devia ser 5 (7 - 2). Retornado: ${maxLvlMystic}`);

// Se o domínio civil pertencer a uma raça ligada à natureza (isNatureBoundRace = true), o limite de coexistência é ignorado
domainCivil.isNatureBoundRace = true;
maxLvlMystic = actions.getDomainMaxLevel(domainMistico);
assert(maxLvlMystic === 7, `O nível máximo com raça ligada à natureza devia ignorar coexistência (7). Retornado: ${maxLvlMystic}`);

// Resetar raça do civil
domainCivil.isNatureBoundRace = false;

// 5. Teste de Rendimento Passivo de Domínio Místico
// Místico nível 2 com manutenção devia gerar passiveIncome = 2 LO.
// Manutenção de Inexistente = 0. Saldo final devia aumentar em 2 LO.
domainMistico.level = 2;
domainMistico.isMystic = true;
domainMistico.treasury = 10;
deps.activeGuild = {
  ...mockSavedState!,
  domains: [domainMistico, domainCivil]
};
actions = useDomainActions(deps);

actions.payMaintenance('domain-mystic-1');
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainMysticAfterMaint = mockSavedState!.domains.find(d => d.id === 'domain-mystic-1')!;
assert(domainMysticAfterMaint.treasury === 12, `O tesouro devia ser 12 (10 + 2). Atual: ${domainMysticAfterMaint.treasury}`);

// 6. Teste de Mana do Regente (magicPowerLevel = level * level)
// Como o nível subiu para 2, o magicPowerLevel devia ser atualizado para 4
actions.updateDomain('domain-mystic-1', { level: 3 });
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainMysticAfterUpdate = mockSavedState!.domains.find(d => d.id === 'domain-mystic-1')!;
assert(domainMysticAfterUpdate.magicPowerLevel === 9, `O poder mágico devia ser 9 (3 * 3). Atual: ${domainMysticAfterUpdate.magicPowerLevel}`);

// 7. Teste de Ameaças Contínuas e Fim de Turno
// Adicionamos tarefas de Bandidos e Corrupção pendentes
let domainWithThreats: Domain = {
  id: 'domain-threats-1',
  name: 'Feudo das Sombras',
  regent: 'Ged',
  level: 1,
  terrain: 'Planície',
  isMystic: false,
  court: 'Comum',
  treasury: 50,
  popularity: 'Tolerado',
  fortification: 0,
  buildings: [
    { id: 'b-t-1', name: 'Taverna', description: '', costLO: 1, benefit: '', fortificationBonus: 0, requires: [], skill: '', income: '' }
  ],
  units: [],
  advisors: [],
  pendingTasks: [
    { id: 't-bandits', name: '🏴‍☠️ Ameaça: Bandidos', description: 'Bandidos na estrada', status: 'Pendente', progress: 0 },
    { id: 't-corruption', name: '💰 Problema: Corrupção', description: 'Corrupção na corte', status: 'Pendente', progress: 0 }
  ],
  revolt: false
};

deps.activeGuild = {
  ...mockSavedState!,
  domains: [domainWithThreats]
};
actions = useDomainActions(deps);

// Resetar turno devia processar ameaças:
// - Bandidos reduz popularidade: Tolerado -> Impopular
// - Corrupção reduz LO: 1d6 (por exemplo, reduz de 50 para algo menor)
actions.resetDomainTurn('domain-threats-1');
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterThreatReset = mockSavedState!.domains.find(d => d.id === 'domain-threats-1')!;
assert(domainAfterThreatReset.popularity === 'Impopular', `A popularidade devia cair para Impopular. Atual: ${domainAfterThreatReset.popularity}`);
assert(domainAfterThreatReset.treasury < 50, `O tesouro devia ter sido drenado pela corrupção (< 50). Atual: ${domainAfterThreatReset.treasury}`);

// 8. Teste de Aftermath de Corrupção concluída
// Se concluirmos a tarefa de corrupção, a corte deve cair de categoria (Comum -> Pobre)
actions.updatePendingTask('domain-threats-1', 't-corruption', { status: 'Concluido' });
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterCorruptionResolved = mockSavedState!.domains.find(d => d.id === 'domain-threats-1')!;
assert(domainAfterCorruptionResolved.court === 'Pobre', `A corte devia cair para Pobre. Atual: ${domainAfterCorruptionResolved.court}`);

// 9. Teste de Revolta Fim de Turno
// Sob revolta, o fim do turno destrói uma construção aleatória
domainAfterCorruptionResolved.revolt = true;
deps.activeGuild = {
  ...mockSavedState!,
  domains: [domainAfterCorruptionResolved]
};
actions = useDomainActions(deps);

actions.resetDomainTurn('domain-threats-1');
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);

let domainAfterRevoltReset = mockSavedState!.domains.find(d => d.id === 'domain-threats-1')!;
assert(domainAfterRevoltReset.buildings.length === 0, `A Taverna devia ter sido destruída pela revolta. Atual: ${domainAfterRevoltReset.buildings.length}`);

// 10. Teste de Popularidade e Revolta Invariante
// Se a popularidade subir acima de Odiado, a revolta deve ser desativada automaticamente
actions.updateDomain('domain-threats-1', { popularity: 'Tolerado' });
deps.activeGuild = mockSavedState!;
actions = useDomainActions(deps);
let domainCured = mockSavedState!.domains.find(d => d.id === 'domain-threats-1')!;
assert(domainCured.revolt === false, "A revolta devia ter sido curada ao subir popularidade para Tolerado");

console.log("✅ Teste 15 passou.");

console.log("=== TODOS OS TESTES UNITÁRIOS DE DOMÍNIOS PASSARAM COM SUCESSO! ===");
process.exit(0);
