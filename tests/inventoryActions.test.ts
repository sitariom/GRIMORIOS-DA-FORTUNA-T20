import { useItemActions } from '../context/hooks/useItemActions';
import { GuildState, Item, LogCategory, LogEntry } from '../types';
import {
  BASE_CARRY,
  CARRY_PER_STR,
  MAX_OVERLOAD_MULTIPLIER,
  calcCarryLimit,
  calcMaxCarry,
  calcTotalCarryLimit,
  calcTotalMaxCarry
} from '../constants';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES UNITÁRIOS DE INVENTÁRIO E CARGA T20 ===");

let mockSavedState: GuildState | null = null;
let lastNotification: any = null;

const createInitialState = (): GuildState => ({
  id: 'test-guild-inventory',
  guildName: 'Arsenal dos Defensores de Arton',
  version: 1,
  wallet: { TC: 0, TS: 1000, TO: 0, LO: 0 },
  items: [
    {
      id: 'item-1',
      name: 'Espada Longa',
      type: 'Arma',
      rarity: 'Comum',
      quantity: 5,
      value: 15,
      space: 1,
      origin: 'Loja',
      encounter: 'Compra',
      isQuestItem: false,
      isNonNegotiable: false
    },
    {
      id: 'item-2',
      name: 'Armadura Completa',
      type: 'Equipamento',
      rarity: 'Comum',
      quantity: 2,
      value: 1000,
      space: 5,
      origin: 'Forja',
      encounter: 'Compra',
      isQuestItem: false,
      isNonNegotiable: false
    },
    {
      id: 'item-3',
      name: 'Gema Preciosa de Valkaria',
      type: 'Riqueza',
      rarity: 'Superior',
      quantity: 4,
      value: 50,
      space: 0.5,
      origin: 'Masmorra',
      encounter: 'Tesouro',
      isQuestItem: false,
      isNonNegotiable: false
    }
  ],
  bases: [],
  domains: [],
  npcs: [],
  logs: [],
  members: [
    {
      id: 'member-weak',
      name: 'Bardo Fraco',
      status: 'Ativo',
      strength: -1,
      wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
      inventory: []
    },
    {
      id: 'member-strong',
      name: 'Guerreiro Robusto',
      status: 'Ativo',
      strength: 4,
      wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
      inventory: []
    }
  ],
  calendar: { day: 1, month: 0, year: 1420, dayOfWeek: 0, isNimbDay: false },
  quests: [],
  conglomerates: [],
  pointsOfInterest: [],
  reputations: []
});

const triggerSave = (state: GuildState) => {
  mockSavedState = state;
};

const notify = (text: string, type?: 'success' | 'error' | 'info') => {
  lastNotification = { text, type };
};

const internalAddLog = (
  guild: GuildState,
  category: LogCategory,
  details: string,
  value: number,
  memberId: string
): LogEntry[] => {
  const newEntry: LogEntry = {
    id: `log-${Date.now()}-${Math.random()}`,
    date: new Date().toISOString(),
    category,
    details,
    value,
    memberId,
    memberName: 'Tester'
  };
  return [newEntry, ...guild.logs];
};

// 1. Verificação das Fórmulas Canônicas de Carga T20
console.log("Teste 1: Cálculo canônico de capacidade de carga e sobrecarga...");
assert(BASE_CARRY === 10, "BASE_CARRY deve ser 10 espaços");
assert(CARRY_PER_STR === 2, "CARRY_PER_STR deve ser 2 espaços por ponto de Força");
assert(MAX_OVERLOAD_MULTIPLIER === 2, "MAX_OVERLOAD_MULTIPLIER deve ser 2");

// Força 0 -> 10 base, 20 max
assert(calcCarryLimit(0) === 10, "Força 0 deve ter limite 10");
assert(calcMaxCarry(0) === 20, "Força 0 deve ter limite max 20");

// Força -1 -> 8 base, 16 max
assert(calcCarryLimit(-1) === 8, "Força -1 deve ter limite 8");
assert(calcMaxCarry(-1) === 16, "Força -1 deve ter limite max 16");

// Força +4 -> 18 base, 36 max
assert(calcCarryLimit(4) === 18, "Força +4 deve ter limite 18");
assert(calcMaxCarry(4) === 36, "Força +4 deve ter limite max 36");

// Bônus de item (ex: Mochila de Carga +2)
const backpack: Item = {
  id: 'item-backpack',
  name: 'Mochila de Carga',
  type: 'Equipamento',
  rarity: 'Comum',
  quantity: 1,
  value: 50,
  space: 0,
  carryBonus: 2,
  origin: 'Loja',
  encounter: 'Compra',
  isQuestItem: false,
  isNonNegotiable: false
};
assert(calcTotalCarryLimit(4, [backpack]) === 20, "Força 4 + Mochila (+2) deve ter limite 20");
assert(calcTotalMaxCarry(4, [backpack]) === 40, "Força 4 + Mochila (+2) deve ter limite max 40");
console.log("✅ Teste 1 passou: Fórmulas de carga validadas.");

