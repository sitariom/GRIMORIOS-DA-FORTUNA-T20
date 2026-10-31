import { useFinancialActions } from '../context/hooks/useFinancialActions';
import { GuildState, LogCategory, LogEntry, CurrencyType } from '../types';
import { RATES } from '../constants';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES UNITÁRIOS DE FINANÇAS E CÂMBIO T20 ===");

let mockSavedState: GuildState | null = null;
let lastNotification: any = null;

const createInitialState = (): GuildState => ({
  id: 'test-guild-finances',
  guildName: 'Guilda dos Banqueiros de Valkaria',
  version: 1,
  wallet: { TC: 100, TS: 50, TO: 20, LO: 2 },
  items: [],
  bases: [],
  domains: [],
  npcs: [],
  logs: [],
  members: [
    {
      id: 'member-1',
      name: 'Tibor',
      status: 'Ativo',
      strength: 0,
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
    memberName: 'Tibor'
  };
  return [newEntry, ...guild.logs];
};

// 1. Depósito com saldo positivo
console.log("Teste 1: Depósito de moedas na tesouraria...");
let state = createInitialState();
let actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
actions.deposit('member-1', 15, 'TO', 'Recompensa de missão');

assert(mockSavedState !== null, "triggerSave deve ter sido chamado no depósito");
assert(mockSavedState!.wallet.TO === 35, `Saldo esperado de TO: 35, obtido: ${mockSavedState!.wallet.TO}`);
assert(mockSavedState!.logs.length === 1, "Log de depósito deve ser gravado");
assert(mockSavedState!.logs[0].category === 'Deposito', "Categoria do log deve ser Deposito");
assert(mockSavedState!.logs[0].value === 150, `Valor em T$ esperado no log: 150, obtido: ${mockSavedState!.logs[0].value}`);
console.log("✅ Teste 1 passou: Depósito e log gerados com sucesso.");

// 2. Saque com saldo positivo
console.log("Teste 2: Saque com saldo suficiente...");
state = mockSavedState!;
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
actions.withdraw('member-1', 10, 'TO', 'Compra de provisões');

assert(mockSavedState!.wallet.TO === 25, `Saldo esperado de TO: 25, obtido: ${mockSavedState!.wallet.TO}`);
assert(mockSavedState!.logs.length === 2, "Log de saque deve ser acumulado");
assert(mockSavedState!.logs[0].category === 'Saque', "Categoria do log deve ser Saque");
assert(mockSavedState!.logs[0].value === -100, `Valor negativo em T$ esperado no log: -100, obtido: ${mockSavedState!.logs[0].value}`);
console.log("✅ Teste 2 passou: Saque com sucesso.");

// 3. Bloqueio de saque sem saldo suficiente
console.log("Teste 3: Bloqueio de saque quando o saldo é insuficiente...");
state = mockSavedState!;
const previousWallet = { ...state.wallet };
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
actions.withdraw('member-1', 1000, 'TO', 'Tentativa de saque abusivo');

assert(mockSavedState!.wallet.TO === previousWallet.TO, "Saldo de TO não deve mudar após saque rejeitado");
assert(lastNotification !== null && lastNotification.type === 'error', "Notificação de erro deve ser disparada");
console.log("✅ Teste 3 passou: Saque indevido bloqueado.");

// 4. Paridade de Câmbio T20 (1 TO -> 10 TS)
console.log("Teste 4: Câmbio canônico 1 TO -> 10 TS...");
state = createInitialState();
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
actions.convertWallet(1, 'TO', 'TS');

assert(mockSavedState!.wallet.TO === 19, `TO esperado: 19, obtido: ${mockSavedState!.wallet.TO}`);
assert(mockSavedState!.wallet.TS === 60, `TS esperado: 60, obtido: ${mockSavedState!.wallet.TS}`);
assert(mockSavedState!.logs[0].category === 'Conversao', "Log de conversão registrado");
console.log("✅ Teste 4 passou: 1 TO convertido em 10 TS.");

// 5. Paridade de Câmbio T20 (1 TO -> 100 TC)
console.log("Teste 5: Câmbio canônico 1 TO -> 100 TC...");
state = mockSavedState!;
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
actions.convertWallet(1, 'TO', 'TC');

assert(mockSavedState!.wallet.TO === 18, `TO esperado: 18, obtido: ${mockSavedState!.wallet.TO}`);
assert(mockSavedState!.wallet.TC === 200, `TC esperado: 200, obtido: ${mockSavedState!.wallet.TC}`);
console.log("✅ Teste 5 passou: 1 TO convertido em 100 TC.");

// 6. Câmbio de Moedas Menores para Maiores (1000 TS -> 1 LO)
console.log("Teste 6: Câmbio de moeda menor para maior (1.000 TS -> 1 LO)...");
state = { ...createInitialState(), wallet: { TC: 0, TS: 1500, TO: 0, LO: 0 } };
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
actions.convertWallet(1000, 'TS', 'LO');

assert(mockSavedState!.wallet.TS === 500, `TS esperado: 500, obtido: ${mockSavedState!.wallet.TS}`);
assert(mockSavedState!.wallet.LO === 1, `LO esperado: 1, obtido: ${mockSavedState!.wallet.LO}`);
console.log("✅ Teste 6 passou: 1.000 TS convertidos para 1 LO.");

// 7. Reversão Cambial sem perda de valor
console.log("Teste 7: Reversão cambial bidirecional sem perda matemática...");
state = { ...createInitialState(), wallet: { TC: 0, TS: 0, TO: 10, LO: 0 } };
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
// Converte 10 TO para TS (esperado: 100 TS)
actions.convertWallet(10, 'TO', 'TS');
assert(mockSavedState!.wallet.TO === 0 && mockSavedState!.wallet.TS === 100, "10 TO devem virar 100 TS");

state = mockSavedState!;
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
// Converte 100 TS de volta para TO (esperado: 10 TO)
actions.convertWallet(100, 'TS', 'TO');
assert(mockSavedState!.wallet.TO === 10 && mockSavedState!.wallet.TS === 0, "100 TS devem retornar a exatamente 10 TO");
console.log("✅ Teste 7 passou: Reversão cambial exata sem resíduo.");

// 8. Quantidade insuficiente para gerar ao menos 1 unidade de moeda maior
console.log("Teste 8: Rejeição de câmbio com valor insuficiente para 1 unidade inteira destino...");
state = { ...createInitialState(), wallet: { TC: 5, TS: 0, TO: 0, LO: 0 } };
actions = useFinancialActions({ activeGuild: state, triggerSave, notify, internalAddLog });
// 5 TC não geram nem 1 TS (precisa de 10 TC)
actions.convertWallet(5, 'TC', 'TS');
assert(lastNotification !== null && lastNotification.type === 'error', "Deve notificar erro de quantidade insuficiente");
console.log("✅ Teste 8 passou: Câmbio fracionário inferior a 1 unidade bloqueado com sucesso.");

console.log("=== TODOS OS TESTES UNITÁRIOS DE FINANÇAS PASSARAM COM SUCESSO! ===");
