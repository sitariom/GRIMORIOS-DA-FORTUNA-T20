import React, { useState, useMemo } from 'react';
import { useGuild } from '../context/GuildContext';
import { Contact, Trash2, Plus, Coins, MapPin, X, Filter, UserSearch, Briefcase, SortAsc, SortDesc, Edit, Handshake, Heart, Award, UserPlus } from 'lucide-react';
import { NPCLocationType, NPC, NPCRelationship } from '../types';

const RELATIONSHIP_CONFIG: Record<NPCRelationship, { label: string, color: string, bg: string, icon: React.ElementType }> = {
    'Contratado': { label: 'Contratado', color: 'text-fantasy-gold', bg: 'bg-fantasy-gold/10 border-fantasy-gold/20', icon: Coins },
    'Aliado': { label: 'Aliado', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-400/20', icon: Heart },
    'Parceiro': { label: 'Parceiro', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-400/20', icon: Handshake },
    'Recrutado': { label: 'Recrutado', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-400/20', icon: Award },
};

const NPCsPage: React.FC = () => {
  const { bases, domains, npcs, addNPC, updateNPC, removeNPC, payAllNPCs, paySingleNPC, notify, wallet } = useGuild();
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter & Sort States
  const [filterLocation, setFilterLocation] = useState<string>('Todas');
  const [filterType, setFilterType] = useState<NPCRelationship | 'Todos'>('Todos');
  const [sortOption, setSortOption] = useState<'Name' | 'CostDesc' | 'CostAsc'>('Name');

  // Form States
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCost, setNewCost] = useState(0);
  const [relationship, setRelationship] = useState<NPCRelationship>('Contratado');
  const [locationType, setLocationType] = useState<NPCLocationType>('Grupo');
  const [targetId, setTargetId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (locationType !== 'Grupo' && !targetId) {
        notify("Selecione uma Base ou Domínio específico para alocar o contato.", "error");
        return;
    }

    let locationName = 'Em Comitiva';
    
    if (locationType === 'Base') {
        const b = bases.find(b => b.id === targetId);
        locationName = b ? `Base: ${b.name}` : 'Base Desconhecida';
    } else if (locationType === 'Dominio') {
        const d = domains.find(d => d.id === targetId);
        locationName = d ? `Domínio: ${d.name}` : 'Domínio Desconhecido';
    }

    if (editingId) {
        updateNPC(editingId, { 
            name: newName, 
            role: newRole, 
            monthlyCost: newCost, 
            locationType, 
            locationId: targetId, 
            locationName,
            relationship
        });
    } else {
        addNPC({ name: newName, role: newRole, monthlyCost: newCost, locationType, locationId: targetId, locationName, relationship });
    }
    
    closeModal();
  };

  const openEditModal = (npc: NPC) => {
      setNewName(npc.name);
      setNewRole(npc.role);
      setNewCost(npc.monthlyCost);
      setRelationship(npc.relationship || 'Contratado');
      setLocationType(npc.locationType);
      setTargetId(npc.locationId || '');
      setEditingId(npc.id);
      setShowAdd(true);
  };

  const closeModal = () => {
      setShowAdd(false);
      resetForm();
  };

  const resetForm = () => {
      setNewName(''); setNewRole(''); setNewCost(0); setRelationship('Contratado'); setTargetId(''); setLocationType('Grupo'); setEditingId(null);
  };

  // Get Unique Locations for Filter Dropdown
  const uniqueLocations = useMemo(() => {
      const locs = new Set<string>();
      locs.add('Todas');
      locs.add('Em Comitiva');
      npcs.forEach(n => locs.add(n.locationName));
      return Array.from(locs).sort();
  }, [npcs]);

  // Apply Filter and Sort
  const filteredNpcs = useMemo(() => {
      let result = npcs.filter(n => 
          (n.name.toLowerCase().includes(searchTerm.toLowerCase()) || n.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (filterLocation !== 'Todas') {
          result = result.filter(n => n.locationName === filterLocation);
      }

      if (filterType !== 'Todos') {
          // Handle legacy data where relationship might be undefined (defaults to 'Contratado')
          result = result.filter(n => (n.relationship || 'Contratado') === filterType);
      }

      return result.sort((a, b) => {
          if (sortOption === 'Name') return a.name.localeCompare(b.name);
          if (sortOption === 'CostDesc') return b.monthlyCost - a.monthlyCost;
          if (sortOption === 'CostAsc') return a.monthlyCost - b.monthlyCost;
          return 0;
      });
  }, [npcs, searchTerm, filterLocation, filterType, sortOption]);

  const payrollNpcs = npcs.filter(n => n.monthlyCost > 0 && (n.relationship === 'Contratado' || !n.relationship));
  const totalPayroll = payrollNpcs.reduce((a, n) => a + n.monthlyCost, 0);
  const canPayTotal = wallet.TS >= totalPayroll;

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Rede de Contatos</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Funcionários, Aliados, Parceiros e Recrutados.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {payrollNpcs.length > 0 && (
            <button 
              disabled={!canPayTotal}
              onClick={() => { if(canPayTotal && confirm(`Confirmar pagamento total da folha: T$ ${totalPayroll}?`)) payAllNPCs(); }} 
              className={`flex-1 lg:flex-none px-8 py-5 rounded-[28px] flex items-center justify-center gap-3 font-medieval uppercase tracking-widest shadow-xl border-b-4 transition-all active:translate-y-1 active:border-b-0 ${canPayTotal ? 'bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-950' : 'bg-gray-700 text-gray-400 border-gray-900 cursor-not-allowed'}`}
            >
               <Coins size={20} /> 
               {canPayTotal ? `Pagar Folha (T$ ${totalPayroll})` : `Falta Saldo (Req: T$ ${totalPayroll})`}
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="flex-1 lg:flex-none bg-fantasy-blood hover:bg-red-700 text-white px-8 py-5 rounded-[28px] flex items-center justify-center gap-3 font-medieval uppercase tracking-widest shadow-xl border-b-4 border-red-950 transition-all active:translate-y-1 active:border-b-0">
             <UserPlus size={20} /> Novo Registro
          </button>
        </div>
      </header>

      {/* Control Bar: Search, Filter, Sort */}
      <div className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col xl:flex-row gap-6 shadow-xl items-center">
          <div className="flex-1 relative w-full">
              <UserSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-fantasy-wood/30 dark:text-fantasy-parchment/20" size={24} />
              <input type="text" placeholder="Buscar por nome ou função..." className="w-full bg-white/20 dark:bg-black/30 border-2 border-fantasy-wood/10 dark:border-white/5 rounded-2xl pl-16 pr-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-lg focus:outline-none focus:border-fantasy-gold transition-all shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
              {/* Type Filter */}
              <div className="relative flex-1 sm:flex-none">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-fantasy-wood/40 dark:text-fantasy-parchment/40">
                      <Handshake size={16}/>
                  </div>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 pl-10 pr-8 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      <option value="Todos" className="dark:bg-black">Todos os Vínculos</option>
                      {Object.keys(RELATIONSHIP_CONFIG).map(r => <option key={r} value={r} className="dark:bg-black">{r}</option>)}
                  </select>
              </div>

              {/* Location Filter */}
              <div className="relative flex-1 sm:flex-none">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-fantasy-wood/40 dark:text-fantasy-parchment/40">
                      <Filter size={16}/>
                  </div>
                  <select 
                    value={filterLocation} 
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 pl-10 pr-8 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      {uniqueLocations.map(loc => <option key={loc} value={loc} className="dark:bg-black">{loc}</option>)}
                  </select>
              </div>

              {/* Sort */}
              <div className="relative flex-1 sm:flex-none">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-fantasy-wood/40 dark:text-fantasy-parchment/40">
                      {sortOption === 'Name' ? <SortAsc size={16}/> : <SortDesc size={16}/>}
                  </div>
                  <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 pl-10 pr-8 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      <option value="Name" className="dark:bg-black">Nome (A-Z)</option>
                      <option value="CostDesc" className="dark:bg-black">Custo (Maior)</option>
                      <option value="CostAsc" className="dark:bg-black">Custo (Menor)</option>
                  </select>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredNpcs.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-50">
                  <Contact size={80} className="mx-auto mb-6 text-fantasy-wood/30 dark:text-white/20"/>
                  <p className="font-medieval text-3xl text-fantasy-wood dark:text-fantasy-parchment uppercase">Nenhum contrato encontrado.</p>
              </div>
          )}
          {filteredNpcs.map((npc, idx) => {
              const rel = npc.relationship || 'Contratado';
              const relConfig = RELATIONSHIP_CONFIG[rel];
              const RelIcon = relConfig.icon;
              const canPayIndividual = wallet.TS >= npc.monthlyCost;
              const isPaid = npc.monthlyCost > 0;
              
              return (
              <div key={npc.id} className={`parchment-card p-10 rounded-[48px] border-2 shadow-2xl group animate-slide-up hover:border-fantasy-gold/50 transition-all flex flex-col justify-between ${relConfig.bg}`} style={{ animationDelay: `${idx * 50}ms` }}>
                  <div>
                      <div className="flex justify-between items-start mb-8">
                          <div className="wax-seal w-16 h-16 flex items-center justify-center shadow-lg bg-black/20 dark:bg-black/40 backdrop-blur-sm border-2 border-white/10"><Briefcase size={32} className="text-white"/></div>
                          <div className="flex gap-2">
                             <button onClick={() => openEditModal(npc)} className="text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood dark:hover:text-fantasy-parchment transition-colors p-2 bg-black/5 dark:bg-black/20 rounded-full"><Edit size={18}/></button>
                             <button onClick={() => { if(confirm(`Remover registro de ${npc.name}?`)) removeNPC(npc.id); }} className="text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-red-800 dark:hover:text-red-400 transition-colors p-2 bg-black/5 dark:bg-black/20 rounded-full"><Trash2 size={18}/></button>
                          </div>
                      </div>
                      
                      <div className="space-y-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                                <RelIcon size={16} className={relConfig.color}/>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${relConfig.color}`}>{relConfig.label}</span>
                            </div>
                            <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tight mb-2 leading-none truncate">{npc.name}</h3>
                            <span className="text-[10px] font-black bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black px-4 py-1 rounded-full uppercase tracking-widest opacity-80">{npc.role}</span>
                          </div>

                          <div className="flex items-center gap-4 bg-black/5 dark:bg-black/20 p-5 rounded-[24px] border border-fantasy-wood/5 dark:border-white/5 shadow-inner">
                              <MapPin size={20} className="text-fantasy-gold shrink-0"/>
                              <div className="text-[11px] text-fantasy-wood/70 dark:text-fantasy-parchment/60 font-bold uppercase truncate tracking-widest">{npc.locationName}</div>
                          </div>

                          <div className="flex justify-between items-center pt-6 border-t border-fantasy-wood/10 dark:border-white/5">
                              <span className="text-[10px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-black uppercase tracking-widest">Custo Mensal</span>
                              <span className={`text-3xl font-medieval ${isPaid ? 'text-fantasy-wood dark:text-fantasy-gold' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                  {isPaid ? `T$ ${npc.monthlyCost}` : 'Voluntário'}
                              </span>
                          </div>
                      </div>
                  </div>

                  <div className="mt-8">
                      {isPaid ? (
                          <button 
                            onClick={() => { if(canPayIndividual) paySingleNPC(npc.id); }}
                            disabled={!canPayIndividual}
                            className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${canPayIndividual ? 'bg-emerald-800/10 border-emerald-800/20 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-800 hover:text-white' : 'bg-gray-500/10 border-gray-500/20 text-gray-500 cursor-not-allowed'}`}
                          >
                              {canPayIndividual ? 'Pagar Salário' : 'Saldo Insuficiente'}
                          </button>
                      ) : (
                          <div className="w-full py-3 text-center text-xs font-black uppercase tracking-widest text-fantasy-wood/30 dark:text-fantasy-parchment/30 border border-transparent">
                              Sem encargos financeiros
                          </div>
                      )}
                  </div>
              </div>
          )})}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
           <div className="parchment-card p-14 rounded-[60px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
               <button onClick={closeModal} className="absolute top-10 right-10 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-4 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={32}/></button>
               
               <div className="flex flex-col items-center text-center mb-10">
                   <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white shadow-2xl"><Contact size={48}/></div>
                   <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">{editingId ? 'Editar Registro' : 'Novo Registro'}</h3>
                   <p className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-[0.3em] mt-4">{editingId ? 'Atualizar dados do contato.' : 'Adicionar um novo contato à rede da guilda.'}</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="space-y-3">
                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Tipo de Vínculo</label>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                           {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => {
                               const isActive = relationship === key;
                               return (
                                   <button 
                                     key={key}
                                     type="button"
                                     onClick={() => { setRelationship(key as NPCRelationship); if(key !== 'Contratado') setNewCost(0); }}
                                     className={`py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${isActive ? `${config.bg} border-current ${config.color} shadow-lg scale-105` : 'border-transparent bg-black/5 dark:bg-white/5 opacity-50 hover:opacity-100'}`}
                                   >
                                       <config.icon size={20} />
                                       <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                                   </button>
                               )
                           })}
                       </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Contato</label>
                           <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Alfred, o Mordomo" />
                       </div>
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Função / Cargo</label>
                           <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Ex: Senescal" />
                       </div>
                   </div>

                   <div className={`space-y-3 transition-all ${relationship !== 'Contratado' ? 'opacity-50 grayscale' : ''}`}>
                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo Mensal (T$)</label>
                       <input 
                         type="number" 
                         min="0" 
                         className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-3xl text-center shadow-inner" 
                         required 
                         value={newCost} 
                         onChange={e => setNewCost(Number(e.target.value))}
                         onFocus={(e) => e.target.select()}
                         disabled={relationship !== 'Contratado'}
                       />
                       {relationship !== 'Contratado' && <p className="text-center text-[10px] uppercase font-black tracking-widest text-fantasy-wood/40 dark:text-fantasy-parchment/40">Apenas Contratados geram custo fixo.</p>}
                   </div>

                   <div className="bg-black/5 dark:bg-black/20 p-6 rounded-[32px] border-4 border-fantasy-wood/10 dark:border-white/10 space-y-6">
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Alocação Atual</label>
                           <div className="flex gap-2">
                               <button type="button" onClick={() => { setLocationType('Grupo'); setTargetId(''); }} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Grupo' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Grupo</button>
                               <button type="button" onClick={() => { setLocationType('Base'); setTargetId(''); }} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Base' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Base</button>
                               <button type="button" onClick={() => { setLocationType('Dominio'); setTargetId(''); }} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Dominio' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Domínio</button>
                           </div>
                       </div>

                       {locationType === 'Base' && (
                           <div className="animate-fade-in">
                               <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest mb-2 block">Selecione a Base</label>
                               <select className="w-full bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-xl appearance-none cursor-pointer" value={targetId} onChange={e => setTargetId(e.target.value)} required>
                                   <option value="" className="dark:bg-black">Escolha uma Base...</option>
                                   {bases.map(b => <option key={b.id} value={b.id} className="dark:bg-black">{b.name}</option>)}
                                </select>
                           </div>
                       )}

                       {locationType === 'Dominio' && (
                           <div className="animate-fade-in">
                               <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest mb-2 block">Selecione o Domínio</label>
                               <select className="w-full bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-xl appearance-none cursor-pointer" value={targetId} onChange={e => setTargetId(e.target.value)} required>
                                   <option value="" className="dark:bg-black">Escolha um Domínio...</option>
                                   {domains.map(d => <option key={d.id} value={d.id} className="dark:bg-black">{d.name}</option>)}
                               </select>
                           </div>
                       )}
                   </div>

                   <button type="submit" className="w-full bg-emerald-800 text-white py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all">
                       {editingId ? 'Salvar Alterações' : 'Registrar Contato'}
                   </button>
               </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default NPCsPage;