// 2. Registro e Incremento de Item
console.log("Teste 2: Adição de item e empilhamento automático...");
let state = createInitialState();
let actions = useItemActions({ activeGuild: state, triggerSave, notify, internalAddLog });
actions.addItem({
  name: 'Espada Longa',
  type: 'Arma',
  rarity: 'Comum',
  quantity: 3,
  value: 15,
  space: 1,
  origin: 'Loja',
  encounter: 'Compra',
  isQuestItem: false,
  isNonNegotiable: false
});

assert(mockSavedState!.items.find(i => i.name === 'Espada Longa')!.quantity === 8, "Espadas longas devem totalizar 8");
console.log("✅ Teste 2 passou: Item empilhado com sucesso.");

// 3. Venda Individual com 50% de valor
console.log("Teste 3: Venda individual a 50% do valor...");
state = mockSavedState!;
actions = useItemActions({ activeGuild: state, triggerSave, notify, internalAddLog });
// Vende 2 Espadas Longas (valor 15 cada = 30 T$, 50% = 15 T$)
actions.sellItem('item-1', 2, 'member-strong', 50);

assert(mockSavedState!.wallet.TS === 1015, `Saldo esperado em T$: 1015, obtido: ${mockSavedState!.wallet.TS}`);
assert(mockSavedState!.items.find(i => i.id === 'item-1')!.quantity === 6, "Devem restar 6 espadas");
console.log("✅ Teste 3 passou: Venda individual calculada e creditada.");

// 4. Venda em Lote (Bulk Liquidation)
console.log("Teste 4: Venda em lote com liquidação completa...");
state = mockSavedState!;
actions = useItemActions({ activeGuild: state, triggerSave, notify, internalAddLog });
// Vende todo o lote das Armaduras (2x 1000 = 2000 T$ a 50% = 1000 T$) e Gemas (4x 50 = 200 T$ a 100% = 200 T$)
// Vamos liquidar item-2 e item-3 a 50%
// item-2: 2x 1000 * 0.5 = 1000 T$
// item-3: 4x 50 * 0.5 = 100 T$
// Total: 1100 T$
actions.sellBatchItems(['item-2', 'item-3'], 'member-strong', 50);

assert(mockSavedState!.wallet.TS === 1015 + 1100, `Saldo esperado: 2115, obtido: ${mockSavedState!.wallet.TS}`);
assert(!mockSavedState!.items.some(i => i.id === 'item-2'), "Armaduras vendidas devem ser removidas");
assert(!mockSavedState!.items.some(i => i.id === 'item-3'), "Gemas vendidas devem ser removidas");
console.log("✅ Teste 4 passou: Venda em lote liquidada e estoque removido.");

// 5. Retirada de Item por Membro e Bloqueio de Sobrecarga
console.log("Teste 5: Retirada de item e bloqueio por sobrecarga extrema...");
state = createInitialState();
// Adiciona armaduras pesadas no estoque (5 espaços cada)
state.items = [
  {
    id: 'heavy-plate',
    name: 'Armadura de Batalha Pesada',
    type: 'Equipamento',
    rarity: 'Comum',
    quantity: 10,
    value: 500,
    space: 5,
    origin: 'Forja',
    encounter: 'Compra',
    isQuestItem: false,
    isNonNegotiable: false
  }
];

actions = useItemActions({ activeGuild: state, triggerSave, notify, internalAddLog });
// Bardo fraco tem Força -1 -> Limite Base 8, Máximo Absoluto 16
// Tentar retirar 4 armaduras = 4 * 5 = 20 espaços (> 16 maxLoad) -> Deve bloquear!
actions.withdrawItem('heavy-plate', 'member-weak', 'Equipamento', 4);
assert(lastNotification !== null && lastNotification.type === 'error', "Retirada que excede sobrecarga máxima deve ser rejeitada");

// Agora retira 2 armaduras = 10 espaços (<= 16 maxLoad) -> Deve aceitar!
actions.withdrawItem('heavy-plate', 'member-weak', 'Equipamento', 2);
const weakMember = mockSavedState!.members.find(m => m.id === 'member-weak')!;
assert(weakMember.inventory.length === 1, "Membro deve ter recebido as 2 armaduras");
assert(weakMember.inventory[0].quantity === 2, "Quantidade no inventário do membro deve ser 2");
assert(mockSavedState!.items.find(i => i.id === 'heavy-plate')!.quantity === 8, "Arsenal deve ter decrementado para 8 armaduras");
console.log("✅ Teste 5 passou: Regras de sobrecarga e retirada validadas com sucesso.");

console.log("=== TODOS OS TESTES UNITÁRIOS DE INVENTÁRIO PASSARAM COM SUCESSO! ===");
