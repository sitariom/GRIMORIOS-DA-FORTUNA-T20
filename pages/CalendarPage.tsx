
import React from 'react';
import { useGuild } from '../context/GuildContext';
import { ARTON_MONTHS, ARTON_WEEKDAYS } from '../constants';
import { Calendar, Moon, Sun, ChevronRight, ChevronsRight, Clock } from 'lucide-react';

const CalendarPage: React.FC = () => {
  const { calendar, advanceDate } = useGuild();
  const { day, month, year, dayOfWeek } = calendar;

  const currentMonthName = ARTON_MONTHS[month] || 'Desconhecido';
  const currentWeekDayName = ARTON_WEEKDAYS[dayOfWeek] || 'Dia';

  // Determine season roughly
  let season = 'Primavera';
  if (month >= 3 && month <= 5) season = 'Verão';
  else if (month >= 6 && month <= 8) season = 'Outono';
  else if (month >= 9 && month <= 11) season = 'Inverno';

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
          <div className="parchment-card p-12 rounded-[60px] border-4 border-fantasy-gold/20 shadow-5xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-pulse pointer-events-none"></div>
              
              <div className="mb-4 inline-block px-6 py-2 bg-fantasy-wood/10 dark:bg-white/10 rounded-full border border-fantasy-wood/20 dark:border-white/20">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-fantasy-wood/60 dark:text-fantasy-parchment/60">{season}</span>
              </div>

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
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-6">
              <div className="parchment-card p-10 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-xl bg-black/5 dark:bg-black/20">
                  <h4 className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-6 flex items-center gap-3"><Clock size={24}/> Avançar o Tempo</h4>
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => advanceDate(1)} className="p-6 bg-white/40 dark:bg-white/5 border-2 border-fantasy-wood/5 dark:border-white/5 rounded-3xl hover:border-fantasy-gold hover:scale-105 transition-all group">
                          <ChevronRight className="mx-auto mb-2 text-fantasy-wood/40 dark:text-fantasy-parchment/40 group-hover:text-fantasy-gold" size={32}/>
                          <span className="block text-xs font-black uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment">1 Dia</span>
                      </button>
                      <button onClick={() => advanceDate(7)} className="p-6 bg-white/40 dark:bg-white/5 border-2 border-fantasy-wood/5 dark:border-white/5 rounded-3xl hover:border-fantasy-gold hover:scale-105 transition-all group">
                          <ChevronsRight className="mx-auto mb-2 text-fantasy-wood/40 dark:text-fantasy-parchment/40 group-hover:text-fantasy-gold" size={32}/>
                          <span className="block text-xs font-black uppercase tracking-widest text-fantasy-wood dark:text-fantasy-parchment">1 Semana</span>
                      </button>
                  </div>
              </div>

              <div className="parchment-card p-10 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10 shadow-xl bg-fantasy-wood/5 dark:bg-fantasy-wood/10 flex-1">
                  <h4 className="text-lg font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-4 uppercase tracking-widest">Efemérides</h4>
                  <ul className="space-y-4 text-sm font-serif italic text-fantasy-wood/70 dark:text-fantasy-parchment/70">
                      <li>• A manutenção de Bases e Salários de NPCs é cobrada automaticamente no dia 1 de cada mês.</li>
                      <li>• O ano possui 12 meses de 30 dias (360 dias).</li>
                      <li>• Dias de Nimb (intercalares) não são simulados automaticamente nesta versão para manter a regularidade das cobranças.</li>
                  </ul>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CalendarPage;
