import { useCallback } from 'react';
import { GuildState, Conglomerate, Domain, LogCategory, LogEntry, ConglomerateRole, ConglomerateAffinity } from '../../types';

export interface ConglomerateDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

export const useConglomerateActions = ({
  activeGuild,
  triggerSave,
  notify,
  internalAddLog
}: ConglomerateDeps) => {
  const createConglomerate = useCallback((name: string, type: 'Alianca' | 'Imperio', capitalDomainId: string) => {
    const newC: Conglomerate = {
      id: crypto.randomUUID(),
      name,
      type,
      capitalDomainId,
      memberDomainIds: [capitalDomainId],
      subjugatedIds: [],
      formationDate: `${activeGuild.calendar.day}/${activeGuild.calendar.month + 1}/${activeGuild.calendar.year}`,
      domainRoles: { [capitalDomainId]: 'Capital' },
      active: true,
      formerMemberDomainIds: []
    };
    triggerSave({
      ...activeGuild,
      conglomerates: [...activeGuild.conglomerates, newC],
      domains: activeGuild.domains.map(d => d.id === capitalDomainId ? { ...d, conglomerateId: newC.id, conglomerateAffinity: 'Aliado' as ConglomerateAffinity } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `${type === 'Alianca' ? 'Aliança' : 'Império'} "${name}" formado(a). Capital: ${activeGuild.domains.find(d => d.id === capitalDomainId)?.name || 'Desconhecido'}`, 0, 'system')
    });
  }, [activeGuild, triggerSave, internalAddLog]);

  const inactivateConglomerate = useCallback((conglomerateId: string) => {
    const c = activeGuild.conglomerates.find(c => c.id === conglomerateId);
    if (!c) return;
    const allMemberIds = c.memberDomainIds;
    triggerSave({
      ...activeGuild,
      conglomerates: activeGuild.conglomerates.map(c2 =>
        c2.id === conglomerateId ? { ...c2, active: false, formerMemberDomainIds: [...new Set([...c2.formerMemberDomainIds, ...allMemberIds])] } : c2
      ),
      domains: activeGuild.domains.map(d =>
        d.conglomerateId === conglomerateId
          ? { ...d, conglomerateId: undefined, conglomerateAffinity: undefined, formerConglomerateIds: [...(d.formerConglomerateIds || []), conglomerateId] }
          : d
      )
    });
    notify(`"${c.name}" foi inativado.`);
  }, [activeGuild, triggerSave, notify]);

  const reactivateConglomerate = useCallback((conglomerateId: string) => {
    const c = activeGuild.conglomerates.find(c => c.id === conglomerateId);
    if (!c || c.active) return;
    triggerSave({
      ...activeGuild,
      conglomerates: activeGuild.conglomerates.map(c2 =>
        c2.id === conglomerateId ? { ...c2, active: true } : c2
      )
    });
    notify(`"${c.name}" foi reativado. Domínios precisam ser re-adicionados manualmente.`);
  }, [activeGuild, triggerSave, notify]);

  const addDomainToConglomerate = useCallback((conglomerateId: string, domainId: string, bribeAmount?: number) => {
    const c = activeGuild.conglomerates.find(c => c.id === conglomerateId);
    if (!c || !c.active) return;
    if (c.memberDomainIds.includes(domainId)) return notify('Domínio já pertence ao conglomerado.', 'error');
    const domain = activeGuild.domains.find(d => d.id === domainId);
    if (!domain) return;
    const capitalDomain = activeGuild.domains.find(d => d.id === c.capitalDomainId);
    const bribe = bribeAmount && bribeAmount > 0 ? bribeAmount : 0;
    if (bribe > 0) {
      if (!capitalDomain) return notify('Domínio capital não encontrado.', 'error');
      if (capitalDomain.treasury < bribe) return notify(`Tesouro de "${capitalDomain.name}" insuficiente (tem ${capitalDomain.treasury} LO, precisa de ${bribe} LO).`, 'error');
    }
    const aff = domain.conglomerateAffinity;
    if (aff === 'Subjugado' || aff === 'Vassalo') return notify('Domínios subjugados ou vassalos não podem migrar voluntariamente. Apenas via conquista.', 'error');

    let updatedConglomerates = activeGuild.conglomerates.map(c2 =>
      c2.id === conglomerateId ? { ...c2, memberDomainIds: [...c2.memberDomainIds, domainId] } : c2
    );
    if (domain.conglomerateId && domain.conglomerateId !== conglomerateId) {
      updatedConglomerates = updatedConglomerates.map(c2 =>
        c2.id === domain.conglomerateId
          ? { ...c2, memberDomainIds: c2.memberDomainIds.filter(id => id !== domainId), formerMemberDomainIds: [...c2.formerMemberDomainIds, domainId] }
          : c2
      );
    }
    triggerSave({
      ...activeGuild,
      conglomerates: updatedConglomerates,
      domains: activeGuild.domains.map(d => {
        if (d.id === domainId) return {
          ...d,
          conglomerateId,
          conglomerateAffinity: 'Aliado' as ConglomerateAffinity,
          formerConglomerateIds: [...(d.formerConglomerateIds || []), ...(d.conglomerateId && d.conglomerateId !== conglomerateId ? [d.conglomerateId] : [])],
          treasury: bribe > 0 ? d.treasury + bribe : d.treasury
        };
        if (bribe > 0 && d.id === c.capitalDomainId) return { ...d, treasury: d.treasury - bribe };
        return d;
      }),
      logs: internalAddLog(activeGuild, 'Dominio',
        `Domínio "${domain.name}" juntou-se a "${c.name}"${bribe > 0 ? ` (suborno de ${bribe} LO de ${capitalDomain?.name} → ${domain.name})` : ''}${domain.conglomerateId && domain.conglomerateId !== conglomerateId ? ` (transferido de outro conglomerado)` : ''}.`,
        0, 'system')
    });
    notify(`"${domain.name}" aliado a "${c.name}"${bribe > 0 ? ` — ${bribe} LO transferidos de "${capitalDomain?.name}" para "${domain.name}".` : '.'}`);
  }, [activeGuild, triggerSave, internalAddLog, notify]);

  const setDomainRole = useCallback((conglomerateId: string, domainId: string, role: ConglomerateRole) => {
    const c = activeGuild.conglomerates.find(c => c.id === conglomerateId);
    if (!c) return;
    const domain = activeGuild.domains.find(d => d.id === domainId);
    if (!domain) return;
    triggerSave({
      ...activeGuild,
      conglomerates: activeGuild.conglomerates.map(c2 =>
        c2.id === conglomerateId ? {
          ...c2,
          domainRoles: { ...c2.domainRoles, [domainId]: role },
          capitalDomainId: role === 'Capital' ? domainId : c2.capitalDomainId
        } : c2
      ),
      logs: internalAddLog(activeGuild, 'Dominio',
        `Domínio "${domain.name}" agora exerce o papel de "${role === 'Nenhum' ? '—' : role}" em "${c.name}".`,
        0, 'system')
    });
    notify(`Papel de "${domain.name}" alterado para ${role}.`);
  }, [activeGuild, triggerSave, internalAddLog, notify]);

  const setConglomerateAffinity = useCallback((domainId: string, affinity: ConglomerateAffinity) => {
    const domain = activeGuild.domains.find(d => d.id === domainId);
    if (!domain) return;
    const c = domain.conglomerateId ? activeGuild.conglomerates.find(co => co.id === domain.conglomerateId) : null;
    const updateSubjugatedIds = (conglomerates: Conglomerate[]) =>
      conglomerates.map(co => {
        if (co.id !== domain.conglomerateId) return co;
        const newSubjugated = affinity === 'Subjugado'
          ? (co.subjugatedIds.includes(domainId) ? co.subjugatedIds : [...co.subjugatedIds, domainId])
          : co.subjugatedIds.filter(id => id !== domainId);
        return { ...co, subjugatedIds: newSubjugated };
      });
    triggerSave({
      ...activeGuild,
      conglomerates: updateSubjugatedIds(activeGuild.conglomerates),
      domains: activeGuild.domains.map(d =>
        d.id === domainId ? { ...d, conglomerateAffinity: affinity } : d
      ),
      logs: internalAddLog(activeGuild, 'Dominio',
        `Domínio "${domain.name}" agora tem afinidade "${affinity}"${c ? ` em "${c.name}"` : ''}.`,
        0, 'system')
    });
    notify(`Afinidade de "${domain.name}" alterada para ${affinity}.`);
  }, [activeGuild, triggerSave, internalAddLog, notify]);

  const removeDomainFromConglomerate = useCallback((conglomerateId: string, domainId: string) => {
    const c = activeGuild.conglomerates.find(c => c.id === conglomerateId);
    if (!c) return;
    const aff = activeGuild.domains.find(d => d.id === domainId)?.conglomerateAffinity;
    if (aff === 'Subjugado' || aff === 'Vassalo') return notify('Domínios subjugados ou vassalos não podem sair do conglomerado pacificamente.', 'error');
    const domainName = activeGuild.domains.find(d => d.id === domainId)?.name;
    triggerSave({
      ...activeGuild,
      conglomerates: activeGuild.conglomerates.map(c2 =>
        c2.id === conglomerateId ? (() => {
          const updatedRoles = { ...c2.domainRoles };
          delete updatedRoles[domainId];
          return {
            ...c2,
            memberDomainIds: c2.memberDomainIds.filter(id => id !== domainId),
            capitalDomainId: c2.capitalDomainId === domainId ? (c2.memberDomainIds.filter(id => id !== domainId)[0] || '') : c2.capitalDomainId,
            domainRoles: updatedRoles,
            formerMemberDomainIds: [...c2.formerMemberDomainIds, domainId]
          };
        })() : c2
      ).filter(c2 => c2.memberDomainIds.length > 0),
      domains: activeGuild.domains.map(d =>
        d.id === domainId
          ? { ...d, conglomerateId: undefined, subjugated: undefined, formerConglomerateIds: [...(d.formerConglomerateIds || []), conglomerateId] }
          : d
      ),
      logs: internalAddLog(activeGuild, 'Dominio', `Domínio "${domainName}" saiu de "${c.name}".`, 0, 'system')
    });
    notify('Domínio removido do conglomerado.');
  }, [activeGuild, triggerSave, internalAddLog, notify]);

  const subjugateDomain = useCallback((conglomerateId: string, targetDomainId: string) => {
    const c = activeGuild.conglomerates.find(c => c.id === conglomerateId);
    const target = activeGuild.domains.find(d => d.id === targetDomainId);
    if (!c || !target) return;
    if (c.memberDomainIds.includes(targetDomainId)) return notify('Este domínio já é membro.', 'error');

    const levelDrop = Math.max(1, target.level - 1);
    const buildingLoss = target.buildings && target.buildings.length > 0
      ? target.buildings[Math.floor(Math.random() * target.buildings.length)]
      : null;

    const updatedUnits = target.units?.map(u => ({
      ...u,
      power: Math.ceil((u.power || 1) / 2)
    })) || [];
    const updatedBuildings = buildingLoss
      ? target.buildings.filter(b => b.name !== buildingLoss.name)
      : target.buildings || [];

    const updatedDomain: Domain = {
      ...target,
      level: levelDrop,
      units: updatedUnits,
      buildings: updatedBuildings,
      popularity: 'Odiado',
      revolt: true,
      conglomerateId,
      conglomerateAffinity: 'Subjugado' as ConglomerateAffinity,
      treasury: Math.floor(target.treasury / 2),
      formerConglomerateIds: [...(target.formerConglomerateIds || []), ...(target.conglomerateId && target.conglomerateId !== conglomerateId ? [target.conglomerateId] : [])]
    };

    let updatedConglomerates = activeGuild.conglomerates.map(c2 =>
      c2.id === conglomerateId ? {
        ...c2,
        memberDomainIds: [...c2.memberDomainIds, targetDomainId],
        subjugatedIds: [...c2.subjugatedIds, targetDomainId],
        domainRoles: { ...c2.domainRoles, [targetDomainId]: 'Nenhum' as ConglomerateRole }
      } : c2
    );
    if (target.conglomerateId && target.conglomerateId !== conglomerateId) {
      updatedConglomerates = updatedConglomerates.map(c2 =>
        c2.id === target.conglomerateId
          ? { ...c2, memberDomainIds: c2.memberDomainIds.filter(id => id !== targetDomainId), formerMemberDomainIds: [...c2.formerMemberDomainIds, targetDomainId] }
          : c2
      );
    }

    triggerSave({
      ...activeGuild,
      conglomerates: updatedConglomerates,
      domains: activeGuild.domains.map(d => d.id === targetDomainId ? updatedDomain : d),
      logs: internalAddLog(activeGuild, 'Dominio',
        `IMPÉRIO: "${target.name}" foi subjugado por "${c.name}"! Poder militar reduzido à metade, nível caiu para ${levelDrop}, ${buildingLoss ? `construção "${buildingLoss.name}" destruída,` : ''} popularidade Odiado, em revolta.${target.conglomerateId && target.conglomerateId !== conglomerateId ? ' (conquistado de outro conglomerado)' : ''}`,
        0, 'system')
    });
    notify(`"${target.name}" foi subjugado! Terra arrasada.`);
  }, [activeGuild, triggerSave, internalAddLog, notify]);

  const disbandConglomerate = useCallback((conglomerateId: string) => {
    const c = activeGuild.conglomerates.find(c => c.id === conglomerateId);
    if (!c) return;
    triggerSave({
      ...activeGuild,
      conglomerates: activeGuild.conglomerates.filter(c2 => c2.id !== conglomerateId),
      domains: activeGuild.domains.map(d =>
        d.conglomerateId === conglomerateId
          ? { ...d, conglomerateId: undefined, conglomerateAffinity: undefined, formerConglomerateIds: [...(d.formerConglomerateIds || []), conglomerateId] }
          : d
      ),
      logs: internalAddLog(activeGuild, 'Dominio', `Conglomerado "${c.name}" foi dissolvido.`, 0, 'system')
    });
    notify(`"${c.name}" foi dissolvido.`);
  }, [activeGuild, triggerSave, internalAddLog, notify]);

  return {
    createConglomerate,
    inactivateConglomerate,
    reactivateConglomerate,
    addDomainToConglomerate,
    setDomainRole,
    setConglomerateAffinity,
    removeDomainFromConglomerate,
    subjugateDomain,
    disbandConglomerate
  };
};
