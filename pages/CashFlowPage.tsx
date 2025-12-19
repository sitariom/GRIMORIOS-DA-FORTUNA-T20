import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { ArrowDownLeft, ArrowUpRight, Scroll, History, Download, Calendar, PlusCircle } from 'lucide-react';

const CashFlowPage: React.FC = () => {
  const { logs } = useGuild();
  
  // States for Filters & Pagination
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);

  // Filter Logic
  const financialLogs = logs.filter(log => {
    const isFinancial = log.value !== 0 || log.category === 'Conversao';
    if (!isFinancial) return false;

    const logDate = new Date(log.date);
    if (startDate && logDate < new Date(startDate)) return false;
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // Include the whole end day
        if (logDate > end) return false;
    }
    return true;
  });

  const visibleLogs = financialLogs.slice(0, visibleCount);

  // CSV Export Logic
  const handleExportCSV = () => {
    const headers = ['Data', 'Hora', 'Categoria', 'Detalhes', 'Membro', 'Valor'];
    const rows = financialLogs.map(log => [
        new Date(log.date).toLocaleDateString(),
        new Date(log.date).toLocaleTimeString(),
        log.category,
        `"${log.details.replace(/"/g, '""')}"`,
        log.memberName,
        log.value
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tesouraria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-20 font-serif">
      <header>
        <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Registros tesouraria</h2>
        <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">O rastro de prata e ouro deixado pela guilda.</p>
      </header>

      <div className="parchment-card rounded-[40px] shadow-5xl border-4 border-fantasy-gold/20 overflow-hidden animate-scroll-unroll">
        <div className="bg-fantasy-wood/5 dark:bg-black/20 p-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="wax-seal w-12 h-12 flex items-center justify-center text-white"><History size={24}/></div>
              <div>
                  <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment">Anais de Transação</h3>
                  <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-[0.2em] mt-1">Exibindo {visibleLogs.length} de {financialLogs.length}</div>
              </div>
           </div>

           {/* Filters & Actions */}
           <div className="flex flex-wrap items-center gap-4">
               <div className="flex items-center gap-2 bg-white/40 dark:bg-black/40 p-2 rounded-xl border border-fantasy-wood/10 dark:border-white/10">
                   <Calendar size={16} className="text-fantasy-wood/50 dark:text-fantasy-parchment/50 ml-2"/>
                   <input type="date" className="bg-transparent text-xs font-black uppercase text-fantasy-wood dark:text-fantasy-parchment focus:outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                   <span className="text-fantasy-wood/30">-</span>
                   <input type="date" className="bg-transparent text-xs font-black uppercase text-fantasy-wood dark:text-fantasy-parchment focus:outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
               </div>
               
               <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-800/10 hover:bg-emerald-800/20 text-emerald-900 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-800/20 transition-all" title="Exportar para Excel (CSV)">
                   <Download size={16}/> CSV
               </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-fantasy-wood/5 dark:bg-black/10 text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-widest">
              <tr>
                <th className="px-10 py-6">Data Astral</th>
                <th className="px-10 py-6">Escrutínio</th>
                <th className="px-10 py-6">Escrituração</th>
                <th className="px-10 py-6">Escriba</th>
                <th className="px-10 py-6 text-right">Montante (T$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fantasy-wood/10 dark:divide-white/5">
              {visibleLogs.length === 0 && (
                <tr><td colSpan={5} className="px-10 py-20 text-center font-medieval text-2xl text-fantasy-wood/30 dark:text-white/10 italic">Nenhum registro encontrado neste período...</td></tr>
              )}
              {visibleLogs.map((log) => {
                const isIncome = log.value > 0;
                const isConversion = log.category === 'Conversao';
                
                return (
                  <tr key={log.id} className="hover:bg-fantasy-gold/5 dark:hover:bg-fantasy-gold/10 transition-colors">
                    <td className="px-10 py-6">
                      <div className="font-medieval text-lg text-fantasy-wood/80 dark:text-fantasy-parchment">{new Date(log.date).toLocaleDateString()}</div>
                      <div className="text-[9px] font-bold text-fantasy-wood/30 dark:text-fantasy-parchment/30 uppercase">{new Date(log.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                        isIncome ? 'bg-emerald-700/10 border-emerald-700/30 text-emerald-800 dark:text-emerald-400' : 
                        isConversion ? 'bg-indigo-700/10 border-indigo-700/30 text-indigo-800 dark:text-indigo-400' :
                        'bg-red-800/10 border-red-800/30 text-red-900 dark:text-red-400'
                      }`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="font-serif text-fantasy-wood dark:text-fantasy-parchment/80 font-bold italic leading-tight">"{log.details}"</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase flex items-center gap-2 tracking-tight">
                         <div className="w-2 h-2 rounded-full bg-fantasy-gold"></div> {log.memberName}
                      </span>
                    </td>
                    <td className={`px-10 py-6 text-right font-medieval text-2xl ${isConversion ? 'text-indigo-800 dark:text-indigo-400' : isIncome ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-900 dark:text-red-400'}`}>
                      <div className="flex items-center justify-end gap-2">
                        {isConversion ? '--' : `${isIncome ? '+' : '-'}${Math.abs(log.value).toLocaleString('pt-BR')}`}
                        {!isConversion && (isIncome ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleCount < financialLogs.length && (
            <div className="p-4 bg-fantasy-wood/5 dark:bg-black/20 border-t border-fantasy-wood/10 dark:border-white/5 flex justify-center">
                <button onClick={() => setVisibleCount(prev => prev + 20)} className="flex items-center gap-2 px-8 py-3 bg-fantasy-wood/10 dark:bg-white/5 hover:bg-fantasy-wood/20 dark:hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment transition-all">
                    <PlusCircle size={16}/> Ler Mais Registros
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowPage;