
import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { LandPlot, Castle, Shield, Crown, Building2, Coins, Plus, Trash2, X, Zap, Gavel, ScrollText, Map as MapIcon, Settings, UserCircle, Type, ArrowLeftRight, TrendingUp, TrendingDown, Hammer, Swords, PenTool, Book } from 'lucide-react';
import { POPULARITY_LEVELS, TERRAIN_TYPES, COURT_DATA, CRISIS_EVENTS, DOMAIN_BUILDINGS_CATALOG, DOMAIN_UNITS_CATALOG } from '../constants';
import { GovernResult, PopularityType, CourtType } from '../types';

const DomainsPage: React.FC = () => {
  const { 
    domains, createDomain, updateDomain, investDomain, wallet,
    withdrawDomain, manageDomainTreasury, demolishDomain, governDomain, levelUpDomain,
    addDomainBuilding, removeDomainBuilding, addDomainUnit, removeDomainUnit, notify 
  } = useGuild();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [newRegent, setNewRegent] = useState('');
  const [newTerrain, setNewTerrain] = useState(TERRAIN_TYPES[0]);
  const [creationMethod, setCreationMethod] = useState<'create' | 'conquer'>('create');

  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'finance' | 'unit' | 'building' | 'govern' | 'crisis' | 'stats' | null>(null);
  const [subTab, setSubTab] = useState<'catalog' | 'custom'>('catalog'); // Novo estado para abas
  
  // Finance States
  const [transAmount, setTransAmount] = useState(0);
  const [financeTab, setFinanceTab] = useState<'transfer' | 'manage'>('transfer');
  const [transferType, setTransferType] = useState<'invest' | 'withdraw'>('invest');
  const [manageType, setManageType] = useState<'Income' | 'Expense'>('Income');
  const [transReason, setTransReason] = useState('');

  // Govern States
  const [governRoll, setGovernRoll] = useState(15);
  const [governResult, setGovernResult] = useState<GovernResult | null>(null);

  // Crisis States
  const [activeCrisis, setActiveCrisis] = useState<typeof CRISIS_EVENTS[0] | null>(null);

  // Manual Stats States
  const [editName, setEditName] = useState('');
  const [editRegent, setEditRegent] = useState('');
  const [editPopularity, setEditPopularity] = useState<PopularityType>('Tolerado');
  const [editFortification, setEditFortification] = useState(0);
  const [editCourt, setEditCourt] = useState<CourtType>('Inexistente');

  // Custom Building States
  const [customBuildName, setCustomBuildName] = useState('');
  const [customBuildDesc, setCustomBuildDesc] = useState('');
  const [customBuildCost, setCustomBuildCost] = useState(0);
  const [customBuildBenefit, setCustomBuildBenefit] = useState('');
  const [customBuildPaid, setCustomBuildPaid] = useState(true);

  // Custom Unit States
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitType, setCustomUnitType] = useState('');
  const [customUnitPower, setCustomUnitPower] = useState(1);
  const [customUnitCost, setCustomUnitCost] = useState(0);
  const [customUnitPaid, setCustomUnitPaid] = useState(true);


  const activeDomain = domains.find(d => d.id === activeDomainId);

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      createDomain(newDomainName, newRegent, newTerrain, creationMethod === 'create');
      setNewDomainName(''); setNewRegent(''); setShowAddModal(false);
  };

  const handleFinanceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!activeDomainId || transAmount <= 0) return;

      if (financeTab === 'transfer') {
        if(transferType === 'invest') investDomain(activeDomainId, transAmount);
        else withdrawDomain(activeDomainId, transAmount);
      } else {
        manageDomainTreasury(activeDomainId, transAmount, manageType, transReason || 'Ajuste Manual');
      }
      closeModal();
  };

  const handleCustomBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    addDomainBuilding(activeDomainId, {
        name: customBuildName,
        description: customBuildDesc,
        costLO: customBuildCost,
        benefit: customBuildBenefit
    }, customBuildPaid);
    closeModal();
  };

  const handleCustomUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    addDomainUnit(activeDomainId, {
        name: customUnitName,
        type: customUnitType,
        power: customUnitPower,
        costLO: customUnitCost
    }, customUnitPaid);
    closeModal();
  };

  const handleGovern = (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeDomainId) return;
      
      // Se já temos um resultado, o botão serve para fechar o modal
      if (governResult) {
          closeModal();
          return;
      }

      const res = governDomain(activeDomainId, governRoll);
      setGovernResult(res);
  };

  const handleUpdateStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    updateDomain(activeDomainId, {
      name: editName,
      regent: editRegent,
      popularity: editPopularity,
      fortification: editFortification,
      court: editCourt
    });
    notify("Estatutos Reais atualizados com sucesso.");
    closeModal();
  };

  const rollCrisis = () => {
    const event = CRISIS_EVENTS[Math.floor(Math.random() * CRISIS_EVENTS.length)];
    setActiveCrisis(event);
  };

  const applyCrisis = () => {
    if (!activeDomainId || !activeCrisis) return;
    const d = domains.find(x => x.id === activeDomainId);
    if (!d) return;

    if (activeCrisis.impact === 'popularity') {
        const idx = POPULARITY_LEVELS.indexOf(d.popularity);
        const newIdx = Math.max(0, Math.min(POPULARITY_LEVELS.length - 1, idx + activeCrisis.value));
        updateDomain(activeDomainId, { popularity: POPULARITY_LEVELS[newIdx] });
    } else if (activeCrisis.impact === 'treasury') {
        const currentT = d.treasury;
        const change = activeCrisis.value;
        let finalT = currentT + change;
        if (finalT < 0) finalT = 0; 
        updateDomain(activeDomainId, { treasury: finalT });
    } else if (activeCrisis.impact === 'fortification') {
        updateDomain(activeDomainId, { fortification: Math.max(0, d.fortification + activeCrisis.value) });
    }
    notify(`Destino selado: ${activeCrisis.name}`);
    closeModal();
  };

  const openStatsModal = (d: any) => {
    setActiveDomainId(d.id);
    setEditName(d.name);
    setEditRegent(d.regent);
    setEditPopularity(d.popularity);
    setEditFortification(d.fortification);
    setEditCourt(d.court);
    setModalMode('stats');
  };

  const closeModal = () => {
    setActiveDomainId(null); setModalMode(null); setTransAmount(0); setTransReason('');
    setGovernResult(null); setGovernRoll(15); setActiveCrisis(null); setSubTab('catalog');
    
    // Reset Custom Forms
    setCustomBuildName(''); setCustomBuildDesc(''); setCustomBuildCost(0); setCustomBuildBenefit(''); setCustomBuildPaid(true);
    setCustomUnitName(''); setCustomUnitType(''); setCustomUnitPower(1); setCustomUnitCost(0); setCustomUnitPaid(true);
  };

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-6xl font-medieval text-white tracking-tighter uppercase leading-none mb-3">Domínios Reais</h2>
          <p className="text-lg text-fantasy-gold font-bold uppercase tracking-[0.3em]">Gestão de Territórios, Tropas e Regência.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-fantasy-blood hover:bg-red-700 text-white px-12 py-6 rounded-[32px] flex items-center gap-4 font-medieval uppercase tracking-widest shadow-2xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
           <LandPlot size={28} /> Conquistar Terras
        </button>
      </header>

      <div className="space-y-16">
          {domains.length === 0 && (
            <div className="parchment-card p-36 rounded-[80px] border-4 border-dashed border-fantasy-wood/20 dark:border-white/10 text-center opacity-70">
               <MapIcon size={100} className="mx-auto mb-10 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
               <p className="font-medieval text-4xl text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-[0.2em] italic">Terras incógnitas aguardam seu herdeiro...</p>
            </div>
          )}
          {domains.map((d, idx) => {
             const courtInfo = COURT_DATA[d.court];
             const power = d.units.reduce((acc, u) => acc + u.power, 0);

             return (
              <div key={d.id} className="parchment-card rounded-[60px] border-4 border-fantasy-wood/20 dark:border-fantasy-gold/20 shadow-5xl overflow-hidden animate-slide-up group" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="bg-fantasy-wood/5 dark:bg-black/20 p-12 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex flex-wrap justify-between items-center gap-10 relative">
                      <div className="flex items-center gap-8">
                          <div className="wax-seal w-24 h-24 flex items-center justify-center animate-float">
                             <Crown size={48} className="text-white"/>
                          </div>
                          <div>
                            <h3 className="text-5xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter mb-3">{d.name}</h3>
                            <div className="flex flex-wrap gap-4">
                               <span className="text-xs font-black bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black px-6 py-2 rounded-full uppercase tracking-widest">Nível {d.level}</span>
                               <span className="text-xs font-black bg-blue-900/10 dark:bg-blue-400/10 text-blue-900 dark:text-blue-400 border border-blue-900/20 dark:border-blue-400/20 px-6 py-2 rounded-full uppercase tracking-widest">{d.terrain}</span>
                               <span className="text-sm font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase tracking-widest italic flex items-center gap-2"><Castle size={18}/> Regência: {d.regent}</span>
                            </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-8 bg-white/40 dark:bg-black/40 px-12 py-8 rounded-[48px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-inner">
                          <div className="text-right">
                              <span className="text-xs text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em] block font-black mb-1">Tesouro Real</span>
                              <span className="text-5xl font-medieval text-fantasy-wood dark:text-fantasy-gold tracking-tight">{d.treasury.toLocaleString()} <span className="text-2xl text-fantasy-gold">LO</span></span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setActiveDomainId(d.id); setModalMode('finance'); }} className="bg-fantasy-wood dark:bg-fantasy-gold hover:bg-black dark:hover:bg-fantasy-gold/80 p-6 rounded-3xl text-fantasy-gold dark:text-black shadow-2xl transition-all active:scale-95">
                              <Coins size={32} />
                            </button>
                            <button onClick={() => openStatsModal(d)} className="bg-white/10 dark:bg-white/5 hover:bg-white/20 p-6 rounded-3xl text-fantasy-wood dark:text-fantasy-parchment shadow-2xl transition-all active:scale-95 border border-fantasy-wood/10 dark:border-white/10">
                              <Settings size={32} />
                            </button>
                          </div>
                      </div>

                      <button onClick={() => { if(confirm("Deseja mesmo abandonar este território?")) demolishDomain(d.id); }} className="absolute top-8 right-8 text-fantasy-wood/10 dark:text-white/10 hover:text-red-900 transition-colors">
                        <Trash2 size={28}/>
                      </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x-2 divide-fantasy-wood/10 dark:divide-white/10">
                      <div className="p-12 space-y-10">
                          <h4 className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-[0.5em] flex items-center gap-4"><ScrollText size={24}/> Tratado Territorial</h4>
                          <div className="space-y-8">
                              <div className="bg-white/30 dark:bg-black/20 p-6 rounded-[32px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-sm">
                                <span className="text-xs text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-black uppercase block mb-2 tracking-widest">Popularidade</span>
                                <span className="text-2xl font-medieval text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">{d.popularity}</span>
                              </div>
                              <div className="bg-white/30 dark:bg-black/20 p-6 rounded-[32px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-sm">
                                <span className="text-xs text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-black uppercase block mb-2 tracking-widest">Fortificação</span>
                                <span className="text-2xl font-medieval text-blue-900 dark:text-blue-400 uppercase tracking-tight">{d.fortification} Pontos</span>
                              </div>
                              <div className="bg-fantasy-wood dark:bg-black/60 text-fantasy-parchment p-8 rounded-[36px] shadow-2xl border-b-4 border-black transition-colors">
                                <div className="flex justify-between font-medieval mb-3 text-lg uppercase tracking-widest">
                                    <span>Corte {d.court}</span>
                                    <span className="text-red-400">-{courtInfo.maintenance} LO</span>
                                </div>
                                <p className="text-xs text-white/50 dark:text-fantasy-parchment/40 uppercase font-bold tracking-widest leading-relaxed italic">"{courtInfo.bonus}"</p>
                              </div>
                          </div>
                          <div className="space-y-4 pt-8">
                              <button onClick={() => { setActiveDomainId(d.id); setModalMode('govern'); }} className="w-full bg-emerald-800 text-white py-6 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-2xl border-b-8 border-emerald-950 active:translate-y-1 transition-all flex items-center justify-center gap-4"><Gavel size={24}/> Governar</button>
                              <button onClick={() => { setActiveDomainId(d.id); setModalMode('crisis'); }} className="w-full bg-orange-800 text-white py-6 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-2xl border-b-8 border-orange-950 active:translate-y-1 transition-all flex items-center justify-center gap-4"><Zap size={24}/> Evento Súbito</button>
                              <button disabled={d.level >= 7} onClick={() => levelUpDomain(d.id)} className="w-full bg-black/10 hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/10 text-fantasy-wood dark:text-fantasy-parchment py-5 rounded-[32px] font-medieval uppercase tracking-widest flex flex-col items-center transition-all disabled:opacity-20 border-2 border-fantasy-wood/10 dark:border-white/10">
                                <span className="text-sm">Expandir Fronteiras</span>
                                <span className="text-[10px] font-black opacity-60">Custo: {d.level * 20} Lingotes</span>
                              </button>
                          </div>
                      </div>

                      <div className="p-12 lg:col-span-2 space-y-8 bg-white/10 dark:bg-black/10">
                          <div className="flex justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6">
                             <div>
                                <h4 className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-[0.5em] flex items-center gap-4"><Building2 size={24}/> Infraestrutura do Domínio</h4>
                                <p className="text-xs text-fantasy-wood/70 dark:text-fantasy-parchment/60 mt-2 uppercase font-black tracking-widest">Vagas Reais Ocupadas: {d.buildings.length} de {d.level}</p>
                             </div>
                             <button disabled={d.buildings.length >= d.level} onClick={() => { setActiveDomainId(d.id); setModalMode('building'); }} className="bg-indigo-900 dark:bg-indigo-600 hover:bg-indigo-800 text-white p-4 rounded-3xl shadow-2xl transition-all disabled:opacity-20"><Plus size={32}/></button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                              {d.buildings.map((b) => (
                                  <div key={b.id} className="bg-white/50 dark:bg-white/5 border-2 border-fantasy-wood/10 dark:border-white/10 p-8 rounded-[40px] relative group/item hover:border-fantasy-gold/60 transition-all shadow-md">
                                      <div className="font-medieval text-3xl text-fantasy-wood dark:text-fantasy-parchment uppercase leading-none mb-3 pr-8">{b.name}</div>
                                      <p className="text-xs text-blue-900 dark:text-blue-400 font-black uppercase tracking-widest leading-relaxed italic">{b.benefit}</p>
                                      <button onClick={() => removeDomainBuilding(d.id, b.id)} className="absolute top-6 right-6 text-fantasy-wood/10 dark:text-white/10 hover:text-red-900 transition-colors opacity-0 group-hover/item:opacity-100"><X size={24}/></button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="p-12 space-y-8">
                           <div className="flex justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6">
                             <div>
                                <h4 className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-[0.5em] flex items-center gap-4"><Shield size={24}/> Legiões</h4>
                                <p className="text-xs text-red-950 dark:text-red-400 font-black uppercase mt-2 tracking-widest">Poder Bélico: {power} PWR</p>
                             </div>
                             <button onClick={() => { setActiveDomainId(d.id); setModalMode('unit'); }} className="bg-red-950 dark:bg-red-700 hover:bg-red-900 text-white p-4 rounded-3xl shadow-2xl transition-all"><Plus size={32}/></button>
                          </div>
                          <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                              {d.units.map((u) => (
                                  <div key={u.id} className="bg-red-950/5 dark:bg-white/5 border-l-[12px] border-red-950 dark:border-red-700 p-6 rounded-[28px] flex justify-between items-center group/unit shadow-sm">
                                      <div>
                                          <div className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment uppercase truncate max-w-[140px] leading-none mb-1">{u.name}</div>
                                          <div className="text-[10px] text-red-950 dark:text-red-400 font-black uppercase tracking-widest">PWR {u.power} • {u.type}</div>
                                      </div>
                                      <button onClick={() => removeDomainUnit(d.id, u.id)} className="text-fantasy-wood/10 dark:text-white/10 hover:text-red-900 transition-colors opacity-0 group-hover/unit:opacity-100"><Trash2 size={24}/></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )})}
      </div>

      {(activeDomainId || showAddModal) && (
          <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
             <div className="parchment-card p-14 rounded-[80px] w-full max-w-3xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => {setShowAddModal(false); closeModal();}} className="absolute top-12 right-12 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-4 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={32}/></button>
                
                {/* ... (Modais anteriores mantidos) ... */}
                {showAddModal && (
                   <form onSubmit={handleCreate} className="space-y-12">
                        <div className="flex flex-col items-center text-center mb-12">
                           <div className="wax-seal w-28 h-28 flex items-center justify-center mb-8 animate-float shadow-2xl"><LandPlot size={60} className="text-white"/></div>
                           <h3 className="text-6xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Decreto de Conquista</h3>
                        </div>
                        <div className="space-y-4 text-center">
                            <label className="text-xs font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em]">Título Sagrado do Território</label>
                            <input className="w-full bg-white/40 dark:bg-black/40 border-4 border-fantasy-wood/10 dark:border-white/10 rounded-[40px] px-10 py-8 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-4xl text-center focus:outline-none focus:border-fantasy-gold shadow-inner" required value={newDomainName} onChange={e => setNewDomainName(e.target.value)} placeholder="Grão-Ducado de..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Regente Designado</label>
                                <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl shadow-inner" required value={newRegent} onChange={e => setNewRegent(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Ecossistema do Reino</label>
                                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl appearance-none cursor-pointer" value={newTerrain} onChange={e => setNewTerrain(e.target.value)}>
                                    {TERRAIN_TYPES.map(t => <option key={t} value={t} className="dark:bg-black">{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="bg-black/5 dark:bg-black/20 p-10 rounded-[48px] border-4 border-fantasy-wood/10 dark:border-white/10 space-y-6">
                             <label className="flex items-center gap-6 cursor-pointer group">
                                 <input type="radio" checked={creationMethod === 'create'} onChange={() => setCreationMethod('create')} className="accent-red-900 w-8 h-8" />
                                 <span className="text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-[0.2em]">Investimento de Fundação (T$ 5.000)</span>
                             </label>
                             <label className="flex items-center gap-6 cursor-pointer group">
                                 <input type="radio" checked={creationMethod === 'conquer'} onChange={() => setCreationMethod('conquer')} className="accent-red-900 w-8 h-8" />
                                 <span className="text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-[0.2em]">Conquista por Direito de Guerra (Grátis)</span>
                             </label>
                        </div>
                        <button type="submit" className="w-full bg-fantasy-blood text-white py-10 rounded-[56px] font-medieval text-3xl uppercase tracking-[0.3em] shadow-5xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
                            Proclamar Domínio
                        </button>
                    </form>
                )}

                {modalMode === 'finance' && (
                  <form onSubmit={handleFinanceSubmit} className="space-y-12">
                      <div className="flex flex-col items-center text-center">
                         <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white shadow-xl"><Coins size={40}/></div>
                         <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Tesouro Real</h3>
                         <p className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Saldo Atual: {activeDomain?.treasury} LO</p>
                      </div>
                      <div className="flex gap-4 p-2 bg-black/5 dark:bg-white/5 rounded-3xl">
                         <button type="button" onClick={() => setFinanceTab('transfer')} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${financeTab === 'transfer' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>Transferência Guilda</button>
                         <button type="button" onClick={() => setFinanceTab('manage')} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${financeTab === 'manage' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>Gestão Manual (Mestre)</button>
                      </div>
                      {financeTab === 'transfer' ? (
                        <div className="space-y-8 animate-fade-in">
                           <div className="flex gap-4">
                              <button type="button" onClick={() => setTransferType('invest')} className={`flex-1 py-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${transferType === 'invest' ? 'border-emerald-700 bg-emerald-700/10 text-emerald-800 dark:text-emerald-400' : 'border-transparent bg-black/5 dark:bg-white/5 opacity-60'}`}>
                                 <ArrowLeftRight size={24}/> <span className="font-medieval text-xl">Investir</span> <span className="text-[10px] uppercase font-black">Cofre &rarr; Domínio</span>
                              </button>
                              <button type="button" onClick={() => setTransferType('withdraw')} className={`flex-1 py-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${transferType === 'withdraw' ? 'border-blue-700 bg-blue-700/10 text-blue-800 dark:text-blue-400' : 'border-transparent bg-black/5 dark:bg-white/5 opacity-60'}`}>
                                 <ArrowLeftRight size={24}/> <span className="font-medieval text-xl">Sacar</span> <span className="text-[10px] uppercase font-black">Domínio &rarr; Cofre</span>
                              </button>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Quantidade (LO)</label>
                               <input type="number" min="1" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-4xl text-center shadow-inner" required value={transAmount} onChange={e => setTransAmount(Number(e.target.value))} />
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-8 animate-fade-in">
                           <div className="flex gap-4">
                              <button type="button" onClick={() => setManageType('Income')} className={`flex-1 py-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${manageType === 'Income' ? 'border-emerald-700 bg-emerald-700/10 text-emerald-800 dark:text-emerald-400' : 'border-transparent bg-black/5 dark:bg-white/5 opacity-60'}`}>
                                 <TrendingUp size={24}/> <span className="font-medieval text-xl">Adicionar</span>
                              </button>
                              <button type="button" onClick={() => setManageType('Expense')} className={`flex-1 py-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${manageType === 'Expense' ? 'border-red-700 bg-red-700/10 text-red-800 dark:text-red-400' : 'border-transparent bg-black/5 dark:bg-white/5 opacity-60'}`}>
                                 <TrendingDown size={24}/> <span className="font-medieval text-xl">Remover</span>
                              </button>
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Quantidade</label>
                                 <input type="number" min="1" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl text-center shadow-inner" required value={transAmount} onChange={e => setTransAmount(Number(e.target.value))} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Motivo</label>
                                 <input type="text" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" placeholder="Ex: Multa Imperial" value={transReason} onChange={e => setTransReason(e.target.value)} />
                              </div>
                           </div>
                        </div>
                      )}
                      <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold dark:text-black text-fantasy-gold py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-black dark:border-red-950 active:translate-y-1 transition-all">
                          Confirmar Transação
                      </button>
                  </form>
                )}

                {modalMode === 'building' && (
                  <div className="space-y-10">
                      <div className="flex flex-col items-center text-center">
                         <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white shadow-xl"><Hammer size={40}/></div>
                         <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Obras e Infraestrutura</h3>
                         <p className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Vagas: {activeDomain?.buildings.length} / {activeDomain?.level}</p>
                      </div>

                      <div className="flex gap-4 p-2 bg-black/5 dark:bg-white/5 rounded-3xl mb-4">
                         <button type="button" onClick={() => setSubTab('catalog')} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${subTab === 'catalog' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>
                             <Book size={16}/> Catálogo Oficial
                         </button>
                         <button type="button" onClick={() => setSubTab('custom')} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${subTab === 'custom' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>
                             <PenTool size={16}/> Projeto Personalizado
                         </button>
                      </div>

                      {subTab === 'catalog' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 animate-fade-in">
                             {DOMAIN_BUILDINGS_CATALOG.map((b, i) => {
                               const canAfford = activeDomain ? activeDomain.treasury >= b.costLO : false;
                               const hasSpace = activeDomain ? activeDomain.buildings.length < activeDomain.level : false;
                               const disabled = !canAfford || !hasSpace;
                               return (
                                 <button key={i} disabled={disabled} onClick={() => { addDomainBuilding(activeDomainId!, b, true); closeModal(); }} className="text-left bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 p-6 rounded-[24px] hover:bg-fantasy-gold/20 hover:border-fantasy-gold transition-all disabled:opacity-40 disabled:grayscale relative group">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment uppercase">{b.name}</span>
                                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${canAfford ? 'bg-emerald-800/20 text-emerald-800 dark:text-emerald-400' : 'bg-red-800/20 text-red-800 dark:text-red-400'}`}>{b.costLO} LO</span>
                                    </div>
                                    <p className="text-[10px] text-fantasy-wood/70 dark:text-fantasy-parchment/60 font-serif italic mb-2 leading-tight">{b.description}</p>
                                    <p className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">{b.benefit}</p>
                                    {!hasSpace && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity font-black text-white uppercase tracking-widest">Sem Espaço</div>}
                                 </button>
                               )
                             })}
                          </div>
                      ) : (
                          <form onSubmit={handleCustomBuildingSubmit} className="space-y-6 animate-fade-in">
                               <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome da Obra</label>
                                       <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customBuildName} onChange={e => setCustomBuildName(e.target.value)} />
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo (LO)</label>
                                       <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customBuildCost} onChange={e => setCustomBuildCost(Number(e.target.value))} />
                                   </div>
                               </div>
                               <div className="space-y-2">
                                   <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Descrição Temática</label>
                                   <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customBuildDesc} onChange={e => setCustomBuildDesc(e.target.value)} placeholder="Ex: Uma torre de obsidiana..." />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Benefício Mecânico</label>
                                   <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customBuildBenefit} onChange={e => setCustomBuildBenefit(e.target.value)} placeholder="Ex: +2 em Guerra" />
                               </div>
                               <div className="flex gap-6 p-4 bg-black/5 dark:bg-black/20 rounded-[32px] border border-fantasy-wood/10 dark:border-white/10">
                                   <label className="flex items-center gap-4 cursor-pointer">
                                       <input type="radio" checked={customBuildPaid} onChange={() => setCustomBuildPaid(true)} className="accent-red-900 w-5 h-5" />
                                       <span className="text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60">Pagar com Tesouro</span>
                                   </label>
                                   <label className="flex items-center gap-4 cursor-pointer">
                                       <input type="radio" checked={!customBuildPaid} onChange={() => setCustomBuildPaid(false)} className="accent-red-900 w-5 h-5" />
                                       <span className="text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60">Obra Gratuita / Evento</span>
                                   </label>
                               </div>
                               <button disabled={!activeDomain || (activeDomain.buildings.length >= activeDomain.level)} type="submit" className="w-full bg-indigo-800 text-white py-6 rounded-[32px] font-medieval text-xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-indigo-950 active:translate-y-1 active:border-b-0 disabled:opacity-50">
                                   {(!activeDomain || activeDomain.buildings.length < activeDomain.level) ? 'Erguer Construção' : 'Sem Espaço no Domínio'}
                               </button>
                          </form>
                      )}
                  </div>
                )}

                {modalMode === 'unit' && (
                  <div className="space-y-10">
                      <div className="flex flex-col items-center text-center">
                         <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white shadow-xl"><Swords size={40}/></div>
                         <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Alistamento Militar</h3>
                         <p className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Saldo Real: {activeDomain?.treasury} LO</p>
                      </div>

                      <div className="flex gap-4 p-2 bg-black/5 dark:bg-white/5 rounded-3xl mb-4">
                         <button type="button" onClick={() => setSubTab('catalog')} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${subTab === 'catalog' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>
                             <Book size={16}/> Tropas Padrão
                         </button>
                         <button type="button" onClick={() => setSubTab('custom')} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${subTab === 'custom' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>
                             <PenTool size={16}/> Mercenários / Especiais
                         </button>
                      </div>

                      {subTab === 'catalog' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 animate-fade-in">
                             {DOMAIN_UNITS_CATALOG.map((u, i) => {
                               const canAfford = activeDomain ? activeDomain.treasury >= u.costLO : false;
                               return (
                                 <button key={i} disabled={!canAfford} onClick={() => { addDomainUnit(activeDomainId!, u, true); closeModal(); }} className="text-left bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 p-6 rounded-[24px] hover:bg-red-900/10 hover:border-red-900 transition-all disabled:opacity-40 disabled:grayscale relative">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment uppercase">{u.name}</span>
                                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${canAfford ? 'bg-emerald-800/20 text-emerald-800 dark:text-emerald-400' : 'bg-red-800/20 text-red-800 dark:text-red-400'}`}>{u.costLO} LO</span>
                                    </div>
                                    <p className="text-[10px] text-fantasy-wood/70 dark:text-fantasy-parchment/60 font-black uppercase tracking-widest mb-1">{u.type}</p>
                                    <p className="text-sm font-medieval text-red-900 dark:text-red-400 uppercase">Poder: {u.power}</p>
                                 </button>
                               )
                             })}
                          </div>
                      ) : (
                          <form onSubmit={handleCustomUnitSubmit} className="space-y-6 animate-fade-in">
                               <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome da Unidade</label>
                                       <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customUnitName} onChange={e => setCustomUnitName(e.target.value)} />
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Tipo (Ex: Infantaria)</label>
                                       <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customUnitType} onChange={e => setCustomUnitType(e.target.value)} />
                                   </div>
                               </div>
                               <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Poder Bélico</label>
                                       <input type="number" min="1" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customUnitPower} onChange={e => setCustomUnitPower(Number(e.target.value))} />
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo (LO)</label>
                                       <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" required value={customUnitCost} onChange={e => setCustomUnitCost(Number(e.target.value))} />
                                   </div>
                               </div>
                               <div className="flex gap-6 p-4 bg-black/5 dark:bg-black/20 rounded-[32px] border border-fantasy-wood/10 dark:border-white/10">
                                   <label className="flex items-center gap-4 cursor-pointer">
                                       <input type="radio" checked={customUnitPaid} onChange={() => setCustomUnitPaid(true)} className="accent-red-900 w-5 h-5" />
                                       <span className="text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60">Pagar com Tesouro</span>
                                   </label>
                                   <label className="flex items-center gap-4 cursor-pointer">
                                       <input type="radio" checked={!customUnitPaid} onChange={() => setCustomUnitPaid(false)} className="accent-red-900 w-5 h-5" />
                                       <span className="text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60">Alistamento Gratuito</span>
                                   </label>
                               </div>
                               <button type="submit" className="w-full bg-red-800 text-white py-6 rounded-[32px] font-medieval text-xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-red-950 active:translate-y-1 active:border-b-0">
                                   Recrutar Unidade
                               </button>
                          </form>
                      )}
                  </div>
                )}
                
                {modalMode === 'crisis' && (
                    <div className="space-y-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="wax-seal w-28 h-28 mb-8 flex items-center justify-center text-white bg-gradient-to-br from-purple-900 to-indigo-900 shadow-xl animate-pulse"><Zap size={48}/></div>
                            <h3 className="text-5xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Evento Súbito</h3>
                        </div>

                        {!activeCrisis ? (
                             <button onClick={rollCrisis} className="w-full bg-indigo-900 text-white py-12 rounded-[48px] font-medieval text-4xl uppercase tracking-[0.2em] shadow-5xl border-b-8 border-indigo-950 active:translate-y-2 active:border-b-0 transition-all hover:bg-indigo-800">
                                 Consultar os Astros
                             </button>
                        ) : (
                             <div className="animate-bounce-in space-y-8">
                                 <div className="p-10 bg-black/5 dark:bg-white/5 rounded-[48px] border-4 border-fantasy-wood/20 dark:border-white/10">
                                     <h4 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase mb-4">{activeCrisis.name}</h4>
                                     <p className="font-serif text-xl italic text-fantasy-wood/80 dark:text-fantasy-parchment/80 mb-8">"{activeCrisis.details}"</p>
                                     <div className="inline-block px-8 py-3 bg-white/50 dark:bg-black/50 rounded-full border-2 border-fantasy-wood/10 dark:border-white/10">
                                         <span className="font-black uppercase tracking-widest text-xs text-fantasy-wood/60 dark:text-fantasy-parchment/60">Impacto: </span>
                                         <span className="font-medieval text-xl text-red-800 dark:text-red-400 ml-2">
                                            {activeCrisis.value > 0 ? '+' : ''}{activeCrisis.value} {activeCrisis.impact === 'treasury' ? 'LO' : activeCrisis.impact === 'popularity' ? 'Popularidade' : 'Fortificação'}
                                         </span>
                                     </div>
                                 </div>
                                 <button onClick={applyCrisis} className="w-full bg-fantasy-wood dark:bg-fantasy-parchment text-fantasy-parchment dark:text-black py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105">
                                     Aceitar Destino
                                 </button>
                             </div>
                        )}
                    </div>
                )}
                
                {modalMode === 'stats' && (
                  <form onSubmit={handleUpdateStats} className="space-y-12">
                       <div className="flex flex-col items-center text-center">
                          <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white shadow-xl"><Settings size={40}/></div>
                          <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Estatutos do Domínio</h3>
                          <p className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Ajuste manual das crônicas reais.</p>
                       </div>
                       
                       <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Título do Território</label>
                                  <div className="relative">
                                    <Type size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-fantasy-wood/30" />
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] pl-14 pr-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" value={editName} onChange={e => setEditName(e.target.value)} />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Regente Atual</label>
                                  <div className="relative">
                                    <UserCircle size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-fantasy-wood/30" />
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] pl-14 pr-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" value={editRegent} onChange={e => setEditRegent(e.target.value)} />
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Popularidade</label>
                                  <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none" value={editPopularity} onChange={e => setEditPopularity(e.target.value as PopularityType)}>
                                      {POPULARITY_LEVELS.map(p => <option key={p} value={p} className="dark:bg-black">{p}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Fortificação</label>
                                  <input type="number" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl" value={editFortification} onChange={e => setEditFortification(Number(e.target.value))} />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Nível de Corte</label>
                                  <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none" value={editCourt} onChange={e => setEditCourt(e.target.value as CourtType)}>
                                      {Object.keys(COURT_DATA).map(c => <option key={c} value={c} className="dark:bg-black">{c}</option>)}
                                  </select>
                              </div>
                          </div>
                       </div>

                       <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold dark:text-black text-fantasy-gold py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-black dark:border-red-950 active:translate-y-1 transition-all">
                           Publicar Decreto Real
                       </button>
                  </form>
                )}
             </div>
          </div>
      )}
    </div>
  );
};

export default DomainsPage;
