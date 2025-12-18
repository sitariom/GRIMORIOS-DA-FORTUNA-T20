
import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { PORTE_DATA, TYPE_DATA } from '../constants';
import { BasePorte, BaseType } from '../types';
import { Hammer, Coins, Home, Trash2, Bed, Plus, X, AlertTriangle, ShieldCheck, Map, Castle, Info } from 'lucide-react';

const BasesPage: React.FC = () => {
  const { bases, addBase, upgradeBase, payBaseMaintenance, collectBaseIncome, demolishBase, addRoom, removeRoom, addFurniture, removeFurniture } = useGuild();
  const [modalMode, setModalMode] = useState<'buy' | 'addRoom' | 'addFurn' | 'upgrade' | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newPorte, setNewPorte] = useState<BasePorte>('Minima');
  const [newType, setNewType] = useState<BaseType>('Residencia');
  const [costOption, setCostOption] = useState<'pay' | 'reward'>('pay');
  const [activeBaseId, setActiveBaseId] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState(0);

  const resetModal = () => {
    setModalMode(null); setNewName(''); setItemName(''); setItemCost(0); setActiveBaseId(''); setActiveRoomId('');
  };

  const activeBase = bases.find(b => b.id === activeBaseId);

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Bases e Fortalezas</h2>
          <p className="text-xs md:text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Cidadelas sob seu estandarte nos Reinos de Arton.</p>
        </div>
        <button onClick={() => setModalMode('buy')} className="w-full md:w-auto bg-fantasy-blood hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-medieval uppercase tracking-widest shadow-2xl border-b-4 border-red-950 transition-all active:translate-y-1">
           <Home size={24} /> Erigir Nova Sede
        </button>
      </header>

      <div className="grid grid-cols-1 gap-12">
         {bases.length === 0 ? (
           <div className="parchment-card p-16 md:p-36 rounded-[60px] border-4 border-dashed border-fantasy-wood/10 dark:border-white/10 text-center opacity-60">
              <Map size={80} className="mx-auto mb-10 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
              <p className="font-medieval text-2xl md:text-4xl uppercase tracking-widest italic text-fantasy-wood dark:text-fantasy-parchment">Nenhum território reclamado ainda...</p>
           </div>
         ) : (
           bases.map((base, idx) => {
             const porteData = PORTE_DATA[base.porte];
             const typeData = TYPE_DATA[base.type];
             const isFull = base.rooms.length >= porteData.slots;

             return (
               <div key={base.id} className="parchment-card rounded-[60px] border-4 border-fantasy-gold/20 shadow-5xl overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="bg-fantasy-wood/10 dark:bg-black/20 p-8 md:p-12 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                      <div className="flex items-center gap-8">
                          <div className="wax-seal w-20 h-20 md:w-24 md:h-24 flex items-center justify-center animate-float shrink-0">
                             <Castle size={40} className="text-white"/>
                          </div>
                          <div>
                            <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter mb-2 leading-none">{base.name}</h3>
                            <div className="flex flex-wrap gap-3">
                               <span className="text-[9px] md:text-[10px] font-black bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black px-4 py-1 md:px-5 md:py-2 rounded-full uppercase tracking-[0.2em]">{porteData.label}</span>
                               <span className="text-[9px] md:text-[10px] font-black bg-indigo-700/10 dark:bg-indigo-400/10 text-indigo-900 dark:text-indigo-400 border border-indigo-900/20 dark:border-indigo-400/20 px-4 py-1 md:px-5 md:py-2 rounded-full uppercase tracking-[0.2em]">{typeData.label}</span>
                            </div>
                          </div>
                      </div>
                      <div className="flex gap-4 self-end md:self-auto">
                        <button onClick={() => { setActiveBaseId(base.id); setModalMode('upgrade'); }} className="p-4 md:p-5 bg-fantasy-gold/10 hover:bg-fantasy-gold/20 text-fantasy-gold rounded-3xl transition-all border border-fantasy-gold/30">
                           <Hammer size={24}/>
                        </button>
                        <button onClick={() => { if(confirm("Deseja mesmo abandonar esta sede? Todos os cômodos serão perdidos.")) demolishBase(base.id); }} className="p-4 md:p-5 bg-red-800/10 dark:bg-red-400/10 hover:bg-red-800/20 text-red-900 dark:text-red-400 rounded-3xl transition-all">
                           <Trash2 size={24}/>
                        </button>
                      </div>
                  </div>

                  <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                      <div className="space-y-10">
                          <div className="bg-black/5 dark:bg-black/30 p-6 md:p-10 rounded-[48px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-inner">
                              <h4 className="text-[10px] font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><ShieldCheck size={20}/> Estatuto Predial</h4>
                              <div className="space-y-6">
                                  <div className="flex justify-between items-end mb-2">
                                     <span className="text-xs font-bold uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 tracking-widest">Cômodos Ocupados</span>
                                     <span className="font-medieval text-2xl md:text-3xl text-fantasy-wood dark:text-fantasy-parchment">{base.rooms.length} / {porteData.slots}</span>
                                  </div>
                                  <div className="h-6 w-full bg-fantasy-wood/10 dark:bg-white/10 rounded-full border-2 border-fantasy-wood/20 dark:border-white/10 p-1.5 shadow-inner overflow-hidden">
                                      <div className={`h-full rounded-full shadow-inner transition-all duration-1000 ${isFull ? 'bg-red-600' : 'bg-indigo-600'}`} style={{ width: `${Math.min(100, (base.rooms.length / (porteData.slots || 1)) * 100)}%` }}></div>
                                  </div>
                                  <div className="pt-6 flex justify-between items-center border-t-2 border-fantasy-wood/10 dark:border-white/5">
                                     <span className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Manutenção Mensal</span>
                                     <span className="text-2xl md:text-3xl font-medieval text-red-900 dark:text-red-400">T$ {porteData.maintenance}</span>
                                  </div>
                                  <div className="flex items-center gap-3 p-4 bg-fantasy-gold/5 dark:bg-fantasy-gold/5 rounded-2xl border border-fantasy-gold/10">
                                      <Info size={16} className="text-fantasy-gold shrink-0"/>
                                      <p className="text-[10px] font-black uppercase text-fantasy-gold tracking-widest italic">{typeData.bonus}</p>
                                  </div>
                              </div>
                          </div>
                          <button onClick={() => payBaseMaintenance(base.id, 'Regular', porteData.maintenance)} className="w-full bg-emerald-800 text-white py-6 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-2xl border-b-8 border-emerald-950 active:translate-y-2 active:border-b-0 transition-all">Saldar Dívidas Prediais</button>
                      </div>

                      <div className="lg:col-span-2 space-y-8">
                          <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6 gap-4">
                             <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Planta do Edifício</h4>
                             <button disabled={isFull} onClick={() => { setActiveBaseId(base.id); setModalMode('addRoom'); }} className="w-full md:w-auto bg-indigo-700 hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-medieval uppercase text-sm tracking-widest shadow-2xl disabled:opacity-20 transition-all flex items-center justify-center gap-3">
                               <Plus size={18}/> Novo Cômodo
                             </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 md:pr-4">
                             {base.rooms.map(room => (
                                <div key={room.id} className="bg-white/50 dark:bg-black/20 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[40px] p-8 group/room hover:border-fantasy-gold/40 transition-all shadow-md">
                                   <div className="flex justify-between items-start mb-6">
                                      <div className="flex items-center gap-4">
                                         <Bed size={24} className="text-fantasy-gold shrink-0"/>
                                         <span className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment truncate max-w-[150px] md:max-w-[180px]">{room.name}</span>
                                      </div>
                                      <button onClick={() => removeRoom(base.id, room.id)} className="text-fantasy-wood/20 hover:text-red-800 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 group-hover/room:opacity-100 p-2"><X size={20}/></button>
                                   </div>
                                   <div className="space-y-3 border-l-4 border-fantasy-gold/10 dark:border-white/10 pl-8 ml-3">
                                      {room.furnitures.map(f => (
                                         <div key={f.id} className="flex justify-between items-center group/furn py-1 border-b border-fantasy-wood/5 dark:border-white/5">
                                            <span className="text-xs font-bold text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase tracking-tight">• {f.name}</span>
                                            <button onClick={() => removeFurniture(base.id, room.id, f.id)} className="opacity-100 lg:opacity-0 group-hover/furn:opacity-100 text-red-800 dark:text-red-400"><X size={14}/></button>
                                         </div>
                                      ))}
                                      <button onClick={() => { setActiveBaseId(base.id); setActiveRoomId(room.id); setModalMode('addFurn'); }} className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400 hover:opacity-70 pt-4 tracking-widest flex items-center gap-2">
                                        <Plus size={12}/> Adicionar Mobília
                                      </button>
                                   </div>
                                </div>
                             ))}
                          </div>
                      </div>
                  </div>
               </div>
             );
           })
         )}
      </div>

      {modalMode && (
         <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
           <div className="parchment-card p-6 md:p-14 rounded-[40px] md:rounded-[80px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
               <button onClick={resetModal} className="absolute top-6 right-6 md:top-12 md:right-12 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-2 md:p-4 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={24}/></button>
               
               {modalMode === 'buy' && (
                  <form onSubmit={(e) => { e.preventDefault(); addBase(newName, newPorte, newType, costOption === 'pay'); resetModal(); }} className="space-y-8 md:space-y-12">
                      <div className="flex flex-col items-center text-center">
                         <div className="wax-seal w-20 h-20 md:w-28 md:h-28 mb-4 md:mb-8 flex items-center justify-center text-white shadow-2xl animate-float"><Home size={40}/></div>
                         <h3 className="text-3xl md:text-5xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Alvará de Fundação</h3>
                         <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em] mt-2 md:mt-4">Inicie um novo capítulo na história da sua Guilda.</p>
                      </div>
                      <div className="space-y-6 md:space-y-8">
                         <div className="space-y-3 text-center">
                            <label className="text-[10px] md:text-xs font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-[0.4em]">Título da Propriedade</label>
                            <input className="w-full bg-white/40 dark:bg-black/40 border-4 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] md:rounded-[40px] px-6 py-4 md:px-10 md:py-8 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl md:text-4xl text-center focus:outline-none focus:border-fantasy-gold shadow-inner" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Mansão de..." />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <div className="space-y-2 md:space-y-3">
                               <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Porte Desejado</label>
                               <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] md:rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none cursor-pointer" value={newPorte} onChange={e => setNewPorte(e.target.value as BasePorte)}>
                                  {Object.entries(PORTE_DATA).map(([k,v]) => <option key={k} value={k} className="dark:bg-black">{v.label}</option>)}
                               </select>
                            </div>
                            <div className="space-y-2 md:space-y-3">
                               <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Natureza da Sede</label>
                               <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[24px] md:rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none cursor-pointer" value={newType} onChange={e => setNewType(e.target.value as BaseType)}>
                                  {Object.entries(TYPE_DATA).map(([k,v]) => <option key={k} value={k} className="dark:bg-black">{v.label}</option>)}
                               </select>
                            </div>
                         </div>
                         <div className="bg-black/5 dark:bg-black/20 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col gap-4">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input type="radio" checked={costOption === 'pay'} onChange={() => setCostOption('pay')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs md:text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Pagar Custo de Fundação (T$ {PORTE_DATA[newPorte].cost})</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input type="radio" checked={costOption === 'reward'} onChange={() => setCostOption('reward')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs md:text-sm font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Recompensa / Descoberta (Grátis)</span>
                            </label>
                         </div>
                      </div>
                      <button type="submit" className="w-full bg-fantasy-blood text-white py-6 md:py-10 rounded-[56px] font-medieval text-2xl md:text-3xl uppercase tracking-[0.3em] shadow-5xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
                          Confirmar Escritura
                      </button>
                  </form>
               )}

               {modalMode === 'addRoom' && (
                  <form onSubmit={(e) => { e.preventDefault(); addRoom(activeBaseId, itemName, itemCost, costOption === 'pay'); resetModal(); }} className="space-y-8 md:space-y-12">
                      <div className="flex flex-col items-center text-center">
                         <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><Bed size={40}/></div>
                         <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Projeto de Cômodo</h3>
                         <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Vagas Disponíveis: {(activeBase ? PORTE_DATA[activeBase.porte].slots - activeBase.rooms.length : 0)}</p>
                      </div>
                      <div className="space-y-6 md:space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Nome do Compartimento</label>
                            <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl" required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ex: Laboratório de Alquimia" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Custo de Reforma (T$)</label>
                            <input type="number" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl" required value={itemCost} onChange={e => setItemCost(Number(e.target.value))} />
                         </div>
                         <div className="bg-black/5 dark:bg-black/20 p-6 md:p-8 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col gap-4">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input type="radio" checked={costOption === 'pay'} onChange={() => setCostOption('pay')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 uppercase">Deduzir do Cofre</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input type="radio" checked={costOption === 'reward'} onChange={() => setCostOption('reward')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 uppercase">Reforma por Evento</span>
                            </label>
                         </div>
                      </div>
                      <button type="submit" className="w-full bg-indigo-700 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-indigo-950 active:translate-y-2 active:border-b-0 transition-all">
                          Finalizar Cômodo
                      </button>
                  </form>
               )}

               {modalMode === 'addFurn' && (
                  <form onSubmit={(e) => { e.preventDefault(); addFurniture(activeBaseId, activeRoomId, itemName, itemCost, costOption === 'pay'); resetModal(); }} className="space-y-8 md:space-y-12">
                      <div className="flex flex-col items-center text-center">
                         <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><ShieldCheck size={40}/></div>
                         <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Aquisição de Adorno</h3>
                      </div>
                      <div className="space-y-6 md:space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Descrição do Adorno</label>
                            <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl" required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ex: Armários de Carvalho" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest ml-6">Valor da Peça (T$)</label>
                            <input type="number" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl" required value={itemCost} onChange={e => setItemCost(Number(e.target.value))} />
                         </div>
                         <div className="bg-black/5 dark:bg-black/20 p-6 md:p-8 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col gap-4">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input type="radio" checked={costOption === 'pay'} onChange={() => setCostOption('pay')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 uppercase">Pagar à Mobília</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input type="radio" checked={costOption === 'reward'} onChange={() => setCostOption('reward')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 uppercase">Presente / Achado</span>
                            </label>
                         </div>
                      </div>
                      <button type="submit" className="w-full bg-fantasy-gold text-black py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all">
                          Instalar Peça
                      </button>
                  </form>
               )}

               {modalMode === 'upgrade' && (
                  <form onSubmit={(e) => { e.preventDefault(); upgradeBase(activeBaseId, newPorte); resetModal(); }} className="space-y-8 md:space-y-12">
                      <div className="flex flex-col items-center text-center">
                         <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center text-white"><Hammer size={40}/></div>
                         <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Expansão Territorial</h3>
                         <p className="text-[10px] md:text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Cômodos Atuais: {activeBase?.rooms.length}</p>
                      </div>
                      <div className="space-y-6 md:space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Novo Porte Pretendido</label>
                            <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-6 py-4 md:px-8 md:py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none cursor-pointer" value={newPorte} onChange={e => setNewPorte(e.target.value as BasePorte)}>
                                {Object.entries(PORTE_DATA).map(([k,v]) => <option key={k} value={k} className="dark:bg-black">{v.label}</option>)}
                            </select>
                         </div>
                         <div className="p-6 md:p-8 bg-blue-900/10 dark:bg-blue-400/5 rounded-[40px] border-4 border-blue-900/20 dark:border-blue-400/20 text-center">
                            <p className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">Custo de Diferença de Upgrade</p>
                            <p className="text-3xl md:text-5xl font-medieval text-blue-900 dark:text-blue-400 mt-2">T$ {activeBase ? Math.max(0, PORTE_DATA[newPorte].cost - PORTE_DATA[activeBase.porte].cost) : 0}</p>
                         </div>
                      </div>
                      <button type="submit" className="w-full bg-blue-800 text-white py-6 md:py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-2xl border-b-8 border-blue-950 active:translate-y-2 active:border-b-0 transition-all">
                          Finalizar Expansão
                      </button>
                  </form>
               )}
           </div>
         </div>
      )}
    </div>
  );
};

export default BasesPage;
