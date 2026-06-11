import React, { useState, useEffect } from 'react';
import { useGuild } from '../context/GuildContext';
import { PointOfInterestType, ReputationTargetType, ReputationTier, PointOfInterest } from '../types';
import { Scroll, Plus, Trash2, Edit2, ShieldAlert, Check, X, Shield, Star, Award, ChevronDown, ListTree, Settings, ArrowLeft, Save } from 'lucide-react';
import AnimatedCard from '../components/AnimatedCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';

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
      <div className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-gold/30 bg-fantasy-gold/5 shadow-lg flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2">Nome do Ponto de Interesse</label>
          <input 
            value={editName} 
            onChange={e => setEditName(e.target.value)} 
            className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-fantasy-wood dark:text-fantasy-parchment" 
            placeholder="Nome" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2">Tipo</label>
          <select 
            value={editType} 
            onChange={e => setEditType(e.target.value as PointOfInterestType)} 
            className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-fantasy-wood dark:text-fantasy-gold cursor-pointer"
          >
            {POI_TYPES.map(t => <option key={t} value={t} className="dark:bg-black">{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2">Descrição</label>
          <textarea 
            value={editDesc} 
            onChange={e => setEditDesc(e.target.value)} 
            className="w-full h-20 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-fantasy-wood dark:text-fantasy-parchment" 
            placeholder="Descrição" 
          />
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-[#3d2b1f] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl font-medieval text-xs uppercase tracking-wider transition-all active:scale-95">Cancelar</button>
          <button onClick={() => { onUpdate(poi.id, { name: editName, type: editType, description: editDesc }); setIsEditing(false); }} className="px-5 py-2.5 bg-fantasy-gold hover:bg-yellow-500 text-black font-medieval text-xs uppercase tracking-wider rounded-xl font-bold shadow-md transition-all active:scale-95">Salvar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="parchment-card p-6 rounded-[32px] border border-fantasy-wood/10 dark:border-white/10 bg-white/5 dark:bg-black/20 shadow-xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group hover:border-fantasy-gold/30 transition-all duration-300">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase bg-fantasy-gold/15 text-fantasy-gold px-2.5 py-1 rounded-full border border-fantasy-gold/30">{poi.type}</span>
        </div>
        <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-gold leading-tight">{poi.name}</h3>
        {poi.description && <p className="text-xs font-serif text-fantasy-wood/70 dark:text-fantasy-parchment/70 mt-1">{poi.description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-3 bg-blue-900/10 hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all border border-blue-900/20 hover:scale-105 active:scale-95"
          title="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => { if(confirm(`Excluir ${poi.name}?`)) onRemove(poi.id); }}
          className="p-3 bg-red-900/10 hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-red-900/20 hover:scale-105 active:scale-95"
          title="Remover"
        >
          <Trash2 size={16} />
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
    <div className="parchment-card rounded-[48px] shadow-2xl border-2 border-fantasy-gold/20 overflow-hidden p-8 gap-6 flex flex-col bg-white/5 dark:bg-black/20">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-fantasy-wood/10 dark:border-white/10 pb-6 mb-4 gap-6">
        <div>
           <h3 className="font-medieval text-3xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-2 uppercase tracking-tight">
             <Settings className="text-fantasy-gold shrink-0" size={28} /> Editar Patamares: {poi.name}
           </h3>
           <p className="text-xs text-fantasy-wood/70 dark:text-fantasy-parchment/60 mt-1 uppercase tracking-wider">
             Defina as faixas de pontos, nome da categoria e as recompensas correspondentes.
           </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap w-full xl:w-auto">
           <button onClick={handleRestoreDefaults} className="flex-1 xl:flex-none px-5 py-3.5 bg-fantasy-blood/10 hover:bg-fantasy-blood/20 text-red-400 border border-fantasy-blood/30 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider active:scale-95">
              Restaurar Padrões
            </button>
            <button onClick={onCancel} className="flex-1 xl:flex-none px-5 py-3.5 border border-fantasy-wood/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-fantasy-wood dark:text-fantasy-parchment rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider active:scale-95">
               <ArrowLeft size={16} /> Voltar
            </button>
            <button onClick={() => onSave(tiers)} className="flex-1 xl:flex-none px-6 py-3.5 bg-fantasy-gold hover:bg-yellow-500 text-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all font-bold text-xs uppercase tracking-wider active:scale-95">
               <Save size={16} /> Salvar Patamares
            </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {tiers.sort((a,b) => a.minPoints - b.minPoints).map(tier => (
          <div key={tier.id} className="bg-black/10 dark:bg-black/30 border border-fantasy-wood/10 dark:border-white/15 p-6 rounded-[32px] flex gap-6 items-start xl:items-center flex-col xl:flex-row relative group/tier hover:border-fantasy-gold/30 transition-all duration-300">
            <button onClick={() => removeTier(tier.id)} className="absolute top-4 right-4 text-fantasy-blood/50 hover:text-red-500 transition-colors p-2 bg-black/5 dark:bg-white/5 rounded-full active:scale-95" title="Remover"><Trash2 size={16} /></button>
            
            <div className="flex flex-col gap-1 w-full xl:w-auto shrink-0">
               <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2">Pontuação</label>
               <div className="flex items-center gap-2">
                  <input type="number" value={tier.minPoints} onChange={e => updateTier(tier.id, { minPoints: parseInt(e.target.value)||0 })} className="w-20 p-3 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl text-center font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment" />
                  <span className="text-fantasy-wood/50 dark:text-fantasy-parchment/50 font-serif text-xs">até</span>
                  <input type="number" value={tier.maxPoints} onChange={e => updateTier(tier.id, { maxPoints: parseInt(e.target.value)||0 })} className="w-20 p-3 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl text-center font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment" />
               </div>
            </div>
            
            <div className="flex flex-col gap-1 w-full xl:w-1/4 shrink-0">
               <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2">Categoria</label>
               <input value={tier.name} onChange={e => updateTier(tier.id, { name: e.target.value })} className="w-full p-3 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment" placeholder="Nome" />
               <select value={tier.colorStyle} onChange={e => updateTier(tier.id, { colorStyle: e.target.value })} className="w-full p-2 bg-white/40 dark:bg-black/40 border border-fantasy-wood/10 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider text-fantasy-gold cursor-pointer mt-1">
                 <option value="text-fantasy-wood" className="dark:bg-black">Padrão</option>
                 <option value="text-fantasy-gold" className="dark:bg-black">Dourado</option>
                 <option value="text-red-700" className="dark:bg-black">Vermelho</option>
                 <option value="text-emerald-500" className="dark:bg-black">Esmeralda</option>
                 <option value="text-blue-500" className="dark:bg-black">Azul</option>
                 <option value="text-purple-500" className="dark:bg-black">Roxo</option>
                 <option value="text-orange-500" className="dark:bg-black">Laranja</option>
                 <option value="text-gray-500" className="dark:bg-black">Cinza</option>
               </select>
            </div>

            <div className="flex flex-col gap-1 w-full flex-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2">Recompensas / Benefícios</label>
               <textarea value={tier.description} onChange={e => updateTier(tier.id, { description: e.target.value })} className="w-full p-3 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl text-sm min-h-[60px] text-fantasy-wood dark:text-fantasy-parchment font-serif" placeholder="O que o grupo ganha ou perde neste nível?" />
            </div>
          </div>
        ))}

        <button onClick={handleCreate} className="w-full py-5 border-2 border-dashed border-fantasy-wood/20 dark:border-white/10 hover:border-fantasy-gold hover:text-fantasy-gold rounded-[24px] flex items-center justify-center gap-2 transition-all text-fantasy-wood/60 dark:text-fantasy-parchment/60 font-medieval uppercase text-xs tracking-wider active:scale-95">
           <Plus size={18} /> Nova Faixa de Reputação
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-fantasy-wood dark:text-white tracking-tighter uppercase leading-none mb-2">Gestão de Reputação</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Influência e renome perante as facções, NPCs e organizações de Arton.</p>
        </div>
        <div className="flex bg-[#2a1b14] dark:bg-black/60 p-1 rounded-2xl border-2 border-fantasy-gold/20 shadow-lg w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 lg:flex-none py-3.5 px-8 rounded-xl font-medieval text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 ${
              activeTab === 'manage' ? 'bg-fantasy-gold text-black font-bold shadow-md' : 'text-fantasy-parchment/65 hover:text-fantasy-gold hover:bg-white/5'
            }`}
          >
            Reputação do Grupo
          </button>
          <button
            onClick={() => setActiveTab('pois')}
            className={`flex-1 lg:flex-none py-3.5 px-8 rounded-xl font-medieval text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 ${
              activeTab === 'pois' ? 'bg-fantasy-gold text-black font-bold shadow-md' : 'text-fantasy-parchment/65 hover:text-fantasy-gold hover:bg-white/5'
            }`}
          >
            Pontos de Interesse
          </button>
        </div>
      </header>

      {activeTab === 'pois' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 parchment-card p-8 rounded-[48px] border-2 border-fantasy-gold/20 shadow-2xl flex flex-col h-fit bg-white/5 dark:bg-black/20">
            <h2 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-gold mb-6 border-b-2 border-fantasy-gold/20 pb-3 flex items-center gap-3">
              <ShieldAlert size={24} className="text-fantasy-gold shrink-0" />
              Novo Ponto de Interesse
            </h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2 block">Nome</label>
                <input 
                  value={newPoiName} 
                  onChange={e => setNewPoiName(e.target.value)}
                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-lg focus:outline-none focus:border-fantasy-gold transition-all" 
                  placeholder="Ex: ProGrit, Exército do Reinado..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2 block">Tipo</label>
                <select 
                  value={newPoiType} 
                  onChange={e => setNewPoiType(e.target.value as PointOfInterestType)}
                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-lg text-fantasy-wood dark:text-fantasy-gold cursor-pointer focus:outline-none focus:border-fantasy-gold transition-all appearance-none" 
                >
                  {POI_TYPES.map(t => <option key={t} value={t} className="dark:bg-black">{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-gold ml-2 block">Descrição</label>
                <textarea 
                  value={newPoiDesc} 
                  onChange={e => setNewPoiDesc(e.target.value)}
                  className="w-full h-24 bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-serif text-sm focus:outline-none focus:border-fantasy-gold transition-all" 
                  placeholder="Deixe notas e detalhes aqui..."
                />
              </div>
              <button 
                onClick={handleAddPoi}
                disabled={!newPoiName.trim()}
                className="w-full bg-fantasy-gold hover:bg-yellow-500 text-black font-medieval text-lg py-4 rounded-[28px] transition-all shadow-lg active:translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border-b-4 border-yellow-800 disabled:border-transparent font-bold uppercase tracking-wider"
              >
                <Plus size={20} /> Adicionar POI
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {pointsOfInterest.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="Nenhum Ponto de Interesse"
                description="Comece cadastrando facções, NPCs ou guildas no menu ao lado."
              />
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
        <div className="space-y-10">
          <div className="parchment-card p-8 rounded-[32px] border-2 border-fantasy-gold/30 bg-fantasy-gold/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Scroll className="text-fantasy-gold" size={28}/>
              <div>
                <span className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest block">Selecione uma Facção / Ponto de Interesse</span>
                <p className="text-xs text-fantasy-wood/70 dark:text-fantasy-parchment/70">Acompanhe e administre o nível de afinidade e influência do grupo e de heróis.</p>
              </div>
            </div>
            <div className="relative w-full md:w-80">
              <select 
                value={selectedPoiId} 
                onChange={e => setSelectedPoiId(e.target.value)}
                className="w-full appearance-none font-medieval text-lg bg-white/50 dark:bg-black/40 border-2 border-fantasy-gold/20 rounded-2xl pl-4 pr-12 py-3 text-fantasy-wood dark:text-fantasy-gold cursor-pointer outline-none focus:border-fantasy-gold transition-all"
              >
                <option value="" className="dark:bg-black">-- Selecione um POI --</option>
                {pointsOfInterest.map(p => <option key={p.id} value={p.id} className="dark:bg-black">{p.name} ({p.type})</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-fantasy-gold pointer-events-none" size={20} />
            </div>
          </div>

          {!selectedPoiId ? (
            <EmptyState
              icon={Scroll}
              title="Nenhum Ponto de Interesse Selecionado"
              description="Escolha uma facção ou organização no menu acima para gerenciar a reputação."
            />
          ) : (() => {
            const currentPoi = pointsOfInterest.find(p => p.id === selectedPoiId);
            if (!currentPoi) return null;
            return (
              <div className="space-y-8 animate-fade-in">
                <div className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-gold/20 bg-black/10 dark:bg-black/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase bg-fantasy-gold/15 text-fantasy-gold px-3 py-1 rounded-full border border-fantasy-gold/30">{currentPoi.type}</span>
                    </div>
                    <h3 className="font-medieval text-3xl text-fantasy-wood dark:text-fantasy-gold leading-tight">{currentPoi.name}</h3>
                    {currentPoi.description && <p className="text-xs font-serif text-fantasy-wood/80 dark:text-fantasy-parchment/80 mt-1 max-w-2xl">{currentPoi.description}</p>}
                  </div>
                  <button 
                    onClick={() => setActiveTab('tiers')} 
                    className="px-6 py-3.5 bg-fantasy-wood dark:bg-fantasy-gold hover:bg-white/5 dark:hover:bg-fantasy-gold/80 text-white dark:text-black font-medieval text-xs uppercase tracking-wider rounded-xl border border-fantasy-gold/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 font-bold"
                  >
                     <Settings size={14} /> Editar Patamares
                  </button>
                </div>

                <div className="parchment-card rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10 overflow-hidden shadow-3xl bg-white/5 dark:bg-black/20">
                   <div className="p-0 overflow-x-auto custom-scrollbar">
                     <table className="w-full text-left border-collapse min-w-[800px]">
                       <thead>
                         <tr className="bg-black/20 border-b-2 border-fantasy-wood/10 dark:border-white/10 text-xs font-black uppercase tracking-[0.15em] text-fantasy-wood/70 dark:text-fantasy-parchment/60">
                           <th className="p-6 pl-8">Alvo</th>
                           <th className="p-6">Influência e Benefícios Ativos</th>
                           <th className="p-6 text-center">Pontos</th>
                           <th className="p-6 text-center">Ações Rápidas</th>
                           <th className="p-6 pr-8 text-right">Ajuste Especial</th>
                         </tr>
                       </thead>
                       <tbody>
                         {/* Grupo (Guilda) */}
                         <tr className="border-b border-fantasy-wood/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                           <td className="p-6 pl-8 align-top font-medieval text-xl text-fantasy-wood dark:text-fantasy-gold flex items-center gap-3">
                             <div className="wax-seal w-10 h-10 flex items-center justify-center bg-fantasy-gold/10 border border-fantasy-gold/30 rounded-full shrink-0">
                               <Shield size={18} className="text-fantasy-gold" />
                             </div>
                             <div>
                               <span className="block">{guildName}</span>
                               <span className="text-[10px] uppercase font-black tracking-wider text-fantasy-gold/70">O Grupo</span>
                             </div>
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
                             <tr key={m.id} className="border-b border-fantasy-wood/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                               <td className="p-6 pl-8 align-top font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment">
                                 <div className="flex items-center gap-3">
                                   <div className="wax-seal w-10 h-10 flex items-center justify-center bg-white/5 border border-fantasy-wood/10 dark:border-white/10 rounded-full shrink-0">
                                     <Star size={18} className="text-fantasy-parchment/70" />
                                   </div>
                                   <div>
                                     <span className="block">{m.name}</span>
                                     <span className="text-[10px] uppercase font-black tracking-wider text-fantasy-parchment/40">Aventureiro</span>
                                   </div>
                                 </div>
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

  const sortedTiersForBar = [...(customTiers && customTiers.length > 0 ? customTiers : DEFAULT_TIERS as ReputationTier[])].sort((a,b) => a.minPoints - b.minPoints);
  const currentTierForBar = sortedTiersForBar.find(t => value >= t.minPoints && value <= t.maxPoints) || sortedTiersForBar[0] || DEFAULT_TIERS[0];
  const tierRange = currentTierForBar.maxPoints - currentTierForBar.minPoints;
  const progressInTier = tierRange > 0 ? Math.min(100, Math.max(0, ((value - currentTierForBar.minPoints) / tierRange) * 100)) : 100;

  const handleSaveExact = () => {
    const parsed = parseInt(exactVal, 10);
    if (!isNaN(parsed)) {
      onSetExact(parsed);
    }
    setEditMode(false);
  };

  return (
    <>
      <td className="p-6 align-top">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border mb-2 ${getBadgeStyle(cat.color)} shadow-[0_0_30px_rgba(212,175,55,0.3)] border-2 border-fantasy-gold/50`}>
          {cat.name}
        </span>
        <div className="flex flex-col gap-2 mt-2 max-w-sm">
          {cat.accumulated.map((tier, idx) => (
             <AnimatedCard key={idx} delay={idx * 100} className="flex gap-2 items-start border-l-2 border-fantasy-gold/30 pl-2 font-serif">
                <span className={`text-[10px] uppercase font-black shrink-0 ${tier.color}`}>{tier.name}:</span>
                <span className="text-xs text-fantasy-wood/80 dark:text-fantasy-parchment/80 leading-tight">{tier.desc}</span>
             </AnimatedCard>
          ))}
        </div>
      </td>
      <td className="p-6 text-center align-top pt-8">
        {editMode ? (
           <div className="flex items-center justify-center gap-1.5 animate-fade-in">
             <input 
               type="number" 
               className="w-20 bg-white/80 dark:bg-black/80 border-2 border-fantasy-gold text-fantasy-wood dark:text-fantasy-gold rounded-lg px-2 py-1 text-center font-medieval text-lg focus:outline-none" 
               value={exactVal} 
               onChange={e => setExactVal(e.target.value)} 
               onKeyDown={e => { if (e.key === 'Enter') handleSaveExact(); }}
               autoFocus
             />
       <button onClick={handleSaveExact} className="p-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors border border-emerald-950 shadow-md active:scale-95" title="Salvar"><Check size={14}/></button>
              <button onClick={() => setEditMode(false)} className="p-1.5 bg-fantasy-blood hover:bg-red-700 text-white rounded-lg transition-colors border border-red-950 shadow-md active:scale-95" title="Cancelar"><X size={14}/></button>
            </div>
         ) : (
           <div className="animate-fade-in flex flex-col items-center gap-3">
             <span className="flex items-center justify-center gap-2 cursor-pointer group/points py-1 px-3 bg-black/10 dark:bg-black/40 border border-fantasy-wood/10 dark:border-white/5 rounded-xl font-medieval text-2xl text-fantasy-wood dark:text-fantasy-gold hover:border-fantasy-gold/40 transition-colors w-fit mx-auto" onClick={() => { setEditMode(true); setExactVal(String(value)); }} title="Clique para editar valor exato">
               {value} 
               <Edit2 size={12} className="opacity-0 group-hover/points:opacity-100 text-fantasy-gold/60 hover:text-fantasy-gold transition-opacity shrink-0"/>
             </span>
             <div className="w-full max-w-[120px] h-2 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden">
               <div
                 className="h-full bg-gradient-to-r from-fantasy-gold/60 to-fantasy-gold rounded-full transition-all duration-1000"
                 style={{ width: `${progressInTier}%` }}
               />
             </div>
           </div>
        )}
      </td>
      <td className="p-6 text-center align-top pt-8">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button title="Missão Simples" onClick={() => onChange(1)} className="px-3 py-1.5 bg-emerald-900/20 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-white border border-emerald-900/10 dark:border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95">+1</button>
          <button title="Missão Importante" onClick={() => onChange(2)} className="px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-white border border-emerald-900/20 dark:border-emerald-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95">+2</button>
          <button title="Feito Histórico" onClick={() => onChange(5)} className="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-white border border-emerald-900/30 dark:border-emerald-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95">+5</button>
          
          <div className="w-px h-5 bg-fantasy-wood/10 dark:bg-white/10 mx-1 shrink-0" />
          
          <button title="Falha Simples" onClick={() => onChange(-1)} className="px-3 py-1.5 bg-red-900/20 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white border border-red-900/10 dark:border-red-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95">-1</button>
          <button title="Escândalo / Quebra" onClick={() => onChange(-2)} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white border border-red-900/20 dark:border-red-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95">-2</button>
          <button title="Falha Histórica / Crime" onClick={() => onChange(-5)} className="px-3 py-1.5 bg-red-900/40 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white border border-red-900/30 dark:border-red-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95">-5</button>
        </div>
      </td>
      <td className="p-6 pr-8 text-right align-top pt-8">
         <button title="Distinção Recebida" onClick={() => onChange(10)} className="text-xs px-4 py-2.5 bg-fantasy-gold/10 text-fantasy-gold hover:bg-fantasy-gold hover:text-black border-2 border-fantasy-gold/30 rounded-xl flex items-center gap-1.5 mx-auto ml-auto font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md">
            <Star size={14}/> +10
         </button>
      </td>
    </>
  );
};

export default ReputationPage;
