import React, { useState, useMemo } from 'react';
import { useGuild } from '../context/GuildContext';
import { 
  Contact, Trash2, Plus, Coins, MapPin, X, Filter, UserSearch, Briefcase, 
  SortAsc, SortDesc, Edit, Handshake, Heart, Award, UserPlus, Flame, Shield, 
  Zap, Crosshair, Users, Activity, Crown, Search, UserCheck
} from 'lucide-react';
import { NPCLocationType, NPC, NPCRelationship, MemberStatus } from '../types';

const RELATIONSHIP_CONFIG: Record<NPCRelationship, { label: string, color: string, bg: string, icon: React.ElementType }> = {
    'Contratado': { label: 'Contratado', color: 'text-fantasy-gold', bg: 'bg-fantasy-gold/10 border-fantasy-gold/20', icon: Coins },
    'Aliado': { label: 'Aliado', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-400/20', icon: Heart },
    'Parceiro': { label: 'Parceiro', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-400/20', icon: Handshake },
    'Recrutado': { label: 'Recrutado', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-400/20', icon: Award },
};

const STATUS_COLORS: Record<MemberStatus, { label: string, color: string, bg: string }> = {
    'Ativo': { label: 'Ativo', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    'Inativo': { label: 'Inativo', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    'Morto': { label: 'Falecido 💀', color: 'text-red-500 line-through', bg: 'bg-red-500/10 border-red-500/20' },
    'Ferido': { label: 'Ferido 🩸', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    'Em Missao': { label: 'Em Missão ⚔️', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    'Viajando': { label: 'Viajando 🧭', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
};

const TIER_COLORS = {
    'Iniciante': 'text-amber-600 bg-amber-600/10 border border-amber-600/20',
    'Veterano': 'text-slate-300 bg-slate-300/10 border border-slate-300/20',
    'Mestre': 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
    'N/A': 'text-gray-400 bg-gray-500/10'
};

const NPCsPage: React.FC = () => {
  const { 
    bases, domains, npcs, members, addNPC, updateNPC, removeNPC, 
    payAllNPCs, paySingleNPC, interactWithNPC, toggleActiveAffinity, 
    completeUltimateQuest, notify, wallet 
  } = useGuild();

  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [filterLocation, setFilterLocation] = useState<string>('Todas');
  const [filterType, setFilterType] = useState<NPCRelationship | 'Todos'>('Todos');
  const [filterTier, setFilterTier] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [sortOption, setSortOption] = useState<'Name' | 'CostDesc' | 'CostAsc'>('Name');

  // Selected Member for Affinity Management Focus
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');

  // Form States
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCost, setNewCost] = useState(0);
  const [relationship, setRelationship] = useState<NPCRelationship>('Contratado');
  const [locationType, setLocationType] = useState<NPCLocationType>('Grupo');
  const [targetId, setTargetId] = useState('');
  const [customLocationText, setCustomLocationText] = useState('');
  const [status, setStatus] = useState<MemberStatus>('Ativo');
  
  // T20 Partner Fields
  const [tier, setTier] = useState<'Iniciante' | 'Veterano' | 'Mestre' | 'N/A'>('N/A');
  const [allyType, setAllyType] = useState<string>('N/A');
  const [bonusDescription, setBonusDescription] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (locationType === 'Base' && !targetId) {
        notify("Selecione uma Base para alocar o contato.", "error");
        return;
    }
    if (locationType === 'Dominio' && !targetId) {
        notify("Selecione um Domínio para alocar o contato.", "error");
        return;
    }
    if (locationType === 'Membro' && !targetId) {
        notify("Selecione um Membro para vincular o parceiro.", "error");
        return;
    }
    if (locationType === 'Livre' && !customLocationText.trim()) {
        notify("Digite a localização onde este contato reside.", "error");
        return;
    }

    let locationName = 'Em Comitiva';
    let finalLocationId = targetId;
    
    if (locationType === 'Base') {
        const b = bases.find(b => b.id === targetId);
        locationName = b ? `Base: ${b.name}` : 'Base Desconhecida';
    } else if (locationType === 'Dominio') {
        const d = domains.find(d => d.id === targetId);
        locationName = d ? `Domínio: ${d.name}` : 'Domínio Desconhecido';
    } else if (locationType === 'Membro') {
        const m = members.find(m => m.id === targetId);
        locationName = m ? `Parceiro de: ${m.name}` : 'Aventureiro Desconhecido';
    } else if (locationType === 'Livre') {
        locationName = customLocationText.trim();
        finalLocationId = 'custom';
    } else if (locationType === 'Grupo') {
        finalLocationId = '';
    }

    const npcData = {
        name: newName,
        role: newRole,
        monthlyCost: relationship === 'Contratado' ? newCost : 0,
        locationType,
        locationId: finalLocationId,
        locationName,
        relationship,
        tier,
        allyType: allyType as any,
        bonusDescription,
        status,
        associatedMemberId: locationType === 'Membro' ? targetId : undefined,
        likes,
        dislikes
    };

    if (editingId) {
        updateNPC(editingId, npcData);
    } else {
        addNPC(npcData);
    }
    
    closeModal();
  };

  const openEditModal = (npc: NPC) => {
      setNewName(npc.name);
      setNewRole(npc.role);
      setNewCost(npc.monthlyCost);
      setRelationship(npc.relationship || 'Contratado');
      setLocationType(npc.locationType);
      
      if (npc.locationType === 'Livre') {
         setCustomLocationText(npc.locationName);
         setTargetId('');
      } else {
         setTargetId(npc.locationId || '');
         setCustomLocationText('');
      }
      
      setStatus(npc.status || 'Ativo');
      setTier(npc.tier || 'N/A');
      setAllyType(npc.allyType || 'N/A');
      setBonusDescription(npc.bonusDescription || '');
      setLikes(npc.likes || '');
      setDislikes(npc.dislikes || '');
      setEditingId(npc.id);
      setShowAdd(true);
  };

  const closeModal = () => {
      setShowAdd(false);
      resetForm();
  };

  const resetForm = () => {
      setNewName(''); 
      setNewRole(''); 
      setNewCost(0); 
      setRelationship('Contratado'); 
      setTargetId(''); 
      setCustomLocationText('');
      setLocationType('Grupo'); 
      setStatus('Ativo');
      setTier('N/A');
      setAllyType('N/A');
      setBonusDescription('');
      setLikes('');
      setDislikes('');
      setEditingId(null);
  };

  // Get Unique Locations for Filter Dropdown
  const uniqueLocations = useMemo(() => {
      const locs = new Set<string>();
      locs.add('Todas');
      npcs.forEach(n => {
         if (n.locationType === 'Livre') {
            locs.add('Localidade Livre');
         } else {
            locs.add(n.locationName);
         }
      });
      return Array.from(locs).sort();
  }, [npcs]);

  // Selected Member Object
  const selectedMember = useMemo(() => {
      return members.find(m => m.id === selectedMemberId);
  }, [members, selectedMemberId]);

  // Apply Search and Filters
  const filteredNpcs = useMemo(() => {
      let result = npcs.filter(n => 
          (n.name.toLowerCase().includes(searchTerm.toLowerCase()) || n.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (filterLocation !== 'Todas') {
          if (filterLocation === 'Localidade Livre') {
              result = result.filter(n => n.locationType === 'Livre');
          } else {
              result = result.filter(n => n.locationName === filterLocation);
          }
      }

      if (filterType !== 'Todos') {
          result = result.filter(n => (n.relationship || 'Contratado') === filterType);
      }

      if (filterTier !== 'Todos') {
          result = result.filter(n => (n.tier || 'N/A') === filterTier);
      }

      if (filterStatus !== 'Todos') {
          result = result.filter(n => (n.status || 'Ativo') === filterStatus);
      }

      return result.sort((a, b) => {
          if (sortOption === 'Name') return a.name.localeCompare(b.name);
          if (sortOption === 'CostDesc') return b.monthlyCost - a.monthlyCost;
          if (sortOption === 'CostAsc') return a.monthlyCost - b.monthlyCost;
          return 0;
      });
  }, [npcs, searchTerm, filterLocation, filterType, filterTier, filterStatus, sortOption]);

  // Categorize NPCs for Sectioned Layout
  const partnersSection = useMemo(() => {
    return filteredNpcs.filter(n => n.status === 'Ativo' && n.locationType === 'Membro');
  }, [filteredNpcs]);

  const groupSection = useMemo(() => {
    return filteredNpcs.filter(n => n.status === 'Ativo' && n.locationType === 'Grupo');
  }, [filteredNpcs]);

  const basesSection = useMemo(() => {
    return filteredNpcs.filter(n => n.status === 'Ativo' && n.locationType === 'Base');
  }, [filteredNpcs]);

  const domainsSection = useMemo(() => {
    return filteredNpcs.filter(n => n.status === 'Ativo' && n.locationType === 'Dominio');
  }, [filteredNpcs]);

  const inactiveSection = useMemo(() => {
    return filteredNpcs.filter(n => n.status !== 'Ativo' || n.locationType === 'Livre' || n.locationType === 'Construcao');
  }, [filteredNpcs]);

  const payrollNpcs = npcs.filter(n => n.monthlyCost > 0 && (n.relationship === 'Contratado' || !n.relationship) && n.status === 'Ativo');
  const totalPayroll = payrollNpcs.reduce((a, n) => a + n.monthlyCost, 0);
  const canPayTotal = wallet.TS >= totalPayroll;

  const ALLY_TYPES = [
    'N/A', 'Adepto', 'Ajudante', 'Assassino', 'Perseguidor', 'Vigilante', 
    'Atirador', 'Combatente', 'Destruidor', 'Fortão', 'Guardião', 'Magivocador', 
    'Médico', 'Familiar', 'Familiar Especial', 'Montaria', 'Montaria Especial', 'Parceiro Especial'
  ];

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-fantasy-wood dark:text-white tracking-tighter uppercase leading-none mb-2">Aliados e Comitiva</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Gestão de Ajudantes, Parceiros, Servos e Contatos de Arton.</p>
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

      {/* Focus Aventureiro / Member Selector for Affinity Management */}
      {members.length > 0 && (
        <div className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-gold/30 bg-fantasy-gold/5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
           <div className="flex items-center gap-3">
              <UserCheck className="text-fantasy-gold" size={28}/>
              <div>
                 <span className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest block">Aventureiro do Grupo em Foco</span>
                 <p className="text-xs text-fantasy-wood/70 dark:text-fantasy-parchment/70">Gerencie e veja os bônus e afinidades para este herói.</p>
              </div>
           </div>
           <select 
             value={selectedMemberId} 
             onChange={(e) => setSelectedMemberId(e.target.value)}
             className="w-full sm:w-64 bg-white/50 dark:bg-black/40 border-2 border-fantasy-gold/20 rounded-2xl px-4 py-3 font-medieval text-lg text-fantasy-wood dark:text-fantasy-gold appearance-none cursor-pointer"
           >
              {members.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name} ({m.status})</option>)}
           </select>
        </div>
      )}

      {/* Control Bar: Search, Filters, Sort */}
      <div className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col xl:flex-row gap-6 shadow-xl items-center">
          <div className="flex-1 relative w-full">
              <UserSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-fantasy-wood/50 dark:text-fantasy-parchment/50" size={24} />
              <input type="text" placeholder="Buscar por nome ou função..." className="w-full bg-white/20 dark:bg-black/30 border-2 border-fantasy-wood/10 dark:border-white/5 rounded-2xl pl-16 pr-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-lg focus:outline-none focus:border-fantasy-gold transition-all shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          
          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
              {/* Type Filter */}
              <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 px-6 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      <option value="Todos" className="dark:bg-black">Todos os Vínculos</option>
                      {Object.keys(RELATIONSHIP_CONFIG).map(r => <option key={r} value={r} className="dark:bg-black">{r}</option>)}
                  </select>
              </div>

              {/* Tier Filter */}
              <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={filterTier} 
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 px-6 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      <option value="Todos" className="dark:bg-black">Todos os Patamares</option>
                      <option value="Iniciante" className="dark:bg-black">Iniciante</option>
                      <option value="Veterano" className="dark:bg-black">Veterano</option>
                      <option value="Mestre" className="dark:bg-black">Mestre</option>
                      <option value="N/A" className="dark:bg-black">N/A</option>
                  </select>
              </div>

              {/* Status Filter */}
              <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 px-6 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      <option value="Todos" className="dark:bg-black">Todos os Status</option>
                      <option value="Ativo" className="dark:bg-black">Ativo</option>
                      <option value="Inativo" className="dark:bg-black">Inativo</option>
                      <option value="Morto" className="dark:bg-black">Morto</option>
                      <option value="Ferido" className="dark:bg-black">Ferido</option>
                      <option value="Em Missao" className="dark:bg-black">Em Missão</option>
                      <option value="Viajando" className="dark:bg-black">Viajando</option>
                  </select>
              </div>

              {/* Location Filter */}
              <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={filterLocation} 
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 px-6 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      {uniqueLocations.map(loc => <option key={loc} value={loc} className="dark:bg-black">{loc === 'Localidade Livre' ? 'Localidades Livres' : loc}</option>)}
                  </select>
              </div>

              {/* Sort */}
              <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="w-full sm:w-auto bg-black/5 dark:bg-black/20 px-6 py-4 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest cursor-pointer hover:bg-white/10 transition-colors"
                  >
                      <option value="Name" className="dark:bg-black">Nome (A-Z)</option>
                      <option value="CostDesc" className="dark:bg-black">Custo (Maior)</option>
                      <option value="CostAsc" className="dark:bg-black">Custo (Menor)</option>
                  </select>
              </div>
          </div>
      </div>

      {/* Render Categorized NPC Cards */}
      <div className="space-y-16">
         {filteredNpcs.length === 0 ? (
             <div className="parchment-card py-20 text-center opacity-50 rounded-[48px]">
                 <Contact size={80} className="mx-auto mb-6 text-fantasy-wood/30 dark:text-white/20"/>
                 <p className="font-medieval text-3xl text-fantasy-wood dark:text-fantasy-parchment uppercase">Nenhum registro encontrado.</p>
             </div>
         ) : (
            <>
               {/* 1. Parceiros Ativos */}
               {partnersSection.length > 0 && (
                  <div className="space-y-6">
                     <h3 className="text-3xl font-medieval text-fantasy-gold uppercase tracking-tight flex items-center gap-3 border-b-2 border-fantasy-gold/20 pb-2">
                        <Crown size={28}/> Parceiros Ativos do Grupo
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {partnersSection.map((npc, idx) => (
                           <NPCCard 
                             key={npc.id} 
                             npc={npc} 
                             idx={idx} 
                             onEdit={openEditModal} 
                             selectedMemberId={selectedMemberId} 
                           />
                        ))}
                     </div>
                  </div>
               )}

               {/* 2. Comitiva Geral */}
               {groupSection.length > 0 && (
                  <div className="space-y-6">
                     <h3 className="text-3xl font-medieval text-white uppercase tracking-tight flex items-center gap-3 border-b-2 border-white/10 pb-2">
                        <Users size={28}/> Comitiva Geral (Em Viagem)
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {groupSection.map((npc, idx) => (
                           <NPCCard 
                             key={npc.id} 
                             npc={npc} 
                             idx={idx} 
                             onEdit={openEditModal} 
                             selectedMemberId={selectedMemberId} 
                           />
                        ))}
                     </div>
                  </div>
               )}

               {/* 3. NPCs em Bases */}
               {basesSection.length > 0 && (
                  <div className="space-y-6">
                     <h3 className="text-3xl font-medieval text-white uppercase tracking-tight flex items-center gap-3 border-b-2 border-white/10 pb-2">
                        <MapPin size={28}/> Alocados em Bases
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {basesSection.map((npc, idx) => (
                           <NPCCard 
                             key={npc.id} 
                             npc={npc} 
                             idx={idx} 
                             onEdit={openEditModal} 
                             selectedMemberId={selectedMemberId} 
                           />
                        ))}
                     </div>
                  </div>
               )}

               {/* 4. NPCs em Domínios */}
               {domainsSection.length > 0 && (
                  <div className="space-y-6">
                     <h3 className="text-3xl font-medieval text-white uppercase tracking-tight flex items-center gap-3 border-b-2 border-white/10 pb-2">
                        <Briefcase size={28}/> Alocados em Domínios
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {domainsSection.map((npc, idx) => (
                           <NPCCard 
                             key={npc.id} 
                             npc={npc} 
                             idx={idx} 
                             onEdit={openEditModal} 
                             selectedMemberId={selectedMemberId} 
                           />
                        ))}
                     </div>
                  </div>
               )}

               {/* 5. Inativos, Livres e Mortos */}
               {inactiveSection.length > 0 && (
                  <div className="space-y-6">
                     <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment/65 uppercase tracking-tight flex items-center gap-3 border-b-2 border-fantasy-wood/20 dark:border-white/10 pb-2">
                        <Activity size={28}/> Indisponíveis, Mortos e Localidades Livres
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {inactiveSection.map((npc, idx) => (
                           <NPCCard 
                             key={npc.id} 
                             npc={npc} 
                             idx={idx} 
                             onEdit={openEditModal} 
                             selectedMemberId={selectedMemberId} 
                           />
                        ))}
                     </div>
                  </div>
               )}
            </>
         )}
      </div>

      {/* Creation and Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
           <div className="parchment-card p-8 md:p-12 rounded-[60px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
               <button onClick={closeModal} className="absolute top-8 right-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-3 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={24}/></button>
               
               <div className="flex flex-col items-center text-center mb-8">
                   <div className="wax-seal w-20 h-20 mb-4 flex items-center justify-center text-white shadow-2xl"><Contact size={40}/></div>
                   <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">{editingId ? 'Editar Registro' : 'Novo Registro'}</h3>
                   <p className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-[0.3em] mt-2">{editingId ? 'Atualizar dados do contato.' : 'Adicionar um novo contato à comitiva da guilda.'}</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                   {/* Relationship select */}
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

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Contato</label>
                           <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Alfred, o Mordomo" />
                       </div>
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Função / Cargo</label>
                           <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Ex: Senescal" />
                       </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Tier select */}
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Patamar (Aliado)</label>
                           <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-lg appearance-none cursor-pointer" value={tier} onChange={e => setTier(e.target.value as any)}>
                               <option value="N/A" className="dark:bg-black">N/A (Não é Aliado)</option>
                               <option value="Iniciante" className="dark:bg-black">Iniciante</option>
                               <option value="Veterano" className="dark:bg-black">Veterano</option>
                               <option value="Mestre" className="dark:bg-black">Mestre</option>
                           </select>
                       </div>
                       {/* Partner type select */}
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Tipo de Parceiro</label>
                           <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-lg appearance-none cursor-pointer" value={allyType} onChange={e => setAllyType(e.target.value)}>
                               {ALLY_TYPES.map(t => <option key={t} value={t} className="dark:bg-black">{t === 'N/A' ? 'N/A' : t}</option>)}
                           </select>
                       </div>
                   </div>

                   {/* Status select */}
                   <div className="space-y-3">
                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Status Atual</label>
                       <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-lg appearance-none cursor-pointer" value={status} onChange={e => setStatus(e.target.value as MemberStatus)}>
                           {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k} className="dark:bg-black">{v.label}</option>)}
                       </select>
                   </div>

                   {relationship === 'Contratado' && (
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo Mensal (T$)</label>
                           <input 
                             type="number" 
                             min="0" 
                             className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-3xl text-center shadow-inner" 
                             required 
                             value={newCost} 
                             onChange={e => setNewCost(Number(e.target.value))}
                             onFocus={(e) => e.target.select()}
                           />
                       </div>
                   )}

                   {/* Likes and dislikes */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Gostos / Agrega PA (+2)</label>
                           <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-base" value={likes} onChange={e => setLikes(e.target.value)} placeholder="Ex: Livros, Vinho, Conversa boa" />
                       </div>
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Desgostos</label>
                           <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-base" value={dislikes} onChange={e => setDislikes(e.target.value)} placeholder="Ex: Mentiras, Orcs, Violência" />
                       </div>
                   </div>

                   <div className="space-y-3">
                       <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Benefícios e Notas Mecânicas</label>
                       <textarea rows={3} className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-base" value={bonusDescription} onChange={e => setBonusDescription(e.target.value)} placeholder="Nível 1 (+2 Percepção)\nNível 2 (Sentidos Aguçados)\nNível 3 (Percepção às Cegas)..." />
                   </div>

                   {/* Current allocation block */}
                   <div className="bg-black/5 dark:bg-black/20 p-6 rounded-[32px] border-4 border-fantasy-wood/10 dark:border-white/10 space-y-6">
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Alocação Atual</label>
                           <div className="flex flex-wrap gap-2">
                               <button type="button" onClick={() => { setLocationType('Grupo'); setTargetId(''); }} className={`flex-1 min-w-[80px] py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Grupo' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Grupo</button>
                               <button type="button" onClick={() => { setLocationType('Base'); setTargetId(''); }} className={`flex-1 min-w-[80px] py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Base' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Base</button>
                               <button type="button" onClick={() => { setLocationType('Dominio'); setTargetId(''); }} className={`flex-1 min-w-[80px] py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Dominio' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Domínio</button>
                               <button type="button" onClick={() => { setLocationType('Membro'); setTargetId(''); }} className={`flex-1 min-w-[80px] py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Membro' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Membro</button>
                               <button type="button" onClick={() => { setLocationType('Livre'); setTargetId(''); }} className={`flex-1 min-w-[80px] py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${locationType === 'Livre' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-white/40 dark:bg-white/5 text-fantasy-wood/60 dark:text-fantasy-parchment/60'}`}>Livre</button>
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

                       {locationType === 'Membro' && (
                           <div className="animate-fade-in">
                               <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest mb-2 block">Vincular Parceiro ao Membro</label>
                               <select className="w-full bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-xl appearance-none cursor-pointer" value={targetId} onChange={e => setTargetId(e.target.value)} required>
                                   <option value="" className="dark:bg-black">Escolha um Aventureiro...</option>
                                   {members.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name}</option>)}
                                </select>
                           </div>
                       )}

                       {locationType === 'Livre' && (
                           <div className="animate-fade-in space-y-2">
                               <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest block">Localização Livre</label>
                               <input className="w-full bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-lg" value={customLocationText} onChange={e => setCustomLocationText(e.target.value)} required placeholder="Ex: Reino de Namalkar" />
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

// Sub-component for NPC Card
interface NPCCardProps {
   npc: NPC;
   idx: number;
   onEdit: (npc: NPC) => void;
   selectedMemberId: string;
}

const NPCCard: React.FC<NPCCardProps> = ({ npc, idx, onEdit, selectedMemberId }) => {
   const { members, wallet, paySingleNPC, removeNPC, toggleActiveAffinity, interactWithNPC, completeUltimateQuest } = useGuild();
   
   const focusMember = members.find(m => m.id === selectedMemberId);
   
   const rel = npc.relationship || 'Contratado';
   const relConfig = RELATIONSHIP_CONFIG[rel] || RELATIONSHIP_CONFIG['Contratado'];
   const RelIcon = relConfig.icon;
   
   const stat = npc.status || 'Ativo';
   const statConfig = STATUS_COLORS[stat] || STATUS_COLORS['Ativo'];
   
   const canPay = wallet.TS >= npc.monthlyCost;
   const isPaid = npc.monthlyCost > 0;
   
   // Affinity data
   const currentPA = npc.affinityByMember?.[selectedMemberId] || 0;
   const hasDoneQuest = npc.ultimateQuestDone?.[selectedMemberId] || false;
   const isAffinityActive = focusMember?.activeAffinityNpcId === npc.id;

   return (
      <div 
        className={`parchment-card p-8 rounded-[48px] border-2 shadow-2xl group/card hover:border-fantasy-gold/50 transition-all flex flex-col justify-between ${
          isAffinityActive 
            ? 'border-fantasy-gold/80 bg-fantasy-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
            : 'border-fantasy-wood/10 dark:border-white/10 bg-white/5 dark:bg-black/20'
        }`} 
        style={{ animationDelay: `${idx * 50}ms` }}
      >
          <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-4">
                      <div className="wax-seal w-12 h-12 flex items-center justify-center shadow-lg bg-black/20 dark:bg-black/40 border border-white/10 rounded-full shrink-0">
                          <Contact size={20} className="text-fantasy-gold"/>
                      </div>
                      <div>
                          <h4 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-gold leading-tight">{npc.name}</h4>
                          <p className="text-xs font-serif italic text-fantasy-wood/70 dark:text-fantasy-parchment/70">{npc.role}</p>
                      </div>
                  </div>
                  <div className="flex gap-2 opacity-60 group-hover/card:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(npc)} className="text-fantasy-wood/60 dark:text-fantasy-parchment/60 hover:text-fantasy-gold p-2 bg-white/20 dark:bg-white/5 rounded-full transition-all hover:scale-110" title="Editar"><Edit size={16}/></button>
                      <button onClick={() => { if(confirm(`Excluir ${npc.name}?`)) removeNPC(npc.id); }} className="text-fantasy-blood hover:text-red-500 p-2 bg-white/20 dark:bg-white/5 rounded-full transition-all hover:scale-110" title="Excluir"><Trash2 size={16}/></button>
                  </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${relConfig.bg} ${relConfig.color}`}>
                      <RelIcon size={12} /> {relConfig.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statConfig.bg} ${statConfig.color}`}>
                      {statConfig.label}
                  </span>
                  {npc.tier && npc.tier !== 'N/A' && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${TIER_COLORS[npc.tier]}`}>
                          {npc.tier}
                      </span>
                  )}
                  {npc.allyType && npc.allyType !== 'N/A' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {npc.allyType}
                      </span>
                  )}
              </div>

              <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-fantasy-wood/80 dark:text-fantasy-parchment/80 font-serif">
                      <MapPin size={14} className="text-fantasy-gold shrink-0" />
                      <span><strong>Local:</strong> {npc.locationName}</span>
                  </div>
                  {isPaid && (
                      <div className="flex justify-between items-center gap-2 p-2 bg-black/5 dark:bg-black/20 rounded-xl border border-fantasy-wood/5 dark:border-white/5">
                          <span className="text-xs font-serif text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                              <strong>Salário:</strong> T$ {npc.monthlyCost}/mês
                          </span>
                          {stat === 'Ativo' && (
                              <button 
                                onClick={() => paySingleNPC(npc.id)} 
                                disabled={!canPay} 
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                  canPay 
                                    ? 'bg-emerald-800 text-white hover:bg-emerald-700 border-emerald-950 active:scale-95' 
                                    : 'bg-gray-700 text-gray-400 border-gray-900 cursor-not-allowed'
                                }`}
                              >
                                  Pagar
                              </button>
                          )}
                          {stat !== 'Ativo' && (
                              <span className="text-[10px] uppercase font-black tracking-wider text-amber-500">Sem Custo ({stat})</span>
                          )}
                      </div>
                  )}
              </div>

              {(npc.likes || npc.dislikes || npc.bonusDescription) && (
                  <div className="border-t border-fantasy-wood/10 dark:border-white/10 pt-4 mt-4 space-y-2">
                      {npc.likes && (
                          <div className="text-xs">
                              <strong className="text-fantasy-gold">Gosta de:</strong> <span className="text-fantasy-wood/90 dark:text-fantasy-parchment/85">{npc.likes}</span>
                          </div>
                      )}
                      {npc.dislikes && (
                          <div className="text-xs">
                              <strong className="text-fantasy-gold">Desgosta de:</strong> <span className="text-fantasy-wood/90 dark:text-fantasy-parchment/85">{npc.dislikes}</span>
                          </div>
                      )}
                      {npc.bonusDescription && (
                          <div className="p-3 bg-black/10 dark:bg-black/35 rounded-xl text-xs border border-fantasy-gold/5 font-serif whitespace-pre-line text-fantasy-wood/80 dark:text-fantasy-parchment/80 mt-2">
                              <strong className="text-fantasy-gold block mb-1">Benefício Mecânico:</strong>
                              {npc.bonusDescription}
                          </div>
                      )}
                  </div>
              )}
          </div>

          {selectedMemberId && (
              <div className="border-t-2 border-dashed border-fantasy-wood/10 dark:border-white/10 pt-4 mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                      <div>
                          <span className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest block">Afinidade</span>
                          <span className="text-xs font-serif text-fantasy-wood/70 dark:text-fantasy-parchment/70">com {focusMember?.name}</span>
                      </div>
                      <div className="text-right">
                          <span className="font-medieval text-lg text-fantasy-gold">{currentPA} / 7 PA</span>
                      </div>
                  </div>
                  
                  {/* PA dots indicator */}
                  <div className="flex gap-1.5 py-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                              i < currentPA 
                                ? 'bg-fantasy-gold border-fantasy-gold shadow-[0_0_8px_#d4af37] scale-110' 
                                : 'border-fantasy-wood/30 dark:border-white/20 bg-transparent'
                            }`} 
                            title={`${i + 1} PA`}
                          />
                      ))}
                  </div>

                  {/* Interaction buttons */}
                  {stat !== 'Morto' ? (
                      <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => interactWithNPC(npc.id, selectedMemberId, false)} 
                                className="px-3 py-2 bg-fantasy-wood/5 dark:bg-white/5 hover:bg-fantasy-wood/10 dark:hover:bg-white/10 text-fantasy-wood dark:text-fantasy-parchment border border-fantasy-wood/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                              >
                                  Interagir (+1 PA)
                              </button>
                              <button 
                                onClick={() => interactWithNPC(npc.id, selectedMemberId, true)} 
                                className="px-3 py-2 bg-fantasy-gold/10 hover:bg-fantasy-gold/20 text-fantasy-gold border border-fantasy-gold/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                                title="Interagir com algo que o NPC gosta"
                              >
                                  Agradar (+2 PA)
                              </button>
                          </div>

                          <div className="flex flex-col gap-2">
                              {/* Ultimate quest button */}
                              {currentPA >= 7 && !hasDoneQuest && (
                                  <button 
                                    onClick={() => completeUltimateQuest(npc.id, selectedMemberId)} 
                                    className="w-full py-2.5 bg-fantasy-blood hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-950 transition-all shadow-md animate-pulse active:scale-95"
                                  >
                                      ⚡ Realizar Última Demanda
                                  </button>
                              )}
                              {hasDoneQuest && (
                                  <div className="text-center py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                      ✔️ Última Demanda Concluída
                                  </div>
                              )}

                              {/* Active Affinity toggle */}
                              <button 
                                onClick={() => toggleActiveAffinity(selectedMemberId, npc.id)} 
                                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                                  isAffinityActive 
                                    ? 'bg-fantasy-gold text-black border-fantasy-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]' 
                                    : 'bg-black/20 dark:bg-black/40 hover:bg-white/5 text-fantasy-wood dark:text-fantasy-gold border-fantasy-gold/30'
                                }`}
                              >
                                  {isAffinityActive ? '★ Afinidade Ativada' : 'Ativar Afinidade'}
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center py-3 bg-red-950/20 border border-red-900/30 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          💀 Falecido - Afinidade Bloqueada
                      </div>
                  )}
              </div>
          )}
      </div>
   );
};

export default NPCsPage;
