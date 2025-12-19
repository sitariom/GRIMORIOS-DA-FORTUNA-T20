import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { LandPlot, Castle, Shield, Crown, Building2, Coins, Plus, Trash2, X, Zap, Gavel, Map as MapIcon, Settings, UserCircle, Swords, TrendingUp, TrendingDown, Dices, ArrowLeftRight } from 'lucide-react';
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
  const [modalMode, setModalMode] = useState<'finance' | 'unit' | 'building' | 'govern' | 'crisis' | 'stats' | 'levelup' | null>(null);
  const [subTab, setSubTab] = useState<'catalog' | 'custom'>('catalog');
  
  // Finance States
  const [transAmount, setTransAmount] = useState(0);
  const [financeTab, setFinanceTab] = useState<'transfer' | 'manage'>('transfer');
  const [transferType, setTransferType] = useState<'invest' | 'withdraw'>('invest');
  const [manageType, setManageType] = useState<'Income' | 'Expense'>('Income');
  const [transReason, setTransReason] = useState('');

  // Govern States
  const [governRoll, setGovernRoll] = useState(10);
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
        let finalT = Math.max(0, currentT + change); // Prevent negative treasury
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
    setGovernResult(null); setGovernRoll(10); setActiveCrisis(null); setSubTab('catalog');
    
    setCustomBuildName(''); setCustomBuildDesc(''); setCustomBuildCost(0); setCustomBuildBenefit(''); setCustomBuildPaid(true);
    setCustomUnitName(''); setCustomUnitType(''); setCustomUnitPower(1); setCustomUnitCost(0); setCustomUnitPaid(true);
  };

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-medieval text-white tracking-tighter uppercase leading-none mb-3">Domínios Reais</h2>
          <p className="text-xs md:text-lg text-fantasy-gold font-bold uppercase tracking-[0.3em]">Gestão de Territórios, Tropas e Regência.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full lg:w-auto bg-fantasy-blood hover:bg-red-700 text-white px-8 md:px-12 py-4 md:py-6 rounded-[32px] flex items-center justify-center gap-4 font-medieval uppercase tracking-widest shadow-2xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
           <LandPlot size={28} /> Conquistar Terras
        </button>
      </header>

      <div className="grid grid-cols-1 gap-12">
          {domains.length === 0 ? (
             <div className="parchment-card p-24 md:p-36 rounded-[60px] border-4 border-dashed border-fantasy-wood/10 dark:border-white/10 text-center opacity-60">
                <MapIcon size={80} className="mx-auto mb-10 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
                <p className="font-medieval text-3xl md:text-4xl uppercase tracking-widest italic text-fantasy-wood dark:text-fantasy-parchment">O mapa está em branco...</p>
             </div>
          ) : (
             domains.map((domain, idx) => {
                const totalMaint = COURT_DATA[domain.court].maintenance + domain.units.length; // Estimativa visual
                return (
                <div key={domain.id} className="parchment-card rounded-[60px] shadow-5xl overflow-hidden border-4 border-fantasy-gold/20 animate-slide-up" style={{ animationDelay: `${idx*100}ms` }}>
                    {/* Header */}
                    <div className="bg-fantasy-wood/10 dark:bg-black/20 p-8 md:p-12 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                       <div className="flex items-center gap-6 md:gap-8">
                          <div className="wax-seal w-20 h-20 md:w-28 md:h-28 flex items-center justify-center animate-float shrink-0 bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-950">
                             <Crown size={40} className="text-fantasy-gold"/>
                          </div>
                          <div>
                             <h3 className="text-3xl md:text-5xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter mb-2 leading-none">{domain.name}</h3>
                             <p className={`text-xs md:text-sm font-black uppercase tracking-[0.3em] ${!domain.regent.trim() ? 'text-red-600 dark:text-red-400' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>Regente: {domain.regent || 'VACANTE (Penalidade -5)'}</p>
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          <button onClick={() => { setActiveDomainId(domain.id); setModalMode('finance'); }} className="px-6 py-3 rounded-2xl bg-fantasy-gold/10 text-fantasy-gold border border-fantasy-gold/30 hover:bg-fantasy-gold/20 font-medieval uppercase tracking-widest text-sm flex items-center gap-2 transition-all">
                             <Coins size={18}/> Tesouro
                          </button>
                          <button onClick={() => { setActiveDomainId(domain.id); setModalMode('govern'); }} className="px-6 py-3 rounded-2xl bg-indigo-900/10 text-indigo-900 dark:text-indigo-400 border border-indigo-900/20 dark:border-indigo-400/20 hover:bg-indigo-900/20 font-medieval uppercase tracking-widest text-sm flex items-center gap-2 transition-all">
                             <Gavel size={18}/> Governar
                          </button>
                          <button onClick={() => { setActiveDomainId(domain.id); setModalMode('crisis'); }} className="px-6 py-3 rounded-2xl bg-red-900/10 text-red-900 dark:text-red-400 border border-red-900/20 dark:border-red-400/20 hover:bg-red-900/20 font-medieval uppercase tracking-widest text-sm flex items-center gap-2 transition-all">
                             <Zap size={18}/> Crise
                          </button>
                          <button onClick={() => openStatsModal(domain)} className="px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 text-fantasy-wood dark:text-fantasy-parchment hover:bg-black/10 transition-all">
                             <Settings size={20}/>
                          </button>
                          <button onClick={() => { if(confirm("Abandonar este domínio?")) demolishDomain(domain.id); }} className="px-4 py-3 rounded-2xl bg-red-800/10 text-red-800 dark:text-red-400 hover:bg-red-800/20 transition-all">
                             <Trash2 size={20}/>
                          </button>
                       </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 border-b-2 border-fantasy-wood/10 dark:border-white/10 divide-x-2 divide-y lg:divide-y-0 divide-fantasy-wood/10 dark:divide-white/10">
                        {[
                          { label: 'Nível de Poder', val: domain.level, sub: 'Tier', icon: Castle },
                          { label: 'Tesouro Real', val: `${domain.treasury} LO`, sub: 'Riqueza', icon: Coins },
                          { label: 'Custo de Corte', val: `${totalMaint} LO`, sub: 'Manutenção', icon: TrendingDown },
                          { label: 'Popularidade', val: domain.popularity, sub: 'Moral', icon: UserCircle },
                          { label: 'Fortificação', val: domain.fortification, sub: 'Defesa', icon: Shield },
                        ].map((stat, i) => (
                           <div key={i} className="p-8 text-center hover:bg-fantasy-gold/5 transition-colors group">
                              <stat.icon size={24} className="mx-auto mb-4 text-fantasy-wood/30 dark:text-fantasy-parchment/20 group-hover:text-fantasy-gold transition-colors"/>
                              <div className="text-xl md:text-2xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-1">{stat.val}</div>
                              <div className="text-[9px] md:text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">{stat.label}</div>
                           </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 grid grid-cols-1 xl:grid-cols-2 gap-12">
                       {/* Buildings */}
                       <div className="space-y-8">
                          <div className="flex justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6">
                             <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tight flex items-center gap-3"><Building2 size={24}/> Infraestrutura</h4>
                             <button onClick={() => { setActiveDomainId(domain.id); setModalMode('building'); }} className="p-3 bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black rounded-full hover:scale-110 transition-transform shadow-lg"><Plus size={16}/></button>
                          </div>
                          <div className="space-y-4">
                             {domain.buildings.length === 0 && <p className="text-center py-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 italic font-serif">Nenhuma construção erguida.</p>}
                             {domain.buildings.map(b => (
                                <div key={b.id} className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-fantasy-wood/5 dark:border-white/5 flex justify-between items-center group hover:border-fantasy-gold/30 transition-all">
                                   <div>
                                      <div className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment">{b.name}</div>
                                      <div className="text-xs text-fantasy-wood/60 dark:text-fantasy-parchment/60 italic">{b.benefit}</div>
                                   </div>
                                   <button onClick={() => removeDomainBuilding(domain.id, b.id)} className="text-fantasy-wood/20 hover:text-red-800 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={18}/></button>
                                </div>
                             ))}
                          </div>
                          {domain.level < 7 && (
                              <button onClick={() => { setActiveDomainId(domain.id); setModalMode('levelup'); }} className="w-full py-4 border-2 border-dashed border-fantasy-wood/20 dark:border-white/10 rounded-3xl text-xs font-black uppercase tracking-widest text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-fantasy-gold/10 hover:border-fantasy-gold/40 hover:text-fantasy-gold transition-all">
                                 Expandir Fronteiras (Custo: {domain.level * 20} LO)
                              </button>
                          )}
                       </div>

                       {/* Units */}
                       <div className="space-y-8">
                          <div className="flex justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6">
                             <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tight flex items-center gap-3"><Swords size={24}/> Poder Militar</h4>
                             <button onClick={() => { setActiveDomainId(domain.id); setModalMode('unit'); }} className="p-3 bg-indigo-900 dark:bg-indigo-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"><Plus size={16}/></button>
                          </div>
                          <div className="space-y-4">
                             {domain.units.length === 0 && <p className="text-center py-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 italic font-serif">Nenhuma tropa alistada.</p>}
                             {domain.units.map(u => (
                                <div key={u.id} className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-fantasy-wood/5 dark:border-white/5 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                                   <div>
                                      <div className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment">{u.name}</div>
                                      <div className="text-xs font-black uppercase text-indigo-800 dark:text-indigo-400 tracking-widest">{u.type} • PWR {u.power} • Custo 1 LO</div>
                                   </div>
                                   <button onClick={() => removeDomainUnit(domain.id, u.id)} className="text-fantasy-wood/20 hover:text-red-800 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={18}/></button>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                </div>
             )})
          )}
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
         <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
             <div className="parchment-card p-6 md:p-12 rounded-[40px] md:rounded-[56px] w-full max-w-lg border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-2 md:p-3 bg-white/20 dark:bg-black/20 rounded-full"><X size={28}/></button>
                 
                 <div className="text-center mb-10">
                    <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 flex items-center justify-center text-white"><LandPlot size={40}/></div>
                    <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Carta de Domínio</h3>
                 </div>

                 <form onSubmit={handleCreate} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Território</label>
                        <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl focus:outline-none shadow-inner" required value={newDomainName} onChange={e => setNewDomainName(e.target.value)} placeholder="Condado de..." />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Regente Designado</label>
                        <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl focus:outline-none shadow-inner" required value={newRegent} onChange={e => setNewRegent(e.target.value)} placeholder="Lorde/Lady..." />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Terreno Predominante</label>
                        <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={newTerrain} onChange={e => setNewTerrain(e.target.value)}>
                            {TERRAIN_TYPES.map(t => <option key={t} value={t} className="dark:bg-black">{t}</option>)}
                        </select>
                    </div>

                    <div className="bg-black/5 dark:bg-black/20 p-6 rounded-[32px] border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col gap-4">
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <input type="radio" checked={creationMethod === 'create'} onChange={() => setCreationMethod('create')} className="accent-red-900 w-6 h-6 shrink-0" />
                            <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Reivindicar (Custo: T$ 5.000)</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <input type="radio" checked={creationMethod === 'conquer'} onChange={() => setCreationMethod('conquer')} className="accent-red-900 w-6 h-6 shrink-0" />
                            <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Conquista / Herança (Grátis)</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-fantasy-blood text-white py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-red-950 hover:translate-y-1 active:border-b-0 transition-all">
                        Estabelecer Domínio
                    </button>
                 </form>
             </div>
         </div>
      )}

      {/* Action Modals */}
      {modalMode && activeDomain && (
          <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-10 rounded-[60px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <button onClick={closeModal} className="absolute top-8 right-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-3 bg-white/20 dark:bg-black/20 rounded-full"><X size={24}/></button>
                  
                  {/* Finance Modal */}
                  {modalMode === 'finance' && (
                      <div className="space-y-8">
                          <div className="text-center">
                              <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Tesouro Real: {activeDomain.treasury} LO</h3>
                              <div className="flex justify-center gap-4 mt-6">
                                 <button onClick={() => setFinanceTab('transfer')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${financeTab === 'transfer' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-transparent text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Transferência</button>
                                 <button onClick={() => setFinanceTab('manage')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${financeTab === 'manage' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-transparent text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Gestão Manual</button>
                              </div>
                          </div>
                          
                          <form onSubmit={handleFinanceSubmit} className="space-y-6">
                              {financeTab === 'transfer' ? (
                                  <>
                                     <div className="flex gap-4 p-2 bg-black/5 dark:bg-black/20 rounded-2xl">
                                         <button type="button" onClick={() => setTransferType('invest')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${transferType === 'invest' ? 'bg-emerald-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><ArrowLeftRight size={16}/> Investir (Cofre &rarr; Domínio)</button>
                                         <button type="button" onClick={() => setTransferType('withdraw')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${transferType === 'withdraw' ? 'bg-indigo-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><ArrowLeftRight size={16}/> Resgatar (Domínio &rarr; Cofre)</button>
                                     </div>
                                     <div className="text-center text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Disponível no Cofre: {wallet.LO} LO</div>
                                  </>
                              ) : (
                                  <div className="flex gap-4 p-2 bg-black/5 dark:bg-black/20 rounded-2xl">
                                      <button type="button" onClick={() => setManageType('Income')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${manageType === 'Income' ? 'bg-emerald-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><TrendingUp size={16}/> Adicionar Fundos</button>
                                      <button type="button" onClick={() => setManageType('Expense')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${manageType === 'Expense' ? 'bg-red-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><TrendingDown size={16}/> Deduzir Fundos</button>
                                  </div>
                              )}

                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Quantidade (LO)</label>
                                  <input 
                                    type="number" 
                                    min="1" 
                                    className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-3xl text-center shadow-inner" 
                                    required 
                                    value={transAmount} 
                                    onChange={e => setTransAmount(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                  />
                              </div>

                              {financeTab === 'manage' && (
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Motivo do Ajuste</label>
                                      <input type="text" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" value={transReason} onChange={e => setTransReason(e.target.value)} placeholder="Ex: Doação de Nobre..." />
                                  </div>
                              )}

                              <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-black/50 active:translate-y-1 active:border-b-0 transition-all">Confirmar Operação</button>
                          </form>
                      </div>
                  )}

                  {/* Level Up Modal */}
                  {modalMode === 'levelup' && (
                      <div className="space-y-8 text-center">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white"><MapIcon size={40}/></div>
                          <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Ascensão de Nível</h3>
                          <div className="p-8 bg-black/5 dark:bg-black/20 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10">
                              <p className="font-serif italic text-lg mb-6">"Expandir as fronteiras requer investimento do Tesouro Real."</p>
                              <div className="text-4xl font-medieval text-indigo-900 dark:text-indigo-400 mb-2">Custo: {activeDomain.level * 20} LO</div>
                              <div className="text-xs font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Disponível: {activeDomain.treasury} LO</div>
                          </div>
                          <button onClick={() => { if (activeDomainId) { levelUpDomain(activeDomainId); closeModal(); } }} className="w-full bg-indigo-900 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-8 border-indigo-950 active:translate-y-2 active:border-b-0 transition-all">
                              Autorizar Expansão
                          </button>
                      </div>
                  )}

                  {/* Building Modal */}
                  {modalMode === 'building' && (
                      <div className="space-y-8">
                         <div className="text-center mb-6">
                            <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter mb-2">Novo Projeto de Obra</h3>
                            <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Espaços Disponíveis: {activeDomain.level - activeDomain.buildings.length}</p>
                         </div>
                         
                         {/* Abas */}
                         <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-full mb-6">
                            <button onClick={() => setSubTab('catalog')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'catalog' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Catálogo Oficial</button>
                            <button onClick={() => setSubTab('custom')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'custom' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Projeto Personalizado</button>
                         </div>

                         {subTab === 'catalog' ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {DOMAIN_BUILDINGS_CATALOG.map((b, i) => (
                                    <button key={i} onClick={() => { addDomainBuilding(activeDomain.id, b, true); closeModal(); }} className="text-left bg-white/40 dark:bg-black/20 p-5 rounded-3xl border border-fantasy-wood/5 dark:border-white/5 hover:border-fantasy-gold hover:bg-fantasy-gold/10 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment">{b.name}</span>
                                            <span className="text-xs font-black bg-black/10 dark:bg-white/10 px-2 py-1 rounded-md text-fantasy-wood/70 dark:text-fantasy-parchment/70">{b.costLO} LO</span>
                                        </div>
                                        <p className="text-xs text-fantasy-wood/60 dark:text-fantasy-parchment/60 italic leading-tight">{b.description}</p>
                                        <div className="mt-2 text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">{b.benefit}</div>
                                    </button>
                                ))}
                             </div>
                         ) : (
                             <form onSubmit={handleCustomBuildingSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome da Obra</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customBuildName} onChange={e => setCustomBuildName(e.target.value)} placeholder="Ex: Estátua do Herói" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Descrição Temática</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" value={customBuildDesc} onChange={e => setCustomBuildDesc(e.target.value)} placeholder="Detalhes visuais..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Benefício Mecânico</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customBuildBenefit} onChange={e => setCustomBuildBenefit(e.target.value)} placeholder="Ex: +1 Moral" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo (LO)</label>
                                    <input 
                                      type="number" 
                                      min="0" 
                                      className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" 
                                      required 
                                      value={customBuildCost} 
                                      onChange={e => setCustomBuildCost(Number(e.target.value))}
                                      onFocus={(e) => e.target.select()}
                                    />
                                </div>
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-black/5 dark:bg-black/20 rounded-2xl">
                                    <input type="checkbox" checked={customBuildPaid} onChange={e => setCustomBuildPaid(e.target.checked)} className="w-5 h-5 accent-emerald-800" />
                                    <span className="text-xs font-black uppercase text-fantasy-wood/70 dark:text-fantasy-parchment/60">Deduzir custo do Tesouro Real</span>
                                </label>
                                <button type="submit" className="w-full bg-emerald-800 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all">Erguer Estrutura</button>
                             </form>
                         )}
                      </div>
                  )}

                  {/* Unit Modal */}
                  {modalMode === 'unit' && (
                      <div className="space-y-8">
                         <div className="text-center mb-6">
                            <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter mb-2">Recrutamento Militar</h3>
                            <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Custo Mensal será deduzido na manutenção.</p>
                         </div>

                         {/* Abas */}
                         <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-full mb-6">
                            <button onClick={() => setSubTab('catalog')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'catalog' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Mercenários Padrão</button>
                            <button onClick={() => setSubTab('custom')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'custom' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Tropa Especializada</button>
                         </div>

                         {subTab === 'catalog' ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DOMAIN_UNITS_CATALOG.map((u, i) => (
                                    <button key={i} onClick={() => { addDomainUnit(activeDomain.id, u, true); closeModal(); }} className="text-left bg-white/40 dark:bg-black/20 p-5 rounded-3xl border border-fantasy-wood/5 dark:border-white/5 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment">{u.name}</span>
                                            <span className="text-xs font-black bg-black/10 dark:bg-white/10 px-2 py-1 rounded-md text-fantasy-wood/70 dark:text-fantasy-parchment/70">{u.costLO} LO</span>
                                        </div>
                                        <div className="mt-2 text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">{u.type} • Poder {u.power}</div>
                                    </button>
                                ))}
                             </div>
                         ) : (
                             <form onSubmit={handleCustomUnitSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Batalhão</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customUnitName} onChange={e => setCustomUnitName(e.target.value)} placeholder="Ex: Cavaleiros do Falcão" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Tipo de Tropa</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customUnitType} onChange={e => setCustomUnitType(e.target.value)} placeholder="Ex: Infantaria Pesada" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Poder (PWR)</label>
                                        <input 
                                          type="number" 
                                          min="1" 
                                          className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner text-center" 
                                          required 
                                          value={customUnitPower} 
                                          onChange={e => setCustomUnitPower(Number(e.target.value))}
                                          onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo (LO)</label>
                                        <input 
                                          type="number" 
                                          min="0" 
                                          className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner text-center" 
                                          required 
                                          value={customUnitCost} 
                                          onChange={e => setCustomUnitCost(Number(e.target.value))}
                                          onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-black/5 dark:bg-black/20 rounded-2xl">
                                    <input type="checkbox" checked={customUnitPaid} onChange={e => setCustomUnitPaid(e.target.checked)} className="w-5 h-5 accent-indigo-800" />
                                    <span className="text-xs font-black uppercase text-fantasy-wood/70 dark:text-fantasy-parchment/60">Deduzir custo do Tesouro Real</span>
                                </label>
                                <button type="submit" className="w-full bg-indigo-800 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-indigo-950 active:translate-y-1 active:border-b-0 transition-all">Alistar Unidade</button>
                             </form>
                         )}
                      </div>
                  )}

                  {/* Govern Modal */}
                  {modalMode === 'govern' && (
                      <div className="space-y-8 text-center">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white"><Dices size={40}/></div>
                          <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Decreto de Regência</h3>
                          
                          {!governResult ? (
                              <form onSubmit={handleGovern} className="space-y-8">
                                  <div className="bg-black/5 dark:bg-black/20 p-6 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10">
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80 mb-4">"O regente lança os dados do destino (1d20 + Nível + Bônus)..."</p>
                                      <div className="flex items-center justify-center gap-4">
                                          <label className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Resultado do Dado:</label>
                                          <input 
                                            type="number" 
                                            min="1" 
                                            className="w-24 bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/20 dark:border-white/20 rounded-2xl py-3 text-center font-medieval text-3xl text-fantasy-wood dark:text-fantasy-gold" 
                                            value={governRoll} 
                                            onChange={e => setGovernRoll(Number(e.target.value))}
                                            onFocus={(e) => e.target.select()}
                                          />
                                      </div>
                                  </div>
                                  <button type="submit" className="w-full bg-indigo-900 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-8 border-indigo-950 active:translate-y-2 active:border-b-0 transition-all">
                                      Promulgar Decreto
                                  </button>
                              </form>
                          ) : (
                              <div className="space-y-8 animate-fade-in">
                                  <div className={`p-8 rounded-[40px] border-4 ${governResult.success ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-red-900/10 border-red-900/20'}`}>
                                      <h4 className={`text-4xl font-medieval uppercase tracking-widest mb-2 ${governResult.success ? 'text-emerald-900 dark:text-emerald-400' : 'text-red-900 dark:text-red-400'}`}>{governResult.success ? 'Prosperidade!' : 'Dificuldades...'}</h4>
                                      <div className="text-5xl font-medieval text-fantasy-wood dark:text-fantasy-parchment my-6">{governResult.net > 0 ? '+' : ''}{governResult.net} LO</div>
                                      <div className="space-y-2 text-left bg-white/40 dark:bg-black/20 p-6 rounded-3xl text-xs font-mono opacity-80">
                                          {governResult.details.map((d, i) => <div key={i}>• {d}</div>)}
                                      </div>
                                  </div>
                                  <button onClick={closeModal} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl">Encerrar Sessão</button>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Crisis Modal */}
                  {modalMode === 'crisis' && (
                      <div className="space-y-8 text-center">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white bg-red-900 border-red-950"><Zap size={40}/></div>
                          <h3 className="text-3xl font-medieval text-red-900 dark:text-red-500 uppercase tracking-tighter">Evento Aleatório</h3>
                          
                          {!activeCrisis ? (
                              <div className="space-y-8">
                                  <p className="text-lg font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Os ventos da mudança sopram sobre o domínio..."</p>
                                  <button onClick={rollCrisis} className="w-full bg-red-800 text-white py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all">
                                      Consultar os Presságios
                                  </button>
                              </div>
                          ) : (
                              <div className="space-y-8 animate-bounce-in">
                                  <div className="p-8 bg-black/5 dark:bg-black/30 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10">
                                      <h4 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-4">{activeCrisis.name}</h4>
                                      <p className="font-serif italic text-lg mb-6">"{activeCrisis.details}"</p>
                                      <div className="inline-block px-6 py-2 bg-red-900/20 text-red-900 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-widest">
                                          Impacto: {activeCrisis.value > 0 ? '+' : ''}{activeCrisis.value} em {activeCrisis.impact}
                                      </div>
                                  </div>
                                  <button onClick={applyCrisis} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl">Aceitar o Destino</button>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Stats Modal */}
                  {modalMode === 'stats' && (
                      <div className="space-y-8">
                          <div className="text-center mb-6">
                              <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Estatutos Reais</h3>
                              <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Edição Manual de Registros</p>
                          </div>
                          <form onSubmit={handleUpdateStats} className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nome do Domínio</label>
                                      <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl" value={editName} onChange={e => setEditName(e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Regente</label>
                                      <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl" value={editRegent} onChange={e => setEditRegent(e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nível da Corte</label>
                                      <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl appearance-none" value={editCourt} onChange={e => setEditCourt(e.target.value as CourtType)}>
                                          {Object.keys(COURT_DATA).map(c => <option key={c} value={c} className="dark:bg-black">{c}</option>)}
                                      </select>
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Popularidade</label>
                                      <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl appearance-none" value={editPopularity} onChange={e => setEditPopularity(e.target.value as PopularityType)}>
                                          {POPULARITY_LEVELS.map(p => <option key={p} value={p} className="dark:bg-black">{p}</option>)}
                                      </select>
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Fortificação</label>
                                  <input 
                                    type="number" 
                                    className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl" 
                                    value={editFortification} 
                                    onChange={e => setEditFortification(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                  />
                              </div>
                              <button type="submit" className="w-full bg-emerald-800 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all">Salvar Alterações</button>
                          </form>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default DomainsPage;