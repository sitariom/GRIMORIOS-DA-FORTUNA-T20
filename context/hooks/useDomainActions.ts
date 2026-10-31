import { GuildState, Domain, DomainBuilding, LogCategory, LogEntry, DomainTransaction } from "../../types";
import { COURT_DATA, TERRAIN_MAX_LEVEL, TERRAIN_MAGIC_POTENTIAL } from "../../constants";
import {
  createDomainMilitaryHandlers,
  createDomainLogisticsHandlers,
  createDomainGovernanceHandlers
} from "./domain";

interface DomainDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

export const useDomainActions = ({ activeGuild, triggerSave, notify, internalAddLog }: DomainDeps) => {
  const getMaxActions = (domain: Domain): number => {
    return domain.court === "Rica" ? 3 : 2;
  };

  const normalizeTerrain = (terrain: string): string => {
    const t = (terrain || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const map: Record<string, string> = {
      planicie: 'Planicie', floresta: 'Floresta', montanha: 'Montanha',
      colina: 'Colina', colinas: 'Colina', pantano: 'Pantano',
      deserto: 'Deserto', subterraneo: 'Subterraneo', aquatico: 'Aquatico'
    };
    return map[t] || '';
  };

  const getDomainMaxLevel = (domain: {
    terrain: string;
    isNatureBoundRace?: boolean;
    isSubterraneanBoundRace?: boolean;
    hasWaterAccess?: boolean;
    isMystic?: boolean;
    coexistingDomainId?: string;
  }): number => {
    if (domain.isMystic) {
      let potential = getDomainMagicPotential(domain);
      if (domain.coexistingDomainId) {
        const normalDomain = activeGuild.domains.find(d => d.id === domain.coexistingDomainId);
        if (normalDomain && !normalDomain.isNatureBoundRace) {
          potential = Math.max(1, potential - normalDomain.level);
        }
      }
      return potential;
    }

    const key = normalizeTerrain(domain.terrain);
    let baseMax = TERRAIN_MAX_LEVEL[key] ?? 7;

    if (key === 'Floresta' && domain.isNatureBoundRace) baseMax = 6;
    if (key === 'Subterraneo' && domain.isSubterraneanBoundRace) baseMax = 6;
    if (domain.hasWaterAccess) baseMax += 1;

    return Math.min(7, baseMax);
  };

  const getDomainMagicPotential = (domain: {
    terrain: string;
    hasMysticElement?: boolean;
  }): number => {
    const key = normalizeTerrain(domain.terrain);
    let basePotential = TERRAIN_MAGIC_POTENTIAL[key] ?? 0;

    if (domain.hasMysticElement) {
      basePotential += 1;
    }
    return basePotential;
  };

  const createTransaction = (type: "Entrada" | "Saída", amount: number, reason: string): DomainTransaction => ({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type,
    amount,
    reason
  });

  const computeFortification = (buildings: DomainBuilding[]): number => {
    return buildings.reduce((acc, b) => acc + (b.fortificationBonus || 0), 0);
  };

  const getMaintenanceCost = (domain: Domain): number => {
    const courtMaint = COURT_DATA[domain.court].maintenance;
    const unitMaint = domain.units.reduce((sum, u) => sum + u.maintenance, 0);
    return courtMaint + unitMaint;
  };

  // Submódulos especializados delegados
  const { addDomainUnit, removeDomainUnit, applyBattleOutcome } = createDomainMilitaryHandlers({
    activeGuild,
    triggerSave,
    notify,
    internalAddLog,
    createTransaction,
    getMaxActions,
    computeFortification
  });

  const { resolveCaravan, addPendingTask, updatePendingTask, removePendingTask } = createDomainLogisticsHandlers({
    activeGuild,
    triggerSave,
    notify,
    internalAddLog,
    createTransaction
  });

  const {
    executeDomainAction,
    payMaintenance,
    applyEvent,
    applyRandomEvent,
    resolveRevolt,
    resetDomainTurn,
    resetAllDomainsTurns
  } = createDomainGovernanceHandlers({
    activeGuild,
    triggerSave,
    notify,
    internalAddLog,
    createTransaction,
    getMaxActions,
    computeFortification,
    getDomainMaxLevel,
    getMaintenanceCost
  });

  const createDomain = (
    name: string,
    regent: string,
    terrain: string,
    payCost: boolean,
    isMystic: boolean = false,
    revolt: boolean = false,
    hasWaterAccess: boolean = false,
    hasMysticElement: boolean = false,
    isNatureBoundRace: boolean = false,
    isSubterraneanBoundRace: boolean = false,
    coexistingDomainId?: string
  ) => {
    const cost = 5000;
    if (payCost && activeGuild.wallet.TS < cost) return notify("Fundos insuficientes.", "error");

    const newDomain: Domain = {
      id: crypto.randomUUID(),
      name,
      regent,
      level: 1,
      terrain,
      isMystic,
      coexistingDomainId,
      court: 'Inexistente',
      treasury: 0,
      popularity: isMystic ? 'N/A' : 'Tolerado',
      fortification: 0,
      buildings: [],
      units: [],
      advisors: [],
      pendingTasks: [],
      cashFlow: [],
      revolt,
      hasWaterAccess,
      hasMysticElement,
      isNatureBoundRace,
      isSubterraneanBoundRace,
      actionsRemaining: 2,
      magicPowerLevel: isMystic ? 1 : 0
    };

    const newWallet = payCost ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;

    triggerSave({
      ...activeGuild,
      domains: [...activeGuild.domains, newDomain],
      wallet: newWallet,
      logs: internalAddLog(
        activeGuild,
        payCost ? 'Investimento' : 'Dominio',
        `Fundação Domínio${isMystic ? ' Místico' : ''}: ${name}${payCost ? ` (Custo de T$ ${cost} pago)` : ' por conquista/herança'}`,
        payCost ? -cost : 0,
        'system'
      )
    });
    notify(`Domínio ${isMystic ? 'Místico ' : ''}estabelecido!`);
  };

  const updateDomain = (id: string, data: Partial<Domain>) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;
    const finalData = { ...data };
    
    const isMystic = finalData.isMystic !== undefined ? finalData.isMystic : domain.isMystic;
    const level = finalData.level !== undefined ? finalData.level : domain.level;
    finalData.magicPowerLevel = isMystic ? level * level : 0;

    // Enforce popularity / revolt invariants on manual updates
    if (isMystic) {
      finalData.popularity = 'N/A';
      finalData.revolt = false;
    } else {
      const pop = finalData.popularity !== undefined ? finalData.popularity : domain.popularity;
      if (pop === 'Odiado') {
        finalData.revolt = true;
      } else if (pop !== 'N/A') {
        finalData.revolt = false;
      }
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? { ...d, ...finalData } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Estatutos do Domínio ${domain.name} atualizados manualmente`, 0, 'system')
    });
  };

  const investDomain = (id: string, amount: number) => {
    if (activeGuild.wallet.LO < amount) return notify("Falta Lingotes de Ouro no cofre.", "error");

    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    const transaction = createTransaction('Entrada', amount, "Aporte da Guilda");

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO - amount },
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        treasury: d.treasury + amount,
        cashFlow: [...(d.cashFlow || []), transaction]
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Investimento no Domínio ${domain.name}: +${amount} LO`, -(amount * 1000), 'system')
    });
    notify("Tesouro Real abastecido.");
  };

  const withdrawDomain = (id: string, amount: number) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain || domain.treasury < amount) return notify("Fundo insuficiente no domínio.", "error");

    const transaction = createTransaction('Saída', amount, "Resgate pela Guilda");

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, LO: activeGuild.wallet.LO + amount },
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        treasury: d.treasury - amount,
        cashFlow: [...(d.cashFlow || []), transaction]
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Saque do Domínio ${domain.name}: -${amount} LO`, (amount * 1000), 'system')
    });
    notify("Lingotes transferidos ao cofre.");
  };

  const manageDomainTreasury = (id: string, amount: number, type: 'Income' | 'Expense', reason: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    const localType = type === 'Income' ? 'Entrada' : 'Saída';
    const transaction = createTransaction(localType, amount, reason || 'Ajuste Manual');

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        treasury: type === 'Income' ? d.treasury + amount : Math.max(0, d.treasury - amount),
        cashFlow: [...(d.cashFlow || []), transaction]
      } : d),
      logs: internalAddLog(
        activeGuild,
        'Dominio',
        `Ajuste de Tesouro no Domínio ${domain.name}: ${type === 'Income' ? '+' : '-'}${amount} LO (${reason || 'Ajuste Manual'})`,
        0,
        'system'
      )
    });
    notify(`Tesouro do domínio atualizado (${type}).`);
  };

  const demolishDomain = (id: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    const domainName = domain ? domain.name : '';
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.filter(d => d.id !== id),
      logs: internalAddLog(activeGuild, 'Dominio', `Domínio ${domainName} perdido/abandonado`, 0, 'system')
    });
    notify("Domínio removido.");
  };


  const levelUpDomain = (id: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    const maxLevel = getDomainMaxLevel(domain);
    if (domain.level >= maxLevel) return notify("Domínio já no nível máximo para este terreno.", "error");

    const newLevel = domain.level + 1;
    const newMagicPower = domain.isMystic ? newLevel * newLevel : 0;

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        level: newLevel,
        magicPowerLevel: newMagicPower
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Domínio ${domain.name} evoluiu para Nível ${newLevel} (Concedido pelo Mestre)`, 0, 'system')
    });
    notify("Domínio evoluiu por graça do Mestre!");
  };

  const addDomainBuilding = (id: string, building: Omit<DomainBuilding, 'id'>, pay: boolean) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    if (domain.isMystic) {
      if (building.skill !== 'Misticismo' && building.skill !== 'Religião') {
        return notify("Domínios Místicos só suportam construções de Misticismo ou Religião.", "error");
      }
    }

    const maxActions = getMaxActions(domain);
    const currentActions = domain.actionsRemaining !== undefined ? domain.actionsRemaining : maxActions;

    if (pay) {
      if (currentActions <= 0) {
        return notify("Sem ações restantes no turno atual.", "error");
      }
      if (domain.revolt) {
        return notify("Não é possível realizar esta ação sob revolta.", "error");
      }
    }

    const buildingLimit = domain.level * 3;
    if (domain.buildings.length >= buildingLimit) return notify(`Máximo de construções atingido (${buildingLimit}).`, "error");

    if (building.requires.length > 0) {
      const hasPrereq = building.requires.every(req =>
        domain.buildings.some(b => b.name === req)
      );
      if (!hasPrereq) return notify(`Pré-requisitos necessários: ${building.requires.join(', ')}`, "error");
    }

    if (pay && domain.treasury < building.costLO) return notify("Tesouro Real insuficiente.", "error");

    const newTreasury = pay ? domain.treasury - building.costLO : domain.treasury;
    const newBuildings = [...domain.buildings, { ...building, id: crypto.randomUUID() }];
    const newFortification = computeFortification(newBuildings);

    let updatedCashFlow = domain.cashFlow || [];
    if (pay && building.costLO > 0) {
      const transaction = createTransaction('Saída', building.costLO, `Construção: ${building.name}`);
      updatedCashFlow = [...updatedCashFlow, transaction];
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        treasury: newTreasury,
        buildings: newBuildings,
        fortification: newFortification,
        cashFlow: updatedCashFlow,
        actionsRemaining: pay ? currentActions - 1 : currentActions
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Construção erguida em ${domain.name}: ${building.name}`, 0, 'system')
    });
    notify("Construção finalizada.");
  };

  const removeDomainBuilding = (id: string, buildId: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    const b = domain.buildings.find(x => x.id === buildId);
    const buildName = b ? b.name : 'Desconhecida';

    const newBuildings = domain.buildings.filter(b => b.id !== buildId);
    const newFortification = computeFortification(newBuildings);

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        buildings: newBuildings,
        fortification: newFortification
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Construção demolida em ${domain.name}: ${buildName}`, 0, 'system')
    });
    notify("Construção demolida.");
  };


  const addAdvisor = (id: string, advisor: import('../../types').DomainAdvisor) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return notify("Domínio não encontrado.", "error");

    const maxAdvisors = domain.court === 'Rica' ? 3 : domain.court === 'Comum' ? 1 : 0;
    if (domain.advisors.length >= maxAdvisors) return notify(`A corte ${domain.court} permite no máximo ${maxAdvisors} conselheiros.`, "error");

    let updatedNPCs = activeGuild.npcs;
    if (advisor.associatedType === 'NPC' && advisor.associatedId) {
      updatedNPCs = activeGuild.npcs.map(n => {
        if (n.id === advisor.associatedId) {
          return {
            ...n,
            locationType: 'Dominio',
            locationId: id,
            locationName: domain.name
          };
        }
        return n;
      });
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? { ...d, advisors: [...d.advisors, advisor] } : d),
      npcs: updatedNPCs,
      logs: internalAddLog(activeGuild, 'Dominio', `Conselheiro nomeado em ${domain.name}: ${advisor.name} (${advisor.role})`, 0, 'system')
    });
    notify("Conselheiro nomeado.");
  };

  const removeAdvisor = (id: string, advisorId: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    const adv = domain?.advisors.find(a => a.id === advisorId);
    const advName = adv ? adv.name : 'Desconhecido';

    let updatedNPCs = activeGuild.npcs;
    if (adv && adv.associatedType === 'NPC' && adv.associatedId) {
      updatedNPCs = activeGuild.npcs.map(n => {
        if (n.id === adv.associatedId) {
          return {
            ...n,
            locationType: 'Grupo',
            locationId: undefined,
            locationName: 'Grupo'
          };
        }
        return n;
      });
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? { ...d, advisors: d.advisors.filter(a => a.id !== advisorId) } : d),
      npcs: updatedNPCs,
      logs: internalAddLog(activeGuild, 'Dominio', `Conselheiro dispensado de ${domain?.name || ''}: ${advName}`, 0, 'system')
    });
    notify("Conselheiro dispensado.");
  };

  const updateAdvisor = (id: string, advisorId: string, data: Partial<import('../../types').DomainAdvisor>, newDomainId?: string) => {
    const sourceDomain = activeGuild.domains.find(d => d.id === id);
    if (!sourceDomain) return notify("Domínio de origem não encontrado.", "error");

    const advisor = sourceDomain.advisors.find(a => a.id === advisorId);
    if (!advisor) return notify("Conselheiro não encontrado.", "error");

    const targetDomainId = newDomainId && newDomainId !== id ? newDomainId : id;
    const targetDomain = activeGuild.domains.find(d => d.id === targetDomainId);
    if (!targetDomain) return notify("Domínio de destino não encontrado.", "error");

    if (targetDomainId !== id) {
      const maxAdvisors = targetDomain.court === 'Rica' ? 3 : targetDomain.court === 'Comum' ? 1 : 0;
      if (targetDomain.advisors.length >= maxAdvisors) {
        return notify(`O domínio de destino (${targetDomain.name}) permite no máximo ${maxAdvisors} conselheiros.`, "error");
      }
    }

    const updatedAdvisor = { ...advisor, ...data };

    let updatedDomains = activeGuild.domains;
    let logMsg = "";

    if (targetDomainId !== id) {
      updatedDomains = activeGuild.domains.map(d => {
        if (d.id === id) {
          return { ...d, advisors: d.advisors.filter(a => a.id !== advisorId) };
        }
        if (d.id === targetDomainId) {
          return { ...d, advisors: [...d.advisors, updatedAdvisor] };
        }
        return d;
      });
      logMsg = `Conselheiro ${updatedAdvisor.name} movido de ${sourceDomain.name} para ${targetDomain.name} como ${updatedAdvisor.role}`;
    } else {
      updatedDomains = activeGuild.domains.map(d => {
        if (d.id === id) {
          return {
            ...d,
            advisors: d.advisors.map(a => a.id === advisorId ? updatedAdvisor : a)
          };
        }
        return d;
      });
      logMsg = `Conselheiro ${updatedAdvisor.name} em ${sourceDomain.name} atualizado para ${updatedAdvisor.role} (${updatedAdvisor.skill})`;
    }

    let updatedNPCs = activeGuild.npcs;
    
    if (advisor.associatedId && advisor.associatedId !== updatedAdvisor.associatedId) {
      updatedNPCs = updatedNPCs.map(n => {
        if (n.id === advisor.associatedId) {
          return {
            ...n,
            locationType: 'Grupo',
            locationId: undefined,
            locationName: 'Grupo'
          };
        }
        return n;
      });
    }

    if (updatedAdvisor.associatedType === 'NPC' && updatedAdvisor.associatedId) {
      updatedNPCs = updatedNPCs.map(n => {
        if (n.id === updatedAdvisor.associatedId) {
          return {
            ...n,
            locationType: 'Dominio',
            locationId: targetDomainId,
            locationName: targetDomain.name
          };
        }
        return n;
      });
    }

    triggerSave({
      ...activeGuild,
      domains: updatedDomains,
      npcs: updatedNPCs,
      logs: internalAddLog(activeGuild, 'Dominio', logMsg, 0, 'system')
    });
    notify("Conselheiro atualizado com sucesso.");
  };


  return {
    createDomain, updateDomain, investDomain, withdrawDomain, manageDomainTreasury,
    demolishDomain, levelUpDomain,
    addDomainBuilding, removeDomainBuilding, addDomainUnit, removeDomainUnit,
    executeDomainAction, payMaintenance, getMaintenanceCost, computeFortification,
    applyEvent, applyRandomEvent, resolveRevolt, addAdvisor, removeAdvisor, updateAdvisor, addPendingTask, updatePendingTask, removePendingTask,
    resolveCaravan, applyBattleOutcome, resetDomainTurn, resetAllDomainsTurns,
    getDomainMaxLevel, getDomainMagicPotential
  };
};
