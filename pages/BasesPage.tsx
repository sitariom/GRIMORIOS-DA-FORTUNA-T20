import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { PORTE_DATA, TYPE_DATA, BUSINESS_LEVELS, BUSINESS_ASSETS, MAX_BUSINESS_LEVEL } from '../constants';
import { BasePorte, BaseType, Base, Room } from '../types';
import { Hammer, Coins, Home, Trash2, Bed, Plus, X, ShieldCheck, Map, Castle, Info, TrendingUp, RotateCcw, AlertTriangle, Sparkles, Store, ArrowUp, Briefcase, List, ScrollText } from 'lucide-react';

const PORTES: BasePorte[] = ['Minima', 'Modesta', 'Basica', 'Formidavel', 'Grandiosa', 'Suprema'];

const STANDARD_ROOMS = [
  { name: 'Adega',               benefit: 'O efeito de qualquer preparado ou poção ingerido pelos residentes aumenta em +1 por dado.' },
  { name: 'Ala dos Criados',     benefit: 'No início de cada aventura, cada residente recebe 1d4 PM temporários por patamar. Req: Base Formidável+.' },
  { name: 'Armorial',            benefit: 'Fornece proficiência com um item a sua escolha (arma, armadura ou escudo). Pode trocar o item no início de cada aventura.' },
  { name: 'Biblioteca',          benefit: 'Residentes recebem +1 em Conhecimento.' },
  { name: 'Calabouço',           benefit: 'Residentes recebem +1 em Intimidação e na CD de seus efeitos de medo.' },
  { name: 'Câmara de Meditação', benefit: 'Residentes recebem +1 em Vontade.' },
  { name: 'Casa da Guarda',      benefit: 'Bônus de segurança da guarita aumenta em +4 (total +8). Guardas acompanham o grupo como pelotão de infantaria veterano (parceiro capanga). Req: Base Formidável+, Guarita.' },
  { name: 'Chapelaria',          benefit: 'Residentes podem se beneficiar de um item vestido adicional. Req: Base Formidável+.' },
  { name: 'Cozinha',             benefit: 'No início de cada aventura, escolha dois pratos especiais de Alimentação (T20 p.162). Cada prato é um item (0,5 espaço) para viagem.' },
  { name: 'Despensa',            benefit: 'O limite de carga dos residentes aumenta em 2 espaços.' },
  { name: 'Domo Protetor',       benefit: 'A base recebe +2 em segurança. Se for móvel, pode entrar em ambientes inóspitos sem risco. Req: Gabinete Místico.' },
  { name: 'Enfermaria',          benefit: 'Residentes recebem +1 em Cura e em testes para estancar sangramentos ou em testes de morte.' },
  { name: 'Estábulo',            benefit: 'Cada parceiro animal ou monstro pode aumentar um bônus fornecido por ele em +1. Se for montaria, pode fornecer +3m de deslocamento.' },
  { name: 'Estufa',              benefit: 'Fornece +1 na CD de todos os preparados e poções do residente.' },
  { name: 'Forjaria',            benefit: 'Residentes recebem +1 nas rolagens de dano com uma arma a sua escolha. Pode trocar a arma no início de cada aventura. Req: Oficina de Trabalho.' },
  { name: 'Gabinete Místico',    benefit: 'Residentes recebem +1 em Misticismo.' },
  { name: 'Ginásio',             benefit: 'Residentes recebem +1 em Atletismo e nas rolagens de dano com ataques desarmados e armas naturais.' },
  { name: 'Guarita',             benefit: 'A base recebe +4 em segurança.' },
  { name: 'Jardim Ornamental',   benefit: 'Residentes recebem +1 em testes de Enganação.' },
  { name: 'Laboratório Arcano',  benefit: 'No início de cada aventura, escolha uma magia arcana: seu custo diminui em –1 PM até o fim da aventura. Req: Gabinete Místico.' },
  { name: 'Lavanderia',          benefit: 'Escolha um item de vestuário que modifique uma perícia: ele fornece +1 adicional nessa perícia. Pode trocar o item no início de cada aventura.' },
  { name: 'Memorial',            benefit: 'Caso um residente morra, o próximo personagem do mesmo jogador recebe +1 em um atributo.' },
  { name: 'Observatório',        benefit: 'Se treinado em Misticismo, rola dois dados e usa o melhor resultado em um teste de perícia por aventura.' },
  { name: 'Oficina de Trabalho', benefit: 'Cada residente recebe +1 em um Ofício a sua escolha. Pode trocar o ofício no início de cada aventura.' },
  { name: 'Oratório',            benefit: 'Residentes recebem +1 em Religião.' },
  { name: 'Pátio de Treinamento',benefit: 'Residentes recebem +1 nos testes de ataque com uma arma a sua escolha. Pode trocar a arma no início de cada aventura.' },
  { name: 'Quarto do Capitão',   benefit: 'Bônus de segurança da guarita aumenta em +2 (total +10). O capitão atua como parceiro veterano (atirador, combatente, fortão ou guardião). Req: Casa da Guarda.' },
  { name: 'Sacada',              benefit: 'Cada residente recebe +1 em Diplomacia.' },
  { name: 'Sala de Estar',       benefit: 'Este cômodo pode possuir e receber os benefícios de até três mobílias diferentes.' },
  { name: 'Sala de Guerra',      benefit: 'Residentes recebem +1 em Guerra e Iniciativa.' },
  { name: 'Sala de Jogos',       benefit: 'Residentes recebem +1 em Jogatina. Recuperam 1 PM quando rolam resultado 1 natural em um teste relevante.' },
  { name: 'Sala de Mapas',       benefit: 'Residentes recebem +2 em testes de buscas e em testes de perigos complexos relacionados a viagens.' },
  { name: 'Sala de Perigo',      benefit: 'Residentes recebem +2 em testes da ação treinamento. Req: Sistema de Segurança.' },
  { name: 'Sala do Tesouro',     benefit: 'Qualquer rolagem de d% para definir tesouros aleatórios recebe +5%.' },
  { name: 'Salão de Baile',      benefit: 'Residentes recebem +1 em Nobreza.' },
  { name: 'Sauna',               benefit: 'Uma vez por aventura, ao fazer um teste de resistência, o residente rola dois dados e usa o melhor resultado. Req: Base Formidável+.' },
  { name: 'Sistema de Segurança',benefit: 'A base recebe +4 em segurança. Residentes recebem +2 em testes de resistência contra armadilhas.' },
  { name: 'Suíte',               benefit: 'Até dois residentes recebem +3 PV e descanso confortável. Pode ser construída várias vezes para mais residentes. Req: Base Básica+.' },
  { name: 'Tabernáculo',         benefit: 'No início de cada aventura, escolha uma magia divina: seu custo diminui em –1 PM até o fim da aventura. Req: Oratório.' },
  { name: 'Tablado',             benefit: 'Residentes recebem +1 em Atuação.' },
  { name: 'Vergel',              benefit: 'Residentes recebem +1 em Sobrevivência.' },
];

