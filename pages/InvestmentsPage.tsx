import React from 'react';
import { useGuild } from '../context/GuildContext';
import { LogCategory } from '../types';
import { Hammer, ScrollText, Castle } from 'lucide-react';

const InvestmentsPage: React.FC = () => {
  const { logs } = useGuild();
  const relevantCategories: LogCategory[] = ['Investimento', 'Manutencao', 'Base', 'Dominio'];
  const filteredLogs = logs.filter(log => relevantCategories.includes(log.category));

  return (
    <div className="space-y-10 pb-20 font-serif">
       <header>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Investimentos</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Anais de infraestrutura, reformas e manutenção.</p>
       </header>
       
       <div className="parchment-card rounded-[40px] shadow-5xl border-4 border-fantasy-gold/20 overflow-hidden animate-scroll-unroll">
           <div className="bg-fantasy-wood/5 dark:bg-black/20 p-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="wax-seal w-12 h-12 flex items-center justify-center text-white"><Hammer size={24}/></div>
                 <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment">Livro de Edificações</h3>
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-fantasy-wood/5 dark:bg-black/10 text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-widest">
                    <tr>
                        <th className="px-10 py-6">Época</th>
                        <th className="px-10 py-6">Escrutínio</th>
                        <th className="px-10 py-6">Escrituração</th>
                        <th className="px-10 py-6 text-right">Custo T$</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-fantasy-wood/10 dark:divide-white/5">
                    {filteredLogs.length === 0 && (
                        <tr><td colSpan={4} className="px-10 py-20 text-center font-medieval text-2xl text-fantasy-wood/30 dark:text-white/10 italic">Nenhuma obra registrada...</td></tr>
                    )}
                    {filteredLogs.map(log => {
                        const isExpense = log.value < 0;
                        return (
                            <tr key={log.id} className="hover:bg-fantasy-gold/5 dark:hover:bg-fantasy-gold/10 transition-colors">
                                <td className="px-10 py-6 text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-medieval text-lg">
                                    {new Date(log.date).toLocaleDateString()}
                                </td>
                                <td className="px-10 py-6">
                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                                        log.category === 'Manutencao' ? 'bg-red-800/10 border-red-800/30 text-red-900 dark:text-red-400' : 
                                        log.category === 'Investimento' ? 'bg-indigo-700/10 border-indigo-700/30 text-indigo-900 dark:text-indigo-400' :
                                        'bg-fantasy-wood/10 border-fantasy-wood/20 dark:bg-white/10 dark:text-fantasy-parchment/60'
                                    }`}>
                                        {log.category}
                                    </span>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-3">
                                        <Castle size={16} className="text-fantasy-gold shrink-0"/>
                                        <div>
                                           <p className="font-serif text-fantasy-wood dark:text-fantasy-parchment/80 font-bold italic leading-tight">"{log.details}"</p>
                                           <div className="text-[9px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase font-black mt-1">Autor: {log.memberName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className={`px-10 py-6 text-right font-medieval text-2xl ${isExpense ? 'text-red-900 dark:text-red-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                                    {isExpense ? '' : '+'}{log.value.toLocaleString('pt-BR')}
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

export default InvestmentsPage;