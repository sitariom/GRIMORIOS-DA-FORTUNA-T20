
import { BasePorte, BaseType, CourtType, PopularityType, ItemRarity, DomainBuilding, DomainUnit, BusinessAsset } from "./types";

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
  Negocio: { label: 'Negócio', bonus: 'T$ 100 × nível/mês' },
};

export const MAX_BUSINESS_LEVEL = 7;

export const BUSINESS_LEVELS: Record<number, { cost: number; cd: number }> = {
  1: { cost: 1000, cd: 20 },
  2: { cost: 2000, cd: 24 },
  3: { cost: 3000, cd: 26 },
  4: { cost: 4000, cd: 28 },
  5: { cost: 5000, cd: 30 },
  6: { cost: 6000, cd: 32 },
  7: { cost: 7000, cd: 34 },
};

export const BUSINESS_ASSETS: BusinessAsset[] = [
  { name: 'Academia', description: 'Escola de aventureiros que atrai pessoas extraordinárias.', benefit: 'Recebe um parceiro veterano humanoide (exceto montaria). Se morto, substituído na próxima visita.', requires: [], levelReq: 7, cost: 15000 },
  { name: 'Alfaiataria', description: 'Costureiros que confeccionam roupas elegantes com tecidos finos.', benefit: 'Pode se beneficiar de um item vestido adicional.', requires: ['Oficina'], levelReq: 1, cost: 2000 },
  { name: 'Alojamentos', description: 'Camas e instalações para descanso.', benefit: 'Transforma as condições de descanso no negócio em confortáveis.', requires: [], levelReq: 1, cost: 1000 },
  { name: 'Altar', description: 'Local de oração com símbolos religiosos.', benefit: 'Conjuradores divinos recebem +2 PM.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Arena', description: 'Espaço para lutas e treino com armas.', benefit: 'Recebe proficiência em uma arma marcial (ou exótica se já for proficiente).', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Bazar', description: 'Contatos com fornecedores e estrutura para vender mercadorias.', benefit: 'Ao comprar/vender itens mundanos, muda o preço em 10% a seu favor.', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Botica', description: 'Remédios, bálsamos e ervas medicinais.', benefit: '+1 em Fortitude.', requires: [], levelReq: 1, cost: 1000 },
  { name: 'Cassino', description: 'Jogos de azar e apostas.', benefit: '+1 em Jogatina. 1x/aventura, role 1d: par = TO 10×nível²; ímpar = perde metade.', requires: [], levelReq: 2, cost: 4000 },
  { name: 'Centro de Pesquisa', description: 'Local protegido para experimentos.', benefit: 'Quantidade de engenhocas que pode manter aumenta em +1.', requires: ['Oficina'], levelReq: 3, cost: 5000 },
  { name: 'Círculo de Poder', description: 'Padrões mágicos no chão que atraem energias místicas.', benefit: 'Conjuradores arcanos recebem +2 PM.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Clínica', description: 'Macas, bandagens e material para curar ferimentos.', benefit: '+3 PV.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Cocheira', description: 'Espaço para animais descansarem com tratadores.', benefit: 'Pode ter um parceiro montaria que não conta no limite de parceiros.', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Conservatório', description: 'Escola especializada em música.', benefit: 'Pode usar Atuação no lugar de Diplomacia.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Cozinha', description: 'Fornos, panelas e ingredientes de qualidade.', benefit: 'Bônus em perícias de alimentos que cozinha aumentam em +1.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Creche', description: 'Local seguro para deixar filhos e protegidos.', benefit: '1x/aventura, pode sofrer efeito nocivo no lugar de um aliado adjacente.', requires: [], levelReq: 1, cost: 1500 },
  { name: 'Dojo', description: 'Local de treinamento de artes marciais tamuranianas.', benefit: '+1 em testes de ataque com ataques desarmados ou armas naturais.', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Empório', description: 'Tudo que existe em Arton está à venda aqui.', benefit: 'Negócio rende 100 TO × nível/mês (ou teste × 10 × nível).', requires: ['Bazar'], levelReq: 3, cost: 5000 },
  { name: 'Escritório', description: 'Ábacos, pergaminhos e contabilidade.', benefit: 'Custo em T$ para aumentar nível do negócio é metade do normal.', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Espionagem Industrial', description: 'Agentes que espionam concorrentes.', benefit: 'Escolha um ativo que não possui (mas cumpre requisitos) — recebe seus benefícios. Pode trocar 1x/aventura.', requires: [], levelReq: 3, cost: 5000 },
  { name: 'Estagiários', description: 'Jovens aprendizes que trabalham por pouco.', benefit: 'Ao fabricar item não consumível, pode sofrer –5 no teste para fabricar dois itens da mesma categoria pagando ambos.', requires: ['Oficina'], levelReq: 2, cost: 2000 },
  { name: 'Estúdio', description: 'Espaço para gênios criativos.', benefit: 'CD do teste para aumentar nível do negócio diminui em –5.', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Fachada', description: 'Aparência respeitável para atividades ilegais.', benefit: '+1 em Furtividade. Pode conduzir atividades ilegais no negócio.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Forjaria', description: 'Fornalha, bigorna e equipamento para itens de qualidade.', benefit: '20% de desconto para comprar ou fabricar itens superiores.', requires: ['Oficina'], levelReq: 2, cost: 4000 },
  { name: 'Fortificação', description: 'Muralhas, portões de ferro e janelas gradeadas.', benefit: 'Se o negócio for atacado, defensores recebem +2 na Defesa e em testes de resistência.', requires: [], levelReq: 3, cost: 5000 },
  { name: 'Galeria de Arte', description: 'Obras de arte inovadoras.', benefit: 'Pode substituir testes de Atuação por testes de Enganação.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Ginásio', description: 'Máquinas de exercício e treino físico.', benefit: '+1 em rolagens de dano com ataques desarmados e armas naturais.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Guilda de Aventureiros', description: 'Salão onde heróis trocam histórias.', benefit: 'XP recebida aumenta em +10% (ou +2 PV e +2 PM por patamar se usar marcos).', requires: ['Salão Comunal'], levelReq: 5, cost: 10000 },
  { name: 'Integração', description: 'Programa de treinamento para novos contratados.', benefit: '+2 em testes de treinamento.', requires: [], levelReq: 3, cost: 3000 },
  { name: 'Jardim', description: 'Espaço coberto de flores e árvores.', benefit: 'Custo de Forma Selvagem diminui em –1 PM.', requires: [], levelReq: 1, cost: 1500 },
  { name: 'Laboratório Alquímico', description: 'Ampulhetas, balanças e ingredientes alquímicos.', benefit: 'Efeitos de preparados alquímicos aumentam em um dado (ex: fogo alquímico 2d6).', requires: ['Oficina'], levelReq: 3, cost: 5000 },
  { name: 'Laboratório Secreto', description: 'Covil para experimentos ilegais.', benefit: 'Recebe um poder da Tormenta (perde Carisma como normal).', requires: ['Fachada'], levelReq: 5, cost: 8000 },
  { name: 'Livraria', description: 'Prateleiras com livros, tomos e pergaminhos.', benefit: '+1 em Conhecimento.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Logística', description: 'Especialistas em armazenamento e transporte.', benefit: 'Limite de carga aumenta em 5 espaços.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Mercado Multinivelado', description: 'Sistema de revendedores e associados.', benefit: '1x/aventura, recrutar NPC com nome = nível × 100 T$. Aumenta com mais recrutas até máximo = nível.', requires: [], levelReq: 3, cost: 4000 },
  { name: 'Oficina', description: 'Bancadas, ferramentas e auxiliares.', benefit: '+1 em Ofício.', requires: [], levelReq: 1, cost: 1500 },
  { name: 'Ourivesaria', description: 'Joias, bijuterias e acessórios.', benefit: '1x/aventura, escolha um item para receber melhorias banhado a ouro ou cravejado de gemas (não conta no limite).', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Palco', description: 'Espaço para artistas se apresentarem.', benefit: 'Pode usar poderes de Música gastando ação de movimento (em vez de padrão).', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Pátio de Treinamento', description: 'Armas, alvos e espaço para golpear.', benefit: 'Escolha uma arma: +1 em testes de ataque com ela.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Plano de Carreira', description: 'Auxílio ao crescimento profissional dos funcionários.', benefit: '+2 em testes de buscas.', requires: [], levelReq: 3, cost: 3000 },
  { name: 'Propaganda', description: 'Arautos, cartazes e divulgação.', benefit: '+1 em Diplomacia ou Enganação.', requires: [], levelReq: 2, cost: 2000 },
  { name: 'Salão Comunal', description: 'Grande salão para beber e confraternizar.', benefit: 'Pode usar o poder Mestre dos Sussurros. Se já possui, soma nível do negócio nos testes do poder.', requires: [], levelReq: 2, cost: 3000 },
  { name: 'Salão de Baile', description: 'Espaço para festas e reuniões exclusivas.', benefit: '+1 em Nobreza.', requires: [], levelReq: 1, cost: 2000 },
  { name: 'Salão de Marah', description: 'Local dedicado à Deusa do Amor.', benefit: 'PM total aumenta em +1 por patamar.', requires: [], levelReq: 3, cost: 5000 },
  { name: 'Santuário', description: 'Lugar sagrado para comunhão com divindade.', benefit: 'Se devoto da divindade, aprende uma magia divina adicional de qualquer círculo que possa lançar.', requires: ['Altar'], levelReq: 3, cost: 5000 },
  { name: 'Torre Arcana', description: 'Espaço para arcanistas estudarem e testarem magias.', benefit: 'Aprende uma magia arcana adicional de qualquer círculo que possa lançar.', requires: ['Círculo de Poder'], levelReq: 3, cost: 5000 },
];

export const ITEM_TYPES = ['Consumivel', 'Equipamento', 'Tesouro', 'Arma', 'Riqueza'];

// Regras de Carga (Tormenta20)
export const BASE_CARRY = 10;
export const CARRY_PER_STR = 2;
export const MAX_OVERLOAD_MULTIPLIER = 2;

export const calcCarryLimit = (strength: number): number => Math.max(0, BASE_CARRY + strength * CARRY_PER_STR);
export const calcMaxCarry = (strength: number): number => calcCarryLimit(strength) * MAX_OVERLOAD_MULTIPLIER;

export const SPACE_OPTIONS = [
  { value: 0, label: '0 (Livre)' },
  { value: 0.5, label: '½ (Muito Leve)' },
  { value: 1, label: '1 (Padrão)' },
  { value: 2, label: '2 (Volumoso)' },
  { value: 5, label: '5 (Pesado)' },
  { value: 10, label: '10 (Extremo)' },
];

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

export const POPULARITY_MODIFIERS: Record<PopularityType, number> = {
  Odiado: -5,
  Impopular: -2,
  Tolerado: 0,
  Popular: 1,
  Adorado: 2,
};

export const COURT_DATA: Record<CourtType, { maintenance: number; bonus: string }> = {
  Inexistente: { maintenance: 0, bonus: '-2 em ações de domínio' },
  Pobre: { maintenance: 1, bonus: 'Sem modificadores' },
  Comum: { maintenance: 3, bonus: '+1 Conselheiro' },
  Rica: { maintenance: 5, bonus: '+3 Conselheiros, +1 Ação' },
};

export const TERRAIN_TYPES = ['Planície', 'Floresta', 'Montanha', 'Colina', 'Pântano', 'Deserto', 'Subterrâneo', 'Aquático'];

export const TERRAIN_MAX_LEVEL: Record<string, number> = {
  Planície: 6,
  Planicie: 6,
  Floresta: 4,
  Montanha: 3,
  Colina: 5,
  Colinas: 5,
  Pântano: 3,
  Pantano: 3,
  Deserto: 4,
  Subterrâneo: 2,
  Subterraneo: 2,
  Aquático: 3,
  Aquatico: 3,
};

export const TERRAIN_MAGIC_POTENTIAL: Record<string, number> = {
  Planície: 4,
  Planicie: 4,
  Floresta: 6,
  Montanha: 7,
  Colina: 5,
  Colinas: 5,
  Pântano: 7,
  Pantano: 7,
  Deserto: 6,
  Subterrâneo: 8,
  Subterraneo: 8,
  Aquático: 4,
  Aquatico: 4,
};

export const TAX_TABLE: Record<number, { low: string; medium: string; high: string }> = {
  1: { low: '1', medium: '1d3', high: '1d3+1' },
  2: { low: '1d3', medium: '1d3+1', high: '2d4' },
  3: { low: '1d4', medium: '2d4', high: '2d6' },
  4: { low: '1d6', medium: '2d4+1', high: '2d6+2' },
  5: { low: '1d8', medium: '2d6', high: '2d8+2' },
  6: { low: '1d10', medium: '2d6+1', high: '2d10+2' },
  7: { low: '1d12', medium: '2d8+1', high: '2d12+2' },
};

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

export const DOMAIN_BUILDINGS_CATALOG: (Omit<DomainBuilding, 'id'>)[] = [
  { name: 'Abadia', costLO: 12, benefit: 'Aprende uma magia divina', description: 'Centro de estudos com livros sagrados.', fortificationBonus: 0, requires: [], skill: 'Religião', income: '' },
  { name: 'Adega', costLO: 4, benefit: '+3 PM', description: 'Espaço no porão com barris e vinhos selecionados.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Altar', costLO: 3, benefit: 'Canalizar energia aumenta para d8', description: 'Mesa de pedra para foco divino.', fortificationBonus: 0, requires: ['Templo'], skill: 'Religião', income: '' },
  { name: 'Antro de Jogatina', costLO: 10, benefit: '+2 em Enganação', description: 'Sala discreta para jogos de azar.', fortificationBonus: 0, requires: ['Taverna'], skill: 'Enganação', income: '' },
  { name: 'Aqueduto', costLO: 15, benefit: 'Rola duas vezes para encontros aleatórios, melhor resultado', description: 'Canal sobre arcos de pedra que traz água ao domínio.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Arena Arcana', costLO: 6, benefit: '+1 ponto de dano por dado de Raio Arcano', description: 'Sala com espelhos para treino mágico.', fortificationBonus: 0, requires: ['Salão dos Mistérios'], skill: 'Misticismo', income: '' },
  { name: 'Arena Clandestina', costLO: 15, benefit: 'Recebe Ataque Furtivo', description: 'Lutas ilegais sem regras.', fortificationBonus: 0, requires: ['Taverna'], skill: 'Enganação', income: '' },
  { name: 'Armorial', costLO: 3, benefit: 'Diminui custo de Orgulho em -1 PM', description: 'Sala de brasões heráldicos e genealogia.', fortificationBonus: 0, requires: ['Forte'], skill: 'Nobreza', income: '' },
  { name: 'Banhos Públicos', costLO: 7, benefit: '+5 em testes de governar', description: 'Fontes termais que trazem conforto ao povo.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Bazar', costLO: 5, benefit: '+10% ao negociar itens comuns', description: 'Loja de artigos variados.', fortificationBonus: 0, requires: [], skill: 'Enganação', income: '' },
  { name: 'Biblioteca', costLO: 10, benefit: 'Torna-se treinado em uma perícia', description: 'Coleção de pergaminhos, livros e tomos.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Bosque Sagrado', costLO: 5, benefit: 'Um companheiro animal não conta no limite', description: 'Mata isolada com árvores entalhadas com runas.', fortificationBonus: 0, requires: ['Santuário'], skill: 'Religião', income: '' },
  { name: 'Botica', costLO: 3, benefit: '+1 em Fortitude', description: 'Cabana de ervas medicinais.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Cabana de Caça', costLO: 2, benefit: 'Dano de Marca da Presa aumenta em um passo', description: 'Choupana para treinar caça.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Cadafalso', costLO: 1, benefit: '+2 em Intimidação', description: 'Palanque para execução de condenados.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Câmara Mística', costLO: 15, benefit: 'Pode usar poder de aprimoramento 1x/aventura', description: 'Sala de poder invocado.', fortificationBonus: 0, requires: ['Torre de Estudos'], skill: 'Misticismo', income: '' },
  { name: 'Campo de Treinamento', costLO: 2, benefit: 'Recruta milícia', description: 'Descampado para treino militar.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Canil', costLO: 4, benefit: 'Recruta cães de guerra', description: 'Canil para cães de guarda e ataque.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Capela', costLO: 5, benefit: '+2 em Religião', description: 'Pequena construção para preces.', fortificationBonus: 0, requires: [], skill: 'Religião', income: '' },
  { name: 'Caravançará', costLO: 10, benefit: 'Cria caravanas (pré-requisito adicional: estradas)', description: 'Pátio cercado de hospedarias e armazéns.', fortificationBonus: 0, requires: ['Bazar', 'Estrada'], skill: 'Enganação', income: '' },
  { name: 'Casa de Prazeres', costLO: 10, benefit: 'Recebe um favor uma vez por aventura', description: 'Lugar para comprar sonhos.', fortificationBonus: 0, requires: ['Taverna'], skill: 'Enganação', income: '' },
  { name: 'Castelo', costLO: 25, benefit: 'Muda fortificação do forte para +5', description: 'Construção imponente com fossos e torres.', fortificationBonus: 5, requires: ['Forte'], skill: 'Nobreza', income: '' },
  { name: 'Catedral', costLO: 20, benefit: 'Dobra os efeitos de uma Missa', description: 'Igreja grandiosa para grandes ritos.', fortificationBonus: 0, requires: ['Templo'], skill: 'Religião', income: '' },
  { name: 'Celeiro', costLO: 3, benefit: 'Elimina penalidade no ganho da fazenda', description: 'Depósito para produção agrícola.', fortificationBonus: 0, requires: ['Fazenda'], skill: 'Nobreza', income: '' },
  { name: 'Círculo de Pedras', costLO: 10, benefit: 'Aumenta bônus de atributo de Forma selvagem em +2', description: 'Pedras dispostas para canalizar a natureza.', fortificationBonus: 0, requires: ['Santuário'], skill: 'Religião', income: '' },
  { name: 'Círculo de Poder', costLO: 10, benefit: '+1 na CD de magias arcanas', description: 'Círculo de runas no chão.', fortificationBonus: 0, requires: [], skill: 'Misticismo', income: '' },
  { name: 'Corte de Lei', costLO: 5, benefit: 'Rola dois dados em testes de resistência contra efeitos mentais', description: 'Sala de julgamento do regente.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Curtume', costLO: 4, benefit: '+2 na Defesa de capangas', description: 'Estabelecimento de couro curtido.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Docas', costLO: 4, benefit: 'Bônus de Audácia aumenta em +1 e pode ser usado em ataques', description: 'Encontro de marujos e histórias.', fortificationBonus: 0, requires: ['Porto'], skill: 'Nobreza', income: '' },
  { name: 'Empório', costLO: 10, benefit: '+10% ao negociar um item especial, uma vez por aventura', description: 'Grande loja de tudo.', fortificationBonus: 0, requires: ['Bazar'], skill: 'Enganação', income: '' },
  { name: 'Esconderijo', costLO: 8, benefit: 'Recruta bandidos', description: 'Covil de bandoleiros.', fortificationBonus: 0, requires: [], skill: 'Enganação', income: '' },
  { name: 'Estalagem', costLO: 8, benefit: 'Uma ação padrão adicional uma vez por aventura', description: 'Lugar de lendas e canções.', fortificationBonus: 0, requires: ['Estrada'], skill: 'Nobreza', income: '' },
  { name: 'Estante de Pergaminhos', costLO: 12, benefit: 'Aprende uma magia arcana', description: 'Coleção de textos místicos.', fortificationBonus: 0, requires: [], skill: 'Misticismo', income: '' },
  { name: 'Estátua', costLO: 2, benefit: 'Aumenta gasto máximo de PM em +1', description: 'Monumento de um herói.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Estrada', costLO: 10, benefit: '+2 em Iniciativa', description: 'Caminho que cruza o domínio.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Estrebaria', costLO: 10, benefit: 'Recebe montaria', description: 'Seleção e treino de animais.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Fazenda', costLO: 2, benefit: '+1d6 -2 LO por turno', description: 'Campo arado para agricultura.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '1d6-2' },
  { name: 'Feira', costLO: 5, benefit: '+1d4 LO por turno', description: 'Espaço de comércio semanal.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '1d4' },
  { name: 'Forja', costLO: 6, benefit: '+1 nas rolagens de dano de capangas', description: 'Armas afiadas e prontas.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Forte', costLO: 10, benefit: 'Fortificação +2', description: 'Torre de madeira em posição elevada.', fortificationBonus: 2, requires: [], skill: 'Guerra', income: '' },
  { name: 'Liças', costLO: 2, benefit: 'Aumenta bônus de Fúria em +1', description: 'Campo de areia para combates brutais.', fortificationBonus: 0, requires: ['Pátio de Treinamento'], skill: 'Guerra', income: '' },
  { name: 'Linhas Místicas', costLO: 25, benefit: 'Recuperação de PM aumenta em +1/nível', description: 'Acesso às linhas de energia mística.', fortificationBonus: 0, requires: [], skill: 'Misticismo', income: '' },
  { name: 'Madeireira', costLO: 15, benefit: '+1d8 LO, –10% em eventos, apenas florestas', description: 'Extração de madeira.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '1d8' },
  { name: 'Masmorra', costLO: 20, benefit: '+2 na CD de habilidades de classe (exceto magias)', description: 'Túneis para proteger tesouros.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Mercado', costLO: 10, benefit: 'Muda ganho da feira para 1d8 LO', description: 'Feira maior e sempre aberta.', fortificationBonus: 0, requires: ['Feira'], skill: 'Nobreza', income: '' },
  { name: 'Mina', costLO: 20, benefit: '+1d12 LO, –20% em eventos, apenas montanhas/subterrâneos', description: 'Extração de minérios valiosos.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '1d12' },
  { name: 'Moinho', costLO: 5, benefit: 'Muda dado de ganho da fazenda para d8', description: 'Engenho movido a vento ou água.', fortificationBonus: 0, requires: ['Fazenda'], skill: 'Nobreza', income: '' },
  { name: 'Mosteiro', costLO: 15, benefit: '+3 pontos de mana (apenas para conjuradores divinos)', description: 'Habitação de monges em isolamento.', fortificationBonus: 0, requires: [], skill: 'Religião', income: '' },
  { name: 'Muralha', costLO: 10, benefit: 'Muda fortificação da paliçada para +5', description: 'Muro alto de grandes blocos de pedra.', fortificationBonus: 5, requires: ['Paliçada'], skill: 'Guerra', income: '' },
  { name: 'Obra de Arte', costLO: 3, benefit: '+1 em Vontade', description: 'Quadro, escultura ou criação inspiradora.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Oficina', costLO: 2, benefit: '+2 em Ofício', description: 'Galpão de bancadas e ferramentas.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Ordem de Cavalaria', costLO: 20, benefit: 'Diminui custo de Baluarte em -1 PM', description: 'Sede de irmandade de honra e justiça.', fortificationBonus: 0, requires: ['Forte'], skill: 'Nobreza', income: '' },
  { name: 'Palácio', costLO: 100, benefit: 'Aumenta limite de parceiros em +1', description: 'Construção luxuosa para ostentar poder.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Palco', costLO: 4, benefit: '+2 em Atuação', description: 'Tablado elevado para espetáculos.', fortificationBonus: 0, requires: [], skill: 'Enganação', income: '' },
  { name: 'Paliçada', costLO: 4, benefit: 'Fortificação +2', description: 'Cerca de estacas pontiagudas.', fortificationBonus: 2, requires: [], skill: 'Guerra', income: '' },
  { name: 'Pátio de Treinamento', costLO: 6, benefit: '+1 em testes de ataque (ou uma proficiência)', description: 'Espaço para guardas praticarem.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Pedra de Maldições', costLO: 6, benefit: 'Alvo sofre –5 em sua próxima resistência uma vez por aventura', description: 'Pedra para lançar pragas e agouros.', fortificationBonus: 0, requires: ['Salão dos Mistérios'], skill: 'Misticismo', income: '' },
  { name: 'Pista de Arquearia', costLO: 2, benefit: 'Recruta arqueiros', description: 'Campo de tiro ao alvo.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Pista de Justa', costLO: 10, benefit: 'Recruta cavaleiros', description: 'Terra para torneios de cavalaria.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Poço de Adivinhação', costLO: 10, benefit: 'Rola 2d20 num teste e usa o melhor uma vez por aventura', description: 'Observação de lugares distantes.', fortificationBonus: 0, requires: [], skill: 'Misticismo', income: '' },
  { name: 'Poço de Piche', costLO: 6, benefit: 'Bônus em alquímicos, apenas pântanos', description: 'Buraco para extração de substâncias.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Porto', costLO: 10, benefit: 'Ganha 1d6 LO por turno', description: 'Porto marítimo ou fluvial.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '1d6' },
  { name: 'Posto de Pedágio', costLO: 2, benefit: 'Aumenta ganho de impostos altos (pré-requisito adicional: estradas)', description: 'Cobra pedágio de viajantes.', fortificationBonus: 0, requires: ['Estrada'], skill: 'Guerra', income: '' },
  { name: 'Povoado Afastado', costLO: 4, benefit: 'Permite uma construção de outro terreno', description: 'Comunidade em terreno diferente.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Quarto Luxuoso', costLO: 2, benefit: '+5 pontos de vida', description: 'Cama enorme com colchão de plumas.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
  { name: 'Relicário', costLO: 8, benefit: '+5 num teste de resistência uma vez por aventura', description: 'Cofre de objeto sagrado.', fortificationBonus: 0, requires: ['Capela'], skill: 'Religião', income: '' },
  { name: 'Sala de Mapas', costLO: 8, benefit: 'Recebe uma ação de movimento adicional no primeiro turno de cada combate', description: 'Mapas e reconstituições de batalhas.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Sala de Meditação', costLO: 5, benefit: '+3 pontos de mana (apenas para conjuradores arcanos)', description: 'Sala silenciosa para meditação.', fortificationBonus: 0, requires: [], skill: 'Misticismo', income: '' },
  { name: 'Sala do Trono', costLO: 5, benefit: '+2 em Diplomacia', description: 'Assento elevado para receber súditos.', fortificationBonus: 0, requires: ['Forte'], skill: 'Nobreza', income: '' },
  { name: 'Salão de Guerreiros', costLO: 4, benefit: 'Diminui custo de Ataque Especial em –1 PM', description: 'Salão para soldados se reunirem.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Salão dos Mistérios', costLO: 15, benefit: '+2 em Misticismo', description: 'Ambiente de objetos do oculto.', fortificationBonus: 0, requires: [], skill: 'Misticismo', income: '' },
  { name: 'Santuário', costLO: 4, benefit: 'Fornece um poder de druida', description: 'Lugar isolado para venerar espíritos.', fortificationBonus: 0, requires: [], skill: 'Religião', income: '' },
  { name: 'Sede de Guilda', costLO: 15, benefit: 'Adiciona uma melhoria a um item, uma vez por aventura', description: 'Associação de mestres de ofícios.', fortificationBonus: 0, requires: ['Oficina'], skill: 'Nobreza', income: '' },
  { name: 'Taverna', costLO: 10, benefit: 'Interrogar como ação livre uma vez por aventura', description: 'Lugar de música e fofocas.', fortificationBonus: 0, requires: [], skill: 'Enganação', income: '' },
  { name: 'Templo', costLO: 15, benefit: 'Fornece um poder de clérigo', description: 'Centro de devoção divina.', fortificationBonus: 0, requires: [], skill: 'Religião', income: '' },
  { name: 'Torre de Estudos', costLO: 10, benefit: 'Fornece um poder de arcanista', description: 'Torre isolada para aprendizado místico.', fortificationBonus: 0, requires: [], skill: 'Misticismo', income: '' },
  { name: 'Torre de Guarnição', costLO: 5, benefit: 'Recruta guardas', description: 'Dormitório e área de convivência de tropas.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Torre de Vigia', costLO: 2, benefit: '+2 em Percepção', description: 'Torre na fronteira para avistar invasores.', fortificationBonus: 0, requires: [], skill: 'Guerra', income: '' },
  { name: 'Trupe de Malabaristas', costLO: 4, benefit: '+1 em Reflexos', description: 'Acrobatas e artistas.', fortificationBonus: 0, requires: [], skill: 'Enganação', income: '' },
  { name: 'Universidade', costLO: 25, benefit: 'Recebe um poder geral', description: 'Instituição de ensino e pesquisa.', fortificationBonus: 0, requires: [], skill: 'Nobreza', income: '' },
];

export const DOMAIN_UNITS_CATALOG: (Omit<DomainUnit, 'id'>)[] = [
  { name: 'Camponeses', type: 'Levante', power: 0.5, costLO: 0, maintenance: 0, defense: 10, damage: '1d6', speed: 9, requires: '' },
  { name: 'Milícia', type: 'Infantaria', power: 1, costLO: 1, maintenance: 0.25, defense: 16, damage: '1d8+1', speed: 9, requires: 'Campo de Treinamento' },
  { name: 'Bandidos', type: 'Escaramuça', power: 1, costLO: 2, maintenance: 0.5, defense: 15, damage: '2d6', speed: 9, requires: 'Esconderijo' },
  { name: 'Cães de Guerra', type: 'Animal', power: 2, costLO: 2, maintenance: 0.25, defense: 14, damage: '1d6+3', speed: 15, requires: 'Canil' },
  { name: 'Guardas', type: 'Elite', power: 2, costLO: 2, maintenance: 0.5, defense: 19, damage: '1d8+2', speed: 6, requires: 'Torre de Guarnição' },
  { name: 'Arqueiros', type: 'À Distância', power: 2, costLO: 2, maintenance: 0.5, defense: 15, damage: '1d8', speed: 9, requires: 'Pista de Arquearia' },
  { name: 'Cavaleiros', type: 'Montada', power: 5, costLO: 6, maintenance: 1, defense: 24, damage: '1d8+3', speed: 12, requires: 'Pista de Justa' },
];

export const RANDOM_EVENTS_TABLE = [
  { range: [1, 2], name: 'Ataque de Dragão', description: 'Um dragão ataca o domínio!', impact: 'disaster' as const, effect: 'O domínio perde 1 nível, 1 construção aleatória e 1d6 unidades.' },
  { range: [3, 7], name: 'Invasores', description: 'Força considerável ataca o domínio.', impact: 'invasion' as const, effect: 'Batalha: Poder = 1d12 por nível do domínio.' },
  { range: [8, 11], name: 'Monstro', description: 'Um monstro ataca o domínio.', impact: 'popularity' as const, effect: '-1 popularidade. Perde 1 construção aleatória se não caçado.' },
  { range: [12, 15], name: 'Peste', description: 'Doença assola o domínio.', impact: 'popularity' as const, effect: '-1 popularidade. Perde 1d3+1 unidades.' },
  { range: [16, 20], name: 'Fenômeno Natural', description: 'Evento climático.', impact: 'disaster' as const, effect: 'Pode perder 1 nível, 1 construção ou -1d6 LO nos ganhos.' },
  { range: [21, 22], name: 'Fenômeno Mágico', description: 'Evento sobrenatural bizarro.', impact: 'penalty' as const, effect: '-5 ou -2 em ações de domínio neste turno.' },
  { range: [23, 26], name: 'Questão Diplomática', description: 'Emissário de outro reino exige algo.', impact: 'penalty' as const, effect: 'Pode exigir tributo de 2d6 LO, tropas ou uso de construção.' },
  { range: [27, 30], name: 'Levante', description: 'A população se enfurece!', impact: 'popularity' as const, effect: '-2 popularidade.' },
  { range: [31, 35], name: 'Intriga', description: 'Conselheiro envolvido em chantagem.', impact: 'popularity' as const, effect: '-1 corte e -1 popularidade se não resolvido.' },
  { range: [36, 42], name: 'Questão de Justiça', description: 'Questão legal precisa ser resolvida.', impact: 'popularity' as const, effect: '-2 popularidade se não julgada.' },
  { range: [43, 52], name: 'Bandidos', description: 'Bandoleiros roubam o povo.', impact: 'popularity' as const, effect: '-1 popularidade por turno até derrotados.' },
  { range: [53, 56], name: 'Corrupção', description: 'Corte tomada por falcatruas.', impact: 'treasury' as const, effect: '-1d6 LO por turno até resolvida. -1 corte ao resolver.' },
  { range: [57, 61], name: 'Questão Comercial', description: 'Disputa entre guildas.', impact: 'treasury' as const, effect: '-2d6 LO nos ganhos se não resolvido.' },
  { range: [62, 70], name: 'Saqueadores', description: 'Força menor de invasores.', impact: 'invasion' as const, effect: 'Batalha: Poder = 1d8 por nível do domínio.' },
  { range: [71, 90], name: 'Nenhum Evento', description: 'Tudo tranquilo.', impact: 'none' as const, effect: '' },
  { range: [91, 100], name: 'Regalia', description: 'Evento favorável!', impact: 'boon' as const, effect: '+1d6 LO, ou +2 em testes, ou +1 popularidade.' },
];

// CALENDAR CONSTANTS
export const ARTON_MONTHS = [
  'Caravana', 'Pomo', 'Keenvia', // Primavera
  'Sirravia', 'Vigília', 'Prussvia', // Verão
  'Ceifa', 'Contenda', 'Clausura', // Outono
  'Pharstyth', 'Véu', 'Pyra' // Inverno
];

export const ARTON_WEEKDAYS = [
  'Valk', 'Hedryl', 'Luna', 'Astar', 'Dallia', 'Haya', 'Leen'
];
