
import React from 'react';
import { useGuild } from '../context/GuildContext';
import { LogCategory } from '../types';
import { Package, ScrollText, BookOpen } from 'lucide-react';

const ItemHistoryPage: React.FC = () => {
  const { logs } = useGuild();
  const itemLogs = logs.filter(log => log.category === 'Estoque' || log.category === 'Venda' || (log.category === 'Saque' && log.value === 0));

  return (
    <div className="space-y-10 pb-20 font-serif">
       <header>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Movimentação de itens</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Onde as armas, armaduras e relíquias são registradas.</p>
       </header>
       
       <div className="parchment-card rounded-[40px] shadow-5xl border-4 border-fantasy-gold/20 overflow-hidden animate-scroll-unroll">
           <div className="bg-fantasy-wood/5 dark:bg-black/20 p-8 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="wax-seal w-12 h-12 flex items-center justify-center text-white"><BookOpen size={24}/></div>
                 <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment">Crônicas do Arsenal</h3>
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-fantasy-wood/5 dark:bg-black/10 text-[10px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-widest">
                    <tr>
                        <th className="px-10 py-6">Época</th>
                        <th className="px-10 py-6">Tipo</th>
                        <th className="px-10 py-6">Crônica do Item</th>
                        <th className="px-10 py-6 text-right">Responsável</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-fantasy-wood/10 dark:divide-white/5">
                    {itemLogs.length === 0 && (
                        <tr><td colSpan={4} className="px-10 py-20 text-center font-medieval text-2xl text-fantasy-wood/30 dark:text-white/10 italic">Nenhuma crônica registrada...</td></tr>
                    )}
                    {itemLogs.map(log => {
                        let badgeColor = 'bg-fantasy-wood/10 text-fantasy-wood/50 border-fantasy-wood/20 dark:text-fantasy-parchment/40 dark:border-white/10';
                        if (log.category === 'Venda') badgeColor = 'bg-emerald-700/10 text-emerald-800 border-emerald-700/30 dark:text-emerald-400 dark:border-emerald-400/30';
                        if (log.category === 'Estoque') badgeColor = 'bg-blue-700/10 text-blue-800 border-blue-700/30 dark:text-blue-400 dark:border-blue-400/30';

                        return (
                            <tr key={log.id} className="hover:bg-fantasy-gold/5 dark:hover:bg-fantasy-gold/10 transition-colors">
                                <td className="px-10 py-6">
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
                                <td className="px-10 py-6 text-right">
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
       </div>
    </div>
  );
};

export default ItemHistoryPage;
