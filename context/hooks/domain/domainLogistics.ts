import { GuildState, DomainPendingTask, LogCategory, LogEntry, CourtType } from '../../../types';

export interface DomainLogisticsDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
  createTransaction: (type: 'Entrada' | 'Saída', amount: number, reason: string) => import('../../../types').DomainTransaction;
}

export const createDomainLogisticsHandlers = (deps: DomainLogisticsDeps) => {
  const {
    activeGuild,
    triggerSave,
    notify,
    internalAddLog,
    createTransaction
  } = deps;

  const resolveCaravan = (id: string, taskId: string, profitLO: number) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return notify("Domínio não encontrado.", "error");

    const task = domain.pendingTasks?.find(t => t.id === taskId);
    if (!task) return notify("Tarefa de caravana não encontrada.", "error");

    const match = task.description.match(/Investimento:\s*(\d+)\s*LO/);
    const investLO = match ? parseInt(match[1]) : 0;

    let transaction;
    let logMsg = "";
    let finalTreasuryChange = 0;
    let logValue = 0;

    if (profitLO > 0) {
      transaction = createTransaction('Entrada', profitLO, "Retorno de Caravana");
      logMsg = `Caravana Resolvida em ${domain.name}: +${profitLO} LO obtidos de lucro (Investimento original: ${investLO} LO)`;
      finalTreasuryChange = profitLO;
      logValue = 0;
      notify(`Caravana resolvida: +${profitLO} LO adicionados ao tesouro.`);
    } else {
      transaction = createTransaction('Saída', 0, `Caravana Fracassada (Investimento de ${investLO} LO perdido)`);
      logMsg = `Caravana perdida em ${domain.name}: −${investLO} LO`;
      finalTreasuryChange = 0;
      logValue = 0;
      notify(`Caravana fracassou: ${investLO} LO investidos foram perdidos.`, "error");
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        treasury: d.treasury + finalTreasuryChange,
        pendingTasks: (d.pendingTasks || []).filter(t => t.id !== taskId),
        cashFlow: [...(d.cashFlow || []), transaction]
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', logMsg, logValue, 'system')
    });
  };

  const addPendingTask = (id: string, task: Omit<DomainPendingTask, 'id'>) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;
    const newTask: DomainPendingTask = {
      ...task,
      status: task.status || 'Pendente',
      progress: task.progress !== undefined ? task.progress : 0,
      history: [{ date: new Date().toISOString(), details: 'Pendência criada' }],
      id: crypto.randomUUID()
    };
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? { ...d, pendingTasks: [...(d.pendingTasks || []), newTask] } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Nova pendência registrada no domínio ${domain.name}: ${task.name}`, 0, 'system')
    });
    notify("Tarefa assíncrona/pendência registrada.");
  };

  const updatePendingTask = (id: string, taskId: string, data: Partial<DomainPendingTask> & { note?: string }) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    let updatedTaskName = '';
    let statusChangedStr = '';
    let updatedNPCs = [...activeGuild.npcs];
    let addedLogs: LogEntry[] = [];
    
    const updatedDomains = activeGuild.domains.map(d => {
      if (d.id !== id) return d;
      
      let updatedCourt = d.court;
      let updatedAdvisors = [...d.advisors];
      
      const newTasks = (d.pendingTasks || []).map(t => {
        if (t.id !== taskId) return t;
        updatedTaskName = t.name;
        
        const newHistory = [...(t.history || [])];
        if (data.note && data.note.trim() !== '') {
          newHistory.push({
            date: new Date().toISOString(),
            details: data.note.trim()
          });
        }
        
        if (data.status && data.status !== t.status) {
          statusChangedStr = ` (Status: ${t.status} -> ${data.status})`;
          
          if (data.status === 'Concluido' && t.name.includes('Corrupção')) {
            const courtOrderDesc: CourtType[] = ['Rica', 'Comum', 'Pobre', 'Inexistente'];
            const idx = courtOrderDesc.indexOf(d.court);
            if (idx < courtOrderDesc.length - 1 && d.court !== 'Inexistente') {
              updatedCourt = courtOrderDesc[idx + 1];
              const maxAdvisors = updatedCourt === 'Rica' ? 3 : updatedCourt === 'Comum' ? 1 : 0;
              const removedAdvisors = d.advisors.slice(maxAdvisors);
              updatedAdvisors = d.advisors.slice(0, maxAdvisors);
              
              updatedNPCs = updatedNPCs.map(n => {
                if (removedAdvisors.some(a => a.associatedType === 'NPC' && a.associatedId === n.id)) {
                  return {
                    ...n,
                    locationType: 'Grupo',
                    locationId: undefined,
                    locationName: 'Grupo'
                  } as typeof n;
                }
                return n;
              });
              
              const tempState = { ...activeGuild, logs: [...activeGuild.logs, ...addedLogs] };
              const log = internalAddLog(
                tempState,
                'Dominio',
                `Corrupção resolvida em ${d.name}: Devido às demissões e expurgos, a corte foi rebaixada para ${updatedCourt}.`,
                0,
                'system'
              );
              addedLogs = [...addedLogs, ...log];
            }
          }
        }

        const { note, ...cleanData } = data;
        
        return {
          ...t,
          ...cleanData,
          history: newHistory
        };
      });

      return {
        ...d,
        court: updatedCourt,
        advisors: updatedAdvisors,
        pendingTasks: newTasks
      };
    });

    const baseLog = internalAddLog(
      { ...activeGuild, logs: [...activeGuild.logs, ...addedLogs] },
      'Dominio',
      `Pendência "${updatedTaskName}" em ${domain.name} atualizada${statusChangedStr}. Progresso: ${data.progress !== undefined ? data.progress : 0}%`,
      0,
      'system'
    );

    triggerSave({
      ...activeGuild,
      domains: updatedDomains,
      npcs: updatedNPCs,
      logs: [...activeGuild.logs, ...addedLogs, ...baseLog]
    });
    notify("Pendência atualizada.");
  };

  const removePendingTask = (id: string, taskId: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    const task = domain?.pendingTasks?.find(t => t.id === taskId);
    const taskName = task ? task.name : 'Desconhecida';
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? { ...d, pendingTasks: (d.pendingTasks || []).filter(t => t.id !== taskId) } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Pendência removida do domínio ${domain?.name || ''}: ${taskName}`, 0, 'system')
    });
  };

  return { resolveCaravan, addPendingTask, updatePendingTask, removePendingTask };
};
