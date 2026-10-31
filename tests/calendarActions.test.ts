import { useCalendarActions } from '../context/hooks/useCalendarActions';
import { GuildState } from '../types';
import { ARTON_MONTHS, ARTON_WEEKDAYS } from '../constants';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== INICIANDO TESTES UNITÁRIOS DO CALENDÁRIO ARTONIANO ===");

let mockSavedState: GuildState | null = null;

const createInitialState = (): GuildState => ({
  id: 'test-guild-calendar',
  guildName: 'Guilda dos Cronistas de Tanna-Toh',
  version: 1,
  wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
  items: [],
  bases: [],
  domains: [],
  npcs: [],
  logs: [],
  members: [],
  calendar: { day: 1, month: 0, year: 1420, dayOfWeek: 0, isNimbDay: false },
  quests: [],
  conglomerates: [],
  pointsOfInterest: [],
  reputations: []
});

const triggerSave = (state: GuildState) => {
  mockSavedState = state;
};

// 1. Verificação das Constantes Canônicas de Arton
console.log("Teste 1: Constantes de meses e dias da semana artonianos...");
assert(ARTON_MONTHS.length === 12, "Arton deve ter exatamente 12 meses");
assert(ARTON_WEEKDAYS.length === 7, "A semana artoniana deve ter 7 dias");
assert(ARTON_MONTHS[0] === 'Caravana', "Primeiro mês deve ser Caravana");
assert(ARTON_MONTHS[11] === 'Pyra', "Último mês deve ser Pyra");
console.log("✅ Teste 1 passou: Constantes do calendário validadas.");

// 2. Avanço de 1 dia com rotação do dia da semana
console.log("Teste 2: Avanço de 1 dia com rotação do dia da semana...");
let state = createInitialState();
let actions = useCalendarActions({ activeGuild: state, triggerSave });
actions.advanceDate(1);

assert(mockSavedState!.calendar.day === 2, `Dia esperado: 2, obtido: ${mockSavedState!.calendar.day}`);
assert(mockSavedState!.calendar.dayOfWeek === 1, `Dia da semana esperado: 1 (${ARTON_WEEKDAYS[1]}), obtido: ${mockSavedState!.calendar.dayOfWeek}`);
assert(mockSavedState!.calendar.month === 0, `Mês deve continuar 0 (${ARTON_MONTHS[0]})`);
assert(mockSavedState!.calendar.year === 1420, `Ano deve continuar 1420`);
console.log("✅ Teste 2 passou: Avanço de 1 dia computado com sucesso.");

// 3. Virada de mês (dia 30 -> dia 1 do próximo mês)
console.log("Teste 3: Avanço de 30 dias com virada de mês canônico...");
// Posiciona no dia 25 do mês 0 e avança 10 dias -> dia 5 do mês 1
state = { ...createInitialState(), calendar: { day: 25, month: 0, year: 1420, dayOfWeek: 3, isNimbDay: false } };
actions = useCalendarActions({ activeGuild: state, triggerSave });
actions.advanceDate(10);

assert(mockSavedState!.calendar.day === 5, `Dia esperado: 5, obtido: ${mockSavedState!.calendar.day}`);
assert(mockSavedState!.calendar.month === 1, `Mês esperado: 1 (${ARTON_MONTHS[1]}), obtido: ${mockSavedState!.calendar.month}`);
assert(mockSavedState!.calendar.year === 1420, `Ano esperado: 1420, obtido: ${mockSavedState!.calendar.year}`);
assert(mockSavedState!.calendar.dayOfWeek === (3 + 10) % 7, "Dia da semana deve ciclar módulo 7");
console.log("✅ Teste 3 passou: Virada de mês computada.");

// 4. Virada de ano após o 12º mês (mês 11 -> mês 0 do ano seguinte)
console.log("Teste 4: Virada de ano após o mês 11 (Pyra -> Caravana)...");
// Posiciona no dia 28 do mês 11 (Pyra) do ano 1420 e avança 5 dias
state = { ...createInitialState(), calendar: { day: 28, month: 11, year: 1420, dayOfWeek: 0, isNimbDay: false } };
actions = useCalendarActions({ activeGuild: state, triggerSave });
actions.advanceDate(5);

// 28 + 5 = 33 -> 33 - 30 = 3; month 11 + 1 = 12 (> 11 -> month 0, year 1421)
assert(mockSavedState!.calendar.day === 3, `Dia esperado: 3, obtido: ${mockSavedState!.calendar.day}`);
assert(mockSavedState!.calendar.month === 0, `Mês esperado: 0 (${ARTON_MONTHS[0]}), obtido: ${mockSavedState!.calendar.month}`);
assert(mockSavedState!.calendar.year === 1421, `Ano esperado: 1421, obtido: ${mockSavedState!.calendar.year}`);
console.log("✅ Teste 4 passou: Virada de ano completada com sucesso.");

// 5. Retrocesso de dias com ajuste reverso de mês e ano
console.log("Teste 5: Retrocesso temporal (dias negativos)...");
// Posiciona no dia 2 do mês 0 do ano 1421 e retrocede 5 dias
state = { ...createInitialState(), calendar: { day: 2, month: 0, year: 1421, dayOfWeek: 2, isNimbDay: false } };
actions = useCalendarActions({ activeGuild: state, triggerSave });
actions.advanceDate(-5);

// 2 - 5 = -3 -> -3 + 30 = 27; month 0 - 1 = -1 -> month 11, year 1420
assert(mockSavedState!.calendar.day === 27, `Dia esperado: 27, obtido: ${mockSavedState!.calendar.day}`);
assert(mockSavedState!.calendar.month === 11, `Mês esperado: 11 (${ARTON_MONTHS[11]}), obtido: ${mockSavedState!.calendar.month}`);
assert(mockSavedState!.calendar.year === 1420, `Ano esperado: 1420, obtido: ${mockSavedState!.calendar.year}`);
console.log("✅ Teste 5 passou: Retrocesso temporal preserva ciclo de 360 dias.");

// 6. Definição direta da data do jogo (setGameDate)
console.log("Teste 6: Definição direta de data (setGameDate)...");
state = createInitialState();
actions = useCalendarActions({ activeGuild: state, triggerSave });
actions.setGameDate(15, 6, 1425);

assert(mockSavedState!.calendar.day === 15, "Dia deve ser 15");
assert(mockSavedState!.calendar.month === 6, "Mês deve ser 6");
assert(mockSavedState!.calendar.year === 1425, "Ano deve ser 1425");
console.log("✅ Teste 6 passou: setGameDate configurado com sucesso.");

// 7. Ativação e persistência do Dia de Nimb
console.log("Teste 7: Comutação do estado místico do Dia de Nimb...");
state = createInitialState();
actions = useCalendarActions({ activeGuild: state, triggerSave });
actions.toggleNimbDay(true);

assert(mockSavedState!.calendar.isNimbDay === true, "isNimbDay deve ser true");

state = mockSavedState!;
actions = useCalendarActions({ activeGuild: state, triggerSave });
actions.toggleNimbDay(false);

assert(mockSavedState!.calendar.isNimbDay === false, "isNimbDay deve ser false");
console.log("✅ Teste 7 passou: Comutação do Dia de Nimb funcional.");

console.log("=== TODOS OS TESTES UNITÁRIOS DO CALENDÁRIO PASSARAM COM SUCESSO! ===");
