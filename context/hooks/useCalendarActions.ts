import { GuildState } from '../../types';

interface CalendarDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
}

export const useCalendarActions = ({ activeGuild, triggerSave }: CalendarDeps) => {
  const advanceDate = (days: number) => {
    let { day, month, year, dayOfWeek } = activeGuild.calendar;
    let totalDays = day + days;

    while (totalDays > 30) {
      totalDays -= 30;
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
    while (totalDays < 1) {
      totalDays += 30;
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
    }
    
    const newDayOfWeek = (dayOfWeek + days) % 7;
    const normalizedWeekDay = newDayOfWeek < 0 ? newDayOfWeek + 7 : newDayOfWeek;

    triggerSave({
      ...activeGuild,
      calendar: { ...activeGuild.calendar, day: totalDays, month, year, dayOfWeek: normalizedWeekDay }
    });
  };

  const setGameDate = (day: number, month: number, year: number) => {
    triggerSave({
      ...activeGuild,
      calendar: { ...activeGuild.calendar, day, month, year }
    });
  };

  const toggleNimbDay = (state: boolean) => {
    triggerSave({
      ...activeGuild,
      calendar: { ...activeGuild.calendar, isNimbDay: state }
    });
  };

  return { advanceDate, setGameDate, toggleNimbDay };
};
