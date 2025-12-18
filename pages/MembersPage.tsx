
import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { Trash2, UserPlus, Shield, User, MapPin, Sparkles, X } from 'lucide-react';

const MembersPage: React.FC = () => {
  const { members, addMember, removeMember } = useGuild();
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addMember(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Aventureiros</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">As almas heróicas que compõem o corpo da guilda.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
                   required
                 />
              </div>
              <button type="submit" className="w-full bg-fantasy-blood text-white py-6 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-2xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all">
                Selar Contrato
              </button>
           </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
           {members.length === 0 && (
             <div className="col-span-full parchment-card p-20 rounded-[40px] border-4 border-dashed border-fantasy-wood/10 dark:border-white/10 text-center opacity-60">
                <User size={80} className="mx-auto mb-6 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
                <p className="font-medieval text-2xl uppercase italic">Ninguém alistado ainda...</p>
             </div>
           )}
           {members.map((member, idx) => (
             <div key={member.id} className="parchment-card p-8 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-2xl group hover:border-fantasy-gold/40 transition-all animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex justify-between items-start mb-6">
                   <div className="bg-fantasy-wood/5 dark:bg-white/5 p-4 rounded-3xl border border-fantasy-wood/10 dark:border-white/10 group-hover:bg-fantasy-gold/10 transition-colors">
                      <Shield size={32} className="text-fantasy-gold"/>
                   </div>
                   <button 
                     onClick={() => { if(confirm(`Confirmar expulsão de ${member.name}?`)) removeMember(member.id); }}
                     className="text-fantasy-wood/20 dark:text-white/10 hover:text-red-800 dark:hover:text-red-400 transition-colors"
                   >
                     <Trash2 size={24} />
                   </button>
                </div>
                <div>
                   <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter mb-2 leading-none">{member.name}</h3>
                   <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-black bg-fantasy-wood dark:bg-black/40 text-fantasy-parchment dark:text-fantasy-parchment/60 px-4 py-1.5 rounded-full uppercase tracking-widest">Membro Ativo</span>
                      <span className="text-[10px] font-black bg-fantasy-arcane/10 text-fantasy-arcane border border-fantasy-arcane/20 px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2"><Sparkles size={10}/> Herói</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
