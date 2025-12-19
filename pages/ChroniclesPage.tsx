import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { LogCategory } from '../types';
import { NotebookPen, Search, Filter, Download, ArrowDownLeft, ArrowUpRight, ScrollText, History, FileText, Calendar, PlusCircle } from 'lucide-react';

const ChroniclesPage: React.FC = () => {
  const { logs, guildName, exportLogs } = useGuild();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'TUDO'>('TUDO');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'TUDO' || log.category === filterCategory;
    
    if (!matchesSearch || !matchesCategory) return false;

    const logDate = new Date(log.date);
    if (startDate && logDate < new Date(startDate)) return false;
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (logDate > end) return false;
    }

    return true;
  });

  const visibleLogs = filteredLogs.slice(0, visibleCount);

  const categories: (LogCategory | 'TUDO')[] = [
    'TUDO', 'Deposito', 'Saque', 'Venda', 'Compra', 'Investimento', 'Manutencao', 'Conversao', 'Base', 'Dominio', 'Estoque', 'NPC', 'Sistema'
  ];

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Livro de Crônicas</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">A memória imutável das glórias e gastos de {guildName}.</p>
        </div>
        <button onClick={exportLogs} className="bg-fantasy-wood dark:bg-fantasy-gold hover:bg-[#3d2b1f] dark:hover:bg-fantasy-gold/80 text-fantasy-parchment dark:text-black px-8 py-4 rounded-2xl flex items-center gap-3 font-medieval uppercase tracking-widest shadow-2xl transition-all border-2 border-fantasy-gold/20">
           <Download size={24} /> Exportar Anais (JSON)
        </button>
      </header>

      <div className="parchment-card p-8 rounded-[40px] border-2 border-[#1a0f08]/10 dark:border-white/10 flex flex-col gap-8 shadow-2xl">
          <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a0f08]/30 dark:text-fantasy-parchment/20" size={24} />
                  <input 
                    type="text" 
                    placeholder="Escavar nos anais do tempo..." 
                    className="w-full bg-white/20 dark:bg-black/30 border-2 border-[#1a0f08]/10 dark:border-white/5 rounded-[28px] pl-16 pr-6 py-5 text-[#1a0f08] dark:text-fantasy-parchment font-medieval text-xl focus:outline-none focus:border-fantasy-gold transition-all shadow-inner" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
              </div>
              
              <div className="flex items-center gap-2 bg-white/40 dark:bg-black/40 p-4 rounded-[28px] border-2 border-fantasy-wood/10 dark:border-white/10 h-auto">
                   <Calendar size={20} className="text-fantasy-wood/50 dark:text-fantasy-parchment/50 ml-2"/>
                   <input type="date" className="bg-transparent text-sm font-black uppercase text-fantasy-wood dark:text-fantasy-parchment focus:outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                   <span className="text-fantasy-wood/30">-</span>
                   <input type="date" className="bg-transparent text-sm font-black uppercase text-fantasy-wood dark:text-fantasy-parchment focus:outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-center">
             {categories.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setFilterCategory(cat)} 
                 className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filterCategory === cat ? 'bg-[#1a0f08] dark:bg-fantasy-gold text-fantasy-gold dark:text-black border-black shadow-lg scale-105' : 'bg-[#1a0f08]/5 dark:bg-white/5 text-[#1a0f08]/40 dark:text-fantasy-parchment/40 border-[#1a0f08]/10 dark:border-white/10 hover:bg-[#1a0f08]/10 dark:hover:bg-white/10'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
      </div>

      <div className="parchment-card rounded-[56px] shadow-5xl border-4 border-fantasy-gold/20 overflow-hidden animate-scroll-unroll">
        <div className="bg-[#1a0f08]/5 dark:bg-black/20 p-10 border-b-2 border-[#1a0f08]/10 dark:border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="wax-seal w-16 h-16 flex items-center justify-center text-white"><NotebookPen size={32}/></div>
              <div>
                  <h3 className="font-medieval text-3xl text-[#1a0f08] dark:text-fantasy-parchment">Tratado Geral de Atividades</h3>
                  <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-[0.2em] mt-1">Exibindo {visibleLogs.length} de {filteredLogs.length}</div>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1a0f08]/5 dark:bg-black/10 text-[10px] font-black uppercase text-[#1a0f08]/40 dark:text-fantasy-parchment/40 tracking-[0.4em]">
              <tr>
                <th className="px-12 py-8">Época</th>
                <th className="px-12 py-8">Vínculo</th>
                <th className="px-12 py-8">Crônica</th>
                <th className="px-12 py-8">Escriba</th>
                <th className="px-12 py-8 text-right">T$ Eq.</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1a0f08]/10 dark:divide-white/5">
              {visibleLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-12 py-20 text-center font-medieval text-3xl text-[#1a0f08]/20 dark:text-white/10 italic">O silêncio reina nestas datas...</td></tr>
              )}
              {visibleLogs.map((log) => {
                const isIncome = log.value > 0;
                const isZero = log.value === 0;
                
                return (
                  <tr key={log.id} className="hover:bg-fantasy-gold/10 dark:hover:bg-fantasy-gold/5 transition-colors group">
                    <td className="px-12 py-8">
                      <div className="font-medieval text-2xl text-[#1a0f08]/80 dark:text-fantasy-parchment leading-none mb-2">{new Date(log.date).toLocaleDateString()}</div>
                      <div className="text-[10px] font-black text-[#1a0f08]/30 dark:text-fantasy-parchment/30 uppercase tracking-widest">{new Date(log.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-12 py-8">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 tracking-[0.2em] shadow-sm inline-block ${
                        log.category === 'Deposito' || log.category === 'Venda' ? 'bg-emerald-800/10 border-emerald-800/30 text-emerald-900 dark:text-emerald-400' : 
                        log.category === 'Saque' || log.category === 'Manutencao' ? 'bg-red-900/10 border-red-900/30 text-red-950 dark:text-red-400' :
                        'bg-[#1a0f08]/5 border-[#1a0f08]/20 text-[#1a0f08]/60 dark:text-fantasy-parchment/60'
                      }`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-12 py-8">
                      <p className="font-serif text-[#1a0f08] dark:text-fantasy-parchment/80 font-bold italic leading-relaxed text-lg">"{log.details}"</p>
                    </td>
                    <td className="px-12 py-8">
                      <span className="text-xs font-black text-[#1a0f08]/70 dark:text-fantasy-parchment/70 uppercase tracking-widest">{log.memberName}</span>
                    </td>
                    <td className={`px-12 py-8 text-right font-medieval text-3xl ${isZero ? 'text-[#1a0f08]/40 dark:text-white/10' : isIncome ? 'text-emerald-900 dark:text-emerald-400' : 'text-red-950 dark:text-red-400'}`}>
                      {isZero ? '--' : `${isIncome ? '+' : '-'}${Math.abs(log.value).toLocaleString('pt-BR')}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleCount < filteredLogs.length && (
            <div className="p-4 bg-[#1a0f08]/5 dark:bg-black/20 border-t border-[#1a0f08]/10 dark:border-white/5 flex justify-center">
                <button onClick={() => setVisibleCount(prev => prev + 20)} className="flex items-center gap-2 px-8 py-3 bg-[#1a0f08]/10 dark:bg-white/5 hover:bg-[#1a0f08]/20 dark:hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-[#1a0f08] dark:text-fantasy-parchment transition-all">
                    <PlusCircle size={16}/> Continuar Leitura
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChroniclesPage;