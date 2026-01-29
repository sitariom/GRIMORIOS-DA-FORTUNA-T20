
import React, { useState, useMemo } from 'react';
import { useGuild } from '../context/GuildContext';
import { Trash2, UserPlus, Shield, User, Sparkles, History, Scroll, HeartPulse, Skull, Tent, ShieldAlert, Footprints, Coins, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { MemberStatus, Member } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const STATUS_CONFIG: Record<MemberStatus, { icon: React.ElementType, color: string, bg: string, label: string }> = {
    'Ativo': { icon: Shield, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-700/10 dark:bg-emerald-400/10', label: 'Ativo' },
    'Inativo': { icon: User, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10', label: 'Inativo' },
    'Ferido': { icon: HeartPulse, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-600/10 dark:bg-rose-400/10', label: 'Ferido' },
    'Morto': { icon: Skull, color: 'text-gray-900 dark:text-gray-400', bg: 'bg-gray-900/10 dark:bg-gray-400/10', label: 'Morto' },
    'Em Missao': { icon: ShieldAlert, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-700/10 dark:bg-blue-400/10', label: 'Em Missão' },
    'Viajando': { icon: Footprints, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-700/10 dark:bg-amber-400/10', label: 'Viajando' },
};

const MembersPage: React.FC = () => {
  const { members, logs, addMember, removeMember, updateMember } = useGuild();
  const [newName, setNewName] = useState('');
  
  // States for Modals
  const [historyMemberId, setHistoryMemberId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addMember(newName.trim());
      setNewName('');
    }
  };

  const memberHistory = useMemo(() => {
      if (!historyMemberId) return [];
      return logs.filter(log => log.memberId === historyMemberId && (log.category === 'Deposito' || log.category === 'Saque'));
  }, [logs, historyMemberId]);

  const getContributionStats = (id: string) => {
      const contributions = logs
        .filter(l => l.memberId === id && (l.category === 'Deposito' || l.category === 'Saque'))
        .reduce((acc, l) => acc + l.value, 0);
      return contributions;
  };

  const historyMember = members.find(m => m.id === historyMemberId);

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Aventureiros</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">As almas heróicas que compõem o corpo da guilda.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Card */}
        <div className="parchment-card p-10 rounded-[50px] border-4 border-fantasy-gold/20 shadow-5xl h-fit">
           <div className="wax-seal w-16 h-16 mx-auto mb-6 flex items-center justify-center text-white"><UserPlus size={32}/></div>
           <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold text-center uppercase tracking-tighter mb-8">Novo Alistamento</h3>
           <form onSubmit={handleAdd} className="space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Campeão</label>
                 <input 
                   type="text"
                   value={newName}
                   onChange={e => setNewName(e.target.value)}
                   className="w-full bg-white/30 dark:bg-black/40 border-2 border-fantasy-wood/20 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl focus:outline-none focus:border-fantasy-gold shadow-inner"
                   placeholder="Ex: Arton, o Bravo"
                   autoFocus
                   required
                 />
              </div>
              <button type="submit" className="w-full bg-fantasy-blood text-white py-6 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-2xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all">
                Selar Contrato
              </button>
           </form>
        </div>

        {/* Members List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit content-start">
           {members.length === 0 && (
             <div className="col-span-full parchment-card p-20 rounded-[40px] border-4 border-dashed border-fantasy-wood/10 dark:border-white/10 text-center opacity-60">
                <User size={80} className="mx-auto mb-6 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
                <p className="font-medieval text-2xl uppercase italic">Ninguém alistado ainda...</p>
             </div>
           )}
           {members.map((member, idx) => {
             const status = member.status || 'Ativo';
             const config = STATUS_CONFIG[status] || STATUS_CONFIG['Ativo'];
             const StatusIcon = config.icon;
             const contribution = getContributionStats(member.id);

             return (
             <div key={member.id} className="parchment-card p-8 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-2xl group hover:border-fantasy-gold/40 transition-all animate-slide-up h-fit relative" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex justify-between items-start mb-6">
                   <div className={`${config.bg} p-4 rounded-3xl border border-fantasy-wood/10 dark:border-white/10 transition-colors`}>
                      <StatusIcon size={32} className={config.color}/>
                   </div>
                   <div className="flex gap-2">
                       <button 
                         onClick={() => setHistoryMemberId(member.id)}
                         className="bg-fantasy-wood/5 dark:bg-white/5 hover:bg-fantasy-gold/20 text-fantasy-wood dark:text-fantasy-parchment p-3 rounded-2xl transition-all"
                         title="Ver Histórico"
                       >
                         <History size={20} />
                       </button>
                       <button 
                         onClick={() => setConfirmDeleteId(member.id)}
                         className="bg-red-900/5 hover:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-2xl transition-all"
                         title="Expulsar Membro"
                       >
                         <Trash2 size={20} />
                       </button>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <div>
                       <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter mb-1 leading-none truncate pr-2" title={member.name}>{member.name}</h3>
                       <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest flex items-center gap-2">
                           <Coins size={12}/> Contribuição Líquida: 
                           <span className={contribution >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
                             {contribution > 0 ? '+' : ''}{contribution.toLocaleString()} T$
                           </span>
                       </div>
                   </div>

                   <div className="pt-4 border-t border-fantasy-wood/10 dark:border-white/5">
                      <select 
                        value={status} 
                        onChange={(e) => updateMember(member.id, { status: e.target.value as MemberStatus })}
                        className="w-full bg-white/40 dark:bg-black/20 border border-fantasy-wood/10 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment cursor-pointer focus:outline-none hover:bg-white/60 dark:hover:bg-white/10 transition-colors appearance-none text-center"
                      >
                         {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s} className="dark:bg-black">{s}</option>)}
                      </select>
                   </div>
                </div>
             </div>
           )})}
        </div>
      </div>

      {/* History Modal */}
      {historyMemberId && (
        <div className="fixed inset-0 bg-black/90 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
           <div className="parchment-card p-8 md:p-12 rounded-[40px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
               <button onClick={() => setHistoryMemberId(null)} className="absolute top-6 right-6 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-3 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={24}/></button>
               
               <div className="text-center mb-8">
                   <div className="wax-seal w-20 h-20 mx-auto mb-4 flex items-center justify-center text-white"><Scroll size={40}/></div>
                   <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Registros de {historyMember?.name}</h3>
                   <p className="text-xs font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-[0.3em]">Histórico Financeiro Individual</p>
               </div>

               <div className="space-y-4">
                   {memberHistory.length === 0 ? (
                       <div className="text-center py-10 opacity-50 font-serif italic">Nenhuma movimentação registrada.</div>
                   ) : (
                       memberHistory.map(log => (
                           <div key={log.id} className="flex justify-between items-center p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-fantasy-wood/5 dark:border-white/5">
                               <div className="space-y-1">
                                   <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">{new Date(log.date).toLocaleDateString()}</div>
                                   <div className="font-serif italic text-fantasy-wood dark:text-fantasy-parchment text-sm">{log.details}</div>
                               </div>
                               <div className={`font-medieval text-xl ${log.value > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'} flex items-center gap-2`}>
                                   {log.value > 0 ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                                   {Math.abs(log.value).toLocaleString()} T$
                               </div>
                           </div>
                       ))
                   )}
               </div>
           </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="Expulsar Aventureiro"
        message="Deseja realmente remover este membro da guilda? Seu histórico será mantido nos registros, mas ele não terá mais acesso."
        onConfirm={() => {
            if (confirmDeleteId) removeMember(confirmDeleteId);
            setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
        confirmText="Expulsar"
        variant="danger"
      />
    </div>
  );
};

export default MembersPage;
