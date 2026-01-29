
import { BasePorte, BaseType, CourtType, PopularityType, ItemRarity } from "./types";

export const PORTE_DATA: Record<BasePorte, { cost: number; maintenance: number; slots: number; label: string }> = {
  Minima: { cost: 1000, maintenance: 100, slots: 0, label: 'Mínima (T$ 1k)' },
  Modesta: { cost: 3000, maintenance: 300, slots: 3, label: 'Modesta (T$ 3k)' },
  Basica: { cost: 6000, maintenance: 600, slots: 6, label: 'Básica (T$ 6k)' },
  Formidavel: { cost: 10000, maintenance: 1000, slots: 9, label: 'Formidável (T$ 10k)' },
  Grandiosa: { cost: 15000, maintenance: 1500, slots: 12, label: 'Grandiosa (T$ 15k)' },
  Suprema: { cost: 21000, maintenance: 2100, slots: 15, label: 'Suprema (T$ 21k)' },
};

export const TYPE_DATA: Record<BaseType, { label: string; bonus: string }> = {
  CentroDePoder: { label: 'Centro de Poder', bonus: '+1 PM' },
  Empreendimento: { label: 'Empreendimento', bonus: 'Gera renda em TO' },
  Esconderijo: { label: 'Esconderijo', bonus: '+1 Resistência' },
  Fortificacao: { label: 'Fortificação', bonus: '+5 Segurança, +1 Defesa' },
  Movel: { label: 'Móvel', bonus: '+1.5m deslocamento' },
  Residencia: { label: 'Residência', bonus: '+3 PV, Prato Especial' },
};

export const ITEM_TYPES = ['Consumivel', 'Equipamento', 'Tesouro', 'Arma', 'Riqueza'];

