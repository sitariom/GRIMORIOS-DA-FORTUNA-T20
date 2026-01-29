
import React, { useMemo } from 'react';
import { useGuild } from '../context/GuildContext';
import { RATES, PORTE_DATA } from '../constants';
import { TrendingUp, Coins, Users, Scroll, LandPlot, Sword, Castle, Sparkles, Map as MapIcon, Shield, Activity, Home, Crown, Tent, User } from 'lucide-react';
import { CurrencyType } from '../types';

const DashboardPage: React.FC = () => {
  const { wallet, domains, guildName, npcs, members, logs, bases } = useGuild();
  
  // 1. Cálculos Gerais
  const totalTS = (wallet.TC * RATES.TC) + (wallet.TS * RATES.TS) + (wallet.TO * RATES.TO) + (wallet.LO * RATES.LO);
  const totalNPCCost = npcs.reduce((acc, n) => acc + n.monthlyCost, 0);

  // 2. Lógica do Gráfico de Fluxo de Caixa (Retroativo)
  const chartData = useMemo(() => {
    let currentWealth = totalTS; 
    const historyPoints: { date: string; value: number }[] = [];
    
    historyPoints.push({ date: 'Hoje', value: currentWealth });

    const financialLogs = logs
        .filter(l => l.value !== 0)
        .slice(0, 30); // Analisa os últimos 30 movimentos

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

  // 3. Agrupamento de Relações (The Ecosystem Logic)
  
  // Grupo A: Bases e seus habitantes
  const basesRelation = useMemo(() => bases.map(b => ({
      ...b,
      assignedNPCs: npcs.filter(n => n.locationId === b.id),
      meta: PORTE_DATA[b.porte]
  })), [bases, npcs]);

  // Grupo B: Domínios e seus habitantes
  const domainsRelation = useMemo(() => domains.map(d => ({
      ...d,
      assignedNPCs: npcs.filter(n => n.locationId === d.id)
  })), [domains, npcs]);

  // Grupo C: Comitiva (NPCs 'Grupo') e Aventureiros (Membros)
  const roamingNPCs = useMemo(() => npcs.filter(n => n.locationType === 'Grupo'), [npcs]);

  return (
    <div className="space-y-10 pb-20 font-serif">
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
          { label: 'Folha de Pagamento', val: `T$ ${totalNPCCost.toLocaleString()}`, icon: TrendingUp, color: 'text-red-900 dark:text-red-400', border: 'border-red-900/30' },
          { label: 'Domínios Reais', val: domains.length, icon: Crown, color: 'text-indigo-900 dark:text-indigo-400', border: 'border-indigo-900/30' },
          { label: 'População Ativa', val: members.length + npcs.length, icon: Users, color: 'text-emerald-900 dark:text-emerald-500', border: 'border-emerald-900/30' },
        ].map((kpi, i) => (
          <div key={i} className={`parchment-card p-6 md:p-8 rounded-[32px] animate-slide-up relative overflow-hidden group border-b-[6px] ${kpi.border}`} style={{ animationDelay: `${i * 100}ms` }}>
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
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-fantasy-wood/50 dark:text-fantasy-parchment/50">{kpi.label}</p>
                   <p className={`text-3xl md:text-4xl font-medieval ${kpi.color} drop-shadow-sm`}>{kpi.val}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* SECTION: FLUXO DE CAIXA */}
      <div className="parchment-card p-8 md:p-10 rounded-[40px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10">
         <div className="flex justify-between items-center mb-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 pb-4">
             <h3 className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment flex items-center gap-4">
                <div className="p-2 bg-emerald-800/10 dark:bg-emerald-400/10 rounded-lg"><Activity size={24} className="text-emerald-800 dark:text-emerald-400"/></div>
                Fluxo de Caixa (Histórico)
             </h3>
             <div className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/40 dark:text-fantasy-parchment/40 hidden sm:block">
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
                    <span key={i} className="text-[9px] font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase">{d.date}</span>
                ))}
            </div>
         </div>
      </div>

      {/* ECOLOGIA DA GUILDA: BASES, DOMINIOS, PESSOAL */}
      <h3 className="font-medieval text-3xl md:text-4xl text-center text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter pt-8">
        Mapeamento de Influência e Pessoal
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
          
          {/* COLUNA 1: INFRAESTRUTURA (BASES) */}
          <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                  <div className="p-2 bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black rounded-lg"><Castle size={20}/></div>
                  <h4 className="font-medieval text-xl uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment">Infraestrutura</h4>
              </div>
              
              {basesRelation.length === 0 && (
                  <div className="parchment-card p-8 rounded-3xl opacity-60 text-center text-sm italic">Nenhuma base estabelecida.</div>
              )}

              {basesRelation.map(b => (
                  <div key={b.id} className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-wood/10 dark:border-white/10 hover:border-fantasy-gold/50 transition-colors shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h5 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold">{b.name}</h5>
                              <span className="text-[9px] font-black uppercase bg-black/5 dark:bg-white/10 px-2 py-1 rounded text-fantasy-wood/60 dark:text-fantasy-parchment/60">{b.porte}</span>
                          </div>
                          <Home size={20} className="text-fantasy-wood/30 dark:text-fantasy-parchment/20"/>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest border-b border-fantasy-wood/5 pb-1">Equipe Alocada ({b.assignedNPCs.length})</div>
                          {b.assignedNPCs.length === 0 ? (
                              <p className="text-xs italic text-fantasy-wood/40 dark:text-fantasy-parchment/40">Instalação vazia.</p>
                          ) : (
                              <ul className="space-y-2">
                                  {b.assignedNPCs.map(npc => (
                                      <li key={npc.id} className="flex justify-between items-center text-xs">
                                          <span className="font-bold text-fantasy-wood/80 dark:text-fantasy-parchment/80">{npc.name}</span>
                                          <span className="text-[9px] uppercase tracking-wider opacity-60">{npc.role}</span>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-fantasy-wood/10 dark:border-white/5 flex justify-between text-xs font-bold text-red-900/60 dark:text-red-400/60">
                          <span>Manutenção:</span>
                          <span>T$ {b.meta.maintenance + b.assignedNPCs.reduce((a,n)=>a+n.monthlyCost,0)}</span>
                      </div>
                  </div>
              ))}
          </div>

          {/* COLUNA 2: SOBERANIA (DOMÍNIOS) */}
          <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                  <div className="p-2 bg-indigo-900 text-white rounded-lg"><Crown size={20}/></div>
                  <h4 className="font-medieval text-xl uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment">Soberania</h4>
              </div>

              {domainsRelation.length === 0 && (
                  <div className="parchment-card p-8 rounded-3xl opacity-60 text-center text-sm italic">Nenhum domínio reivindicado.</div>
              )}

              {domainsRelation.map(d => (
                  <div key={d.id} className="parchment-card p-6 rounded-[32px] border-2 border-indigo-900/10 dark:border-indigo-400/10 hover:border-indigo-500/50 transition-colors shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h5 className="font-medieval text-xl text-indigo-900 dark:text-indigo-400">{d.name}</h5>
                              <span className="text-[9px] font-black uppercase bg-indigo-900/5 dark:bg-indigo-400/10 px-2 py-1 rounded text-indigo-900/60 dark:text-indigo-400/60">Nível {d.level}</span>
                          </div>
                          <LandPlot size={20} className="text-indigo-900/30 dark:text-indigo-400/20"/>
                      </div>

                      <div className="space-y-3">
                          <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest border-b border-fantasy-wood/5 pb-1">Corte & Serviços ({d.assignedNPCs.length})</div>
                          {d.assignedNPCs.length === 0 ? (
                              <p className="text-xs italic text-fantasy-wood/40 dark:text-fantasy-parchment/40">Sem funcionários diretos.</p>
                          ) : (
                              <ul className="space-y-2">
                                  {d.assignedNPCs.map(npc => (
                                      <li key={npc.id} className="flex justify-between items-center text-xs">
                                          <span className="font-bold text-fantasy-wood/80 dark:text-fantasy-parchment/80">{npc.name}</span>
                                          <span className="text-[9px] uppercase tracking-wider opacity-60">{npc.role}</span>
                                      </li>
                                  ))}
                              </ul>
                          )}
                          <div className="pt-2 text-[10px] uppercase font-black text-fantasy-wood/50 flex gap-3">
                             <span className="flex items-center gap-1"><Castle size={10}/> {d.buildings.length} Obras</span>
                             <span className="flex items-center gap-1"><Sword size={10}/> {d.units.length} Tropas</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* COLUNA 3: PESSOAL & COMITIVA */}
          <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                  <div className="p-2 bg-emerald-800 text-white rounded-lg"><Users size={20}/></div>
                  <h4 className="font-medieval text-xl uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment">Pessoal Ativo</h4>
              </div>

              {/* Aventureiros */}
              <div className="parchment-card p-6 rounded-[32px] border-2 border-emerald-900/10 dark:border-emerald-400/10 shadow-lg">
                  <div className="flex items-center gap-2 mb-4 border-b border-fantasy-wood/10 pb-2">
                      <User size={16} className="text-emerald-800 dark:text-emerald-400"/>
                      <h5 className="font-medieval text-lg text-emerald-900 dark:text-emerald-400 uppercase">Aventureiros (Membros)</h5>
                  </div>
                  {members.length === 0 ? (
                      <p className="text-xs italic text-fantasy-wood/40">Nenhum herói registrado.</p>
                  ) : (
                      <div className="flex flex-wrap gap-2">
                          {members.map(m => (
                              <span key={m.id} className="px-3 py-1 bg-white/40 dark:bg-black/20 rounded-full text-xs font-bold text-fantasy-wood dark:text-fantasy-parchment border border-fantasy-wood/5">
                                  {m.name}
                              </span>
                          ))}
                      </div>
                  )}
              </div>

              {/* Comitiva / Parceiros */}
              <div className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-lg">
                  <div className="flex items-center gap-2 mb-4 border-b border-fantasy-wood/10 pb-2">
                      <Tent size={16} className="text-fantasy-wood dark:text-fantasy-parchment"/>
                      <h5 className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment uppercase">Comitiva & Aliados (Grupo)</h5>
                  </div>
                  {roamingNPCs.length === 0 ? (
                      <p className="text-xs italic text-fantasy-wood/40">Nenhum aliado viajando com o grupo.</p>
                  ) : (
                      <ul className="space-y-3">
                          {roamingNPCs.map(npc => (
                              <li key={npc.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                                  <div>
                                      <div className="text-xs font-bold text-fantasy-wood dark:text-fantasy-parchment">{npc.name}</div>
                                      <div className="text-[9px] uppercase tracking-widest opacity-60">{npc.role}</div>
                                  </div>
                                  <div className="text-xs font-mono font-bold text-red-900/60 dark:text-red-400/60">
                                      T$ {npc.monthlyCost}
                                  </div>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};

export default DashboardPage;
