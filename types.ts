
export type CurrencyType = 'TC' | 'TS' | 'TO' | 'LO';
export type DomainCurrency = 'LO';

export interface Wallet {
  TC: number; 
  TS: number; 
  TO: number; 
  LO: number;
}

export type ItemType = 'Consumivel' | 'Equipamento' | 'Tesouro' | 'Arma' | 'Riqueza';
export type ItemRarity = 'Comum' | 'Superior' | 'Magico' | 'Liturgico' | 'Artefato';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  quantity: number;
  value: number;
  origin: string;
  encounter: string;
  isQuestItem: boolean;
  isNonNegotiable: boolean;
}

export type BasePorte = 'Minima' | 'Modesta' | 'Basica' | 'Formidavel' | 'Grandiosa' | 'Suprema';
export type BaseType = 'CentroDePoder' | 'Empreendimento' | 'Esconderijo' | 'Fortificacao' | 'Movel' | 'Residencia';

export type NPCLocationType = 'Base' | 'Dominio' | 'Construcao' | 'Grupo';
export type NPCRelationship = 'Contratado' | 'Aliado' | 'Parceiro' | 'Recrutado';

export interface NPC {
  id: string;
  name: string;
  role: string;
  monthlyCost: number;
  locationType: NPCLocationType;
  locationId?: string; // ID da base, domínio ou construção
  locationName: string; // Nome descritivo para exibição
  relationship?: NPCRelationship;
}

export interface Furniture {
  id: string;
  name: string;
  description?: string;
  cost?: number;
}

export interface Room {
  id: string;
  name: string;
  furnitures: Furniture[];
}

export interface Base {
  id: string;
  name: string;
  porte: BasePorte;
  type: BaseType;
  rooms: Room[]; 
  history: string[];
}

export type CourtType = 'Inexistente' | 'Pobre' | 'Comum' | 'Rica';
export type PopularityType = 'Odiado' | 'Impopular' | 'Tolerado' | 'Popular' | 'Adorado';

export interface DomainUnit {
  id: string;
  name: string;
  type: string;
  power: number;
  costLO: number;
}

export interface DomainBuilding {
  id: string;
  name: string;
  description: string;
  costLO: number;
  benefit: string;
}

export interface Domain {
  id: string;
  name: string;
  regent: string;
  level: number;
  terrain: string;
  court: CourtType;
  treasury: number;
  popularity: PopularityType;
  fortification: number;
  buildings: DomainBuilding[]; 
  units: DomainUnit[];
}

export interface GovernResult {
  income: number;
  maintenance: number;
  net: number;
  success: boolean;
  popularityChange: number;
  details: string[];
}

export type LogCategory = 'Venda' | 'Compra' | 'Saque' | 'Deposito' | 'Investimento' | 'Manutencao' | 'Conversao' | 'Sistema' | 'Base' | 'Dominio' | 'Estoque' | 'NPC' | 'Quest' | 'Calendario' | 'Membro';

export interface LogEntry {
  id: string;
  date: string;
  category: LogCategory;
  details: string;
  value: number;
  memberId: string;
  memberName: string;
}

export type MemberStatus = 'Ativo' | 'Inativo' | 'Morto' | 'Ferido' | 'Em Missao' | 'Viajando';

export interface Member {
  id: string;
  name: string;
  status: MemberStatus;
  wallet: Wallet; // Carteira individual do aventureiro
  inventory: Item[]; // Inventário individual
}

export interface CalendarState {
  day: number;
  month: number; // 0-11 index based on ARTON_MONTHS
  year: number;
  dayOfWeek: number; // 0-6 index based on ARTON_WEEKDAYS
}

export type QuestStatus = 'Disponivel' | 'Em Andamento' | 'Concluida' | 'Falha';

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  rewardGold: number; // Valor em TS
  rewardXP: string;
  assignedMemberIds: string[];
}

export interface GuildState {
  id: string;
  guildName: string;
  wallet: Wallet;
  items: Item[];
  bases: Base[];
  domains: Domain[];
  npcs: NPC[];
  logs: LogEntry[];
  members: Member[];
  calendar: CalendarState;
  quests: Quest[];
}

export interface MultiGuildState {
  activeGuildId: string;
  guilds: GuildState[];
}