export const RARITY_CONFIG: Record<ItemRarity, { label: string, color: string, bg: string, border: string }> = {
  Comum: { label: 'Comum', color: 'text-fantasy-wood/80 dark:text-fantasy-parchment', bg: '', border: 'border-fantasy-wood/10 dark:border-white/20' },
  Superior: { label: 'Superior', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-900/5 dark:bg-emerald-400/5', border: 'border-emerald-700/20' },
  Magico: { label: 'Mágico', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-900/5 dark:bg-blue-400/5', border: 'border-blue-700/20' },
  Liturgico: { label: 'Litúrgico', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-900/5 dark:bg-amber-400/5', border: 'border-amber-700/20' },
  Artefato: { label: 'Artefato', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-900/5 dark:bg-purple-400/5', border: 'border-purple-700/20' },
};

export const RATES = {
  TC: 0.1,   
  TS: 1,     
  TO: 10,    
  LO: 1000   
};

export const POPULARITY_LEVELS: PopularityType[] = ['Odiado', 'Impopular', 'Tolerado', 'Popular', 'Adorado'];

export const COURT_DATA: Record<CourtType, { maintenance: number; bonus: string }> = {
  Inexistente: { maintenance: 0, bonus: '-2 em ações de domínio' },
  Pobre: { maintenance: 1, bonus: 'Sem modificadores' },
  Comum: { maintenance: 3, bonus: '+1 Conselheiro' },
  Rica: { maintenance: 5, bonus: '+3 Conselheiros, +1 Ação' },
};

export const TERRAIN_TYPES = ['Planície', 'Floresta', 'Montanha', 'Colina', 'Pântano', 'Deserto', 'Subterrâneo', 'Aquático'];

export const NPC_ROLES = [
  { role: 'Cozinheiro', cost: 50, bonus: 'Descanso melhora cura' },
  { role: 'Guarda', cost: 75, bonus: '+2 Segurança' },
  { role: 'Mestre de Armas', cost: 150, bonus: 'Treino de perícia combate' },
  { role: 'Escrivão', cost: 40, bonus: 'Organização de contratos' },
  { role: 'Estalajadeiro', cost: 60, bonus: 'Boatos e rumores' },
  { role: 'Espião', cost: 200, bonus: 'Informação privilegiada' },
];

export const CRISIS_EVENTS = [
  { name: 'Peste Negra', impact: 'popularity', value: -2, details: 'Uma doença assola as terras. O povo está desesperado.' },
  { name: 'Praga na Colheita', impact: 'treasury', value: -10, details: 'Gafanhotos destruíram as plantações. Prejuízo no tesouro real.' },
  { name: 'Invasão Orc', impact: 'fortification', value: -2, details: 'Um bando de orcs atacou as fronteiras. Danos nas defesas.' },
  { name: 'Colheita Farta', impact: 'treasury', value: 8, details: 'O sol brilhou e a terra deu frutos em abundância. Lucro!' },
  { name: 'Festival do Regente', impact: 'popularity', value: 1, details: 'Uma festa grandiosa aumentou seu prestígio.' },
  { name: 'Pilhagem de Ninho', impact: 'treasury', value: 15, details: 'Seus homens encontraram um covil abandonado com tesouros.' },
  { name: 'Incêndio na Cidade', impact: 'treasury', value: -5, details: 'Fogo no mercado central. O regente deve pagar o reparo.' },
  { name: 'Boas Novas', impact: 'popularity', value: 1, details: 'Rumores de sua sabedoria se espalharam.' },
];

export const DOMAIN_BUILDINGS_CATALOG = [
  { name: 'Estalagem', costLO: 2, benefit: '+1 Ação Padrão (1x por aventura)', description: 'Lugar de lendas e canções.' },
  { name: 'Estrada', costLO: 1, benefit: '+2 Iniciativa', description: 'Caminho que cruza o domínio.' },
  { name: 'Fazenda', costLO: 1, benefit: 'Gera 1d6-2 LO por turno', description: 'Campo arado para agricultura.' },
  { name: 'Feira', costLO: 2, benefit: 'Gera 1d4 LO por turno', description: 'Espaço de comércio semanal.' },
  { name: 'Forja', costLO: 3, benefit: '+1 Dano para tropas', description: 'Armas afiadas e prontas.' },
  { name: 'Forte', costLO: 5, benefit: '+2 Fortificação', description: 'Símbolo de poder e sede da corte.' },
  { name: 'Mina', costLO: 4, benefit: 'Gera 1d12 LO por turno', description: 'Extração de minérios valiosos.' },
  { name: 'Muralha', costLO: 8, benefit: '+5 Fortificação', description: 'Muro alto de blocos de pedra.' },
  { name: 'Oficina', costLO: 2, benefit: '+2 Ofício', description: 'Galpão repleto de ferramentas.' },
  { name: 'Palácio', costLO: 15, benefit: '+1 Limite de Parceiros', description: 'Ostentação do poder do regente.' },
  { name: 'Sala do Trono', costLO: 5, benefit: '+2 Diplomacia', description: 'Onde o regente recebe seus súditos.' },
  { name: 'Taverna', costLO: 2, benefit: 'Interrogar como ação livre', description: 'Lugar de música e fofocas.' },
  { name: 'Templo', costLO: 10, benefit: 'Um poder de Clérigo', description: 'Centro de devoção divina.' },
  { name: 'Torre de Vigia', costLO: 3, benefit: '+2 Percepção', description: 'Torre na fronteira para avistar invasores.' },
];

export const DOMAIN_UNITS_CATALOG = [
  { name: 'Milícia', type: 'Infantaria', power: 1, costLO: 1 },
  { name: 'Arqueiros', type: 'À Distância', power: 2, costLO: 2 },
  { name: 'Cavalaria', type: 'Montada', power: 4, costLO: 4 },
  { name: 'Guarda Real', type: 'Elite', power: 6, costLO: 6 },
  { name: 'Mercenários', type: 'Variado', power: 3, costLO: 3 },
];
