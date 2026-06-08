import { GuildState, NPC, LogCategory, LogEntry } from '../../types';

interface NPCDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

export const useNPCActions = ({ activeGuild, triggerSave, notify, internalAddLog }: NPCDeps) => {
  const addNPC = (npc: Omit<NPC, 'id'>) => {
    triggerSave({
      ...activeGuild,
      npcs: [...activeGuild.npcs, { ...npc, id: crypto.randomUUID() }]
    });
    notify("NPC Registrado.");
  };

  const updateNPC = (id: string, data: Partial<NPC>) => {
    triggerSave({
      ...activeGuild,
      npcs: activeGuild.npcs.map(n => n.id === id ? { ...n, ...data } : n)
    });
    notify("NPC Atualizado.");
  };

  const removeNPC = (id: string) => {
    triggerSave({
      ...activeGuild,
      npcs: activeGuild.npcs.filter(n => n.id !== id)
    });
    notify("NPC Removido.");
  };

  const payAllNPCs = () => {
    const payrollNpcs = activeGuild.npcs.filter(n => 
      (n.relationship === 'Contratado' || !n.relationship) && 
      (n.status === 'Ativo' || !n.status) && 
      (n.monthlyCost || 0) > 0
    );
    const totalCost = payrollNpcs.reduce((acc, n) => acc + (n.monthlyCost || 0), 0);
    if (activeGuild.wallet.TS < totalCost) return notify("Fundos insuficientes para folha completa.", "error");

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - totalCost },
      logs: internalAddLog(activeGuild, 'Manutencao', `Pagamento Folha Salarial (${payrollNpcs.length} funcionários)`, -totalCost, 'system')
    });
    notify("Todos os salários pagos.");
  };

  const paySingleNPC = (id: string) => {
    const npc = activeGuild.npcs.find(n => n.id === id);
    if (!npc) return;
    if (npc.relationship && npc.relationship !== 'Contratado') {
      return notify("Apenas contratados recebem salários.", "error");
    }
    if (npc.status && npc.status !== 'Ativo') {
      return notify(`Não é possível pagar o salário de um funcionário com status: ${npc.status}.`, "error");
    }
    if (activeGuild.wallet.TS < npc.monthlyCost) return notify("Fundos insuficientes.", "error");

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - npc.monthlyCost },
      logs: internalAddLog(activeGuild, 'Manutencao', `Pagamento: ${npc.name}`, -npc.monthlyCost, 'system')
    });
    notify(`Salário de ${npc.name} pago.`);
  };

  const interactWithNPC = (npcId: string, memberId: string, alignsWithLikes: boolean) => {
    const npc = activeGuild.npcs.find(n => n.id === npcId);
    if (!npc) return notify("NPC não encontrado.", "error");

    const amount = alignsWithLikes ? 2 : 1;
    const currentAffinities = npc.affinityByMember || {};
    const newPA = Math.min(7, (currentAffinities[memberId] || 0) + amount);

    triggerSave({
      ...activeGuild,
      npcs: activeGuild.npcs.map(n =>
        n.id === npcId
          ? {
              ...n,
              affinityByMember: {
                ...currentAffinities,
                [memberId]: newPA
              }
            }
          : n
      )
    });
    notify(`Interação realizada! Afinidade com ${npc.name} agora é ${newPA} PA.`);
  };

  const decreaseAffinity = (npcId: string, memberId: string) => {
    const npc = activeGuild.npcs.find(n => n.id === npcId);
    if (!npc) return notify("NPC não encontrado.", "error");

    const currentAffinities = npc.affinityByMember || {};
    const currentPA = currentAffinities[memberId] || 0;
    if (currentPA <= 0) return notify(`${npc.name} já está com 0 PA para este herói.`, "info");

    const newPA = Math.max(0, currentPA - 1);

    triggerSave({
      ...activeGuild,
      npcs: activeGuild.npcs.map(n =>
        n.id === npcId
          ? {
              ...n,
              affinityByMember: {
                ...currentAffinities,
                [memberId]: newPA
              }
            }
          : n
      )
    });
    notify(`Afinidade reduzida! ${npc.name} agora tem ${newPA} PA com este herói.`);
  };

  const toggleActiveAffinity = (memberId: string, npcId: string) => {
    const member = activeGuild.members.find(m => m.id === memberId);
    if (!member) return notify("Membro não encontrado.", "error");

    const isCurrentActive = member.activeAffinityNpcId === npcId;
    const newActiveId = isCurrentActive ? undefined : npcId;

    triggerSave({
      ...activeGuild,
      members: activeGuild.members.map(m =>
        m.id === memberId
          ? { ...m, activeAffinityNpcId: newActiveId }
          : m
      )
    });
    notify(isCurrentActive ? "Benefício de afinidade desativado." : "Benefício de afinidade ativado com sucesso!");
  };

  const completeUltimateQuest = (npcId: string, memberId: string) => {
    const npc = activeGuild.npcs.find(n => n.id === npcId);
    if (!npc) return notify("NPC não encontrado.", "error");

    const currentPA = (npc.affinityByMember || {})[memberId] || 0;
    if (currentPA < 7) {
      return notify("Requer 7 Pontos de Afinidade para realizar a Última Demanda.", "error");
    }

    const currentUltimateDone = npc.ultimateQuestDone || {};
    triggerSave({
      ...activeGuild,
      npcs: activeGuild.npcs.map(n =>
        n.id === npcId
          ? {
              ...n,
              ultimateQuestDone: {
                ...currentUltimateDone,
                [memberId]: true
              }
            }
          : n
      )
    });
    notify(`Última Demanda de ${npc.name} concluída com sucesso! Terceiro benefício ativado.`);
  };

  return {
    addNPC,
    updateNPC,
    removeNPC,
    payAllNPCs,
    paySingleNPC,
    interactWithNPC,
    decreaseAffinity,
    toggleActiveAffinity,
    completeUltimateQuest
  };
};
