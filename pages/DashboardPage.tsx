
import React, { useEffect, useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { RATES } from '../constants';
import { TrendingUp, Shield, Coins, Castle, Users, Scroll, LandPlot, Sword, Sparkles, BarChart3, Map as MapIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const DashboardPage: React.FC = () => {
  const { wallet, domains, guildName, npcs, members } = useGuild();
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    const generateHero = async () => {
      // Verificação de segurança: Se não houver API KEY, não tenta chamar o Google, evitando crash.
      if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
          console.warn("API Key não configurada. Usando fallback visual.");
          return; 
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `A majestic fantasy library filled with golden treasures and magical grimoires, high fantasy style, cinematic lighting, Arton RPG vibes.` }]
          },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        
        // Correção: Verificação segura para evitar erro TS18048 (Objeto possivelmente undefined)
        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                setHeroImage(`data:image/png;base64,${part.inlineData.data}`);
              }
            }
        }
      } catch (e) {
        console.error("Erro artístico ou chave inválida:", e);
        // Falha silenciosa para não quebrar a UI
      }
    };
    generateHero();
  }, [guildName]);

  const totalTS = (wallet.TC * RATES.TC) + (wallet.TS * RATES.TS) + (wallet.TO * RATES.TO) + (wallet.LO * RATES.LO);
  const totalNPCCost = npcs.reduce((acc, n) => acc + n.monthlyCost, 0);

  return (
    <div className="space-y-12 pb-20 font-serif">
      <div className="relative h-[250px] md:h-[400px] w-full rounded-[40px] md:rounded-[60px] overflow-hidden border-8 border-[#3d2b1f] shadow-2xl group">
        {heroImage ? (
          <img src={heroImage} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2000ms]" alt="Estandarte" />
        ) : (
          <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center overflow-hidden relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
             <Sparkles className="text-fantasy-gold animate-spin-slow" size={64}/>
             <span className="absolute bottom-4 right-8 text-[10px] text-white/20 uppercase tracking-widest font-black">AI Art Offline</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12">
          <div className="flex items-center gap-4 mb-4">
             <div className="wax-seal w-12 h-12 flex items-center justify-center"><BarChart3 size={24} className="text-white"/></div>
             <h2 className="text-fantasy-gold font-medieval text-xl md:text-2xl tracking-[0.2em] uppercase">Registros de {guildName}</h2>
          </div>
          <h1 className="text-4xl md:text-8xl font-medieval text-white text-glow-gold tracking-tight leading-none drop-shadow-2xl">
            Grimório da Fortuna
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Cofre da Ordem', val: `T$ ${totalTS.toLocaleString()}`, icon: Coins, color: 'text-fantasy-wood dark:text-fantasy-gold', bg: 'bg-fantasy-gold/20' },
          { label: 'Gasto de Pessoal', val: `T$ ${totalNPCCost.toLocaleString()}`, icon: TrendingUp, color: 'text-red-900 dark:text-red-500', bg: 'bg-red-900/10' },
          { label: 'Domínios', val: domains.length, icon: MapIcon, color: 'text-blue-900 dark:text-blue-400', bg: 'bg-blue-900/10' },
          { label: 'Especialistas', val: npcs.length, icon: Users, color: 'text-emerald-900 dark:text-emerald-500', bg: 'bg-emerald-900/10' },
        ].map((kpi, i) => (
          <div key={i} className="parchment-card p-8 md:p-10 rounded-[40px] animate-scroll-unroll shadow-2xl border-b-[10px] border-fantasy-wood/20 dark:border-fantasy-gold/20">
             <div className="flex justify-between items-center mb-6 md:mb-8">
                <div className={`p-5 ${kpi.bg} rounded-3xl ${kpi.color}`}><kpi.icon size={36}/></div>
                <div className="wax-seal w-10 h-10 md:w-12 md:h-12"></div>
             </div>
             <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-fantasy-wood/40 dark:text-fantasy-parchment/40 mb-2">{kpi.label}</div>
             <div className={`text-2xl md:text-4xl font-medieval ${kpi.color}`}>{kpi.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="parchment-card p-8 md:p-12 rounded-[60px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10">
           <h3 className="font-medieval text-2xl md:text-4xl text-fantasy-wood dark:text-fantasy-parchment mb-8 md:mb-12 border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6 md:pb-8 flex items-center gap-6">
             <Scroll size={32} className="text-fantasy-gold"/> Livro de Contas de Arton
           </h3>
           <div className="space-y-8 md:space-y-10">
              {[
                { label: 'Tibares de Cobre', val: wallet.TC, color: 'bg-orange-800' },
                { label: 'Tibares de Prata', val: wallet.TS, color: 'bg-slate-500' },
                { label: 'Tibares de Ouro', val: wallet.TO, color: 'bg-fantasy-gold' },
                { label: 'Lingotes de Ouro', val: wallet.LO, color: 'bg-indigo-700' },
              ].map((coin, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-3 md:mb-4">
                    <span className="font-medieval text-lg md:text-2xl text-fantasy-wood dark:text-fantasy-parchment">{coin.label}</span>
                    <span className="font-medieval text-xl md:text-3xl text-fantasy-wood dark:text-fantasy-gold">{coin.val.toLocaleString()}</span>
                  </div>
                  <div className="h-4 md:h-6 w-full bg-black/10 dark:bg-white/5 rounded-full border-2 border-fantasy-wood/10 dark:border-white/10 p-1 md:p-1.5 shadow-inner">
                    <div 
                      className={`h-full ${coin.color} rounded-full transition-all duration-1000 shadow-xl`}
                      style={{ width: `${Math.min(100, (coin.val / (totalTS || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="parchment-card p-8 md:p-12 rounded-[60px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col">
           <h3 className="font-medieval text-2xl md:text-4xl text-fantasy-wood dark:text-fantasy-parchment mb-8 md:mb-12 border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6 md:pb-8 flex items-center gap-6">
             <LandPlot size={32} className="text-fantasy-gold"/> Mapa de Domínios Reais
           </h3>
           <div className="flex-1 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar pr-2 md:pr-4 max-h-[500px]">
              {domains.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-fantasy-wood/20 dark:text-white/10 italic">
                   <MapIcon size={80} className="mb-6"/>
                   <p className="font-medieval text-xl md:text-3xl uppercase tracking-widest text-center">Terras Incógnitas...</p>
                </div>
              ) : (
                domains.map((d) => (
                  <div key={d.id} className="p-6 md:p-8 bg-white/40 dark:bg-black/40 rounded-[32px] border-l-[8px] md:border-l-[12px] border-fantasy-gold shadow-lg hover:bg-fantasy-gold/10 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
                       <span className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment">{d.name}</span>
                       <span className="text-[10px] md:text-xs font-black bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black px-4 py-1 md:px-5 md:py-2 rounded-full uppercase tracking-widest whitespace-nowrap">Nível {d.level}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-8 text-xs md:text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 uppercase tracking-widest">
                       <div className="flex items-center gap-2"><Castle size={16}/> {d.buildings.length} Obras</div>
                       <div className="flex items-center gap-2"><Sword size={16}/> {d.units.length} Tropas</div>
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
