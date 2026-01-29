
import React, { useState, useRef } from 'react';
import { useGuild } from '../context/GuildContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Download, Upload, Trash2, Edit3, Check, X, ShieldCheck, ScrollText } from 'lucide-react';

const GuildManagerPage: React.FC = () => {
  const { 
    guilds, activeGuildId, setActiveGuild, createNewGuild, 
    renameActiveGuild, deleteActiveGuild, importGuild, guildName 
  } = useGuild();
  
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(guildName);
  
  const fileInput = useRef<HTMLInputElement>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGuildName.trim()) {
      createNewGuild(newGuildName);
      setShowCreate(false);
      setNewGuildName('');
      navigate('/'); // Redireciona para o Dashboard
    }
  };

  const handleSelect = (id: string) => {
      setActiveGuild(id);
      navigate('/'); // Redireciona para o Dashboard
  };

  const handleExport = () => {
    const active = guilds.find(g => g.id === activeGuildId);
    if (!active) return;
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(active, null, 2));
    const node = document.createElement('a');
    node.setAttribute("href", data);
    node.setAttribute("download", `${active.guildName}_backup.json`);
    node.click();
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => importGuild(event.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Minhas campanhas</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">O mural dos grandes feitos.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => fileInput.current?.click()} className="flex-1 md:flex-none bg-[#3d2b1f] dark:bg-black hover:bg-[#4d3b2f] text-fantasy-parchment px-8 py-4 rounded-2xl border-2 border-fantasy-gold/20 flex items-center justify-center gap-3 font-medieval uppercase text-xs tracking-widest transition-all">
                <Upload size={18} /> Importar Pergaminho
            </button>
            <input type="file" ref={fileInput} className="hidden" accept=".json" onChange={onImportFile} />
            <button onClick={() => setShowCreate(true)} className="flex-1 md:flex-none bg-fantasy-blood hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-medieval uppercase tracking-widest shadow-2xl transition-all border-b-4 border-red-950">
                <Plus size={24} /> Novo Estandarte
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {guilds.map(guild => {
            const isActive = guild.id === activeGuildId;
            return (
                <div key={guild.id} className={`parchment-card p-10 rounded-[40px] border-4 transition-all duration-500 hover:scale-[1.03] ${isActive ? 'border-fantasy-gold shadow-[0_0_30px_#d4af3733]' : 'border-fantasy-wood/20 dark:border-white/10'}`}>
                    <div className="flex justify-between items-start mb-8">
                        <div className={`w-16 h-16 flex items-center justify-center rounded-3xl border-2 ${isActive ? 'bg-fantasy-gold/10 border-fantasy-gold' : 'bg-fantasy-wood/5 dark:bg-white/5 border-fantasy-wood/20 dark:border-white/10'}`}>
                          <ShieldCheck size={32} className={isActive ? 'text-fantasy-gold' : 'text-fantasy-wood/30 dark:text-white/20'}/>
                        </div>
                        {isActive && (
                          <div className="wax-seal w-10 h-10 flex items-center justify-center animate-pulse">
                            <Check size={20} className="text-white"/>
                          </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-10">
                        {isActive && isRenaming ? (
                            <div className="flex gap-3 bg-white/30 dark:bg-black/30 p-2 rounded-xl border border-fantasy-wood/20 dark:border-white/10">
                                <input className="w-full bg-transparent text-lg font-medieval text-fantasy-wood dark:text-fantasy-parchment focus:outline-none" value={renameValue} onChange={e => setRenameValue(e.target.value)} />
                                <button onClick={() => { renameActiveGuild(renameValue); setIsRenaming(false); }} className="text-emerald-700 dark:text-emerald-400"><Check size={24}/></button>
                                <button onClick={() => setIsRenaming(false)} className="text-red-700 dark:text-red-400"><X size={24}/></button>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between">
                                <h3 className="font-medieval text-3xl text-fantasy-wood dark:text-fantasy-parchment leading-tight pr-4">{guild.guildName}</h3>
                                {isActive && <button onClick={() => setIsRenaming(true)} className="text-fantasy-wood/30 dark:text-white/10 hover:text-fantasy-wood dark:hover:text-fantasy-gold mt-1"><Edit3 size={20}/></button>}
                            </div>
                        )}
                        <div className="flex gap-4 text-[10px] font-black text-fantasy-wood/60 dark:text-fantasy-parchment/40 uppercase tracking-widest border-t border-fantasy-wood/10 dark:border-white/10 pt-4">
                           <span className="flex items-center gap-1"><Users size={12}/> {guild.members.length} Almas</span>
                           <span className="flex items-center gap-1"><ScrollText size={12}/> {guild.items.length} Bens</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {!isActive ? (
                            <button onClick={() => handleSelect(guild.id)} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black py-4 rounded-2xl font-medieval uppercase tracking-widest shadow-lg hover:bg-[#3d2b1f] dark:hover:bg-fantasy-gold/80 transition-all">Empunhar Estandarte</button>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleExport} className="bg-fantasy-gold/20 dark:bg-fantasy-gold/10 hover:bg-fantasy-gold/30 text-fantasy-wood dark:text-fantasy-gold py-4 rounded-2xl font-medieval uppercase tracking-widest flex items-center justify-center gap-2 border border-fantasy-gold/30">
                                    <Download size={18}/> Backup
                                </button>
                                <button onClick={() => { if(confirm("Deseja queimar estes registros para sempre?")) deleteActiveGuild(); }} className="bg-red-900/10 hover:bg-red-900/20 text-red-800 dark:text-red-400 py-4 rounded-2xl font-medieval uppercase tracking-widest flex items-center justify-center gap-2 border border-red-900/20">
                                    <Trash2 size={18}/> Queimar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>

      {showCreate && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-12 rounded-[56px] w-full max-w-lg border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-4 bg-fantasy-gold shadow-[0_0_20px_#d4af37]"></div>
                  <button onClick={() => setShowCreate(false)} className="absolute top-10 right-10 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-3 bg-white/20 dark:bg-black/20 rounded-full">
                    <X size={28}/>
                  </button>
                  
                  <div className="flex flex-col items-center text-center mb-10">
                     <div className="wax-seal w-20 h-20 flex items-center justify-center mb-6">
                        <ShieldCheck size={40} className="text-white"/>
                     </div>
                     <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Novo Estandarte</h3>
                  </div>
                  
                  <form onSubmit={handleCreate} className="space-y-8">
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-[0.2em]">Título da Campanha</label>
                          <input 
                            className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/20 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl focus:outline-none focus:border-fantasy-gold shadow-inner" 
                            required 
                            value={newGuildName} 
                            onChange={e => setNewGuildName(e.target.value)} 
                            placeholder="Ex: Guardiões de Vectorius"
                            autoFocus 
                          />
                      </div>
                      <button type="submit" className="w-full bg-fantasy-blood text-white py-8 rounded-[36px] font-medieval text-xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-red-950 hover:translate-y-1 active:border-b-0 transition-all">
                          Fundar Guilda
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default GuildManagerPage;
