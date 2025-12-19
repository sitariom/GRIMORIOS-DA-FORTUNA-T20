import React from 'react';
import { useGuild } from '../context/GuildContext';
import { RATES } from '../constants';
import { TrendingUp, Coins, Users, Scroll, LandPlot, Sword, Castle, Sparkles, Map as MapIcon, Shield } from 'lucide-react';
import { CurrencyType } from '../types';

const DashboardPage: React.FC = () => {
  const { wallet, domains, guildName, npcs, members } = useGuild();
  
  const totalTS = (wallet.TC * RATES.TC) + (wallet.TS * RATES.TS) + (wallet.TO * RATES.TO) + (wallet.LO * RATES.LO);
  const totalNPCCost = npcs.reduce((acc, n) => acc + n.monthlyCost, 0);

  return (
    <div className="space-y-10 pb-20 font-serif">
      {/* Hero Section - Redesigned for better mobile layout */}
      <div className="relative w-full rounded-[32px] md:rounded-[60px] overflow-hidden border-4 border-[#3d2b1f] shadow-2xl group isolate">
          {/* Background Layers */}
          <div className="absolute inset-0 bg-slate-950"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950/90 to-black"></div>
          
          {/* Animated Background Icon */}
          <div className="absolute -right-10 -bottom-20 opacity-10 text-fantasy-gold animate-spin-slow pointer-events-none">
             <Sparkles size={300}/>
          </div>

          <div className="relative p-8 md:p-14 flex flex-col justify-end min-h-[280px] md:min-h-[400px]">
            <div className="space-y-2">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-fantasy-gold/20 flex items-center justify-center border border-fantasy-gold/40 backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <Shield size={20} className="text-fantasy-gold" />
                  </div>
                  <span className="text-fantasy-gold/80 font-bold uppercase tracking-[0.3em] text-[10px] md:text-sm">
                    Registros Oficiais
                  </span>
               </div>
               
               <h2 className="text-fantasy-parchment/60 font-medieval text-xl md:text-3xl tracking-widest uppercase border-l-4 border-fantasy-gold/50 pl-4 py-1">
                 {guildName}
               </h2>
               
               <h1 className="text-4xl md:text-7xl font-medieval text-white tracking-tight leading-none drop-shadow-xl mt-4">
                 Grimório da <span className="text-transparent bg-clip-text bg-gradient-to-r from-fantasy-gold via-yellow-200 to-fantasy-gold">Fortuna</span>
               </h1>
            </div>
          </div>
      </div>

      {/* KPI Grid - Enhanced Parchment Look */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Cofre da Ordem', val: `T$ ${totalTS.toLocaleString()}`, icon: Coins, color: 'text-amber-900 dark:text-fantasy-gold', border: 'border-amber-900/30' },
          { label: 'Custo Mensal', val: `T$ ${totalNPCCost.toLocaleString()}`, icon: TrendingUp, color: 'text-red-900 dark:text-red-400', border: 'border-red-900/30' },
          { label: 'Domínios', val: domains.length, icon: MapIcon, color: 'text-indigo-900 dark:text-indigo-400', border: 'border-indigo-900/30' },
          { label: 'Membros & NPCs', val: members.length + npcs.length, icon: Users, color: 'text-emerald-900 dark:text-emerald-500', border: 'border-emerald-900/30' },
        ].map((kpi, i) => (
          <div key={i} className={`parchment-card p-6 md:p-8 rounded-[32px] animate-slide-up relative overflow-hidden group border-b-[6px] ${kpi.border}`} style={{ animationDelay: `${i * 100}ms` }}>
             {/* Decorative Corner */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="parchment-card p-8 md:p-10 rounded-[40px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10">
           <h3 className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment mb-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 pb-4 flex items-center gap-4">
             <div className="p-2 bg-fantasy-gold/20 rounded-lg"><Scroll size={24} className="text-fantasy-gold"/></div>
             Resumo do Tesouro
           </h3>
           <div className="space-y-6">
              {[
                { label: 'Tibares de Cobre', code: 'TC', val: wallet.TC, color: 'bg-orange-800' },
                { label: 'Tibares de Prata', code: 'TS', val: wallet.TS, color: 'bg-slate-500' },
                { label: 'Tibares de Ouro', code: 'TO', val: wallet.TO, color: 'bg-fantasy-gold' },
                { label: 'Lingotes de Ouro', code: 'LO', val: wallet.LO, color: 'bg-indigo-700' },
              ].map((coin, i) => {
                const coinValueInTS = coin.val * RATES[coin.code as CurrencyType];
                const percentage = totalTS > 0 ? Math.min(100, (coinValueInTS / totalTS) * 100) : 0;
                
                return (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-medieval text-lg text-fantasy-wood/80 dark:text-fantasy-parchment/80">{coin.label}</span>
                    <span className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold">{coin.val.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${coin.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-right text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-black mt-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      {percentage.toFixed(1)}% do Patrimônio
                  </div>
                </div>
              )})}
           </div>
        </div>

        <div className="parchment-card p-8 md:p-10 rounded-[40px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col">
           <h3 className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment mb-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 pb-4 flex items-center gap-4">
             <div className="p-2 bg-fantasy-gold/20 rounded-lg"><LandPlot size={24} className="text-fantasy-gold"/></div>
             Domínios Ativos
           </h3>
           <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
              {domains.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-fantasy-wood/30 dark:text-fantasy-parchment/20 italic">
                   <MapIcon size={64} className="mb-4 opacity-50"/>
                   <p className="font-medieval text-xl uppercase tracking-widest text-center">Nenhuma terra conquistada</p>
                </div>
              ) : (
                domains.map((d) => (
                  <div key={d.id} className="p-5 bg-white/40 dark:bg-black/30 rounded-[24px] border border-fantasy-wood/5 dark:border-white/5 hover:border-fantasy-gold/50 transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment group-hover:text-fantasy-gold transition-colors">{d.name}</span>
                       <span className="text-[10px] font-black bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black px-3 py-1 rounded-full uppercase tracking-widest">Nível {d.level}</span>
                    </div>
                    <div className="flex gap-4 text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/50 uppercase tracking-widest">
                       <div className="flex items-center gap-1.5"><Castle size={12}/> {d.buildings.length} Obras</div>
                       <div className="flex items-center gap-1.5"><Sword size={12}/> {d.units.length} Tropas</div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;