const STANDARD_FURNITURES = [
  { name: 'Armadura Decorativa',    cost: 2000, benefit: 'Os residentes recebem +1 na Defesa. Pode ser instalada em qualquer cômodo.' },
  { name: 'Armário de Remédios',    cost: 2000, benefit: 'Preparados e poções de cura recuperam +1 PV por dado. Req: Enfermaria ou Estufa.' },
  { name: 'Banheira',               cost: 300,  benefit: 'Uma vez por aventura, rola dois dados em um teste de Fortitude e usa o melhor. Req: Suíte.' },
  { name: 'Bar',                    cost: 1000, benefit: 'Residentes recebem +1 PM. Req: Sala de Estar, Salão de Baile ou Sala de Jogos.' },
  { name: 'Baú Reforçado',          cost: 300,  benefit: 'Aumenta o bônus no limite de carga para 3 espaços (em vez de 2). Req: Despensa.' },
  { name: 'Bigorna',                cost: 500,  benefit: 'Na Oficina de Trabalho: bônus em Ofício aumenta para +3. Na Forjaria: bônus em dano aumenta para +2.' },
  { name: 'Colchão de Penas Exóticas', cost: 500, benefit: 'Aumenta os PV extras fornecidos pela suíte em +3 (total +6 PV). Req: Suíte.' },
  { name: 'Colmeia de Pergaminhos', cost: 2500, benefit: 'Conjuradores arcanos aprendem uma magia de qualquer círculo que possam lançar. Req: Biblioteca ou Gabinete Místico.' },
  { name: 'Criatura Empalhada',     cost: 1000, benefit: 'Fornece bônus em rolagens de dano contra criaturas do mesmo tipo igual ao patamar da criatura empalhada (ex: serpe = +2 contra monstros). Req: grupo fornece a carcaça.' },
  { name: 'Engenho Automatizado',   cost: 3000, benefit: 'O tempo de fabricação de itens não consumíveis não mágicos na base cai à metade. Req: Oficina de Trabalho.' },
  { name: 'Espelho de Corpo',       cost: 2000, benefit: 'Na Chapelaria: permite usar mais um item vestido adicional (total de 2 adicionais). Na Suíte: +1 em testes de perícias baseadas em Carisma.' },
  { name: 'Ídolo Dourado',          cost: 1200, benefit: 'Aumenta um dos bônus em perícias fornecidos pelo cômodo em +1.' },
  { name: 'Lareira',                cost: 2500, benefit: '+1 na CD de efeitos de fogo e redução de fogo 2 para os residentes. Req: Sala de Estar, Cozinha ou Suíte.' },
  { name: 'Lustre de Cristal',      cost: 2500, benefit: 'Uma vez por aventura, aumenta um efeito de luz em +1 por dado. Req: Sala de Estar ou Salão de Baile.' },
  { name: 'Mapa-Múndi',             cost: 1500, benefit: 'Aumenta os bônus do cômodo em questão em +1. Req: Sala de Guerra ou Sala de Mapas.' },
  { name: 'Mesa de Reuniões',       cost: 2000, benefit: 'No início de cada combate, os personagens podem trocar os valores de iniciativa rolados entre si. Req: Sala de Guerra ou Sala de Estar.' },
  { name: 'Obra de Arte',           cost: 2000, benefit: 'Uma vez por aventura, cada residente cura PM = patamar × quantidade de obras de arte na base.' },
  { name: 'Planetário',             cost: 1500, benefit: 'Permite usar o bônus do observatório uma vez adicional por aventura. Req: Observatório.' },
  { name: 'Prataria',               cost: 2000, benefit: 'Permite preparar uma refeição para viagem adicional no início de cada aventura. Req: Cozinha.' },
  { name: 'Prateleiras Reforçadas', cost: 2000, benefit: 'Fornece uma perícia treinada a cada residente. Req: Biblioteca.' },
  { name: 'Quadro de Diagramas',    cost: 3000, benefit: 'Custo de fabricação de itens mundanos na base: 1/4 do preço. Custo de conserto: 1/8 do preço. Req: Oficina de Trabalho.' },
  { name: 'Relíquia Abençoada',     cost: 2500, benefit: 'No Oratório: conjuradores divinos aprendem uma magia divina de qualquer círculo que possam lançar. Na Sala de Estar: +1 nos testes de resistência de todos os residentes.' },
  { name: 'Retratos',               cost: 1750, benefit: 'Residentes recebem +5 em testes de perícia para ajudar outros residentes. Pode ser instalada em qualquer cômodo de uso comum.' },
  { name: 'Roleta Ahleniense',      cost: 2000, benefit: 'Uma vez por aventura, permite rolar novamente um teste de perícia e usar o melhor resultado. Req: Sala de Jogos.' },
];

const calculateBaseSecurity = (base: Base): number => {
  let sec = base.type === 'Fortificacao' ? 5 : 0;
  
  // Add Gárgulas Animadas (+2 security each)
  sec += (base.gargulas || 0) * 2;
  
  base.rooms.forEach(room => {
    if (room.isDamaged) return; // Damaged rooms do not contribute to security!
    const roomName = room.name.toLowerCase();
    
    if (roomName.includes('guarita')) {
      sec += 4;
    }
    if (roomName.includes('casa da guarda')) {
      sec += 4;
    }
    if (roomName.includes('quarto do capitão') || roomName.includes('quarto do capitao')) {
      sec += 2;
    }
    if (roomName.includes('domo protetor') || roomName.includes('cúpula protetora') || roomName.includes('cupula protetora')) {
      sec += 2;
    }
    if (roomName.includes('sistema de segurança') || roomName.includes('sistema de seguranca')) {
      sec += 4;
    }
  });
  
  return Math.min(20, Math.max(0, sec));
};

