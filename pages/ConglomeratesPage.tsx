
import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { LandPlot, Crown, Shield, Globe, Users, Swords, AlertTriangle, Plus, X, Building2, Coins, HeartHandshake, Skull, TrendingDown, ChevronRight, Trash2 } from 'lucide-react';
import { ConglomerateType } from '../types';

const ConglomeratesPage: React.FC = () => {
  const {
    domains, conglomerates, members, npcs,
    createConglomerate, addDomainToConglomerate, removeDomainFromConglomerate,
    subjugateDomain, disbandConglomerate, notify
  } = useGuild();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ConglomerateType>('Alianca');
  const [newCapital, setNewCapital] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddDomain, setShowAddDomain] = useState<string | null>(null);
  const [showSubjugate, setShowSubjugate] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('');

  const freeDomains = domains.filter(d => !d.conglomerateId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCapital) return;
    createConglomerate(newName.trim(), newType, newCapital);
    setShowCreate(false);
    setNewName('');
    setNewType('Alianca');
    setNewCapital('');
  };

  const totalMilitaryPower = (domainIds: string[]) =>
    domainIds.reduce((sum, did) => {
      const d = domains.find(x => x.id === did);
      return sum + (d?.units?.reduce((s, u) => s + (u.power || 1), 0) || 0);
    }, 0);

  return (
    <div className="space-y-10 pb-20 font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-fantasy-wood dark:text-white tracking-tighter uppercase leading-none mb-2">Alianças & Impérios</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Conglomerados de domínios sob um único estandarte.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-fantasy-blood hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-medieval uppercase tracking-widest shadow-2xl border-b-4 border-red-950 transition-all active:translate-y-1">
          <Plus size={24} /> Novo Conglomerado
        </button>
      </header>

      {conglomerates.length === 0 ? (
        <div className="parchment-card p-36 rounded-[60px] border-4 border-dashed border-fantasy-wood/10 dark:border-fantasy-parchment/10 text-center opacity-60">
          <Globe size={100} className="mx-auto mb-10 text-fantasy-wood/20 dark:text-fantasy-parchment/10" />
          <p className="font-medieval text-4xl uppercase italic text-fantasy-wood dark:text-fantasy-parchment">Nenhuma aliança ou império formado ainda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {conglomerates.map(c => {
            const isExpanded = expandedId === c.id;
            const capital = domains.find(d => d.id === c.capitalDomainId);
            const members = c.memberDomainIds.map(id => domains.find(d => d.id === id)).filter(Boolean);
            const power = totalMilitaryPower(c.memberDomainIds);
            const subjugatedCount = c.subjugatedIds.length;

            return (
              <div key={c.id} className="parchment-card rounded-[60px] overflow-hidden shadow-5xl border-4 border-fantasy-gold/20">
                <div className="bg-fantasy-wood/5 dark:bg-black/20 p-8 md:p-12 border-b-2 border-fantasy-wood/10 dark:border-white/10">
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`wax-seal w-20 h-20 flex items-center justify-center ${c.type === 'Imperio' ? 'bg-gradient-to-br from-red-900 to-amber-900 border-red-950' : 'bg-gradient-to-br from-blue-900 to-emerald-900 border-blue-950'}`}>
                        {c.type === 'Imperio' ? <Skull size={36} className="text-red-300" /> : <HeartHandshake size={36} className="text-emerald-300" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter">{c.name}</h3>
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${c.type === 'Imperio' ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                            {c.type === 'Imperio' ? 'Império' : 'Aliança'}
                          </span>
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50 mt-1">
                          Capital: {capital?.name || 'N/A'} • Formado em {c.formationDate || '?'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <div className="text-2xl font-medieval text-fantasy-gold">{members.length}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Domínios</div>
                      </div>
                      <div className="h-12 w-px bg-fantasy-wood/20" />
                      <div>
                        <div className="text-2xl font-medieval text-red-600 dark:text-red-400">{power}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Poder Militar</div>
                      </div>
                      {subjugatedCount > 0 && (
                        <>
                          <div className="h-12 w-px bg-fantasy-wood/20" />
                          <div>
                            <div className="text-2xl font-medieval text-amber-600">{subjugatedCount}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Subjugados</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 flex-wrap">
                    <button onClick={() => { setExpandedId(isExpanded ? null : c.id); setShowAddDomain(null); setShowSubjugate(null); }}
                      className="flex items-center gap-2 px-4 py-2 bg-fantasy-wood/5 dark:bg-white/5 hover:bg-fantasy-wood/10 rounded-xl text-xs font-black uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment transition-all">
                      <ChevronRight size={16} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} /> Detalhes
                    </button>
                    <button onClick={() => { setExpandedId(c.id); setShowAddDomain(c.id); setShowSubjugate(null); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-900/10 hover:bg-blue-900/20 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                      <Plus size={14} /> Adicionar Domínio
                    </button>
                    {freeDomains.length > 0 && (
                      <button onClick={() => { setExpandedId(c.id); setShowSubjugate(c.id); setShowAddDomain(null); }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/10 hover:bg-red-900/20 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                        <Skull size={14} /> Subjugar
                      </button>
                    )}
                    <button onClick={() => { if (window.confirm(`Dissolver "${c.name}"?`)) disbandConglomerate(c.id); }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900/10 hover:bg-gray-900/20 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all ml-auto">
                      <Trash2 size={14} /> Dissolver
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-8 md:p-12 space-y-6 animate-fade-in">
                    {showAddDomain === c.id && (
                      <div className="bg-blue-900/5 dark:bg-blue-400/5 p-6 rounded-3xl border-2 border-blue-900/20 space-y-4">
                        <h4 className="font-medieval text-lg text-blue-700 dark:text-blue-400">Adicionar Domínio por Aliança</h4>
                        <div className="flex gap-4">
                          <select className="flex-1 bg-white/40 dark:bg-black/40 rounded-2xl px-6 py-4 font-medieval text-lg outline-none"
                            value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)}>
                            <option value="">Selecione um domínio...</option>
                            {freeDomains.map(d => <option key={d.id} value={d.id}>{d.name} (Lv{d.level})</option>)}
                          </select>
                          <button onClick={() => { if (selectedDomain) { addDomainToConglomerate(c.id, selectedDomain); setSelectedDomain(''); } }}
                            className="bg-blue-800 text-white px-8 py-4 rounded-2xl font-medieval uppercase tracking-widest shadow-xl border-b-4 border-blue-950 active:translate-y-1 transition-all">
                            Aliar
                          </button>
                        </div>
                      </div>
                    )}

                    {showSubjugate === c.id && (
                      <div className="bg-red-900/5 dark:bg-red-400/5 p-6 rounded-3xl border-2 border-red-900/20 space-y-4">
                        <h4 className="font-medieval text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
                          <Skull size={20} /> Subjugar Domínio à Força
                        </h4>
                        <p className="text-xs font-black uppercase tracking-widest text-red-600/60">
                          O domínio sofrerá Terra Arrasada: Poder militar -50%, Nível -1, perde 1 construção, popularidade Odiado, revolta imediata.
                        </p>
                        <div className="flex gap-4">
                          <select className="flex-1 bg-white/40 dark:bg-black/40 rounded-2xl px-6 py-4 font-medieval text-lg outline-none"
                            value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)}>
                            <option value="">Selecione um domínio para atacar...</option>
                            {freeDomains.map(d => <option key={d.id} value={d.id}>{d.name} (Lv{d.level}, Poder {d.units?.reduce((s, u) => s + (u.power || 1), 0) || 0})</option>)}
                          </select>
                          <button onClick={() => { if (selectedDomain) { subjugateDomain(c.id, selectedDomain); setSelectedDomain(''); } }}
                            className="bg-red-800 text-white px-8 py-4 rounded-2xl font-medieval uppercase tracking-widest shadow-xl border-b-4 border-red-950 active:translate-y-1 transition-all">
                            Conquistar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment flex items-center gap-3">
                        <LandPlot size={20} /> Domínios Membros
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map(d => d && (
                          <div key={d.id} className={`bg-white/30 dark:bg-black/20 p-4 rounded-2xl border-2 ${c.subjugatedIds.includes(d.id) ? 'border-red-700/30 bg-red-900/5' : 'border-fantasy-wood/10 dark:border-white/10'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment">{d.name}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">
                                  Nível {d.level} • Corte {d.court} • {d.terrain}
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  {c.subjugatedIds.includes(d.id) && (
                                    <span className="text-[8px] bg-red-800 text-white px-2 py-0.5 rounded-full font-black uppercase">Subjugado</span>
                                  )}
                                  {d.id === c.capitalDomainId && (
                                    <span className="text-[8px] bg-fantasy-gold text-black px-2 py-0.5 rounded-full font-black uppercase">Capital</span>
                                  )}
                                  {d.revolt && (
                                    <span className="text-[8px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Revolta</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-medieval text-xl text-red-600 dark:text-red-400">
                                  {d.units?.reduce((s, u) => s + (u.power || 1), 0) || 0}
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-widest opacity-50">Poder</div>
                              </div>
                            </div>
                            {!c.subjugatedIds.includes(d.id) && !(d.id === c.capitalDomainId && c.memberDomainIds.length <= 1) && (
                              <button onClick={() => { if (window.confirm(`Remover "${d.name}" do conglomerado?`)) removeDomainFromConglomerate(c.id, d.id); }}
                                className="mt-3 text-[9px] text-gray-500 hover:text-red-500 font-black uppercase tracking-widest transition-colors">
                                Remover
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[150] p-4 backdrop-blur-xl animate-fade-in">
          <div className="parchment-card p-14 rounded-[80px] w-full max-w-lg border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in">
            <button onClick={() => setShowCreate(false)} className="absolute top-10 right-10 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-4 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={32} /></button>

            <form onSubmit={handleCreate} className="space-y-10">
              <div className="flex flex-col items-center text-center">
                <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white shadow-2xl animate-float">
                  <Globe size={48} />
                </div>
                <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Novo Conglomerado</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Nome do Conglomerado</label>
                  <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl focus:outline-none focus:border-fantasy-gold shadow-inner" required
                    value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Aliança de Valkaria" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Tipo</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setNewType('Alianca')}
                      className={`p-6 rounded-3xl border-2 text-center transition-all ${newType === 'Alianca' ? 'bg-emerald-900/20 border-emerald-600 text-emerald-600' : 'border-fantasy-wood/10 text-fantasy-wood/60'}`}>
                      <HeartHandshake size={32} className="mx-auto mb-2" />
                      <div className="font-medieval text-lg">Aliança</div>
                      <div className="text-[8px] font-black uppercase tracking-widest mt-1">União voluntária</div>
                    </button>
                    <button type="button" onClick={() => setNewType('Imperio')}
                      className={`p-6 rounded-3xl border-2 text-center transition-all ${newType === 'Imperio' ? 'bg-red-900/20 border-red-600 text-red-600' : 'border-fantasy-wood/10 text-fantasy-wood/60'}`}>
                      <Skull size={32} className="mx-auto mb-2" />
                      <div className="font-medieval text-lg">Império</div>
                      <div className="text-[8px] font-black uppercase tracking-widest mt-1">Subjugação</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Domínio Capital (Estandarte)</label>
                  <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl appearance-none cursor-pointer" required value={newCapital} onChange={e => setNewCapital(e.target.value)}>
                    <option value="" className="dark:bg-black">Selecione um domínio...</option>
                    {freeDomains.map(d => <option key={d.id} value={d.id} className="dark:bg-black">{d.name} (Nível {d.level})</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-fantasy-blood text-white py-10 rounded-[56px] font-medieval text-3xl uppercase tracking-widest shadow-5xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
                Formar {newType === 'Alianca' ? 'Aliança' : 'Império'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConglomeratesPage;
