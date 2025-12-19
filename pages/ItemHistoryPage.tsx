import React, { useState, useMemo } from 'react';
import { useGuild } from '../context/GuildContext';
import { LogEntry } from '../types';
import { Package, BookOpen, Calendar, Download, PlusCircle, Layers } from 'lucide-react';

const ItemHistoryPage: React.FC = () => {
  const { logs } = useGuild();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isGrouped, setIsGrouped] = useState(true);

  // Grouping Helper Function
  const processLogs = (rawLogs: LogEntry[]) => {
      // 1. Filter by Type & Date
      let filtered = rawLogs.filter(log => {
          const validCat = log.category === 'Estoque' || log.category === 'Venda';
          if (!validCat) return false;

          const logDate = new Date(log.date);
          if (startDate && logDate < new Date(startDate)) return false;
          if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59);
              if (logDate > end) return false;
          }
          return true;
      });

      if (!isGrouped) return filtered;

      // 2. Group Consecutive Similar Logs
      const grouped: LogEntry[] = [];
      
      // Regex to parse item name from details like: "Venda 5x Poção (50%)" or "Descarte: Poção (x5)"
      // Strategy: Remove numbers and 'x' and see if the core name matches
      const cleanName = (details: string) => details.replace(/\d+x|x\d+|\d+%|:|\(|\)|Venda|Compra|Retirada|Descarte|Estoque|Item Registrado/gi, '').trim();
      const extractQty = (details: string) => {
          const match = details.match(/(\d+)x|x(\d+)/);
          return match ? parseInt(match[1] || match[2]) : 1;
      };

      filtered.forEach((currentLog) => {
          const lastLog = grouped[grouped.length - 1];
          const currentDate = new Date(currentLog.date).toLocaleDateString();
          
          if (lastLog) {
              const lastDate = new Date(lastLog.date).toLocaleDateString();
              const currentName = cleanName(currentLog.details);
              const lastName = cleanName(lastLog.details);

              if (
                  lastDate === currentDate && 
                  lastLog.category === currentLog.category && 
                  lastLog.memberId === currentLog.memberId &&
                  currentName === lastName &&
                  currentName.length > 2 // Avoid grouping empty or symbol-only names
              ) {
                  // Merge logs
                  const currentQty = extractQty(currentLog.details);
                  const lastQty = extractQty(lastLog.details); // Need to parse from the already merged string if needed, but simplified here
                  
                  // Simple heuristic: If the details start with a number or contain 'x', try to sum them. 
                  // Otherwise just append count.
                  // Ideally, we rewrite the details.
                  
                  // Let's create a new detail string
                  const totalValue = lastLog.value + currentLog.value;
                  const newQty = lastQty + currentQty;
                  
                  lastLog.value = totalValue;
                  // Reconstruct detail string based on category to look nice
                  if (lastLog.category === 'Venda') {
                      lastLog.details = `Venda Agrupada: ${newQty}x ${currentName}`;
                  } else {
                      lastLog.details = `${lastLog.category} Agrupado: ${newQty}x ${currentName}`;
                  }
                  
                  return; // Skip pushing currentLog, it's merged
              }
          }
          // Push a copy to avoid mutating context state directly if we were deep modifying (though slice protects mostly)
          grouped.push({ ...currentLog }); 
      });

      return grouped;
  };

  const visibleLogs = useMemo(() => {
      return processLogs(logs).slice(0, visibleCount);
  }, [logs, startDate, endDate, isGrouped, visibleCount]);

  const totalFilteredCount = useMemo(() => processLogs(logs).length, [logs, startDate, endDate, isGrouped]);

  const handleExportCSV = () => {
    const data = processLogs(logs);
    const headers = ['Data', 'Hora', 'Categoria', 'Detalhes', 'Responsável'];
    const rows = data.map(log => [
        new Date(log.date).toLocaleDateString(),
        new Date(log.date).toLocaleTimeString(),
        log.category,
        `"${log.details.replace(/"/g, '""')}"`,
        log.memberName
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_itens_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-20 font-serif">
       <header>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Movimentação de itens</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Onde as armas, armaduras e relíquias são registradas.</p>
       </header>
       
       <div className="parchment-card rounded-[40px] shadow-5xl border-4 border-fantasy-gold/20 overflow-hidden animate-scroll-unroll">
           <div className="bg-fantasy-wood/5 dark:bg-black/20 p-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="wax-seal w-12 h-12 flex items-center justify-center text-white"><BookOpen size={24}/></div>
                 <div>
                    <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment">Crônicas do Arsenal</h3>
                    <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-[0.2em] mt-1">Exibindo {visibleLogs.length} de {totalFilteredCount}</div>
                 </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                   <button 
                     onClick={() => setIsGrouped(!isGrouped)} 
                     className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isGrouped ? 'bg-indigo-900/10 text-indigo-800 dark:text-indigo-400 border-indigo-900/20' : 'bg-white/20 text-fantasy-wood/40 border-fantasy-wood/10'}`}
                     title={isGrouped ? "Desagrupar registros similares" : "Agrupar registros similares"}
                   >
                       <Layers size={16}/> {isGrouped ? 'Agrupado' : 'Detalhado'}
                   </button>

                   <div className="flex items-center gap-2 bg-white/40 dark:bg-black/40 p-2 rounded-xl border border-fantasy-wood/10 dark:border-white/10">
                       <Calendar size={16} className="text-fantasy-wood/50 dark:text-fantasy-parchment/50 ml-2"/>
                       <input type="date" className="bg-transparent text-xs font-black uppercase text-fantasy-wood dark:text-fantasy-parchment focus:outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                       <span className="text-fantasy-wood/30">-</span>
                       <input type="date" className="bg-transparent text-xs font-black uppercase text-fantasy-wood dark:text-fantasy-parchment focus:outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
                   </div>
                   
                   <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-800/10 hover:bg-emerald-800/20 text-emerald-900 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-800/20 transition-all">
                       <Download size={16}/> CSV
                   </button>
               </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-fantasy-wood/5 dark:bg-black/10 text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-widest">
                    <tr>
                        <th className="px-10 py-6 whitespace-nowrap">Época</th>
                        <th className="px-10 py-6">Tipo</th>
                        <th className="px-10 py-6">Crônica do Item</th>
                        <th className="px-10 py-6 text-right whitespace-nowrap">Responsável</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-fantasy-wood/10 dark:divide-white/5">
                    {visibleLogs.length === 0 && (
                        <tr><td colSpan={4} className="px-10 py-20 text-center font-medieval text-2xl text-fantasy-wood/30 dark:text-white/10 italic">Nenhuma crônica registrada no período...</td></tr>
                    )}
                    {visibleLogs.map((log, i) => {
                        let badgeColor = 'bg-fantasy-wood/10 text-fantasy-wood/50 border-fantasy-wood/20 dark:text-fantasy-parchment/40 dark:border-white/10';
                        if (log.category === 'Venda') badgeColor = 'bg-emerald-700/10 text-emerald-800 border-emerald-700/30 dark:text-emerald-400 dark:border-emerald-400/30';
                        if (log.category === 'Estoque') badgeColor = 'bg-blue-700/10 text-blue-800 border-blue-700/30 dark:text-blue-400 dark:border-blue-400/30';

                        return (
                            <tr key={`${log.id}-${i}`} className="hover:bg-fantasy-gold/5 dark:hover:bg-fantasy-gold/10 transition-colors">
                                <td className="px-10 py-6 whitespace-nowrap">
                                    <div className="font-medieval text-lg text-fantasy-wood/80 dark:text-fantasy-parchment">{new Date(log.date).toLocaleDateString()}</div>
                                    <div className="text-[9px] font-bold text-fantasy-wood/30 dark:text-fantasy-parchment/30 uppercase">{new Date(log.date).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-10 py-6">
                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${badgeColor}`}>
                                        {log.category}
                                    </span>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-3">
                                        <Package size={16} className="text-fantasy-gold shrink-0"/>
                                        <p className="font-serif text-fantasy-wood dark:text-fantasy-parchment/80 font-bold italic leading-tight">"{log.details}"</p>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right whitespace-nowrap">
                                    <span className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase flex items-center justify-end gap-2 tracking-tight">
                                      {log.memberName} <div className="w-2 h-2 rounded-full bg-fantasy-gold"></div>
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
             </table>
           </div>

           {visibleCount < totalFilteredCount && (
                <div className="p-4 bg-fantasy-wood/5 dark:bg-black/20 border-t border-fantasy-wood/10 dark:border-white/5 flex justify-center">
                    <button onClick={() => setVisibleCount(prev => prev + 20)} className="flex items-center gap-2 px-8 py-3 bg-fantasy-wood/10 dark:bg-white/5 hover:bg-fantasy-wood/20 dark:hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment transition-all">
                        <PlusCircle size={16}/> Carregar Mais Histórico
                    </button>
                </div>
            )}
       </div>
    </div>
  );
};

export default ItemHistoryPage;