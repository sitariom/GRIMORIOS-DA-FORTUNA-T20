
import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { ARTON_MONTHS, ARTON_WEEKDAYS } from '../constants';
import { Moon, Sun, ChevronRight, ChevronsRight, Clock, ChevronLeft, ChevronsLeft, Edit, Dices, X } from 'lucide-react';

const CalendarPage: React.FC = () => {
  const { calendar = { day: 1, month: 0, year: 1420, dayOfWeek: 0, isNimbDay: false }, advanceDate, setGameDate, toggleNimbDay, isAdmin } = useGuild();
  const { day, month, year, dayOfWeek, isNimbDay } = calendar;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editDay, setEditDay] = useState(day);
  const [editMonth, setEditMonth] = useState(month);
  const [editYear, setEditYear] = useState(year);

  const currentMonthName = ARTON_MONTHS[month] || 'Desconhecido';
  const currentWeekDayName = ARTON_WEEKDAYS[dayOfWeek] || 'Dia';

  // Determine season roughly
  let season = 'Primavera';
  if (month >= 3 && month <= 5) season = 'Verão';
  else if (month >= 6 && month <= 8) season = 'Outono';
  else if (month >= 9 && month <= 11) season = 'Inverno';

  const handleManualSet = (e: React.FormEvent) => {
      e.preventDefault();
      setGameDate(editDay, editMonth, editYear);
      setShowEditModal(false);
  };

  const openEdit = () => {
      setEditDay(day);
      setEditMonth(month);
      setEditYear(year);
      setShowEditModal(true);
  };

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Calendário Artoniano</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">A passagem das eras e o fluxo do tempo.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Main Calendar Display */}
          <div className={`parchment-card p-12 rounded-[60px] border-4 shadow-5xl flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-700 ${isNimbDay ? 'border-purple-600/50 bg-purple-900/10' : 'border-fantasy-gold/20'}`}>
              <div className={`absolute inset-0 opacity-10 animate-pulse pointer-events-none ${isNimbDay ? "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"}`}></div>
              
              {!isNimbDay && (
                  <div className="mb-4 inline-block px-6 py-2 bg-fantasy-wood/10 dark:bg-white/10 rounded-full border border-fantasy-wood/20 dark:border-white/20">
                      <span className="text-xs font-black uppercase tracking-[0.4em] text-fantasy-wood/60 dark:text-fantasy-parchment/60">{season}</span>
                  </div>
              )}

              {isNimbDay ? (
                  <div className="flex flex-col items-center animate-bounce-in">
                      <Dices size={80} className="text-purple-600 dark:text-purple-400 mb-6 animate-spin-slow"/>
                      <span className="text-6xl md:text-8xl font-medieval text-purple-800 dark:text-purple-300 drop-shadow-lg tracking-tighter uppercase">Dia de Nimb</span>
                      <p className="text-xl font-serif italic text-purple-900/60 dark:text-purple-200/60 mt-4">"Onde a lógica falha e a sorte impera."</p>
                  </div>
              ) : (
                  <>
                      <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-8xl font-medieval text-fantasy-wood dark:text-fantasy-gold drop-shadow-lg">{day}</span>
                          <span className="text-2xl font-medieval text-fantasy-wood/50 dark:text-fantasy-parchment/50">de</span>
                      </div>
                      
                      <h3 className="text-5xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-4 uppercase tracking-tight">{currentMonthName}</h3>
                      <p className="text-xl font-medieval text-fantasy-wood/60 dark:text-fantasy-parchment/60">{year} DE</p>
                      
                      <div className="mt-8 flex items-center gap-3">
                          <Sun className="text-fantasy-gold animate-spin-slow" size={24}/>
                          <span className="text-sm font-black uppercase tracking-widest text-fantasy-wood/80 dark:text-fantasy-parchment/80">{currentWeekDayName}</span>
                          <Moon className="text-indigo-400" size={24}/>
                      </div>
                  </>
              )}
          </div>

          {/* Controls - Admin Only */}
          {isAdmin ? (
              <div className="flex flex-col gap-6">
                  <div className="parchment-card p-10 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-xl bg-black/5 dark:bg-black/20">
                      <div className="flex justify-between items-center mb-6">
                          <h4 className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment flex items-center gap-3"><Clock size={24}/> Controle Temporal</h4>
                          <button onClick={openEdit} className="p-2 bg-fantasy-wood/10 dark:bg-white/10 rounded-full hover:bg-fantasy-wood/20 text-fantasy-wood dark:text-fantasy-parchment" title="Ajuste Manual">
                              <Edit size={18}/>
                          </button>
                      </div>
                      
                      {/* Advance/Rewind Buttons */}
                      <div className="grid grid-cols-4 gap-2 mb-6">
                          <button onClick={() => advanceDate(-7)} className="p-3 bg-white/40 dark:bg-white/5 border border-fantasy-wood/5 dark:border-white/5 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all flex flex-col items-center justify-center gap-1 group">
                              <ChevronsLeft size={20} className="opacity-50 group-hover:opacity-100"/>
                              <span className="text-[9px] font-black uppercase">-1 Sem</span>
                          </button>
                          <button onClick={() => advanceDate(-1)} className="p-3 bg-white/40 dark:bg-white/5 border border-fantasy-wood/5 dark:border-white/5 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all flex flex-col items-center justify-center gap-1 group">
                              <ChevronLeft size={20} className="opacity-50 group-hover:opacity-100"/>
                              <span className="text-[9px] font-black uppercase">-1 Dia</span>
                          </button>
                          <button onClick={() => advanceDate(1)} className="p-3 bg-white/40 dark:bg-white/5 border border-fantasy-wood/5 dark:border-white/5 rounded-2xl hover:border-emerald-500 hover:text-emerald-500 transition-all flex flex-col items-center justify-center gap-1 group">
                              <ChevronRight size={20} className="opacity-50 group-hover:opacity-100"/>
                              <span className="text-[9px] font-black uppercase">+1 Dia</span>
                          </button>
                          <button onClick={() => advanceDate(7)} className="p-3 bg-white/40 dark:bg-white/5 border border-fantasy-wood/5 dark:border-white/5 rounded-2xl hover:border-emerald-500 hover:text-emerald-500 transition-all flex flex-col items-center justify-center gap-1 group">
                              <ChevronsRight size={20} className="opacity-50 group-hover:opacity-100"/>
                              <span className="text-[9px] font-black uppercase">+1 Sem</span>
                          </button>
                      </div>

                      {/* Nimb Toggle */}
                      <button 
                        onClick={() => toggleNimbDay(!isNimbDay)} 
                        className={`w-full py-4 rounded-3xl font-medieval uppercase tracking-widest text-lg transition-all border-2 flex items-center justify-center gap-3 ${isNimbDay ? 'bg-purple-900 text-white border-purple-950 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-transparent border-fantasy-wood/20 text-fantasy-wood/40 hover:border-purple-500 hover:text-purple-500'}`}
                      >
                          <Dices size={24} className={isNimbDay ? 'animate-spin' : ''}/>
                          {isNimbDay ? 'Encerrar Dia de Nimb' : 'Declarar Dia de Nimb'}
                      </button>
                  </div>

                  <div className="parchment-card p-8 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-xl bg-fantasy-wood/5 dark:bg-fantasy-wood/10 flex-1">
                      <h4 className="text-lg font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-4 uppercase tracking-widest">Efemérides</h4>
                      <ul className="space-y-4 text-xs font-serif italic text-fantasy-wood/70 dark:text-fantasy-parchment/70">
                          <li>• A manutenção de Bases e Salários de NPCs é cobrada automaticamente no dia 1 de cada mês.</li>
                          <li>• O ano possui 12 meses de 30 dias (360 dias).</li>
                          <li>• Dias de Nimb são ativados manualmente e suspendem a contagem normal visualmente.</li>
                      </ul>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col justify-center items-center text-center p-12 opacity-50">
                  <Clock size={64} className="mb-4 text-fantasy-wood/30 dark:text-fantasy-parchment/30"/>
                  <p className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment uppercase">Apenas o Mestre do Tempo pode alterar o destino.</p>
              </div>
          )}
      </div>

      {/* Manual Set Modal */}
      {showEditModal && (
          <div className="fixed inset-0 bg-black/90 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="parchment-card p-10 rounded-[50px] w-full max-w-md border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in">
                  <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-2 rounded-full transition-colors"><X size={24}/></button>
                  
                  <div className="text-center mb-8">
                      <div className="wax-seal w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white"><Edit size={32}/></div>
                      <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Ajuste Cronológico</h3>
                  </div>

                  <form onSubmit={handleManualSet} className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-center block text-fantasy-wood/50">Dia</label>
                              <input type="number" min="1" max="30" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-2xl py-3 text-center font-medieval text-xl" value={editDay} onChange={e => setEditDay(Number(e.target.value))} />
                          </div>
                          <div className="space-y-2 col-span-2">
                              <label className="text-[10px] font-black uppercase text-center block text-fantasy-wood/50">Mês</label>
                              <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-2xl py-3 px-4 font-medieval text-lg appearance-none text-center cursor-pointer" value={editMonth} onChange={e => setEditMonth(Number(e.target.value))}>
                                  {ARTON_MONTHS.map((m, i) => <option key={i} value={i} className="dark:bg-black">{m}</option>)}
                              </select>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-center block text-fantasy-wood/50">Ano</label>
                          <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-2xl py-3 text-center font-medieval text-xl" value={editYear} onChange={e => setEditYear(Number(e.target.value))} />
                      </div>
                      <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-4 rounded-[32px] font-medieval text-xl uppercase tracking-widest shadow-xl">Confirmar Data</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default CalendarPage;
