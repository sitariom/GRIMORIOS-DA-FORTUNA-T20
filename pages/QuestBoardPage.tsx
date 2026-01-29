
import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { Quest, QuestStatus, CurrencyType } from '../types';
import { CheckSquare, Plus, Trash2, ArrowRight, ArrowLeft, Coins, Award, Users, AlertCircle, X, Edit } from 'lucide-react';

const STATUS_COLUMNS: { id: QuestStatus; label: string; color: string }[] = [
    { id: 'Disponivel', label: 'Disponíveis', color: 'border-slate-500/30 bg-slate-500/10' },
    { id: 'Em Andamento', label: 'Em Andamento', color: 'border-blue-500/30 bg-blue-500/10' },
    { id: 'Concluida', label: 'Concluídas', color: 'border-emerald-500/30 bg-emerald-500/10' },
    { id: 'Falha', label: 'Falhas', color: 'border-red-500/30 bg-red-500/10' }
];

const QuestBoardPage: React.FC = () => {
  const { quests = [], addQuest, updateQuest, updateQuestStatus, deleteQuest, members } = useGuild();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGold, setNewGold] = useState(0);
  const [newCurrency, setNewCurrency] = useState<CurrencyType>('TS');
  const [newXP, setNewXP] = useState('');
  const [assignedIds, setAssignedIds] = useState<string[]>([]);

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (modalMode === 'edit' && editingId) {
          updateQuest(editingId, {
              title: newTitle,
              description: newDesc,
              rewardGold: newGold,
              rewardCurrency: newCurrency,
              rewardXP: newXP,
              assignedMemberIds: assignedIds
          });
      } else {
          addQuest({
              title: newTitle,
              description: newDesc,
              status: 'Disponivel',
              rewardGold: newGold,
              rewardCurrency: newCurrency,
              rewardXP: newXP,
              assignedMemberIds: assignedIds
          });
      }
      closeModal();
  };

  const openCreateModal = () => {
      resetForm();
      setModalMode('create');
  };

  const openEditModal = (q: Quest) => {
      setEditingId(q.id);
      setNewTitle(q.title);
      setNewDesc(q.description);
      setNewGold(q.rewardGold);
      setNewCurrency(q.rewardCurrency || 'TS');
      setNewXP(q.rewardXP);
      setAssignedIds(q.assignedMemberIds || []);
      setModalMode('edit');
  };

  const resetForm = () => {
      setNewTitle(''); setNewDesc(''); setNewGold(0); setNewCurrency('TS'); setNewXP(''); setAssignedIds([]); setEditingId(null);
  };

  const closeModal = () => {
      setModalMode(null); 
      resetForm();
  };

  const toggleMemberAssign = (id: string) => {
      setAssignedIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  // Filter only active members for assignment
  const activeMembers = members.filter(m => m.status === 'Ativo');

  return (
    <div className="space-y-12 pb-20 font-serif h-full flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Quadro de Missões</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Desafios, contratos e jornadas heróicas.</p>
        </div>
        <button onClick={openCreateModal} className="bg-fantasy-blood hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-medieval uppercase tracking-widest shadow-2xl border-b-4 border-red-950 transition-all active:translate-y-1">
           <Plus size={24} /> Nova Missão
        </button>
      </header>

      <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
          <div className="flex gap-6 min-w-max h-full">
              {STATUS_COLUMNS.map(col => (
                  <div key={col.id} className={`w-80 md:w-96 flex-shrink-0 flex flex-col rounded-[32px] border-2 ${col.color} p-4 backdrop-blur-sm`}>
                      <div className="mb-4 px-2 py-2 flex items-center justify-between">
                          <h3 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-widest">{col.label}</h3>
                          <span className="bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-black">{(quests || []).filter(q => q.status === col.id).length}</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                          {(quests || []).filter(q => q.status === col.id).map(quest => (
                              <div key={quest.id} className="parchment-card p-5 rounded-3xl border-2 border-fantasy-wood/10 dark:border-white/10 shadow-md hover:border-fantasy-gold/50 transition-all group relative">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment leading-tight pr-6">{quest.title}</h4>
                                      <div className="flex gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => openEditModal(quest)} className="text-fantasy-wood/40 hover:text-fantasy-gold transition-colors"><Edit size={16}/></button>
                                          <button onClick={() => deleteQuest(quest.id)} className="text-fantasy-wood/40 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                      </div>
                                  </div>
                                  <p className="text-xs text-fantasy-wood/70 dark:text-fantasy-parchment/70 font-serif italic mb-4 line-clamp-3">{quest.description}</p>
                                  
                                  {/* Rewards */}
                                  <div className="flex gap-2 mb-4 flex-wrap">
                                      {quest.rewardGold > 0 && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-fantasy-gold/10 text-fantasy-gold px-2 py-1 rounded">
                                              <Coins size={10}/> {quest.rewardGold} {quest.rewardCurrency || 'TS'}
                                          </span>
                                      )}
                                      {quest.rewardXP && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-purple-900/10 text-purple-400 px-2 py-1 rounded">
                                              <Award size={10}/> {quest.rewardXP}
                                          </span>
                                      )}
                                  </div>

                                  {/* Members */}
                                  {quest.assignedMemberIds.length > 0 && (
                                      <div className="flex items-center gap-1 mb-4 overflow-hidden">
                                          {quest.assignedMemberIds.map(mid => {
                                              const m = members.find(x => x.id === mid);
                                              return m ? (
                                                  <div key={mid} className="w-6 h-6 rounded-full bg-fantasy-wood text-fantasy-parchment flex items-center justify-center text-[10px] font-bold border border-fantasy-parchment" title={m.name}>
                                                      {m.name.charAt(0)}
                                                  </div>
                                              ) : null;
                                          })}
                                      </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex justify-between items-center pt-2 border-t border-fantasy-wood/5 dark:border-white/5">
                                      {col.id !== 'Disponivel' && (
                                          <button onClick={() => updateQuestStatus(quest.id, col.id === 'Em Andamento' ? 'Disponivel' : 'Em Andamento')} className="p-2 hover:bg-white/10 rounded-full text-fantasy-wood/50 dark:text-fantasy-parchment/50 hover:text-fantasy-wood">
                                              <ArrowLeft size={16}/>
                                          </button>
                                      )}
                                      <div className="flex-1"></div>
                                      {col.id !== 'Concluida' && col.id !== 'Falha' && (
                                          <div className="flex gap-1">
                                              {col.id === 'Em Andamento' && (
                                                  <button onClick={() => updateQuestStatus(quest.id, 'Falha')} className="p-2 hover:bg-red-900/20 rounded-full text-fantasy-wood/50 dark:text-fantasy-parchment/50 hover:text-red-500" title="Falhar">
                                                      <X size={16}/>
                                                  </button>
                                              )}
                                              <button onClick={() => updateQuestStatus(quest.id, col.id === 'Disponivel' ? 'Em Andamento' : 'Concluida')} className="p-2 hover:bg-emerald-900/20 rounded-full text-fantasy-wood/50 dark:text-fantasy-parchment/50 hover:text-emerald-500" title="Avançar">
                                                  <ArrowRight size={16}/>
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {modalMode && (
          <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-10 rounded-[50px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <button onClick={closeModal} className="absolute top-8 right-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-3 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={24}/></button>
                  
                  <div className="text-center mb-8">
                      <div className="wax-seal w-20 h-20 mx-auto mb-4 flex items-center justify-center text-white"><CheckSquare size={40}/></div>
                      <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">{modalMode === 'edit' ? 'Editar Contrato' : 'Novo Contrato'}</h3>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Título da Missão</label>
                          <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-xl" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: A Besta de Smokestone" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Descrição / Objetivos</label>
                          <textarea className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-serif text-lg h-32 resize-none" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Detalhes do contrato..." />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Recompensa (Ouro)</label>
                              <div className="flex gap-2">
                                  <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-xl" value={newGold} onChange={e => setNewGold(Number(e.target.value))} />
                                  <select className="bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-4 py-4 font-medieval text-lg outline-none cursor-pointer" value={newCurrency} onChange={e => setNewCurrency(e.target.value as CurrencyType)}>
                                      {['TC', 'TS', 'TO', 'LO'].map(c => <option key={c} value={c} className="dark:bg-black">{c}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Recompensa (XP / Itens)</label>
                              <input type="text" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] px-6 py-4 font-medieval text-xl" value={newXP} onChange={e => setNewXP(e.target.value)} placeholder="Ex: 500 XP, Espada mágica" />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Membros Ativos Alocados</label>
                          <div className="flex flex-wrap gap-2 bg-black/5 dark:bg-black/20 p-4 rounded-[24px] border border-fantasy-wood/10 dark:border-white/10 max-h-40 overflow-y-auto">
                              {activeMembers.length === 0 && <p className="text-xs text-fantasy-wood/40 italic px-2">Nenhum aventureiro ativo disponível.</p>}
                              {activeMembers.map(m => (
                                  <button 
                                    key={m.id}
                                    type="button" 
                                    onClick={() => toggleMemberAssign(m.id)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${assignedIds.includes(m.id) ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black border-transparent' : 'bg-white/10 text-fantasy-wood/60 dark:text-fantasy-parchment/60 border-fantasy-wood/10 dark:border-white/10'}`}
                                  >
                                      {m.name}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <button type="submit" className="w-full bg-fantasy-blood text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all">
                          {modalMode === 'edit' ? 'Salvar Alterações' : 'Publicar Missão'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default QuestBoardPage;
