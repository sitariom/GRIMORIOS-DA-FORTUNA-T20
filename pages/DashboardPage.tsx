import React, { useMemo } from 'react';
import { useGuild } from '../context/GuildContext';
import { Link } from 'react-router-dom';
import { RATES, PORTE_DATA, ARTON_MONTHS, ARTON_WEEKDAYS } from '../constants';
import { DEFAULT_TIERS } from './ReputationPage';
import AnimatedCard from '../components/AnimatedCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  TrendingUp, Coins, Users, Scroll, LandPlot, Sword, Castle, Sparkles, Shield, 
  Activity, Home, Crown, Tent, User, Calendar, Plus, Hammer, Heart, 
  AlertTriangle, ChevronRight, Edit2, Package, Star, Clock
} from 'lucide-react';
import { CurrencyType, ReputationTier } from '../types';

const getBadgeStyle = (colorStyle: string) => {
  switch (colorStyle) {
    case 'text-red-700':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'text-orange-500':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'text-blue-500':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'text-emerald-500':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'text-purple-500':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'text-fantasy-gold':
      return 'bg-fantasy-gold/10 text-fantasy-gold border-fantasy-gold/20';
    case 'text-gray-500':
    case 'text-fantasy-wood':
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const getReputationData = (value: number, customTiers?: ReputationTier[]) => {
  const tiersToUse = customTiers && customTiers.length > 0 ? customTiers : DEFAULT_TIERS as ReputationTier[];
  const sortedTiers = [...tiersToUse].sort((a,b) => a.minPoints - b.minPoints);
  
  let currentTier = sortedTiers[0] || DEFAULT_TIERS[0];
  let accumulatedDescs: { name: string; desc: string; color: string }[] = [];

  for (const tier of sortedTiers) {
    if (value >= tier.minPoints && value <= tier.maxPoints) {
      currentTier = tier;
      break;
    }
  }
  if (value < (sortedTiers[0]?.minPoints || 0)) {
     currentTier = sortedTiers[0] || DEFAULT_TIERS[0];
  } else if (value > (sortedTiers[sortedTiers.length - 1]?.maxPoints || 0)) {
     currentTier = sortedTiers[sortedTiers.length - 1] || DEFAULT_TIERS[DEFAULT_TIERS.length - 1];
  }

  if (value >= 0) {
    const achieved = sortedTiers.filter(t => t.maxPoints >= 0 && t.minPoints <= value);
    accumulatedDescs = achieved.map(t => ({ name: t.name, desc: t.description, color: t.colorStyle }));
  } else {
    const achieved = sortedTiers.filter(t => t.maxPoints < 0 && t.maxPoints >= value).sort((a,b) => b.maxPoints - a.maxPoints);
    accumulatedDescs = achieved.map(t => ({ name: t.name, desc: t.description, color: t.colorStyle }));
  }

  return { name: currentTier.name, color: currentTier.colorStyle, accumulated: accumulatedDescs };
};

const DashboardPage: React.FC = () => {
  const { 
    wallet, domains, guildName, npcs, members, logs, bases, calendar, quests, pointsOfInterest, reputations,
    items, advanceDate, toggleNimbDay, isAdmin, isLoading
  } = useGuild();
  
  // 1. Cálculos Gerais
  const totalTS = (wallet.TC * RATES.TC) + (wallet.TS * RATES.TS) + (wallet.TO * RATES.TO) + (wallet.LO * RATES.LO);
  
  // Contar salário apenas para contratados ativos
  const totalNPCCost = npcs
    .filter(n => n.relationship === 'Contratado' && n.status === 'Ativo')
    .reduce((acc, n) => acc + (n.monthlyCost || 0), 0);

  // 2. Lógica do Gráfico de Fluxo de Caixa (Retroativo)
  const chartData = useMemo(() => {
    let currentWealth = totalTS; 
    const historyPoints: { date: string; value: number }[] = [];
    
    historyPoints.push({ date: 'Hoje', value: currentWealth });

    const financialLogs = logs
        .filter(l => l.value !== 0)
        .slice(0, 30);

    financialLogs.forEach(log => {
        currentWealth -= log.value; 
        if (currentWealth < 0) currentWealth = 0; 
        
        historyPoints.push({
            date: new Date(log.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
            value: currentWealth
        });
    });

    return historyPoints.reverse();
  }, [logs, totalTS]);

  // Normalização para SVG
  const minVal = Math.min(...chartData.map(d => d.value));
  const maxVal = Math.max(...chartData.map(d => d.value));
  const range = maxVal - minVal || 1; 

  const getX = (index: number) => (index / (chartData.length - 1)) * 100;
  const getY = (value: number) => 100 - ((value - minVal) / range) * 80 - 10; 

  const svgPoints = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const fillPath = `${svgPoints} 100,120 0,120`;

  // 3. Resumos & Previews de Outras Seções
  const activeQuests = useMemo(() => quests.filter(q => q.status === 'Em Andamento'), [quests]);
  const availableQuests = useMemo(() => quests.filter(q => q.status === 'Disponivel'), [quests]);

  const damagedRoomsCount = useMemo(() => bases.reduce((acc, b) => acc + b.rooms.filter(r => r.isDamaged).length, 0), [bases]);
  
  const domainsRemainingActions = useMemo(() => domains.reduce((acc, d) => acc + (d.actionsRemaining ?? (d.court === 'Rica' ? 3 : 2)), 0), [domains]);
  const domainsInRevolt = useMemo(() => domains.filter(d => d.revolt).length, [domains]);

  const contractedNPCs = useMemo(() => npcs.filter(n => n.relationship === 'Contratado'), [npcs]);
  const activeContractedNPCs = useMemo(() => contractedNPCs.filter(n => n.status === 'Ativo'), [npcs]);
  const alliesNPCs = useMemo(() => npcs.filter(n => n.relationship === 'Aliado' || n.relationship === 'Parceiro' || n.relationship === 'Recrutado'), [npcs]);

  const activeMembers = useMemo(() => members.filter(m => m.status === 'Ativo'), [members]);
  const acompanhandoNPCs = useMemo(() => npcs.filter(n => n.locationType === 'Membro'), [npcs]);

  const questItems = useMemo(() => (items || []).filter(item => item.isQuestItem), [items]);
  const totalItemsCount = useMemo(() => (items || []).reduce((acc, item) => acc + item.quantity, 0), [items]);
  const totalInventoryValue = useMemo(() => (items || []).reduce((acc, item) => acc + (item.value * item.quantity), 0), [items]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 font-serif">
      {/* Hero Section */}
      <div className="relative w-full rounded-[32px] md:rounded-[60px] overflow-hidden border-4 border-[#3d2b1f] shadow-2xl group isolate">
          <div className="absolute inset-0 bg-[#1a0f08]">
             <img 
               src="https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2544&auto=format&fit=crop" 
               alt="Fantasy Library Background" 
               className="w-full h-full object-cover opacity-60 mix-blend-luminosity md:mix-blend-normal hover:scale-105 transition-transform duration-[20s]"
             />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40"></div>
          <div className="absolute -right-10 -bottom-20 opacity-10 text-fantasy-gold animate-spin-slow pointer-events-none mix-blend-overlay">
             <Sparkles size={300}/>
          </div>

          <div className="relative p-8 md:p-14 flex flex-col justify-end min-h-[280px] md:min-h-[400px]">
            <div className="space-y-2">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-fantasy-gold/10 flex items-center justify-center border border-fantasy-gold/20 backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                    <Shield size={20} className="text-fantasy-gold" />
                  </div>
                  <span className="text-fantasy-gold/80 font-bold uppercase tracking-[0.3em] text-[10px] md:text-sm">
                    Relatório de Gestão Integrada
                  </span>
               </div>
               <h2 className="text-fantasy-parchment/80 font-medieval text-xl md:text-3xl tracking-widest uppercase border-l-4 border-fantasy-gold/50 pl-4 py-1 text-shadow-lg">
                 {guildName}
               </h2>
               <h1 className="text-4xl md:text-7xl font-medieval text-white tracking-tight leading-none drop-shadow-2xl mt-4">
                 Visão <span className="text-transparent bg-clip-text bg-gradient-to-r from-fantasy-gold via-yellow-200 to-fantasy-gold">Estratégica</span>
               </h1>
            </div>
          </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Cofre da Ordem', val: `T$ ${totalTS.toLocaleString()}`, icon: Coins, color: 'text-amber-900 dark:text-fantasy-gold', border: 'border-amber-900/30' },
          { label: 'Custos da Comitiva', val: `T$ ${totalNPCCost.toLocaleString()}`, icon: TrendingUp, color: 'text-red-900 dark:text-red-400', border: 'border-red-900/30' },
          { label: 'Dia da Campanha', val: `Dia ${calendar.day}`, icon: Calendar, color: 'text-indigo-900 dark:text-indigo-400', border: 'border-indigo-900/30' },
          { label: 'Missões Ativas', val: activeQuests.length, icon: Sword, color: 'text-emerald-900 dark:text-emerald-500', border: 'border-emerald-900/30' },
        ].map((kpi, i) => (
          <AnimatedCard key={i} delay={i * 100} className={`parchment-card p-6 md:p-8 rounded-[32px] relative overflow-hidden group border-b-[6px] ${kpi.border}`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <kpi.icon size={64} className="text-black dark:text-white"/>
             </div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl backdrop-blur-sm border border-black/5 dark:border-white/5">
                      <kpi.icon size={28} className={kpi.color}/>
                   </div>
                   <div className="wax-seal w-8 h-8 md:w-10 md:h-10 shadow-md"></div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-fantasy-wood/70 dark:text-fantasy-parchment/70">{kpi.label}</p>
                   <p className={`text-3xl md:text-4xl font-medieval ${kpi.color} drop-shadow-sm`}>{kpi.val}</p>
                </div>
              </div>
          </AnimatedCard>
         ))}
      </div>

      {/* SECTION: FLUXO DE CAIXA */}
      <div className="parchment-card p-8 md:p-10 rounded-[40px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10">
         <div className="flex justify-between items-center mb-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 pb-4">
             <h3 className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment flex items-center gap-4">
                <div className="p-2 bg-emerald-800/10 dark:bg-emerald-400/10 rounded-lg"><Activity size={24} className="text-emerald-800 dark:text-emerald-400"/></div>
                Fluxo de Caixa (Histórico)
             </h3>
             <div className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/60 dark:text-fantasy-parchment/60 hidden sm:block">
                 Últimas 30 Movimentações
             </div>
         </div>
         
         <div className="relative w-full h-64 md:h-80 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 rounded-3xl p-4 overflow-hidden border border-fantasy-wood/5 dark:border-white/5">
            {chartData.length > 1 ? (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" className="text-fantasy-wood/10 dark:text-white/10" strokeWidth="0.5" strokeDasharray="2"/>
                    <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-fantasy-wood/10 dark:text-white/10" strokeWidth="0.5" strokeDasharray="2"/>
                    <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" className="text-fantasy-wood/10 dark:text-white/10" strokeWidth="0.5" strokeDasharray="2"/>

                    <polygon points={fillPath} fill="url(#chartGradient)" />
                    <polyline fill="none" stroke="#d4af37" strokeWidth="1.5" points={svgPoints} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    {chartData.map((d, i) => (
                        <circle key={i} cx={getX(i)} cy={getY(d.value)} r="1.5" className="fill-fantasy-wood dark:fill-fantasy-parchment stroke-fantasy-gold" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    ))}
                </svg>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-fantasy-wood/30 dark:text-fantasy-parchment/30">
                    <Activity size={48} className="mb-2 opacity-50"/>
                    <span className="font-medieval text-xl">Dados insuficientes para projeção</span>
                </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-2">
                {chartData.filter((_, i) => i % Math.ceil(chartData.length/6) === 0).map((d, i) => (
                    <span key={i} className="text-[9px] font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase">{d.date}</span>
                ))}
            </div>
         </div>
      </div>

      {/* DASHBOARD INTEGRADO: CONTROLES E PREVIEWS */}
      <h3 className="font-medieval text-3xl md:text-4xl text-center text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter pt-8">
        Panorama da Guilda
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* COLUNA ESQUERDA: INFRAESTRUTURA, MISSÕES E TEMPO */}
          <div className="space-y-10">
              
              {/* 1. Calendário e Tempo (Interactive Card) */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <Calendar size={20} className="text-fantasy-gold" />
                          Calendário e Tempo
                      </h4>
                      <Link to="/calendar" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Ver Completo <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/10 dark:bg-black/35 p-4 rounded-2xl border border-fantasy-wood/5">
                          <div>
                              <span className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest block">Data Artoniana</span>
                              <span className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment leading-tight block">
                                  Dia {calendar.day} de {ARTON_MONTHS[calendar.month] || 'Mês'} de {calendar.year}
                              </span>
                              <span className="block text-xs font-serif text-fantasy-wood/60 dark:text-fantasy-parchment/65 mt-1">
                                  Dia da semana: {ARTON_WEEKDAYS[calendar.dayOfWeek] || 'Desconhecido'}
                              </span>
                          </div>
                          {calendar.isNimbDay && (
                              <span className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.25)]">
                                  🎲 Dia de Nimb
                              </span>
                          )}
                      </div>
                      {isAdmin ? (
                          <div className="flex gap-2">
                              <button 
                                  onClick={() => advanceDate(1)} 
                                  className="flex-1 py-3 bg-fantasy-gold hover:bg-yellow-500 text-black rounded-xl font-medieval text-xs uppercase tracking-wider font-bold shadow-md hover:scale-105 active:scale-95 transition-all border-b-2 border-yellow-800"
                              >
                                  Avançar Dia (+1 Dia)
                              </button>
                              <button 
                                  onClick={() => toggleNimbDay(!calendar.isNimbDay)} 
                                  className={`flex-1 py-3 rounded-xl font-medieval text-xs uppercase tracking-wider font-bold shadow-md hover:scale-105 active:scale-95 transition-all border-b-2 ${
                                      calendar.isNimbDay 
                                          ? 'bg-red-800 text-white border-red-950 hover:bg-red-700' 
                                          : 'bg-black/25 hover:bg-black/40 text-fantasy-gold border-fantasy-gold/20'
                                  }`}
                              >
                                  {calendar.isNimbDay ? 'Instabilizar Nimb' : 'Ativar Dia de Nimb'}
                              </button>
                          </div>
                      ) : (
                          <div className="flex items-center justify-center gap-2 py-3 bg-black/10 dark:bg-black/30 rounded-xl border border-dashed border-fantasy-gold/20 text-fantasy-gold/60 text-xs font-medium">
                              <Clock size={14} /> Apenas o administrador pode alterar o fluxo do tempo.
                          </div>
                      )}
                  </div>
              </div>

              {/* 2. Missões e Contratos */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <Sword size={20} className="text-fantasy-gold" />
                          Missões e Contratos
                      </h4>
                      <Link to="/quests" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Quadro de Missões <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Em Andamento</span>
                              <span className="font-medieval text-3xl text-fantasy-gold">{activeQuests.length}</span>
                          </div>
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Disponíveis</span>
                              <span className="font-medieval text-3xl text-fantasy-parchment">{availableQuests.length}</span>
                          </div>
                      </div>

                      <div className="space-y-2 mt-4">
                          <span className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest block ml-1">Últimas Missões Ativas</span>
                          {activeQuests.length === 0 ? (
                              <EmptyState icon={Sword} title="Nenhuma Missão" description="Nenhuma missão em andamento no momento." />
                          ) : (
                              <div className="space-y-2">
                                  {activeQuests.slice(0, 3).map(q => {
                                      const assignedMembers = members.filter(m => q.assignedMemberIds.includes(m.id));
                                      return (
                                          <div key={q.id} className="bg-black/10 dark:bg-black/35 border border-fantasy-wood/5 p-3.5 rounded-xl flex justify-between items-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                              <div>
                                                  <span className="font-medieval text-base text-fantasy-wood dark:text-fantasy-parchment block leading-none mb-1">{q.title}</span>
                                                  <span className="text-[9px] uppercase tracking-wider text-fantasy-gold">Recompensa: {q.rewardGold} {q.rewardCurrency}</span>
                                              </div>
                                              <div className="text-right">
                                                  <div className="flex gap-1">
                                                      {assignedMembers.length === 0 ? (
                                                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-[8px] font-black uppercase tracking-wider">Sem Heróis</span>
                                                      ) : (
                                                          assignedMembers.map(am => (
                                                              <span key={am.id} className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-md text-[8px] font-bold" title={am.name}>
                                                                  {am.name.split(' ')[0]}
                                                              </span>
                                                          ))
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      )
                                  })}
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* 3. Infraestrutura & Bases */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <Castle size={20} className="text-fantasy-gold" />
                          Infraestrutura & Bases
                      </h4>
                      <Link to="/bases" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Gerenciar Bases <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Bases Cadastradas</span>
                              <span className="font-medieval text-3xl text-fantasy-parchment">{bases.length}</span>
                          </div>
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Cômodos Danificados</span>
                              <span className={`font-medieval text-3xl ${damagedRoomsCount > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>{damagedRoomsCount}</span>
                          </div>
                      </div>

                      {bases.length === 0 ? (
                          <EmptyState icon={Castle} title="Nenhuma Base" description="Nenhuma base estabelecida pela guilda." />
                      ) : (
                          <div className="space-y-3 mt-4">
                              {bases.slice(0, 2).map(b => {
                                  const assignedNPCs = npcs.filter(n => n.locationId === b.id);
                                  const damagedRooms = b.rooms.filter(r => r.isDamaged);
                                  const meta = PORTE_DATA[b.porte] || { maintenance: 0 };
                                  return (
                                      <div key={b.id} className="bg-black/10 dark:bg-black/35 border border-fantasy-wood/5 p-4 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                          <div className="flex justify-between items-start mb-2">
                                              <div>
                                                  <span className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-gold block leading-none mb-1">{b.name}</span>
                                                  <span className="text-[8px] font-black uppercase bg-white/10 px-2 py-0.5 rounded text-fantasy-parchment/50 tracking-wider">{b.porte} ({b.type})</span>
                                              </div>
                                              {damagedRooms.length > 0 && (
                                                  <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 animate-pulse">
                                                      ⚠️ Reparo Exigido
                                                  </span>
                                              )}
                                          </div>
                                          <div className="text-xs font-serif text-fantasy-wood/80 dark:text-fantasy-parchment/80 flex justify-between mt-2">
                                              <span>Cômodos/Equipe:</span>
                                              <span>{b.rooms.length} cômodos | {assignedNPCs.length} NPCs alocados</span>
                                          </div>
                                          <div className="text-xs font-serif text-red-900/60 dark:text-red-400/60 flex justify-between mt-1 font-bold">
                                              <span>Manutenção Total:</span>
                                              <span>T$ {meta.maintenance + assignedNPCs.reduce((a, n) => a + n.monthlyCost, 0)}/mês</span>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      )}
                  </div>
              </div>

              {/* 4. Soberania e Domínios */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <Crown size={20} className="text-fantasy-gold" />
                          Soberania & Domínios
                      </h4>
                      <Link to="/domains" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Administrar Domínios <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Ações Disponíveis</span>
                              <span className={`font-medieval text-3xl ${domainsRemainingActions > 0 ? 'text-fantasy-gold animate-bounce' : 'text-fantasy-parchment/50'}`}>{domainsRemainingActions}</span>
                          </div>
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Em Revolta</span>
                              <span className={`font-medieval text-3xl ${domainsInRevolt > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>{domainsInRevolt}</span>
                          </div>
                      </div>

                      {domains.length === 0 ? (
                          <EmptyState icon={Crown} title="Nenhum Domínio" description="Nenhum domínio sob o controle da guilda." />
                      ) : (
                          <div className="space-y-3 mt-4">
                              {domains.slice(0, 2).map(d => {
                                  return (
                                      <div key={d.id} className="bg-black/10 dark:bg-black/35 border border-fantasy-wood/5 p-4 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                          <div className="flex justify-between items-start mb-2">
                                              <div>
                                                  <span className="font-medieval text-lg text-indigo-900 dark:text-indigo-400 block leading-none mb-1">{d.name}</span>
                                                  <span className="text-[8px] font-black uppercase bg-indigo-900/5 dark:bg-indigo-400/10 px-2 py-0.5 rounded text-indigo-900/60 dark:text-indigo-400/60 tracking-wider">Nível {d.level} ({d.terrain})</span>
                                              </div>
                                              <div className="flex gap-1">
                                                  {d.revolt && (
                                                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-[8px] font-black uppercase tracking-wider animate-pulse">Revolta</span>
                                                  )}
                                                  {(d.actionsRemaining ?? (d.court === 'Rica' ? 3 : 2)) > 0 && (
                                                      <span className="px-2 py-0.5 bg-fantasy-gold/15 text-fantasy-gold border border-fantasy-gold/30 rounded-md text-[8px] font-black uppercase tracking-wider animate-pulse">{d.actionsRemaining} Ações</span>
                                                  )}
                                              </div>
                                          </div>
                                          <div className="text-xs font-serif text-fantasy-wood/80 dark:text-fantasy-parchment/80 flex justify-between mt-2">
                                              <span>Tesouro (LO) / Modificadores:</span>
                                              <span>LO {d.treasury} | Modificador Ação: {d.actionModifier || 0}</span>
                                          </div>
                                          <div className="text-xs font-serif text-fantasy-wood/80 dark:text-fantasy-parchment/80 flex justify-between mt-1">
                                              <span>Obras / Tropas / Conselheiros:</span>
                                              <span>{d.buildings.length} Obras | {d.units.length} Tropas | {d.advisors.length} Conselheiros</span>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      )}
                  </div>
              </div>
          </div>
          
          {/* COLUNA DIREITA: MEMBROS, COMITIVA, ARSENAL E REPUTAÇÃO */}
          <div className="space-y-10">
              
              {/* 5. Aventureiros (Membros) */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <User size={20} className="text-fantasy-gold" />
                          Aventureiros (Membros)
                      </h4>
                      <Link to="/members" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Aventureiros <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-4">
                      {activeMembers.length === 0 ? (
                          <EmptyState icon={User} title={members.length === 0 ? 'Nenhum Aventureiro' : 'Nenhum Membro Ativo'} description={members.length === 0 ? 'Nenhum aventureiro cadastrado na guilda.' : 'Nenhum aventureiro ativo no momento.'} />
                      ) : (
                          <div className="space-y-3">
                              {activeMembers.map(m => {
                              const activeNpc = npcs.find(n => n.id === m.activeAffinityNpcId);
                              return (
                                  <div key={m.id} className="bg-black/10 dark:bg-black/35 border border-fantasy-wood/5 p-4 rounded-2xl flex flex-col justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                      <div className="flex justify-between items-center">
                                          <div>
                                              <span className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment block leading-none mb-1">{m.name}</span>
                                              <span className="text-[9px] uppercase tracking-wider opacity-60 font-serif">Status: {m.status}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <span className="px-2 py-0.5 bg-fantasy-gold/10 text-fantasy-gold border border-fantasy-gold/20 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                                  <Sparkles size={8}/> {m.divinePoints || 0} PD
                                              </span>
                                          </div>
                                      </div>
                                      {activeNpc && (
                                          <div className="mt-2.5 p-2 bg-fantasy-gold/5 border border-fantasy-gold/20 rounded-xl flex items-center gap-2 text-[10px]">
                                              <Crown size={12} className="text-fantasy-gold shrink-0"/>
                                              <span className="text-fantasy-wood/80 dark:text-fantasy-parchment/80 font-serif">
                                                  Afinidade Ativa: <strong>{activeNpc.name}</strong> ({activeNpc.allyType})
                                              </span>
                                          </div>
                                      )}
                                  </div>
                              )
                          })}
                      </div>
                      )}
                  </div>
              </div>

              {/* 6. Comitiva & Aliados (NPCs) */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <Tent size={20} className="text-fantasy-gold" />
                          Comitiva & Aliados
                      </h4>
                      <Link to="/npcs" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Aliados e Comitiva <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Aliados / Parceiros</span>
                              <span className="font-medieval text-3xl text-fantasy-parchment">{alliesNPCs.length}</span>
                          </div>
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Contratados Ativos</span>
                              <span className="font-medieval text-3xl text-fantasy-gold">{activeContractedNPCs.length}</span>
                          </div>
                      </div>

                      <div className="space-y-2 mt-4 border-t border-fantasy-wood/5 dark:border-white/5 pt-3">
                          <div className="flex justify-between text-xs font-serif text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                              <span>Manutenção Mensal (Equipe):</span>
                              <span className="font-bold text-red-900/60 dark:text-red-400/60">T$ {totalNPCCost}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest block ml-1 mt-4">Acompanhando o Grupo</span>
                          {acompanhandoNPCs.length === 0 ? (
                              <EmptyState icon={Tent} title="Nenhum Acompanhante" description="Nenhum NPC acompanhando o grupo atualmente." />
                          ) : (
                              <div className="space-y-2">
                                  {acompanhandoNPCs.map(n => (
                                      <div key={n.id} className="bg-black/10 dark:bg-black/35 border border-fantasy-wood/5 px-3.5 py-2 rounded-xl text-xs font-serif hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                          <span className="font-bold text-fantasy-wood/80 dark:text-fantasy-parchment/80 block leading-tight">{n.name}</span>
                                          <span className="text-[8px] uppercase font-serif tracking-wider opacity-60">{n.relationship} • {n.tier}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* 7. Arsenal e Riquezas (Inventory) */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <Package size={20} className="text-fantasy-gold" />
                          Arsenal & Riquezas
                      </h4>
                      <Link to="/inventory" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Acessar Arsenal <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Total de Itens</span>
                              <span className="font-medieval text-3xl text-fantasy-parchment">{totalItemsCount}</span>
                          </div>
                          <div className="bg-black/5 dark:bg-black/25 p-3 rounded-xl border border-fantasy-wood/5 text-center">
                              <span className="text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-wider block">Valor de Estoque</span>
                              <span className="font-medieval text-xl text-fantasy-gold mt-1.5 block">T$ {totalInventoryValue.toLocaleString('pt-BR')}</span>
                          </div>
                      </div>

                      <div className="space-y-2 mt-4">
                          <span className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest block ml-1">Itens de Missão Guardados</span>
                          {questItems.length === 0 ? (
                              <EmptyState icon={Package} title="Sem Itens de Missão" description="Sem itens de missão em estoque." />
                          ) : (
                              <div className="space-y-2">
                                  {questItems.slice(0, 2).map(item => (
                                      <div key={item.id} className="bg-black/10 dark:bg-black/35 border border-fantasy-wood/5 px-3 py-2 rounded-xl flex justify-between items-center text-xs hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                          <span className="font-serif font-bold text-fantasy-wood/80 dark:text-fantasy-parchment/80">{item.name}</span>
                                          <span className="px-2 py-0.5 bg-fantasy-gold/10 text-fantasy-gold border border-fantasy-gold/20 rounded-md text-[8px] font-black uppercase tracking-wider shrink-0">Qtd: {item.quantity}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* 8. Influência e Reputação */}
              <div className="parchment-card p-6 md:p-8 rounded-[32px] border-2 border-fantasy-gold/20 shadow-xl bg-white/5 dark:bg-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-fantasy-wood/10 dark:border-white/10 pb-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-wide">
                          <Scroll size={20} className="text-fantasy-gold" />
                          Influência & Reputação
                      </h4>
                      <Link to="/reputation" className="text-xs font-bold text-fantasy-gold hover:underline flex items-center gap-1">
                          Fações e POIs <ChevronRight size={14}/>
                      </Link>
                  </div>
                  <div className="space-y-4">
                      {pointsOfInterest.length === 0 ? (
                          <EmptyState icon={Scroll} title="Nenhum POI" description="Nenhum ponto de interesse cadastrado." />
                      ) : (
                          <div className="space-y-3">
                              {pointsOfInterest.slice(0, 3).map(poi => {
                                  const repEntry = reputations.find(r => r.pointOfInterestId === poi.id && r.targetType === 'Grupo');
                                  const repValue = repEntry ? repEntry.value : 0;
                                  const cat = getReputationData(repValue, poi.tiers);
                                  return (
                                      <div key={poi.id} className="bg-black/10 dark:bg-black/35 border border-fantasy-wood/5 p-4 rounded-2xl flex justify-between items-center text-xs hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                          <div>
                                              <span className="font-medieval text-base text-fantasy-wood dark:text-fantasy-parchment block leading-none mb-1">{poi.name}</span>
                                              <span className="text-[8px] uppercase tracking-wider opacity-60 font-serif">{poi.type}</span>
                                          </div>
                                          <div className="text-right flex flex-col items-end gap-1">
                                              <span className="font-medieval text-sm text-fantasy-gold">Pontos: {repValue}</span>
                                              <span className={`text-[8px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(cat.color)}`}>
                                                  {cat.name}
                                              </span>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;