const BasesPage: React.FC = () => {
  const { 
    bases, addBase, upgradeBase, reformBase, repairRoom, payBaseMaintenance, 
    collectBaseIncome, demolishBase, addRoom, removeRoom, addFurniture, removeFurniture,
    moveFurniture, addGargula, removeGargula
  } = useGuild();

  const [modalMode, setModalMode] = useState<'buy' | 'addRoom' | 'addFurn' | 'upgrade' | 'income' | 'reform' | 'bonuses' | 'createBusiness' | 'levelUpBusiness' | 'addAsset' | 'removeAsset' | 'collectBusinessIncome' | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newPorte, setNewPorte] = useState<BasePorte>('Minima');
  const [newType, setNewType] = useState<BaseType>('Residencia');
  
  const [acquisitionMethod, setAcquisitionMethod] = useState<'construct' | 'buy' | 'reward'>('construct');
  const [upgradeMethod, setUpgradeMethod] = useState<'roll' | 'reward'>('roll');
  const [reformMethod, setReformMethod] = useState<'roll' | 'reward'>('roll');
  
  const [rollResult, setRollResult] = useState<number | ''>('');
  
  const [activeBaseId, setActiveBaseId] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState(200);
  const [costOption, setCostOption] = useState<'pay' | 'reward'>('pay');
  const [incomeAmount, setIncomeAmount] = useState(0);

  // Business state
  const [bizAssetName, setBizAssetName] = useState('');
  const [bizIncomeRoll, setBizIncomeRoll] = useState<number | ''>('');

  const {
    createBusiness, levelUpBusiness, addBusinessAsset, removeBusinessAsset,
    collectBusinessIncome
  } = useGuild();

  const resetModal = () => {
    setModalMode(null); 
    setNewName(''); 
    setItemName(''); 
    setItemCost(200); 
    setIncomeAmount(0); 
    setActiveBaseId(''); 
    setActiveRoomId('');
    setRollResult('');
    setAcquisitionMethod('construct');
    setUpgradeMethod('roll');
    setReformMethod('roll');
    setCostOption('pay');
    setBizAssetName('');
    setBizIncomeRoll('');
  };

  const activeBase = bases.find(b => b.id === activeBaseId);

  const getUpgradeCost = () => {
      if (!activeBase) return 0;
      const currentPorteIndex = PORTES.indexOf(activeBase.porte);
      if (currentPorteIndex === -1 || currentPorteIndex >= PORTES.length - 1) return 0;
      const nextPorte = PORTES[currentPorteIndex + 1];
      const diff = PORTE_DATA[nextPorte].cost - PORTE_DATA[activeBase.porte].cost;
      return diff > 0 ? diff : 0;
  };

  const getNextUpgradePorte = (): BasePorte | null => {
      if (!activeBase) return null;
      const currentPorteIndex = PORTES.indexOf(activeBase.porte);
      if (currentPorteIndex === -1 || currentPorteIndex >= PORTES.length - 1) return null;
      return PORTES[currentPorteIndex + 1];
  };

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-medieval text-fantasy-wood dark:text-white tracking-tighter uppercase leading-none mb-2">Bases e Fortalezas</h2>
          <p className="text-xs md:text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Cidadelas sob seu estandarte nos Reinos.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button onClick={() => setModalMode('buy')} className="flex-1 md:flex-none bg-fantasy-blood hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-medieval uppercase tracking-widest shadow-2xl border-b-4 border-red-950 transition-all active:translate-y-1">
             <Home size={24} /> Reclamar Território
          </button>
          <button onClick={() => setModalMode('createBusiness')} className="flex-1 md:flex-none bg-amber-800 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-medieval uppercase tracking-widest shadow-2xl border-b-4 border-amber-950 transition-all active:translate-y-1">
             <Store size={24} /> Fundar Negócio
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
         {bases.length === 0 ? (
            <div className="parchment-card p-16 md:p-36 rounded-[60px] border-4 border-dashed border-fantasy-wood/10 dark:border-white/10 text-center opacity-60">
               <Map size={80} className="mx-auto mb-10 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
               <p className="font-medieval text-2xl md:text-4xl uppercase tracking-widest italic text-fantasy-wood dark:text-fantasy-parchment">Nenhuma sede estabelecida ainda...</p>
            </div>
         ) : (
            bases.map((base, idx) => {
              const porteData = PORTE_DATA[base.porte];
              const typeData = TYPE_DATA[base.type];
              const isFull = base.rooms.length >= porteData.slots;
              const securityVal = calculateBaseSecurity(base);

              return (
                <div key={base.id} className="parchment-card rounded-[60px] border-4 border-fantasy-gold/20 shadow-5xl overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                   <div className="bg-fantasy-wood/10 dark:bg-black/20 p-8 md:p-12 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                       <div className="flex items-center gap-8">
                           <div className="wax-seal w-20 h-20 md:w-24 md:h-24 flex items-center justify-center animate-float shrink-0">
                              <Castle size={40} className="text-white"/>
                           </div>
                           <div>
                             <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter mb-2 leading-none">{base.name}</h3>
                             <div className="flex flex-wrap gap-3">
                                <span className="text-[9px] md:text-[10px] font-black bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black px-4 py-1 md:px-5 md:py-2 rounded-full uppercase tracking-[0.2em]">{porteData.label}</span>
                                <span className="text-[9px] md:text-[10px] font-black bg-indigo-700/10 dark:bg-indigo-400/10 text-indigo-900 dark:text-indigo-400 border border-indigo-900/20 dark:border-indigo-400/20 px-4 py-1 md:px-5 md:py-2 rounded-full uppercase tracking-[0.2em]">{typeData.label}</span>
                             </div>
                           </div>
                       </div>
                       <div className="flex gap-4 self-end md:self-auto">
                         <button onClick={() => { setActiveBaseId(base.id); setModalMode('upgrade'); }} title="Expandir Porte" className="p-4 md:p-5 bg-fantasy-gold/10 hover:bg-fantasy-gold/20 text-fantasy-gold rounded-3xl transition-all border border-fantasy-gold/30">
                            <Hammer size={24}/>
                         </button>
                         <button onClick={() => { setActiveBaseId(base.id); setModalMode('reform'); setNewType(base.type); }} title="Reformar Sede (Mudar Tipo)" className="p-4 md:p-5 bg-indigo-700/10 hover:bg-indigo-700/20 text-indigo-700 dark:text-indigo-400 rounded-3xl transition-all border border-indigo-700/30">
                            <RotateCcw size={24}/>
                         </button>
                         <button onClick={() => { if(confirm("Deseja mesmo abandonar esta sede? Todos os cômodos e mobílias serão perdidos.")) demolishBase(base.id); }} title="Abandonar Base" className="p-4 md:p-5 bg-red-800/10 dark:bg-red-400/10 hover:bg-red-800/20 text-red-900 dark:text-red-400 rounded-3xl transition-all">
                            <Trash2 size={24}/>
                         </button>
                       </div>
                   </div>

                   <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {base.type === 'Negocio' ? (
                      <>
                        <div className="space-y-10">
                          <div className="bg-black/5 dark:bg-black/30 p-6 md:p-10 rounded-[48px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-inner">
                            <h4 className="text-[10px] font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><Store size={20}/> Estatuto Comercial</h4>
                            <div className="space-y-6">
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest">Nível</span>
                                <span className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment">{base.businessLevel || 1} / {MAX_BUSINESS_LEVEL}</span>
                              </div>
                              <div className="h-6 w-full bg-fantasy-wood/10 dark:bg-white/10 rounded-full border-2 border-fantasy-wood/20 dark:border-white/10 p-1.5 shadow-inner overflow-hidden">
                                <div className="h-full rounded-full shadow-inner transition-all duration-1000 bg-amber-600" style={{ width: `${((base.businessLevel || 1) / MAX_BUSINESS_LEVEL) * 100}%` }}></div>
                              </div>
                              <div className="pt-6 flex justify-between items-center border-t-2 border-fantasy-wood/10 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Ativos</span>
                                <span className="text-2xl md:text-3xl font-medieval text-fantasy-gold">{(base.businessAssetNames || []).length} / {base.businessLevel || 1}</span>
                              </div>
                              <div className="h-4 w-full bg-fantasy-wood/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-fantasy-gold transition-all duration-1000" style={{ width: `${((base.businessAssetNames || []).length / (base.businessLevel || 1)) * 100}%` }}></div>
                              </div>
                              <div className="pt-6 flex justify-between items-center border-t-2 border-fantasy-wood/10 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Renda Mensal</span>
                                <span className="text-2xl md:text-3xl font-medieval text-emerald-600 dark:text-emerald-400">T$ {(base.businessLevel || 1) * 100}</span>
                              </div>
                              <div className="flex items-center gap-3 p-4 bg-fantasy-gold/5 dark:bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/10">
                                <Info size={16} className="text-fantasy-gold shrink-0"/>
                                <p className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest italic">{typeData.bonus}</p>
                              </div>
                              <button onClick={() => { setActiveBaseId(base.id); setModalMode('bonuses'); }} className="w-full bg-violet-800/80 hover:bg-violet-700 text-white py-3.5 rounded-full font-medieval text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 border-b-4 border-violet-950 active:translate-y-1 active:border-b-0">
                                <Sparkles size={16}/> Ver Bônus
                              </button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <button onClick={() => { setActiveBaseId(base.id); setModalMode('collectBusinessIncome'); }} className="w-full bg-fantasy-gold hover:bg-[#bfa030] text-black py-5 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-xl border-b-8 border-[#8c7320] active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3">
                              <TrendingUp size={24}/> Coletar Lucros
                            </button>
                            {(base.businessLevel || 1) < MAX_BUSINESS_LEVEL && (
                              <button onClick={() => { setActiveBaseId(base.id); setModalMode('levelUpBusiness'); }} className="w-full bg-amber-700 text-white py-4 rounded-[32px] font-medieval text-lg uppercase tracking-widest shadow-xl border-b-8 border-amber-950 active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3">
                                <ArrowUp size={20}/> Evoluir Negócio
                              </button>
                            )}
                            <button onClick={() => { setActiveBaseId(base.id); setModalMode('addAsset'); }} disabled={(base.businessAssetNames || []).length >= (base.businessLevel || 1)} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-4 rounded-[32px] font-medieval text-lg uppercase tracking-widest shadow-lg border-b-8 border-emerald-950 active:translate-y-2 active:border-b-0 transition-all disabled:opacity-30 flex items-center justify-center gap-3">
                              <Plus size={20}/> Adquirir Ativo
                            </button>
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-8">
                          <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6 gap-4">
                            <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Ativos do Negócio</h4>
                            <span className="text-[10px] font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">
                              {(base.businessAssetNames || []).length} / {base.businessLevel || 1} ativos adquiridos
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(base.businessAssetNames || []).length === 0 ? (
                              <div className="col-span-full p-12 text-center">
                                <Briefcase size={48} className="mx-auto mb-4 text-fantasy-wood/20 dark:text-fantasy-parchment/20"/>
                                <p className="font-medieval text-xl text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-wider">Nenhum ativo ainda</p>
                                <p className="text-xs text-fantasy-wood/30 dark:text-fantasy-parchment/30 mt-2 italic">Evolua o negócio e adquira ativos para expandir.</p>
                              </div>
                            ) : (
                              (base.businessAssetNames || []).map(assetName => {
                                const asset = BUSINESS_ASSETS.find(a => a.name === assetName);
                                return (
                                  <div key={assetName} className="bg-white/50 dark:bg-black/20 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[40px] p-6 hover:border-fantasy-gold/40 transition-all shadow-md group">
                                    <div className="flex justify-between items-start mb-3">
                                      <h5 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment">{assetName}</h5>
                                      <button onClick={() => { if(confirm(`Remover ativo "${assetName}"?`)) removeBusinessAsset(base.id, assetName); }} className="opacity-0 group-hover:opacity-100 text-red-700 dark:text-red-400 hover:text-red-500 transition-all" title="Remover Ativo">
                                        <X size={16}/>
                                      </button>
                                    </div>
                                    {asset && (
                                      <>
                                        <p className="text-xs text-fantasy-wood/60 dark:text-fantasy-parchment/60 italic mb-2">{asset.description}</p>
                                        <div className="p-3 bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/10">
                                          <p className="text-[10px] font-black text-fantasy-gold uppercase tracking-widest">Benefício</p>
                                          <p className="text-xs text-fantasy-wood dark:text-fantasy-parchment mt-1">{asset.benefit}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                          {/* Available Assets to buy (recommended) */}
                          {(base.businessAssetNames || []).length < (base.businessLevel || 1) && (
                            <div className="bg-indigo-900/5 dark:bg-indigo-400/5 border-2 border-indigo-900/10 dark:border-indigo-400/10 rounded-[48px] p-8">
                              <h5 className="font-medieval text-lg text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ScrollText size={18}/> Ativos Sugeridos
                              </h5>
                              <p className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-wider mb-4">
                                Você pode adquirir {((base.businessLevel || 1) - (base.businessAssetNames || []).length)} ativo(s) adicional(is). Selecione no botão "Adquirir Ativo".
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-10">
                            <div className="bg-black/5 dark:bg-black/30 p-6 md:p-10 rounded-[48px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-inner">
                                <h4 className="text-[10px] font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><ShieldCheck size={20}/> Estatuto Predial</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end mb-2">
                                       <span className="text-xs font-bold uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest">Cômodos Ocupados</span>
                                       <span className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment">{base.rooms.length} / {porteData.slots}</span>
                                    </div>
                                    <div className="h-6 w-full bg-fantasy-wood/10 dark:bg-white/10 rounded-full border-2 border-fantasy-wood/20 dark:border-white/10 p-1.5 shadow-inner overflow-hidden">
                                        <div className={`h-full rounded-full shadow-inner transition-all duration-1000 ${isFull ? 'bg-red-600' : 'bg-indigo-600'}`} style={{ width: `${Math.min(100, (base.rooms.length / (porteData.slots || 1)) * 100)}%` }}></div>
                                    </div>
                                    <div className="pt-6 flex justify-between items-center border-t-2 border-fantasy-wood/10 dark:border-white/5">
                                       <span className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Manutenção Mensal</span>
                                       <span className="text-2xl md:text-3xl font-medieval text-red-900 dark:text-red-400">T$ {porteData.maintenance}</span>
                                    </div>
                                    
                                    <div className="pt-6 flex flex-col gap-2 border-t-2 border-fantasy-wood/10 dark:border-white/5">
                                       <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Segurança</span>
                                          <span className="text-2xl md:text-3xl font-medieval text-fantasy-gold">{securityVal} / 20</span>
                                       </div>
                                       <div className="h-4 w-full bg-fantasy-wood/10 dark:bg-white/10 rounded-full overflow-hidden">
                                          <div className="h-full bg-fantasy-gold transition-all duration-1000" style={{ width: `${(securityVal / 20) * 100}%` }}></div>
                                       </div>
                                       <p className="text-[9.5px] text-fantasy-wood/50 dark:text-fantasy-parchment/50 uppercase tracking-wide leading-relaxed italic">
                                          Invasores ND inferior sofrem penalidade de perícia/dano igual à diferença. Criaturas ND 5 pontos abaixo não invadem.
                                       </p>
                                    </div>

                                    <div className="pt-6 flex flex-col gap-2 border-t-2 border-fantasy-wood/10 dark:border-white/5">
                                       <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Gárgulas Animadas</span>
                                          <span className="text-xl font-medieval text-fantasy-gold">{base.gargulas || 0} / {base.porte === 'Formidavel' ? 1 : base.porte === 'Grandiosa' ? 2 : base.porte === 'Suprema' ? 3 : 0}</span>
                                       </div>
                                       {['Formidavel', 'Grandiosa', 'Suprema'].includes(base.porte) && (
                                         <div className="flex gap-2 mt-2">
                                           <button onClick={() => addGargula(base.id, true)} className="flex-1 text-[9px] font-black uppercase bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-2 rounded-full transition-colors tracking-widest shadow">
                                              Contratar (T$ 10k)
                                           </button>
                                           {(base.gargulas || 0) > 0 && (
                                             <button onClick={() => removeGargula(base.id)} className="text-[9px] font-black uppercase bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded-full transition-colors tracking-widest shadow">
                                                Remover
                                             </button>
                                           )}
                                         </div>
                                       )}
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-fantasy-gold/5 dark:bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/10">
                                        <Info size={16} className="text-fantasy-gold shrink-0"/>
                                        <p className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest italic">{typeData.bonus}</p>
                                    </div>

                                    <button onClick={() => { setActiveBaseId(base.id); setModalMode('bonuses'); }} className="w-full bg-violet-800/80 hover:bg-violet-700 text-white py-3.5 rounded-full font-medieval text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 border-b-4 border-violet-950 active:translate-y-1 active:border-b-0">
                                        <Sparkles size={16}/> Ver Bônus
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                              {base.type === 'Empreendimento' && (
                                  <button onClick={() => { setActiveBaseId(base.id); setModalMode('income'); }} className="w-full bg-fantasy-gold hover:bg-[#bfa030] text-black py-5 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-xl border-b-8 border-[#8c7320] active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3">
                                      <TrendingUp size={24}/> Coletar Lucros
                                  </button>
                              )}
                              <div className="flex gap-3">
                                <button onClick={() => payBaseMaintenance(base.id, 'Regular', porteData.maintenance, false)} className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-white py-5 rounded-[32px] font-medieval text-lg uppercase tracking-widest shadow-2xl border-b-8 border-emerald-950 active:translate-y-2 active:border-b-0 transition-all">
                                    Pagar
                                </button>
                                <button onClick={() => { if(confirm("Negligenciar manutenção danificará um cômodo aleatório. Confirmar?")) payBaseMaintenance(base.id, 'Regular', porteData.maintenance, true); }} className="flex-1 bg-amber-800 hover:bg-amber-700 text-white py-5 rounded-[32px] font-medieval text-lg uppercase tracking-widest shadow-2xl border-b-8 border-amber-950 active:translate-y-2 active:border-b-0 transition-all">
                                    Negligenciar
                                </button>
                              </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6 gap-4">
                               <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Planta do Edifício</h4>
                               <button disabled={isFull} onClick={() => { setActiveBaseId(base.id); setModalMode('addRoom'); }} className="w-full md:w-auto bg-indigo-700 hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-medieval uppercase text-sm tracking-widest shadow-2xl disabled:opacity-20 transition-all flex items-center justify-center gap-3">
                                 <Plus size={18}/> Novo Cômodo
                               </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 md:pr-4">
                               {base.rooms.map(room => (
                                  <div key={room.id} className={`bg-white/50 dark:bg-black/20 border-2 rounded-[40px] p-8 group/room hover:border-fantasy-gold/40 transition-all shadow-md ${room.isDamaged ? 'border-red-600/40 bg-red-950/5 dark:bg-red-950/10' : 'border-fantasy-wood/10 dark:border-white/10'}`}>
                                     <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                           <Bed size={24} className={room.isDamaged ? "text-red-600 shrink-0" : "text-fantasy-gold shrink-0"}/>
                                           <div className="flex flex-col">
                                              <span className={`font-medieval text-2xl truncate max-w-[150px] md:max-w-[180px] ${room.isDamaged ? "text-red-600 line-through decoration-red-900/60" : "text-fantasy-wood dark:text-fantasy-parchment"}`}>{room.name}</span>
                                              {room.cost !== undefined && <span className="text-[9px] uppercase tracking-wider text-fantasy-wood/40 dark:text-fantasy-parchment/40">Custo: T$ {room.cost}</span>}
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                           {room.isDamaged && (
                                              <button onClick={() => { if(confirm(`Confirmar reparo por T$ ${Math.floor((room.cost || 0)/2)}?`)) repairRoom(base.id, room.id, true); }} className="text-[9px] font-black uppercase bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-full transition-colors tracking-widest shadow">
                                                 Reparar (T$ {Math.floor((room.cost || 0)/2)})
                                              </button>
                                           )}
                                           <button 
                                              onClick={() => {
                                                const furnCount = room.furnitures.length;
                                                const msg = furnCount > 0
                                                  ? `Demolir "${room.name}"?\n\n⚠️ ATENÇÃO: ${furnCount} mobília(s) dentro deste cômodo serão perdidas permanentemente!\n\nConfirmar demolição?`
                                                  : `Demolir o cômodo "${room.name}"?\n\nEsta ação não pode ser desfeita.`;
                                                if (confirm(msg)) removeRoom(base.id, room.id);
                                              }} 
                                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-red-700 dark:text-red-400 hover:bg-red-700 hover:text-white dark:hover:bg-red-800 border border-red-700/30 dark:border-red-400/30 transition-all opacity-70 hover:opacity-100"
                                              title="Demolir Cômodo"
                                            >
                                              <X size={12}/> Demolir
                                            </button>
                                        </div>
                                     </div>
                                     <div className="space-y-3 border-l-4 border-fantasy-gold/10 dark:border-white/10 pl-8 ml-3">
                                        {room.furnitures.map(f => (
                                           <div key={f.id} className="flex justify-between items-center group/furn py-1 border-b border-fantasy-wood/5 dark:border-white/5">
                                              <span className="text-xs font-bold text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase tracking-tight">• {f.name}</span>
                                              <div className="flex items-center gap-2">
                                                  <button type="button" onClick={() => {
                                                     const otherRooms = base.rooms.filter(r => r.id !== room.id);
                                                     if (otherRooms.length === 0) {
                                                        alert("Não há outros cômodos para mover esta mobília.");
                                                        return;
                                                     }
                                                     const message = "Selecione o cômodo de destino digitando o número correspondente:\n" + 
                                                        otherRooms.map((r, i) => `${i + 1}. ${r.name}`).join("\n");
                                                     const selection = prompt(message);
                                                     if (selection === null) return;
                                                     const index = parseInt(selection, 10) - 1;
                                                     if (isNaN(index) || index < 0 || index >= otherRooms.length) {
                                                        alert("Seleção inválida.");
                                                        return;
                                                     }
                                                     const targetRoom = otherRooms[index];
                                                     moveFurniture(base.id, room.id, targetRoom.id, f.id);
                                                  }} title="Mover Mobília" className="opacity-100 lg:opacity-0 group-hover/furn:opacity-100 text-indigo-700 dark:text-indigo-400 hover:opacity-70 mr-2 text-[10px] font-black uppercase tracking-wider">
                                                     Mover
                                                  </button>
                                                  <button onClick={() => removeFurniture(base.id, room.id, f.id)} className="opacity-100 lg:opacity-0 group-hover/furn:opacity-100 text-red-800 dark:text-red-400"><X size={14}/></button>
                                               </div>
                                           </div>
                                        ))}
                                        <button disabled={room.isDamaged} onClick={() => { setActiveBaseId(base.id); setActiveRoomId(room.id); setModalMode('addFurn'); }} className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400 hover:opacity-70 pt-4 tracking-widest flex items-center gap-2 disabled:opacity-30">
                                          <Plus size={12}/> Adicionar Mobília
                                        </button>
                                     </div>
                                  </div>
                               ))}
                            </div>
                        </div>
                      </>
                    )}
                    </div>
                </div>
              );
            })
         )}
      </div>

      {modalMode && (
         <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
            <div className="parchment-card p-6 md:p-14 rounded-[40px] md:rounded-[80px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={resetModal} className="absolute top-6 right-6 md:top-12 md:right-12 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-2 md:p-4 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={24}/></button>
                
                {modalMode === 'buy' && (
                   <form onSubmit={(e) => { e.preventDefault(); addBase(newName, newPorte, newType, acquisitionMethod, rollResult === '' ? undefined : Number(rollResult)); resetModal(); }} className="space-y-8 md:space-y-12">
                       <div className="flex flex-col items-center text-center">
                          <div className="wax-seal w-20 h-20 md:w-28 md:h-28 mb-4 md:mb-8 flex items-center justify-center text-white shadow-2xl animate-float"><Home size={40}/></div>
                          <h3 className="text-3xl md:text-5xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Alvará de Fundação</h3>
                          <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em] mt-2 md:mt-4">Inicie um novo capítulo na história da sua Guilda.</p>
                       </div>
                       <div className="space-y-6 md:space-y-8">
                          <div className="space-y-3 text-center">
                             <label className="text-[10px] md:text-xs font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em]">Título da Propriedade</label>
                             <input className="w-full bg-white/40 dark:bg-black/40 border-4 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] md:rounded-[40px] px-6 py-4 md:px-10 md:py-8 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl md:text-4xl text-center focus:outline-none focus:border-fantasy-gold shadow-inner" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Mansão dos Ventos" />
                          </div>
                          
                          <div className="bg-black/5 dark:bg-black/20 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col gap-6">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <input type="radio" checked={acquisitionMethod === 'construct'} onChange={() => { setAcquisitionMethod('construct'); setNewPorte('Minima'); }} className="accent-red-900 w-6 h-6 shrink-0 mt-1" />
                                <div className="flex flex-col">
                                   <span className="text-xs md:text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Construir Sede Mínima (Custo: T$ 1.000)</span>
                                   <span className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-wider mt-1">Requer teste de Nobreza CD 20. Falha consome materiais (T$ 1.000) mas não funda a base.</span>
                                </div>
                            </label>
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <input type="radio" checked={acquisitionMethod === 'buy'} onChange={() => setAcquisitionMethod('buy')} className="accent-red-900 w-6 h-6 shrink-0 mt-1" />
                                <div className="flex flex-col">
                                   <span className="text-xs md:text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Comprar Pronta (Custo Triplicado: T$ {PORTE_DATA[newPorte].cost * 3})</span>
                                   <span className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-wider mt-1">Sede imediata de qualquer porte escolhido. Sem teste.</span>
                                </div>
                            </label>
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <input type="radio" checked={acquisitionMethod === 'reward'} onChange={() => setAcquisitionMethod('reward')} className="accent-red-900 w-6 h-6 shrink-0 mt-1" />
                                <div className="flex flex-col">
                                   <span className="text-xs md:text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Recompensa / Descoberta (Grátis)</span>
                                   <span className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-wider mt-1">Sede doada por contratante ou torre de vilão derrotado.</span>
                                </div>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                             <div className="space-y-2 md:space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Porte Desejado</label>
                                <select disabled={acquisitionMethod === 'construct'} className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] md:rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none cursor-pointer disabled:opacity-40" value={newPorte} onChange={e => setNewPorte(e.target.value as BasePorte)}>
                                   {Object.entries(PORTE_DATA).map(([k,v]) => <option key={k} value={k} className="dark:bg-black">{v.label}</option>)}
                                </select>
                             </div>
                             <div className="space-y-2 md:space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Natureza da Sede</label>
                                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] md:rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none cursor-pointer" value={newType} onChange={e => setNewType(e.target.value as BaseType)}>
                                   {Object.entries(TYPE_DATA).map(([k,v]) => <option key={k} value={k} className="dark:bg-black">{v.label}</option>)}
                                </select>
                             </div>
                          </div>

                          {acquisitionMethod === 'construct' && (
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Resultado do Teste de Nobreza (CD 20)</label>
                                 <input 
                                   type="number" 
                                   min="1" 
                                   className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl text-center" 
                                   required={acquisitionMethod === 'construct'}
                                   value={rollResult} 
                                   onChange={e => setRollResult(e.target.value === '' ? '' : Number(e.target.value))} 
                                   placeholder="Resultado do dado + bônus" 
                                 />
                              </div>
                          )}
                       </div>
                       <button type="submit" className="w-full bg-fantasy-blood text-white py-6 md:py-10 rounded-[56px] font-medieval text-2xl md:text-3xl uppercase tracking-[0.3em] shadow-5xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
                           Confirmar Escritura
                       </button>
                   </form>
                )}

                {modalMode === 'addRoom' && activeBase && (
                   <form onSubmit={(e) => { 
                       e.preventDefault(); 
                       addRoom(activeBaseId, itemName, costOption === 'pay' ? 'roll' : 'reward', rollResult === '' ? undefined : Number(rollResult)); 
                       resetModal(); 
                   }} className="space-y-8 md:space-y-12">
                       <div className="flex flex-col items-center text-center">
                          <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><Bed size={40}/></div>
                          <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Projeto de Cômodo</h3>
                          <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Vagas Disponíveis: {PORTE_DATA[activeBase.porte].slots - activeBase.rooms.length}</p>
                       </div>
                       <div className="space-y-6 md:space-y-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Selecione o Cômodo</label>
                             <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={itemName} onChange={e => setItemName(e.target.value)}>
                                <option value="">Customizado/Outro...</option>
                                {STANDARD_ROOMS.map(r => (
                                    <option key={r.name} value={r.name} className="dark:bg-black">{r.name}</option>
                                ))}
                             </select>
                             <input className="w-full mt-3 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ou digite o nome do cômodo..." />
                          </div>

                          {itemName && (
                              <div className="p-4 bg-fantasy-gold/5 dark:bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/25 text-left space-y-2">
                                 <p className="text-xs font-bold text-fantasy-gold uppercase tracking-wider">Benefício:</p>
                                 <p className="text-xs text-fantasy-wood dark:text-fantasy-parchment">
                                    {STANDARD_ROOMS.find(r => r.name === itemName)?.benefit || "Benefício customizado a ser acordado com o Mestre."}
                                 </p>
                              </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <label className="flex items-center gap-4 cursor-pointer group p-4 bg-black/5 dark:bg-black/25 rounded-2xl border border-fantasy-wood/10">
                                 <input type="radio" checked={costOption === 'pay'} onChange={() => setCostOption('pay')} className="accent-red-900 w-6 h-6 shrink-0" />
                                 <span className="text-xs font-black text-fantasy-wood/75 dark:text-fantasy-parchment/70 uppercase">Construção Regular (T$ 1.000)</span>
                             </label>
                             <label className="flex items-center gap-4 cursor-pointer group p-4 bg-black/5 dark:bg-black/25 rounded-2xl border border-fantasy-wood/10">
                                 <input type="radio" checked={costOption === 'reward'} onChange={() => setCostOption('reward')} className="accent-red-900 w-6 h-6 shrink-0" />
                                 <span className="text-xs font-black text-fantasy-wood/75 dark:text-fantasy-parchment/70 uppercase">Recompensa / Grátis</span>
                             </label>
                          </div>

                          {costOption === 'pay' && (
                              <div className="space-y-4">
                                 <div className="p-6 bg-blue-900/10 dark:bg-blue-400/5 rounded-[40px] border-4 border-blue-900/20 dark:border-blue-400/20 text-center">
                                    <p className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">Teste Necessário</p>
                                    <p className="text-3xl font-medieval text-blue-900 dark:text-blue-400 mt-2">
                                        CD: {20 + PORTE_DATA[activeBase.porte].slots}
                                    </p>
                                    <p className="text-[9.5px] text-blue-900/60 dark:text-blue-400/60 uppercase tracking-wide mt-2">
                                        Nobreza (ou outra perícia justificada)
                                    </p>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Resultado do Teste (d20 + modificador)</label>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl text-center" 
                                      required={costOption === 'pay'}
                                      value={rollResult} 
                                      onChange={e => setRollResult(e.target.value === '' ? '' : Number(e.target.value))} 
                                      placeholder="Resultado do teste d20" 
                                    />
                                 </div>
                              </div>
                          )}
                       </div>
                       <button type="submit" className="w-full bg-indigo-700 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-indigo-950 active:translate-y-2 active:border-b-0 transition-all">
                           Efetivar Projeto
                       </button>
                   </form>
                )}

                {modalMode === 'addFurn' && (
                   <form onSubmit={(e) => { e.preventDefault(); addFurniture(activeBaseId, activeRoomId, itemName, itemCost, costOption === 'pay'); resetModal(); }} className="space-y-8 md:space-y-12">
                       <div className="flex flex-col items-center text-center">
                          <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><ShieldCheck size={40}/></div>
                          <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Aquisição de Adorno</h3>
                       </div>
                       <div className="space-y-6 md:space-y-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Selecione a Mobília</label>
                             <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={itemName} onChange={e => {
                                 setItemName(e.target.value);
                                 const found = STANDARD_FURNITURES.find(f => f.name === e.target.value);
                                 if (found) {
                                    setItemCost(found.cost);
                                 }
                             }}>
                                <option value="">Customizada...</option>
                                {STANDARD_FURNITURES.map(f => (
                                    <option key={f.name} value={f.name} className="dark:bg-black">{f.name} (T$ {f.cost})</option>
                                ))}
                             </select>
                             <input className="w-full mt-3 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ou digite o nome da mobília..." />
                          </div>

                          {itemName && (
                              <div className="p-4 bg-fantasy-gold/5 dark:bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/25 text-left space-y-2">
                                 <p className="text-xs font-bold text-fantasy-gold uppercase tracking-wider">Benefício:</p>
                                 <p className="text-xs text-fantasy-wood dark:text-fantasy-parchment">
                                    {STANDARD_FURNITURES.find(f => f.name === itemName)?.benefit || "Benefício customizado a ser acordado com o Mestre."}
                                 </p>
                              </div>
                          )}

                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Valor da Peça (T$)</label>
                             <input 
                               type="number"
                               min="0"
                               className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl text-center" 
                               required 
                               value={itemCost} 
                               onChange={e => setItemCost(Number(e.target.value))}
                               onFocus={(e) => e.target.select()}
                             />
                          </div>
                          <div className="bg-black/5 dark:bg-black/20 p-6 md:p-8 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col gap-4">
                             <label className="flex items-center gap-4 cursor-pointer">
                                 <input type="radio" checked={costOption === 'pay'} onChange={() => setCostOption('pay')} className="accent-red-900 w-6 h-6 shrink-0" />
                                 <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 uppercase">Pagar à Mobília</span>
                             </label>
                             <label className="flex items-center gap-4 cursor-pointer">
                                 <input type="radio" checked={costOption === 'reward'} onChange={() => setCostOption('reward')} className="accent-red-900 w-6 h-6 shrink-0" />
                                 <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 uppercase">Presente / Achado (Grátis)</span>
                             </label>
                          </div>
                       </div>
                       <button type="submit" className="w-full bg-fantasy-gold text-black py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all">
                           Instalar Peça
                       </button>
                   </form>
                )}

                {modalMode === 'upgrade' && activeBase && (
                   <form onSubmit={(e) => { e.preventDefault(); const nextP = getNextUpgradePorte(); if(nextP) upgradeBase(activeBaseId, nextP, upgradeMethod, rollResult === '' ? undefined : Number(rollResult)); resetModal(); }} className="space-y-8 md:space-y-12">
                       <div className="flex flex-col items-center text-center">
                          <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><Hammer size={40}/></div>
                          <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Expansão Territorial</h3>
                          <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Cômodos Atuais: {activeBase.rooms.length}</p>
                       </div>
                       
                       {getNextUpgradePorte() === null ? (
                           <div className="p-8 text-center text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl uppercase tracking-wider">
                              Esta base já alcançou o porte supremo ({activeBase.porte})!
                           </div>
                       ) : (
                           <div className="space-y-6 md:space-y-8">
                              <div className="p-6 md:p-8 bg-black/5 dark:bg-black/25 rounded-[32px] md:rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 text-center">
                                 <p className="text-sm font-black text-fantasy-wood dark:text-fantasy-gold uppercase tracking-widest">Evolução</p>
                                 <p className="text-2xl md:text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mt-2">
                                     {activeBase.porte} &rarr; {getNextUpgradePorte()}
                                 </p>
                                 <p className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">
                                     Novos Slots: {PORTE_DATA[getNextUpgradePorte()!].slots} cômodos
                                 </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <label className="flex items-center gap-4 cursor-pointer group p-4 bg-black/5 dark:bg-black/25 rounded-2xl border border-fantasy-wood/10">
                                     <input type="radio" checked={upgradeMethod === 'roll'} onChange={() => setUpgradeMethod('roll')} className="accent-red-900 w-6 h-6 shrink-0" />
                                     <span className="text-xs font-black text-fantasy-wood/75 dark:text-fantasy-parchment/70 uppercase">Expansão Regular (T$ {getUpgradeCost()})</span>
                                 </label>
                                 <label className="flex items-center gap-4 cursor-pointer group p-4 bg-black/5 dark:bg-black/25 rounded-2xl border border-fantasy-wood/10">
                                     <input type="radio" checked={upgradeMethod === 'reward'} onChange={() => setUpgradeMethod('reward')} className="accent-red-900 w-6 h-6 shrink-0" />
                                     <span className="text-xs font-black text-fantasy-wood/75 dark:text-fantasy-parchment/70 uppercase">Upgrade por Evento (Grátis)</span>
                                 </label>
                              </div>

                              <div className="p-6 md:p-8 bg-blue-900/10 dark:bg-blue-400/5 rounded-[40px] border-4 border-blue-900/20 dark:border-blue-400/20 text-center">
                                 <p className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">Requisitos de Expansão</p>
                                 <p className="text-3xl md:text-4xl font-medieval text-blue-900 dark:text-blue-400 mt-2">
                                     CD: {20 + PORTE_DATA[getNextUpgradePorte()!].slots}
                                 </p>
                              </div>

                              {upgradeMethod === 'roll' && (
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Resultado do Teste (CD {20 + PORTE_DATA[getNextUpgradePorte()!].slots})</label>
                                     <input 
                                       type="number" 
                                       min="1" 
                                       className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl text-center" 
                                       required={upgradeMethod === 'roll'}
                                       value={rollResult} 
                                       onChange={e => setRollResult(e.target.value === '' ? '' : Number(e.target.value))} 
                                       placeholder="Resultado d20 + Nobreza" 
                                     />
                                  </div>
                              )}
                           </div>
                       )}

                       {getNextUpgradePorte() !== null && (
                           <button type="submit" className="w-full bg-blue-800 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-blue-950 active:translate-y-2 active:border-b-0 transition-all">
                               Finalizar Expansão
                           </button>
                       )}
                   </form>
                )}

                {modalMode === 'reform' && activeBase && (
                   <form onSubmit={(e) => { e.preventDefault(); reformBase(activeBaseId, newType, reformMethod, rollResult === '' ? undefined : Number(rollResult)); resetModal(); }} className="space-y-8 md:space-y-12">
                       <div className="flex flex-col items-center text-center">
                          <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><RotateCcw size={40}/></div>
                          <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Reforma da Sede</h3>
                          <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Altere a natureza principal da sua base.</p>
                       </div>
                       <div className="space-y-6 md:space-y-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Nova Natureza Desejada</label>
                             <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none cursor-pointer" value={newType} onChange={e => setNewType(e.target.value as BaseType)}>
                                 {Object.entries(TYPE_DATA).map(([k,v]) => <option key={k} value={k} className="dark:bg-black">{v.label}</option>)}
                             </select>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <label className="flex items-center gap-4 cursor-pointer group p-4 bg-black/5 dark:bg-black/25 rounded-2xl border border-fantasy-wood/10">
                                 <input type="radio" checked={reformMethod === 'roll'} onChange={() => setReformMethod('roll')} className="accent-red-900 w-6 h-6 shrink-0" />
                                 <span className="text-xs font-black text-fantasy-wood/75 dark:text-fantasy-parchment/70 uppercase">Reforma Regular (T$ {PORTE_DATA[activeBase.porte].cost / 2})</span>
                             </label>
                             <label className="flex items-center gap-4 cursor-pointer group p-4 bg-black/5 dark:bg-black/25 rounded-2xl border border-fantasy-wood/10">
                                 <input type="radio" checked={reformMethod === 'reward'} onChange={() => setReformMethod('reward')} className="accent-red-900 w-6 h-6 shrink-0" />
                                 <span className="text-xs font-black text-fantasy-wood/75 dark:text-fantasy-parchment/70 uppercase">Reforma por Evento (Grátis)</span>
                             </label>
                          </div>
                          
                          <div className="p-6 bg-blue-900/10 dark:bg-blue-400/5 rounded-[40px] border-4 border-blue-900/20 dark:border-blue-400/20 text-center">
                             <p className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">Dados da Reforma</p>
                             <p className="text-xl font-medieval text-blue-900 dark:text-blue-400 mt-2">
                                 Custo: T$ {reformMethod === 'roll' ? (PORTE_DATA[activeBase.porte].cost / 2) : 0} | CD do Teste: {20 + activeBase.rooms.length}
                             </p>
                          </div>
                          
                          {reformMethod === 'roll' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Resultado do Teste (CD {20 + activeBase.rooms.length})</label>
                                <input 
                                  type="number" 
                                  min="1" 
                                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl text-center" 
                                  required={reformMethod === 'roll'}
                                  value={rollResult} 
                                  onChange={e => setRollResult(e.target.value === '' ? '' : Number(e.target.value))} 
                                  placeholder="Resultado do teste Nobreza/Ofício/etc." 
                                />
                              </div>
                          )}
                       </div>
                       <button type="submit" className="w-full bg-blue-800 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-blue-950 active:translate-y-2 active:border-b-0 transition-all">
                           Executar Reforma
                       </button>
                   </form>
                )}

                 {modalMode === 'income' && (
                    <form onSubmit={(e) => { e.preventDefault(); collectBaseIncome(activeBaseId, incomeAmount); resetModal(); }} className="space-y-8 md:space-y-12">
                        <div className="flex flex-col items-center text-center">
                           <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><TrendingUp size={40}/></div>
                           <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Colheita de Lucros</h3>
                           <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Adicione os rendimentos do empreendimento ao cofre.</p>
                        </div>
                        <div className="space-y-6 md:space-y-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Valor Recebido (TO)</label>
                              <input 
                                type="number" 
                                min="0"
                                className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl text-center" 
                                required 
                                value={incomeAmount} 
                                onChange={e => setIncomeAmount(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                              />
                           </div>
                        </div>
                        <button type="submit" className="w-full bg-emerald-800 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-emerald-950 active:translate-y-2 active:border-b-0 transition-all">
                            Confirmar Recebimento
                        </button>
                    </form>
                 )}

                 {modalMode === 'createBusiness' && (
                    <form onSubmit={(e) => { e.preventDefault(); createBusiness(newName); resetModal(); }} className="space-y-8 md:space-y-12">
                        <div className="flex flex-col items-center text-center">
                           <div className="wax-seal w-20 h-20 md:w-28 md:h-28 mb-4 md:mb-8 flex items-center justify-center text-white shadow-2xl animate-float"><Store size={40}/></div>
                           <h3 className="text-3xl md:text-5xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Fundar Negócio</h3>
                           <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em] mt-2 md:mt-4">Inicie um empreendimento comercial.</p>
                        </div>
                        <div className="space-y-6 md:space-y-8">
                           <div className="space-y-3 text-center">
                              <label className="text-[10px] md:text-xs font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em]">Nome do Estabelecimento</label>
                              <input className="w-full bg-white/40 dark:bg-black/40 border-4 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] md:rounded-[40px] px-6 py-4 md:px-10 md:py-8 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl md:text-4xl text-center focus:outline-none focus:border-fantasy-gold shadow-inner" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Empório dos Ventos" />
                           </div>
                           <div className="bg-black/5 dark:bg-black/20 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 text-center space-y-2">
                              <p className="text-sm font-black text-fantasy-wood/70 uppercase tracking-widest">Investimento Inicial: T$ 1.000</p>
                              <p className="text-xs italic text-fantasy-wood/50 dark:text-fantasy-parchment/50">Regra: Teste Ofício/Nobreza CD 20. Negócio começa no nível 1.</p>
                           </div>
                           <div className="p-4 bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/10 text-left">
                              <p className="text-[10px] font-black text-fantasy-gold uppercase tracking-widest">Regras</p>
                              <ul className="mt-2 space-y-1 text-xs text-fantasy-wood/70 dark:text-fantasy-parchment/70">
                                <li>• O negócio começa no nível 1 (máx. {MAX_BUSINESS_LEVEL}).</li>
                                <li>• Renda mensal: T$ 100 × nível.</li>
                                <li>• Cada nível permite adquirir um novo ativo.</li>
                              </ul>
                           </div>
                        </div>
                        <button type="submit" className="w-full bg-amber-800 text-white py-6 md:py-10 rounded-[56px] font-medieval text-2xl md:text-3xl uppercase tracking-[0.3em] shadow-5xl border-b-8 border-amber-950 transition-all active:translate-y-2 active:border-b-0">
                            Estabelecer Negócio
                        </button>
                    </form>
                 )}

                 {modalMode === 'levelUpBusiness' && activeBase && activeBase.type === 'Negocio' && (
                    <form onSubmit={(e) => { e.preventDefault(); levelUpBusiness(activeBaseId); resetModal(); }} className="space-y-8 md:space-y-12">
                        <div className="flex flex-col items-center text-center">
                           <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><ArrowUp size={40}/></div>
                           <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Evoluir Negócio</h3>
                           <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">{activeBase.name} — Nv. {activeBase.businessLevel || 1}</p>
                        </div>
                        {(activeBase.businessLevel || 1) >= MAX_BUSINESS_LEVEL ? (
                          <div className="p-8 text-center text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl uppercase tracking-wider">Negócio já está no nível máximo!</div>
                        ) : (
                          <div className="space-y-6 md:space-y-8">
                            <div className="p-6 md:p-8 bg-black/5 dark:bg-black/25 rounded-[32px] md:rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 text-center">
                              <p className="text-sm font-black text-fantasy-wood dark:text-fantasy-gold uppercase tracking-widest">Próximo Nível</p>
                              <p className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mt-2">
                                {activeBase.businessLevel || 1} &rarr; {(activeBase.businessLevel || 1) + 1}
                              </p>
                              <p className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">
                                +1 slot de ativo disponível
                              </p>
                            </div>
                            <div className="p-6 bg-blue-900/10 dark:bg-blue-400/5 rounded-[40px] border-4 border-blue-900/20 dark:border-blue-400/20 text-center">
                              <p className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">Requisitos</p>
                              <p className="text-2xl font-medieval text-blue-900 dark:text-blue-400 mt-2">
                                T$ {BUSINESS_LEVELS[(activeBase.businessLevel || 1) + 1]?.cost || 0}
                              </p>
                              <p className="text-xs italic text-blue-900/60 dark:text-blue-400/60 mt-1">Regra: Teste Ofício/Nobreza CD {BUSINESS_LEVELS[(activeBase.businessLevel || 1) + 1]?.cd || 0}</p>
                            </div>
                          </div>
                        )}
                        {(activeBase.businessLevel || 1) < MAX_BUSINESS_LEVEL && (
                          <button type="submit" className="w-full bg-amber-700 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-amber-950 active:translate-y-2 active:border-b-0 transition-all">
                              Evoluir para Nível {(activeBase.businessLevel || 1) + 1}
                          </button>
                        )}
                    </form>
                 )}

                  {modalMode === 'addAsset' && activeBase && activeBase.type === 'Negocio' && (() => {
                    const bizLevel = activeBase.businessLevel || 1;
                    const bizCD = 20 + 2 * bizLevel;
                    return (
                    <form onSubmit={(e) => { e.preventDefault(); addBusinessAsset(activeBaseId, bizAssetName); resetModal(); }} className="space-y-8 md:space-y-12">
                        <div className="flex flex-col items-center text-center">
                           <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><Briefcase size={40}/></div>
                           <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Adquirir Ativo</h3>
                           <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">{activeBase.name} — Ativos: {(activeBase.businessAssetNames || []).length}/{bizLevel}</p>
                        </div>
                        <div className="space-y-6 md:space-y-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Selecione o Ativo</label>
                            <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={bizAssetName} onChange={e => setBizAssetName(e.target.value)}>
                              <option value="">Selecione um ativo...</option>
                              {BUSINESS_ASSETS.filter(a => {
                                const owned = activeBase.businessAssetNames || [];
                                if (a.levelReq && bizLevel < a.levelReq) return false;
                                if (owned.includes(a.name)) return false;
                                if (a.requires && a.requires.length > 0 && !a.requires.every(r => owned.includes(r))) return false;
                                return true;
                              }).map(a => (
                                <option key={a.name} value={a.name} className="dark:bg-black">{a.name} (T$ {a.cost})</option>
                              ))}
                            </select>
                          </div>
                          {bizAssetName && (() => {
                            const asset = BUSINESS_ASSETS.find(a => a.name === bizAssetName);
                            return asset ? (
                              <div className="p-4 bg-fantasy-gold/5 dark:bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/25 text-left space-y-2">
                                <p className="text-xs font-bold text-fantasy-wood/70 dark:text-fantasy-parchment/70">{asset.description}</p>
                                <p className="text-xs font-black text-fantasy-gold uppercase tracking-wider">Benefício: <span className="font-normal text-fantasy-wood dark:text-fantasy-parchment">{asset.benefit}</span></p>
                                <p className="text-xs text-fantasy-wood/50">Custo: T$ {asset.cost}</p>
                                {asset.requires && asset.requires.length > 0 && (
                                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Requer: {asset.requires.join(', ')}</p>
                                )}
                                <p className="text-[9px] italic text-fantasy-wood/40 dark:text-fantasy-parchment/40 mt-1">Regra: Teste Ofício/Nobreza CD {bizCD} (CD do negócio)</p>
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <button type="submit" disabled={!bizAssetName} className="w-full bg-emerald-700 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-emerald-950 active:translate-y-2 active:border-b-0 transition-all disabled:opacity-30">
                            Adquirir Ativo
                        </button>
                    </form>
                    );
                  })()}

                 {modalMode === 'collectBusinessIncome' && activeBase && activeBase.type === 'Negocio' && (() => {
                   const level = activeBase.businessLevel || 1;
                   const baseIncome = level * 100;
                   const rollVal = bizIncomeRoll === '' ? 0 : Number(bizIncomeRoll);
                   const rollIncome = rollVal * 10 * level;
                   const finalIncome = Math.max(baseIncome, rollIncome);

                   return (
                    <form onSubmit={(e) => { e.preventDefault(); collectBusinessIncome(activeBaseId, bizIncomeRoll === '' ? undefined : Number(bizIncomeRoll)); resetModal(); }} className="space-y-8 md:space-y-12">
                        <div className="flex flex-col items-center text-center">
                           <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><TrendingUp size={40}/></div>
                           <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Coletar Lucros</h3>
                           <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">{activeBase.name} — Nível {level}</p>
                        </div>
                        <div className="space-y-6 md:space-y-8">
                          <div className="p-6 md:p-8 bg-black/5 dark:bg-black/25 rounded-[36px] border-4 border-fantasy-wood/10 dark:border-white/10 text-center">
                            <p className="text-sm font-black text-fantasy-wood/70 uppercase tracking-widest">Renda Base</p>
                            <p className="text-4xl font-medieval text-emerald-600 dark:text-emerald-400 mt-2">T$ {baseIncome}</p>
                            <p className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">T$ 100 × nível</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Resultado do Teste de Nobreza (opcional)</label>
                            <input type="number" min="1" max="50" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl text-center" value={bizIncomeRoll} onChange={e => setBizIncomeRoll(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Resultado do d20" />
                            {rollVal > 0 && (
                              <p className="text-xs text-fantasy-wood/60 text-center mt-1">
                                Teste × 10 × nível = <strong className="text-fantasy-gold">T$ {rollIncome}</strong>
                                {rollIncome > baseIncome ? (
                                  <span className="text-emerald-600 dark:text-emerald-400"> (substitui a base)</span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400"> (menor que a base, usar base)</span>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="p-6 bg-emerald-900/10 dark:bg-emerald-400/5 rounded-[40px] border-4 border-emerald-900/20 dark:border-emerald-400/20 text-center">
                            <p className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest">Valor a Receber</p>
                            <p className="text-5xl font-medieval text-emerald-900 dark:text-emerald-400 mt-2">T$ {finalIncome}</p>
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-fantasy-gold text-black py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-[#8c7320] active:translate-y-2 active:border-b-0 transition-all">
                            Coletar Renda
                        </button>
                    </form>
                   );
                 })()}

                 {modalMode === 'bonuses' && activeBase && (
                    <div className="space-y-8">
                        <div className="text-center mb-6">
                           <h3 className="text-3xl font-medieval text-violet-900 dark:text-violet-400 uppercase tracking-tighter">Resumo de Bônus</h3>
                           <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Efeitos passivos fornecidos por esta base</p>
                        </div>
                        
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                           <div className="p-6 bg-fantasy-gold/10 border-2 border-fantasy-gold/20 rounded-3xl">
                              <h4 className="font-medieval text-xl text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2"><Info size={18}/> Bônus de Tipo</h4>
                              <ul className="space-y-2 text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                 <li>• {TYPE_DATA[activeBase.type].bonus}</li>
                              </ul>
                           </div>

                           {activeBase.gargulas && activeBase.gargulas > 0 && (
                              <div className="p-6 bg-stone-800/10 border-2 border-stone-800/20 rounded-3xl">
                                 <h4 className="font-medieval text-xl text-stone-800 dark:text-stone-400 mb-2 flex items-center gap-2"><ShieldCheck size={18}/> Gárgulas Animadas ({activeBase.gargulas})</h4>
                                 <ul className="space-y-2 text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                    <li>• +{activeBase.gargulas * 2} de Segurança</li>
                                 </ul>
                              </div>
                           )}

                           {activeBase.type === 'Negocio' && activeBase.businessAssetNames && activeBase.businessAssetNames.length > 0 && (
                              <div className="p-6 bg-amber-900/10 border-2 border-amber-900/20 rounded-3xl">
                                 <h4 className="font-medieval text-xl text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2"><Store size={18}/> Ativos do Negócio</h4>
                                 <div className="space-y-3 text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                    {activeBase.businessAssetNames.map(assetName => {
                                       const asset = BUSINESS_ASSETS.find(a => a.name === assetName);
                                       return (
                                         <div key={assetName} className="p-4 rounded-2xl border border-fantasy-wood/10 bg-white/30 dark:bg-black/20">
                                           <span className="font-medieval text-base text-fantasy-wood dark:text-fantasy-parchment">{assetName}</span>
                                           <p className="text-xs text-fantasy-wood/60 dark:text-fantasy-parchment/60 mt-1">{asset?.benefit || ""}</p>
                                         </div>
                                       );
                                    })}
                                 </div>
                              </div>
                           )}

                           <div className="p-6 bg-emerald-900/10 border-2 border-emerald-900/20 rounded-3xl">
                              <h4 className="font-medieval text-xl text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-2"><Bed size={18}/> Cômodos e Benefícios</h4>
                              <div className="space-y-3 text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                 {(activeBase.type !== 'Negocio' && activeBase.rooms.length === 0) ? (
                                    <p className="opacity-50">Nenhum cômodo construído.</p>
                                 ) : activeBase.type === 'Negocio' ? (
                                    <p className="opacity-50 italic">Negócios não possuem cômodos. Use ativos para expandir.</p>
                                 ) : (
                                    activeBase.rooms.map(room => {
                                       const stdRoom = STANDARD_ROOMS.find(r => r.name === room.name);
                                       return (
                                          <div key={room.id} className={`p-4 rounded-2xl border ${room.isDamaged ? 'border-red-600/30 bg-red-950/5 dark:bg-red-950/10' : 'border-fantasy-wood/10 bg-white/30 dark:bg-black/20'}`}>
                                             <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-medieval text-base ${room.isDamaged ? 'text-red-600 line-through' : 'text-fantasy-wood dark:text-fantasy-parchment'}`}>{room.name}</span>
                                                {room.isDamaged && <span className="text-[9px] font-black uppercase text-red-600 tracking-widest">(DANIFICADO)</span>}
                                             </div>
                                             <p className="text-xs font-serif italic text-fantasy-wood/60 dark:text-fantasy-parchment/60">
                                                {stdRoom?.benefit || "Benefício customizado — acordo com o Mestre."}
                                             </p>
                                             {room.furnitures.length > 0 && (
                                                <div className="mt-2 pl-4 border-l-2 border-fantasy-gold/30 space-y-1">
                                                   {room.furnitures.map(f => {
                                                      const stdFurn = STANDARD_FURNITURES.find(fu => fu.name === f.name);
                                                      return (
                                                         <div key={f.id} className="text-xs">
                                                            <span className="font-black text-fantasy-gold uppercase tracking-wider">{f.name}:</span>
                                                            <span className="text-fantasy-wood/60 dark:text-fantasy-parchment/60 italic"> {stdFurn?.benefit || "Benefício customizado."}</span>
                                                         </div>
                                                      );
                                                   })}
                                                </div>
                                             )}
                                          </div>
                                       );
                                    })
                                 )}
                              </div>
                           </div>
                        </div>
                    </div>
                 )}
             </div>
          </div>
       )}
     </div>
   );
 };

export default BasesPage;