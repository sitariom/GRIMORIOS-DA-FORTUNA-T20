import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { PointOfInterestType, ReputationTargetType, ReputationTier, PointOfInterest } from '../types';
import { Scroll, Plus, Trash2, Edit2, ShieldAlert, Check, X, Shield, Star, Award, ChevronDown, ListTree, Settings, ArrowLeft, Save } from 'lucide-react';

const POI_TYPES: PointOfInterestType[] = ['Ordem/Facção', 'Organização', 'NPC', 'Estabelecimento', 'Outro'];

export const DEFAULT_TIERS: Omit<ReputationTier, 'id'>[] = [
  { name: 'Inimigo Juramentado', minPoints: -999, maxPoints: -10, colorStyle: 'text-red-700', description: 'Hostil. Podem atacar sob vista ou perseguir ativamente.' },
  { name: 'Malvisto / Infame', minPoints: -9, maxPoints: -1, colorStyle: 'text-orange-500', description: 'Inamistoso. Dificuldade em negociar. Vigilância constante.' },
  { name: 'Desconhecido', minPoints: 0, maxPoints: 5, colorStyle: 'text-gray-500', description: 'Indiferente. Tratamento comum de plebeu ou estrangeiro.' },
  { name: 'Notável', minPoints: 6, maxPoints: 9, colorStyle: 'text-blue-500', description: 'Indiferente. Pode garantir hospitalidade básica ou salvo-conduto.' },
  { name: 'Respeitado', minPoints: 10, maxPoints: 15, colorStyle: 'text-emerald-500', description: 'Amistoso. Acesso a contatos, missões ou equipamentos restritos.' },
  { name: 'Celebrado', minPoints: 16, maxPoints: 19, colorStyle: 'text-purple-500', description: 'Amistoso. Direito a audiência com líderes, indultos ou até ajudantes.' },
  { name: 'Renomado', minPoints: 20, maxPoints: 999, colorStyle: 'text-fantasy-gold', description: 'Prestativo. Acesso a tropas, cruzadas conjuntas ou aliança direta.' },
];

const getReputationData = (value: number, customTiers?: ReputationTier[]) => {
  const tiersToUse = customTiers && customTiers.length > 0 ? customTiers : DEFAULT_TIERS as ReputationTier[];
  const sortedTiers = [...tiersToUse].sort((a,b) => a.minPoints - b.minPoints);
  
  let currentTier = sortedTiers[0] || DEFAULT_TIERS[0];
  let accumulatedDescs: { name: string, desc: string, color: string }[] = [];

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
    // For negative reputation, we gather penalties downwards
    const achieved = sortedTiers.filter(t => t.maxPoints < 0 && t.maxPoints >= value).sort((a,b) => b.maxPoints - a.maxPoints);
    accumulatedDescs = achieved.map(t => ({ name: t.name, desc: t.description, color: t.colorStyle }));
  }

  return { name: currentTier.name, color: currentTier.colorStyle, accumulated: accumulatedDescs };
};

