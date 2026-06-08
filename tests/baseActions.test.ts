import { useBaseActions } from '../context/hooks/useBaseActions';
import { GuildState, Base, BasePorte, BaseType } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES UNITÁRIOS DE BASES E MOBÍLIAS ===");

let mockSavedState: GuildState | null = null;
const initialGuildState: GuildState = {
  id: 'test-guild-id',
  guildName: 'Guilda de Teste',
  version: 1,
  wallet: { TC: 0, TS: 50000, TO: 0, LO: 0 },
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
let actions = useBaseActions(deps);

// Teste 1: Construção de Base com falha no teste
console.log("Teste 1: Tentativa de Construção de Base (Falha no teste Nobreza CD 20)...");
actions.addBase("Fortaleza Alvorada", "Minima", "Residencia", "construct", 15);
assert(mockSavedState !== null, "O estado devia ter sido salvo");
assert(mockSavedState!.wallet.TS === 49000, "Devia deduzir T$ 1.000 do material da falha");
assert(mockSavedState!.bases.length === 0, "A base não devia ter sido criada na falha");
console.log("✅ Teste 1 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 2: Construção de Base com sucesso no teste
console.log("Teste 2: Tentativa de Construção de Base (Sucesso no teste Nobreza CD 20)...");
actions.addBase("Fortaleza Alvorada", "Minima", "Residencia", "construct", 20);
assert(mockSavedState!.wallet.TS === 48000, "Devia deduzir mais T$ 1.000 do material");
assert(mockSavedState!.bases.length === 1, "A base devia ter sido criada");
assert(mockSavedState!.bases[0].name === "Fortaleza Alvorada", "Nome incorreto");
assert(mockSavedState!.bases[0].porte === "Minima", "Porte devia ser Minima");
assert(mockSavedState!.bases[0].type === "Residencia", "Tipo devia ser Residencia");
console.log("✅ Teste 2 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 3: Compra Pronta de Base (3x custo, sem teste)
console.log("Teste 3: Compra de Base Pronta (Porte Básica, sem teste, custo triplicado)...");
// Básica custo normal: T$ 6.000. Triplicado = T$ 18.000.
actions.addBase("Torre Celeste", "Basica", "CentroDePoder", "buy");
assert(mockSavedState!.wallet.TS === 30000, "Devia cobrar T$ 18.000 (48k -> 30k)");
assert(mockSavedState!.bases.length === 2, "Devia ter criado a segunda base");
assert(mockSavedState!.bases[1].name === "Torre Celeste", "Nome incorreto");
assert(mockSavedState!.bases[1].porte === "Basica", "Porte devia ser Basica");
console.log("✅ Teste 3 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 4: Upgrade de porte (Mínima -> Modesta, CD 23, com falha)
console.log("Teste 4: Upgrade de porte com falha (Mínima para Modesta, slots 3, CD 23, rolagem 15)...");
// Mínima -> Modesta. Custo: 3000 - 1000 = 2000.
const baseMinId = mockSavedState!.bases[0].id;
actions.upgradeBase(baseMinId, "Modesta", "roll", 15);
assert(mockSavedState!.wallet.TS === 28000, "Devia cobrar T$ 2.000 pela tentativa");
assert(mockSavedState!.bases.find(b => b.id === baseMinId)!.porte === "Minima", "Porte não devia mudar com falha");
console.log("✅ Teste 4 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 5: Upgrade de porte (Mínima -> Modesta, CD 23, com sucesso)
console.log("Teste 5: Upgrade de porte com sucesso (Mínima para Modesta, CD 23, rolagem 25)...");
actions.upgradeBase(baseMinId, "Modesta", "roll", 25);
assert(mockSavedState!.wallet.TS === 26000, "Devia cobrar mais T$ 2.000");
assert(mockSavedState!.bases.find(b => b.id === baseMinId)!.porte === "Modesta", "Porte devia mudar para Modesta");
console.log("✅ Teste 5 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 6: Reforma de tipo (Modesta, custo 3000, reforma metade = 1500, CD 20, com sucesso)
console.log("Teste 6: Reforma de tipo da base (Modesta, Residencia -> Fortificacao, CD 20, rolagem 22)...");
actions.reformBase(baseMinId, "Fortificacao", "roll", 22);
assert(mockSavedState!.wallet.TS === 24500, "Devia cobrar T$ 1.500 (26k -> 24.5k)");
const reformedBase = mockSavedState!.bases.find(b => b.id === baseMinId)!;
assert(reformedBase.type === "Fortificacao", "Tipo devia mudar para Fortificacao");
assert(reformedBase.security === 5, "Segurança base devia subir para 5");
console.log("✅ Teste 6 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 7: Adicionar cômodo (Custo fixo T$ 1.000, CD = 20 + slots da base)
console.log("Teste 7: Adicionar cômodo Biblioteca (Construção Regular, CD 23, rolagem 25)...");
// Modesta possui 3 slots. CD é 23.
actions.addRoom(baseMinId, "Biblioteca", "roll", 25);
assert(mockSavedState!.wallet.TS === 23500, "Devia cobrar T$ 1.000 (24.5k -> 23.5k)");
let updatedBase = mockSavedState!.bases.find(b => b.id === baseMinId)!;
assert(updatedBase.rooms.length === 1, "Devia ter 1 cômodo");
assert(updatedBase.rooms[0].name === "Biblioteca", "Nome incorreto");
assert(updatedBase.rooms[0].cost === 1000, "Custo devia ser salvo como 1000");
console.log("✅ Teste 7 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 7.1: Pré-requisitos de cômodos (Casa da Guarda sem Guarita deve falhar)
console.log("Teste 7.1: Tentar construir Casa da Guarda sem possuir Guarita ou porte adequado (Deve falhar)...");
// Note que a base atual é Modesta (o que viola o porte Formidável exigido para a Casa da Guarda) e não possui Guarita.
actions.addRoom(baseMinId, "Casa da Guarda", "roll", 25);
updatedBase = mockSavedState!.bases.find(b => b.id === baseMinId)!;
assert(updatedBase.rooms.length === 1, "Casa da Guarda não devia ter sido adicionada");
console.log("✅ Teste 7.1 passou.");

// Teste 7.2: Pré-requisitos de cômodos (Construir Guarita e depois Casa da Guarda com sucesso após upgrade de porte)
console.log("Teste 7.2: Upgrade de porte para Formidável, Construir Guarita (Sucesso) e depois Casa da Guarda (Sucesso)...");
// Upgrade para Formidável (via recompensa) para satisfazer o pré-requisito de porte de Casa da Guarda
actions.upgradeBase(baseMinId, "Formidavel", "reward");
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Adicionar Guarita (CD 29 pois Formidável tem 9 slots)
actions.addRoom(baseMinId, "Guarita", "roll", 30);
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

updatedBase = mockSavedState!.bases.find(b => b.id === baseMinId)!;
assert(updatedBase.rooms.length === 2, "Guarita devia ter sido adicionada");

// Adicionar Casa da Guarda (CD 29, possui Guarita e porte Formidável)
actions.addRoom(baseMinId, "Casa da Guarda", "roll", 30);
updatedBase = mockSavedState!.bases.find(b => b.id === baseMinId)!;
assert(updatedBase.rooms.length === 3, "Casa da Guarda devia ter sido adicionada");
assert(mockSavedState!.wallet.TS === 21500, "Devia cobrar T$ 1.000 por cada um (23.5k -> 21.5k)");
console.log("✅ Teste 7.2 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 8: Falha no pagamento de manutenção danificando cômodo
console.log("Teste 8: Pular manutenção danificando cômodo aleatório...");
// Formidável manutenção: T$ 1.000. Vamos passar skip = true
actions.payBaseMaintenance(baseMinId, "Regular", 1000, true);
const baseWithDamagedRoom = mockSavedState!.bases.find(b => b.id === baseMinId)!;
const damagedRoomCount = baseWithDamagedRoom.rooms.filter(r => r.isDamaged).length;
assert(damagedRoomCount === 1, "Exatamente um cômodo devia estar danificado");
console.log("✅ Teste 8 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 9: Reparar cômodo danificado (Custo = 50% de 1000 = T$ 500)
console.log("Teste 9: Reparar cômodo danificado cobrando 50% do custo original (T$ 500)...");
const damagedRoom = mockSavedState!.bases[0].rooms.find(r => r.isDamaged)!;
actions.repairRoom(baseMinId, damagedRoom.id, true);
assert(mockSavedState!.wallet.TS === 21000, "Devia cobrar T$ 500 (21.5k -> 21k)");
const baseWithRepairedRoom = mockSavedState!.bases.find(b => b.id === baseMinId)!;
assert(baseWithRepairedRoom.rooms.find(r => r.id === damagedRoom.id)!.isDamaged === false, "O cômodo devia estar reparado");
console.log("✅ Teste 9 passou.");

// Atualizar estado
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);

// Teste 10: Limite e Compatibilidade de Mobílias
console.log("Teste 10: Limite e Compatibilidade de Mobílias...");
// 1. Tentar adicionar Banheira na Biblioteca (deve falhar - Banheira requer Suíte)
const bibliotecaRoom = mockSavedState!.bases[0].rooms.find(r => r.name === "Biblioteca")!;
actions.addFurniture(baseMinId, bibliotecaRoom.id, "Banheira", 300, true);
assert(mockSavedState!.bases[0].rooms.find(r => r.name === "Biblioteca")!.furnitures.length === 0, "Banheira não devia entrar na Biblioteca");

// 2. Criar uma Suíte (porte Formidável preenche requisito Básica+)
actions.addRoom(baseMinId, "Suíte", "roll", 30);
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);
const suiteRoom = mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte")!;

// 3. Adicionar Banheira na Suíte (deve funcionar)
actions.addFurniture(baseMinId, suiteRoom.id, "Banheira", 300, true);
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);
const updatedSuite = mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte")!;
assert(updatedSuite.furnitures.length === 1, "Banheira devia ter sido instalada");
assert(updatedSuite.furnitures[0].name === "Banheira", "Nome incorreto");

// 4. Tentar adicionar Colchão de Penas Exóticas na mesma Suíte (deve falhar - limite de 1 mobília)
actions.addFurniture(baseMinId, suiteRoom.id, "Colchão de Penas Exóticas", 500, true);
assert(mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte")!.furnitures.length === 1, "Não devia permitir segunda mobília na Suíte");
console.log("✅ Teste 10 passou.");

// Teste 11: Mover Mobílias
console.log("Teste 11: Mover mobílias entre cômodos...");
const currentSuite = mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte")!;
const banheiraId = currentSuite.furnitures[0].id;

// 1. Mover Banheira para Biblioteca (deve falhar)
actions.moveFurniture(baseMinId, currentSuite.id, bibliotecaRoom.id, banheiraId);
assert(mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte")!.furnitures.length === 1, "Banheira não devia ter saído da Suíte");
assert(mockSavedState!.bases[0].rooms.find(r => r.name === "Biblioteca")!.furnitures.length === 0, "Banheira não devia ter entrado na Biblioteca");

// 2. Criar outra Suíte ("Suíte de Hóspedes")
actions.addRoom(baseMinId, "Suíte de Hóspedes", "roll", 30);
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);
const guestSuite = mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte de Hóspedes")!;

// 3. Mover Banheira da Suíte para a Suíte de Hóspedes (deve funcionar)
actions.moveFurniture(baseMinId, currentSuite.id, guestSuite.id, banheiraId);
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);
assert(mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte")!.furnitures.length === 0, "Banheira devia ter saído da primeira Suíte");
assert(mockSavedState!.bases[0].rooms.find(r => r.name === "Suíte de Hóspedes")!.furnitures.length === 1, "Banheira devia ter entrado na Suíte de Hóspedes");
console.log("✅ Teste 11 passou.");

// Teste 12: Gárgulas Animadas
console.log("Teste 12: Gárgulas Animadas (limites e segurança)...");
// 1. Comprar primeira Gárgula (porte Formidável permite 1 gárgula, custo T$ 10.000)
const walletBeforeGargoyle = mockSavedState!.wallet.TS;
actions.addGargula(baseMinId, true);
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);
assert(mockSavedState!.bases[0].gargulas === 1, "Gárgula devia ter sido adicionada");
assert(mockSavedState!.wallet.TS === walletBeforeGargoyle - 10000, "Custo de T$ 10.000 devia ter sido cobrado");

// 2. Tentar comprar segunda Gárgula (deve falhar - limite de 1 para Formidável)
actions.addGargula(baseMinId, true);
assert(mockSavedState!.bases[0].gargulas === 1, "Não devia permitir segunda gárgula");

// 3. Remover gárgula
actions.removeGargula(baseMinId);
deps.activeGuild = mockSavedState!;
actions = useBaseActions(deps);
assert(mockSavedState!.bases[0].gargulas === 0, "Gárgula devia ter sido removida");
console.log("✅ Teste 12 passou.");

console.log("=== TODOS OS TESTES UNITÁRIOS DE BASES E MOBÍLIAS PASSARAM COM SUCESSO ===");
