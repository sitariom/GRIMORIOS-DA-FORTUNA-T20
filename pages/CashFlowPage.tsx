
import React from 'react';
import { useGuild } from '../context/GuildContext';
import { ArrowDownLeft, ArrowUpRight, Scroll, History } from 'lucide-react';

const CashFlowPage: React.FC = () => {
  const { logs } = useGuild();
  const financialLogs = logs.filter(log => log.value !== 0);

  return (
    <div className="space-y-10 pb-20 font-serif">
      <header>
        <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Registros tesouraria</h2>
        <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">O rastro de prata e ouro deixado pela guilda em Arton.</p>
      </header>

      <div className="parchment-card rounded-[40px] shadow-5xl border-4 border-fantasy-gold/20 overflow-hidden animate-scroll-unroll">
        <div className="bg-fantasy-wood/5 dark:bg-black/20 p-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="wax-seal w-12 h-12 flex items-center justify-center text-white"><History size={24}/></div>
              <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment">Anais de Transação</h3>
           </div>
           <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-[0.5em] hidden md:block">Volume Total: {financialLogs.length} Entradas</div>
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
              {financialLogs.length === 0 && (
                <tr><td colSpan={5} className="px-10 py-20 text-center font-medieval text-2xl text-fantasy-wood/30 dark:text-white/10 italic">Nenhum registro encontrado...</td></tr>
              )}
              {financialLogs.map((log, idx) => {
                const isIncome = log.value > 0;
                return (
                  <tr key={log.id} className="hover:bg-fantasy-gold/5 dark:hover:bg-fantasy-gold/10 transition-colors">
                    <td className="px-10 py-6">
                      <div className="font-medieval text-lg text-fantasy-wood/80 dark:text-fantasy-parchment">{new Date(log.date).toLocaleDateString()}</div>
                      <div className="text-[9px] font-bold text-fantasy-wood/30 dark:text-fantasy-parchment/30 uppercase">{new Date(log.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${isIncome ? 'bg-emerald-700/10 border-emerald-700/30 text-emerald-800 dark:text-emerald-400' : 'bg-red-800/10 border-red-800/30 text-red-900 dark:text-red-400'}`}>
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
                    <td className={`px-10 py-6 text-right font-medieval text-2xl ${isIncome ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-900 dark:text-red-400'}`}>
                      <div className="flex items-center justify-end gap-2">
                        {isIncome ? '+' : '-'}{Math.abs(log.value).toLocaleString('pt-BR')}
                        {isIncome ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlowPage;
