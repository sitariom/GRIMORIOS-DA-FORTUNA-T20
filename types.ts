
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

export type ItemCategory = 'Arma' | 'ArmaduraEscudo' | 'Consumivel' | 'ItemGeral' | 'ItemMagico' | 'Tesouro' | 'RecursoNatural';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  quantity: number;
  space: number; // 0 | 0.5 | 1 | 2 | 5 | 10 — espaços que ocupa na mochila
  value: number;
  origin: string;
  encounter: string;
  isQuestItem: boolean;
  isNonNegotiable: boolean;
  carryBonus?: number; // Espaços extras de carga que este item concede (ex: Mochila de Carga)
  category?: ItemCategory;
  subcategory?: string;
  improvements?: string[];
  specialMaterial?: string;
}

export type BasePorte = 'Minima' | 'Modesta' | 'Basica' | 'Formidavel' | 'Grandiosa' | 'Suprema';
export type BaseType = 'CentroDePoder' | 'Empreendimento' | 'Esconderijo' | 'Fortificacao' | 'Movel' | 'Residencia' | 'Negocio';

export type NPCLocationType = 'Base' | 'Dominio' | 'Construcao' | 'Grupo' | 'Membro' | 'Livre';
export type NPCRelationship = 'Contratado' | 'Aliado' | 'Parceiro' | 'Recrutado';

export interface NPC {
  id: string;
  name: string;
  role: string;
  monthlyCost: number;
  locationType: NPCLocationType;
  locationId?: string; // ID da base, domínio, construção, membro ou livre
  locationName: string; // Nome descritivo para exibição
  relationship?: NPCRelationship;
  tier?: 'Iniciante' | 'Veterano' | 'Mestre' | 'N/A';
  allyType?: 'Adepto' | 'Ajudante' | 'Assassino' | 'Perseguidor' | 'Vigilante' | 'Atirador' | 'Combatente' | 'Destruidor' | 'Fortão' | 'Guardião' | 'Magivocador' | 'Médico' | 'Familiar' | 'Familiar Especial' | 'Montaria' | 'Montaria Especial' | 'Parceiro Especial' | 'N/A';
  bonusDescription?: string;
  status?: MemberStatus;
  associatedMemberId?: string;
  likes?: string;
  dislikes?: string;
  affinityByMember?: Record<string, number>;
  ultimateQuestDone?: Record<string, boolean>;
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
  cost?: number;
  isDamaged?: boolean;
}

export interface BusinessAsset {
  name: string;
  description: string;
  benefit: string;
  requires?: string[];
  levelReq?: number;
  cost: number;
}

export interface Base {
  id: string;
  name: string;
  porte: BasePorte;
  type: BaseType;
  rooms: Room[]; 
  history: string[];
  security?: number;
  gargulas?: number;
  businessLevel?: number;
  businessAssetNames?: string[];
  lastIncomeDay?: number;
}

export type CourtType = 'Inexistente' | 'Pobre' | 'Comum' | 'Rica';
export type PopularityType = 'Odiado' | 'Impopular' | 'Tolerado' | 'Popular' | 'Adorado';

export interface DomainUnit {
  id: string;
  name: string;
  type: string;
  power: number;
  costLO: number;
  maintenance: number;
  defense: number;
  damage: string;
  speed: number;
  requires: string;
}

export interface DomainBuilding {
  id: string;
  name: string;
  description: string;
  costLO: number;
  benefit: string;
  fortificationBonus: number;
  requires: string[];
  skill: string;
  income: string;
}

export type AdvisorRole = 'Bispo' | 'Capitão da Guarda' | 'Embaixador' | 'Espião' | 'Falcoeiro' | 'Magistrado' | 'Mago da Corte' | 'Menestrel' | 'Senescal';

export interface DomainAdvisor {
  id: string;
  name: string;
  role: AdvisorRole;
  skill: string;
  associatedId?: string;
  associatedType?: 'Member' | 'NPC';
}

export type TaskStatus = 'Pendente' | 'Em Progresso' | 'Concluido' | 'Cancelado';

export interface DomainPendingTask {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  progress: number;
  history?: { date: string; details: string }[];
}

export interface DomainTransaction {
  id: string;
  date: string;
  type: 'Entrada' | 'Saída';
  amount: number;
  reason: string;
}

export interface Domain {
  id: string;
  name: string;
  regent: string;
  level: number;
  terrain: string;
  isMystic?: boolean; // Domínios Místicos (Regra T20 p. 325)
  coexistingDomainId?: string; // ID do domínio civil coexistente (para cálculo de potencial místico)
  court: CourtType;
  treasury: number;
  popularity: PopularityType | 'N/A'; // Místicos não têm popularidade
  fortification: number;
  buildings: DomainBuilding[]; 
  units: DomainUnit[];
  advisors: DomainAdvisor[];
  pendingTasks?: DomainPendingTask[];
  cashFlow?: DomainTransaction[];
  revolt: boolean;
  actionsRemaining?: number;
  actionModifier?: number;    // Modificador de ação adicional manual (+/-)
  maintenanceMod?: number;    // Custo de manutenção adicional (LO extras por turno)
  magicPowerLevel?: number;   // Nível de poder mágico (apenas domínios místicos)
  hasWaterAccess?: boolean;         // Rio ou mar (+1 ao Nível Máximo)
  hasMysticElement?: boolean;       // Elemento místico (+1 ao Potencial Mágico)
  isNatureBoundRace?: boolean;      // Raça ligada à natureza (Elfo, Sílfide, Dahllan...)
  isSubterraneanBoundRace?: boolean;// Raça ligada ao subterrâneo (Anão, Trog, Medusa...)
  tempCaosPenalty?: boolean;        // Caos temporário no governo (-5 em ações de domínio no turno)
  conglomerateId?: string;           // ID do conglomerado/aliança/império a que pertence
  conglomerateAffinity?: import('./types').ConglomerateAffinity; // Nível de controle/afinidade com o conglomerado
  formerConglomerateIds?: string[];  // IDs de conglomerados dos quais já fez parte
}

export type DomainActionType = 'govern' | 'increaseCourt' | 'decreaseCourt' | 'festival' | 'extort' | 'conscript' | 'recruit' | 'build' | 'taxLow' | 'taxMedium' | 'taxHigh' | 'convert' | 'caravan';

export interface ActionResult {
  success: boolean;
  message: string;
  details?: string[];
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
  strength: number; // Atributo Força (base para limite de carga)
  wallet: Wallet; // Carteira individual do aventureiro
  inventory: Item[]; // Inventário individual
  divinePoints?: number; // Pontos divinos / de ação
  activeAffinityNpcId?: string; // ID do NPC de afinidade ativa
}

export interface CalendarState {
  day: number;
  month: number; // 0-11 index based on ARTON_MONTHS
  year: number;
  dayOfWeek: number; // 0-6 index based on ARTON_WEEKDAYS
  isNimbDay?: boolean;
}

export type ConglomerateType = 'Alianca' | 'Imperio';

export type ConglomerateRole = 'Capital' | 'Baluarte' | 'Valete' | 'Nenhum';
export type ConglomerateAffinity = 'Subjugado' | 'Vassalo' | 'Integrado' | 'Aliado';

export interface Conglomerate {
  id: string;
  name: string;
  type: ConglomerateType;
  capitalDomainId: string;        // Domínio de maior nível (o Estandarte)
  memberDomainIds: string[];      // Todos os IDs dos domínios membros
  subjugatedIds: string[];        // Domínios anexados à força
  formationDate: string;          // Data (turno) de formação
  domainRoles?: Record<string, ConglomerateRole>; // Papel tático de cada domínio membro
  active: boolean;                // Se está operacional (inativo = arquivado)
  formerMemberDomainIds: string[];// Domínios que já foram membros e saíram
}

export type QuestStatus = 'Disponivel' | 'Em Andamento' | 'Concluida' | 'Falha';

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  rewardGold: number;
  rewardCurrency: CurrencyType; // Nova propriedade
  rewardXP: string;
  assignedMemberIds: string[];
}

export type PointOfInterestType = 'Ordem/Facção' | 'Organização' | 'NPC' | 'Estabelecimento' | 'Outro';

export interface ReputationTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  description: string;    // benefits / penalties
  colorStyle: string;     // e.g. text-emerald-500
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: PointOfInterestType;
  description: string;
  tiers?: ReputationTier[]; 
}

export type ReputationTargetType = 'Grupo' | 'Membro';

export interface ReputationEntry {
  id: string;
  pointOfInterestId: string;
  targetType: ReputationTargetType;
  targetId: string; // 'guild' or member.id
  value: number; 
}

export interface GuildState {
  id: string;
  guildName: string;
  version: number; // Controle de Concorrência
  wallet: Wallet;
  items: Item[];
  bases: Base[];
  domains: Domain[];
  conglomerates: Conglomerate[];
  npcs: NPC[];
  logs: LogEntry[];
  members: Member[];
  calendar: CalendarState;
  quests: Quest[];
  pointsOfInterest: PointOfInterest[];
  reputations: ReputationEntry[];
}

export interface MultiGuildState {
  activeGuildId: string;
  guilds: GuildState[];
}