const PoiItem = ({ poi, onUpdate, onRemove }: { poi: PointOfInterest, onUpdate: (id: string, data: Partial<PointOfInterest>) => void, onRemove: (id: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(poi.name);
  const [editType, setEditType] = useState<PointOfInterestType>(poi.type);
  const [editDesc, setEditDesc] = useState(poi.description);

  if (isEditing) {
    return (
      <div className="parchment-card p-4 rounded-xl border border-fantasy-gold/50 shadow-md flex flex-col gap-3">
        <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded p-2 focus:border-fantasy-gold" placeholder="Nome" />
        <select value={editType} onChange={e => setEditType(e.target.value as PointOfInterestType)} className="w-full bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded p-2">
          {POI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full h-16 bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded p-2" placeholder="Descrição" />
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm border border-[#3d2b1f] rounded hover:bg-black/5">Cancelar</button>
          <button onClick={() => { onUpdate(poi.id, { name: editName, type: editType, description: editDesc }); setIsEditing(false); }} className="px-3 py-1 text-sm bg-fantasy-gold text-black font-bold rounded hover:bg-yellow-500">Salvar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="parchment-card p-4 rounded-xl border border-[#3d2b1f] shadow-md flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase bg-black/10 dark:bg-black/50 px-2 py-1 rounded text-fantasy-gold">{poi.type}</span>
        </div>
        <h3 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold">{poi.name}</h3>
        {poi.description && <p className="text-sm text-fantasy-wood/70 dark:text-fantasy-parchment/70 mt-1">{poi.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-3 bg-blue-900/10 hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-900/20"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>
        <button 
          onClick={() => onRemove(poi.id)}
          className="p-3 bg-red-900/10 hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-900/20"
          title="Remover"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
const PoiTiersEditor = ({ poi, onSave, onCancel }: { poi: PointOfInterest, onSave: (tiers: ReputationTier[]) => void, onCancel: () => void }) => {
  const [tiers, setTiers] = useState<ReputationTier[]>(poi.tiers || DEFAULT_TIERS.map(t => ({...t, id: crypto.randomUUID()})));

  const handleCreate = () => {
    setTiers([...tiers, { id: crypto.randomUUID(), name: 'Nova Categoria', minPoints: 0, maxPoints: 0, colorStyle: 'text-gray-500', description: 'Sem efeitos.' }]);
  };

  const updateTier = (id: string, updates: Partial<ReputationTier>) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };

  const handleRestoreDefaults = () => {
    if (confirm("Deseja realmente restaurar os patamares e recompensas para o padrão da Dragão Brasil? Isso apagará suas edições neste POI.")) {
      setTiers(DEFAULT_TIERS.map(t => ({...t, id: crypto.randomUUID()})));
    }
  };

  return (
    <div className="parchment-card rounded-2xl shadow-xl border-2 border-[#3d2b1f] overflow-hidden p-6 gap-4 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#3d2b1f] pb-4 mb-4 gap-4">
        <div>
           <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2">
             <Settings className="text-fantasy-gold" /> Editar Patamares: {poi.name}
           </h3>
           <p className="text-sm text-fantasy-wood/70 dark:text-fantasy-parchment/70 mt-1">
             Defina as faixas de pontos, nome da categoria e as recompensas correspondentes.
           </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
           <button onClick={handleRestoreDefaults} className="px-4 py-2 bg-red-900/10 hover:bg-red-900/30 text-red-600 border border-red-900/30 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold">
             Restaurar Padrões
           </button>
           <button onClick={onCancel} className="px-4 py-2 border border-[#3d2b1f] hover:bg-black/5 rounded-lg flex items-center gap-2 transition-colors font-bold">
              <ArrowLeft size={18} /> Voltar
           </button>
           <button onClick={() => onSave(tiers)} className="px-4 py-2 bg-fantasy-gold hover:bg-yellow-500 text-black rounded-lg flex items-center gap-2 shadow-lg transition-colors font-bold">
              <Save size={18} /> Salvar Patamares
           </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {tiers.sort((a,b) => a.minPoints - b.minPoints).map(tier => (
          <div key={tier.id} className="bg-black/5 dark:bg-black/30 border border-[#3d2b1f]/50 p-4 rounded-xl flex gap-4 items-start sm:items-center flex-col sm:flex-row relative">
            <button onClick={() => removeTier(tier.id)} className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
               <label className="text-[10px] font-bold uppercase tracking-widest text-[#3d2b1f] dark:text-fantasy-parchment/50">Pontuação</label>
               <div className="flex items-center gap-2">
                  <input type="number" value={tier.minPoints} onChange={e => updateTier(tier.id, { minPoints: parseInt(e.target.value)||0 })} className="w-16 p-2 bg-white/50 dark:bg-black/80 border border-[#3d2b1f] rounded text-center" />
                  <span className="text-fantasy-wood/50">até</span>
                  <input type="number" value={tier.maxPoints} onChange={e => updateTier(tier.id, { maxPoints: parseInt(e.target.value)||0 })} className="w-16 p-2 bg-white/50 dark:bg-black/80 border border-[#3d2b1f] rounded text-center" />
               </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:w-1/4">
               <label className="text-[10px] font-bold uppercase tracking-widest text-[#3d2b1f] dark:text-fantasy-parchment/50">Categoria</label>
               <input value={tier.name} onChange={e => updateTier(tier.id, { name: e.target.value })} className="w-full p-2 bg-white/50 dark:bg-black/80 border border-[#3d2b1f] rounded font-medieval text-lg" placeholder="Nome" />
               <select value={tier.colorStyle} onChange={e => updateTier(tier.id, { colorStyle: e.target.value })} className="w-full p-1 bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded text-[10px]">
                 <option value="text-fantasy-wood">Padrão</option>
                 <option value="text-fantasy-gold">Dourado</option>
                 <option value="text-red-700">Vermelho</option>
                 <option value="text-emerald-500">Esmeralda</option>
                 <option value="text-blue-500">Azul</option>
                 <option value="text-purple-500">Roxo</option>
                 <option value="text-orange-500">Laranja</option>
                 <option value="text-gray-500">Cinza</option>
               </select>
            </div>

            <div className="flex flex-col gap-2 w-full flex-1">
               <label className="text-[10px] font-bold uppercase tracking-widest text-[#3d2b1f] dark:text-fantasy-parchment/50">Recompensas / Benefícios</label>
               <textarea value={tier.description} onChange={e => updateTier(tier.id, { description: e.target.value })} className="w-full p-2 bg-white/50 dark:bg-black/80 border border-[#3d2b1f] rounded text-sm min-h-[46px]" placeholder="O que o grupo ganha ou perde neste nível?" />
            </div>
          </div>
        ))}

        <button onClick={handleCreate} className="w-full py-4 border-2 border-dashed border-[#3d2b1f]/50 hover:border-fantasy-gold hover:text-fantasy-gold rounded-xl flex items-center justify-center gap-2 transition-colors text-fantasy-wood/60 dark:text-fantasy-parchment/60">
           <Plus size={20} /> Nova Faixa de Reputação
        </button>
      </div>
    </div>
  );
};

const ReputationPage: React.FC = () => {
  const { 
    pointsOfInterest, reputations, members, guildName, 
    addPointOfInterest, updatePointOfInterest, removePointOfInterest,
    addReputation, updateReputation, removeReputation
  } = useGuild();

  const [activeTab, setActiveTab] = useState<'pois' | 'manage' | 'tiers'>('manage');
  const [selectedPoiId, setSelectedPoiId] = useState<string>('');

  // POI Form
  const [newPoiName, setNewPoiName] = useState('');
  const [newPoiType, setNewPoiType] = useState<PointOfInterestType>('Ordem/Facção');
  const [newPoiDesc, setNewPoiDesc] = useState('');

  const handleAddPoi = () => {
    if (!newPoiName.trim()) return;
    addPointOfInterest({
      name: newPoiName,
      type: newPoiType,
      description: newPoiDesc
    });
    setNewPoiName('');
    setNewPoiDesc('');
    setNewPoiType('Ordem/Facção');
  };

  const getTargetReputation = (poiId: string, targetType: ReputationTargetType, targetId: string) => {
    return reputations.find(r => r.pointOfInterestId === poiId && r.targetType === targetType && r.targetId === targetId);
  };

  const changeReputation = (poiId: string, targetType: ReputationTargetType, targetId: string, amount: number) => {
    const existing = getTargetReputation(poiId, targetType, targetId);
    if (existing) {
      updateReputation(existing.id, { value: existing.value + amount });
    } else {
      addReputation({
        pointOfInterestId: poiId,
        targetType,
        targetId,
        value: amount
      });
    }
  };

  const setExactReputation = (poiId: string, targetType: ReputationTargetType, targetId: string, exact: number) => {
    const existing = getTargetReputation(poiId, targetType, targetId);
    if (existing) {
      updateReputation(existing.id, { value: exact });
    } else {
      addReputation({
        pointOfInterestId: poiId,
        targetType,
        targetId,
        value: exact
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10 w-full px-2 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medieval text-[#1a0f08] dark:text-fantasy-gold mb-2 flex items-center gap-3 drop-shadow-sm">
            <Scroll className="text-fantasy-gold" size={32} />
            Gestão de Reputação
          </h1>
          <p className="text-sm sm:text-base text-fantasy-wood/80 dark:text-fantasy-parchment/60 max-w-2xl">
            Acompanhe a sua influência no mundo. Crie laços com organizações e veja até onde o renome de vocês alcança.
          </p>
        </div>
        <div className="flex bg-[#2a1b14] p-1 rounded-lg border-2 border-fantasy-gold/20 shadow-lg">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-md font-medieval text-sm transition-all flex items-center gap-2 ${
              activeTab === 'manage' ? 'bg-fantasy-gold relative shadow-md text-black overflow-hidden' : 'text-fantasy-parchment/70 hover:text-fantasy-gold hover:bg-white/5'
            }`}
          >
            Gestão
          </button>
          <button
            onClick={() => setActiveTab('pois')}
            className={`px-4 py-2 rounded-md font-medieval text-sm transition-all flex items-center gap-2 ${
              activeTab === 'pois' ? 'bg-fantasy-gold relative shadow-md text-black overflow-hidden' : 'text-fantasy-parchment/70 hover:text-fantasy-gold hover:bg-white/5'
            }`}
          >
            Pontos de Interesse
          </button>
        </div>
      </div>

      {activeTab === 'pois' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 parchment-card p-6 rounded-2xl shadow-xl border-2 border-fantasy-gold/20 flex flex-col h-fit">
            <h2 className="font-medieval text-xl sm:text-2xl text-fantasy-wood dark:text-fantasy-gold mb-6 border-b-2 border-fantasy-gold/20 pb-2 flex items-center gap-3">
              <ShieldAlert size={24} className="text-fantasy-gold" />
              Novo Ponto de Interesse
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/50 uppercase tracking-widest mb-1">Nome</label>
                <input 
                  value={newPoiName} 
                  onChange={e => setNewPoiName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded-lg p-3 text-fantasy-wood dark:text-fantasy-parchment focus:border-fantasy-gold focus:ring-1 focus:ring-fantasy-gold" 
                  placeholder="Ex: ProGrit, Exército do Reinado..."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/50 uppercase tracking-widest mb-1">Tipo</label>
                <select 
                  value={newPoiType} 
                  onChange={e => setNewPoiType(e.target.value as PointOfInterestType)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded-lg p-3 text-fantasy-wood dark:text-fantasy-parchment focus:border-fantasy-gold focus:ring-1 focus:ring-fantasy-gold" 
                >
                  {POI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/50 uppercase tracking-widest mb-1">Descrição</label>
                <textarea 
                  value={newPoiDesc} 
                  onChange={e => setNewPoiDesc(e.target.value)}
                  className="w-full h-24 bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded-lg p-3 text-fantasy-wood dark:text-fantasy-parchment focus:border-fantasy-gold focus:ring-1 focus:ring-fantasy-gold" 
                  placeholder="Deixe notas e detalhes aqui..."
                />
              </div>
              <button 
                onClick={handleAddPoi}
                disabled={!newPoiName.trim()}
                className="w-full bg-fantasy-gold hover:bg-yellow-500 text-black font-medieval text-lg px-4 py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Adicionar
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {pointsOfInterest.length === 0 ? (
              <div className="parchment-card p-12 text-center rounded-2xl border border-dashed border-[#3d2b1f]/50 bg-black/5">
                <ShieldAlert size={48} className="mx-auto text-fantasy-wood/30 dark:text-fantasy-gold/30 mb-4" />
                <h3 className="font-medieval text-xl text-fantasy-wood/60 dark:text-fantasy-parchment/60">Nenhum Ponto de Interesse</h3>
                <p className="text-sm mt-2 text-fantasy-wood/40 dark:text-fantasy-parchment/40">Comece adicionando facções, NPCs ou guildas rivais.</p>
              </div>
            ) : (
              pointsOfInterest.map(poi => (
                <PoiItem key={poi.id} poi={poi} onUpdate={updatePointOfInterest} onRemove={removePointOfInterest} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'tiers' && selectedPoiId && (() => {
        const currentPoi = pointsOfInterest.find(p => p.id === selectedPoiId);
        if (!currentPoi) return null;
        return (
          <PoiTiersEditor 
            poi={currentPoi}
            onSave={(tiers) => {
               updatePointOfInterest(selectedPoiId, { tiers });
               setActiveTab('manage');
            }}
            onCancel={() => setActiveTab('manage')}
          />
        );
      })()}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="parchment-card p-6 rounded-2xl shadow-xl border-2 border-fantasy-gold/20 max-w-2xl">
            <label className="block text-sm font-black text-fantasy-wood/80 dark:text-fantasy-parchment/80 uppercase tracking-widest mb-3">
              Selecione um Ponto de Interesse
            </label>
            <div className="relative">
              <select 
                value={selectedPoiId} 
                onChange={e => setSelectedPoiId(e.target.value)}
                className="w-full appearance-none font-medieval text-xl bg-black/5 dark:bg-black/40 border border-[#3d2b1f] rounded-xl p-4 pr-12 text-fantasy-wood dark:text-fantasy-parchment focus:border-fantasy-gold transition-colors outline-none cursor-pointer"
              >
                <option value="">-- Selecione --</option>
                {pointsOfInterest.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-fantasy-gold pointer-events-none" size={24} />
            </div>
            {pointsOfInterest.length === 0 && (
              <p className="text-xs text-red-500 mt-2">Você precisa cadastrar um POI primeiro na aba ao lado.</p>
            )}
          </div>

          {selectedPoiId && (() => {
            const currentPoi = pointsOfInterest.find(p => p.id === selectedPoiId);
            return (
              <div className="space-y-6">
                <div className="parchment-card rounded-2xl shadow-xl border-2 border-[#3d2b1f] overflow-hidden">
                   <div className="bg-[#1e140d]/10 dark:bg-black/40 p-6 border-b border-[#3d2b1f] flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2">
                          Níveis de Afinidade & Reputação
                        </h3>
                        <p className="text-sm text-fantasy-wood/70 dark:text-fantasy-parchment/70 mt-1">
                          Acompanhe a reputação do grupo ou membros individuais. Pressione "Editar Patamares" para alterar recompensas desta categoria.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('tiers')} 
                        className="px-4 py-2 bg-[#2a1b14] hover:bg-[#3d2b1f] text-fantasy-gold border border-fantasy-gold/30 rounded flex items-center gap-2 transition-colors shrink-0"
                      >
                         <Settings size={18} /> <span className="hidden sm:inline">Editar Patamares</span>
                      </button>
                   </div>
                   <div className="p-0 overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[700px]">
                       <thead>
                         <tr className="bg-[#1e140d]/5 dark:bg-black/20 border-b border-[#3d2b1f] text-xs font-bold uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">
                           <th className="p-4 pl-6">Alvo</th>
                           <th className="p-4">Categoria e Recompensa</th>
                           <th className="p-4 text-center">Pontos</th>
                           <th className="p-4 text-center">Ações Rápidas</th>
                           <th className="p-4 pr-6 text-right">Ajuste Manual</th>
                         </tr>
                       </thead>
                       <tbody>
                         {/* Grupo (Guilda) */}
                         <tr className="border-b border-[#3d2b1f]/30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                           <td className="p-4 pl-6 font-medieval text-lg text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2">
                             <Shield size={18} /> {guildName} (O Grupo)
                           </td>
                           <ReputationRow 
                             poiId={selectedPoiId} 
                             targetType="Grupo" 
                             targetId="guild" 
                             value={getTargetReputation(selectedPoiId, 'Grupo', 'guild')?.value || 0}
                             customTiers={currentPoi?.tiers}
                             onChange={(amt) => changeReputation(selectedPoiId, 'Grupo', 'guild', amt)}
                             onSetExact={(amt) => setExactReputation(selectedPoiId, 'Grupo', 'guild', amt)}
                           />
                         </tr>
                         {/* Members */}
                         {members.filter(m => {
                           const s = String(m.status || 'Ativo').trim().toLowerCase();
                          return s === 'ativo';
                         }).map(m => {
                           const val = getTargetReputation(selectedPoiId, 'Membro', m.id)?.value || 0;
                           return (
                             <tr key={m.id} className="border-b border-[#3d2b1f]/30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                               <td className="p-4 pl-6 font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment ml-6 pl-[3.25rem]">
                                 {m.name}
                               </td>
                               <ReputationRow 
                                 poiId={selectedPoiId} 
                                 targetType="Membro" 
                                 targetId={m.id} 
                                 value={val}
                                 customTiers={currentPoi?.tiers}
                                 onChange={(amt) => changeReputation(selectedPoiId, 'Membro', m.id, amt)}
                                 onSetExact={(amt) => setExactReputation(selectedPoiId, 'Membro', m.id, amt)}
                               />
                             </tr>
                           );
                         })}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Internal Component for the Table Row Cells
const ReputationRow = ({ 
  value, onChange, onSetExact, customTiers
}: { 
  poiId: string; targetType: string; targetId: string; value: number; 
  onChange: (amt: number) => void; onSetExact: (amt: number) => void;
  customTiers?: ReputationTier[];
}) => {
  const cat = getReputationData(value, customTiers);
  const [editMode, setEditMode] = useState(false);
  const [exactVal, setExactVal] = useState(String(value));

  const handleSaveExact = () => {
    const parsed = parseInt(exactVal, 10);
    if (!isNaN(parsed)) {
      onSetExact(parsed);
    }
    setEditMode(false);
  };

  return (
    <>
      <td className="p-4 align-top">
        <div className={`font-bold text-sm sm:text-base ${cat.color}`}>{cat.name}</div>
        <div className="flex flex-col gap-1 mt-2">
          {cat.accumulated.map((tier, idx) => (
             <div key={idx} className="flex gap-2 items-start border-l-2 border-fantasy-gold/30 pl-2">
                <span className={`text-[10px] uppercase font-bold shrink-0 ${tier.color}`}>{tier.name}</span>
                <span className="text-[10px] sm:text-xs text-fantasy-wood/70 dark:text-fantasy-parchment/70 leading-tight">{tier.desc}</span>
             </div>
          ))}
        </div>
      </td>
      <td className="p-4 font-medieval text-xl text-center align-top pt-5">
        {editMode ? (
           <div className="flex items-center gap-1">
             <input type="number" className="w-16 p-1 text-black rounded text-center" value={exactVal} onChange={e => setExactVal(e.target.value)} />
             <button onClick={handleSaveExact} className="text-green-500"><Check size={18}/></button>
           </div>
        ) : (
          <span className="flex items-center justify-center gap-2 cursor-pointer group" onClick={() => { setEditMode(true); setExactVal(String(value)); }}>
            {value} <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-fantasy-gold transition-opacity"/>
          </span>
        )}
      </td>
      <td className="p-4 text-center align-top pt-5">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <button title="Missão Simples / Código de Conduta" onClick={() => onChange(1)} className="px-2 py-1 bg-green-900/20 hover:bg-green-600/40 text-green-600 dark:text-green-400 rounded text-xs font-bold">+1</button>
          <button title="Missão Importante / Doação" onClick={() => onChange(2)} className="px-2 py-1 bg-green-900/20 hover:bg-green-600/40 text-green-600 dark:text-green-400 rounded text-xs font-bold">+2</button>
          <button title="Feito Histórico (+5)" onClick={() => onChange(5)} className="px-2 py-1 bg-green-900/30 hover:bg-green-600/50 text-green-600 dark:text-green-400 rounded text-xs font-bold">+5</button>
          
          <button title="Falha Simples / Conflito" onClick={() => onChange(-1)} className="px-2 py-1 bg-red-900/20 hover:bg-red-600/40 text-red-600 dark:text-red-400 rounded text-xs font-bold ml-2">-1</button>
          <button title="Escândalo" onClick={() => onChange(-2)} className="px-2 py-1 bg-red-900/20 hover:bg-red-600/40 text-red-600 dark:text-red-400 rounded text-xs font-bold">-2</button>
          <button title="Crime / Falha Histórica" onClick={() => onChange(-5)} className="px-2 py-1 bg-red-900/30 hover:bg-red-600/50 text-red-600 dark:text-red-400 rounded text-xs font-bold">-5</button>
        </div>
      </td>
      <td className="p-4 pr-6 text-right align-top pt-5">
         <button title="Distinção Recebida" onClick={() => onChange(10)} className="text-xs px-2 py-1 bg-fantasy-gold/20 text-fantasy-gold hover:bg-fantasy-gold/40 border border-fantasy-gold/30 rounded flex items-center gap-1 mx-auto ml-auto">
            <Star size={12}/> +10
         </button>
      </td>
    </>
  );
};

export default ReputationPage;
