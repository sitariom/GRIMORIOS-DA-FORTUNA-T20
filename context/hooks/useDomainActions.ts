import { GuildState, Domain, DomainBuilding, DomainUnit, LogCategory, LogEntry, DomainActionType, ActionResult, DomainTransaction, DomainPendingTask, CourtType } from '../../types';
import { COURT_DATA, POPULARITY_LEVELS, TERRAIN_MAX_LEVEL, POPULARITY_MODIFIERS, TERRAIN_MAGIC_POTENTIAL } from '../../constants';
import { PopularityType } from '../../types';

interface DomainDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

export const useDomainActions = ({ activeGuild, triggerSave, notify, internalAddLog }: DomainDeps) => {
  const getMaxActions = (domain: Domain): number => {
    return domain.court === 'Rica' ? 3 : 2;
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

    let baseMax = 7;
    const t = domain?.terrain ? domain.terrain.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
    if (t === 'planicie') baseMax = 6;
    else if (t === 'floresta') baseMax = domain.isNatureBoundRace ? 6 : 4;
    else if (t === 'montanha') baseMax = 3;
    else if (t === 'colina' || t === 'colinas') baseMax = 5;
    else if (t === 'pantano') baseMax = 3;
    else if (t === 'deserto') baseMax = 4;
    else if (t === 'subterraneo') baseMax = domain.isSubterraneanBoundRace ? 6 : 2;
    else if (t === 'aquatico') baseMax = 3;
    
    if (domain.hasWaterAccess) {
      baseMax += 1;
    }
    return Math.min(7, baseMax);
  };

  const getDomainMagicPotential = (domain: {
    terrain: string;
    hasMysticElement?: boolean;
  }): number => {
    let basePotential = 0;
    const t = domain?.terrain ? domain.terrain.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
    if (t === 'planicie') basePotential = 4;
    else if (t === 'floresta') basePotential = 6;
    else if (t === 'montanha') basePotential = 7;
    else if (t === 'colina' || t === 'colinas') basePotential = 5;
    else if (t === 'pantano') basePotential = 7;
    else if (t === 'deserto') basePotential = 6;
    else if (t === 'subterraneo') basePotential = 8;
    else if (t === 'aquatico') basePotential = 4;

    if (domain.hasMysticElement) {
      basePotential += 1;
    }
    return basePotential;
  };

  const createTransaction = (type: 'Entrada' | 'Saída', amount: number, reason: string): DomainTransaction => ({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type,
    amount,
    reason
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
        type === 'Income' ? amount * 1000 : -amount * 1000,
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

  const computeFortification = (buildings: DomainBuilding[]): number => {
    return buildings.reduce((sum, b) => sum + (b.fortificationBonus || 0), 0);
  };

  const levelUpDomain = (id: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    const maxLevel = getDomainMaxLevel(domain);
    if (domain.level >= maxLevel) return notify("Domínio já no nível máximo para este terreno.", "error");

    const cost = domain.level * 20;
    if (domain.treasury < cost) return notify("Tesouro Real insuficiente.", "error");

    const buildingLimit = (domain.level + 1) * 3;
    if (domain.buildings.length > buildingLimit) return notify(`Reduza as construções para no máximo ${buildingLimit} antes de subir de nível.`, "error");

    const transaction = createTransaction('Saída', cost, `Evolução de Domínio (Nível ${domain.level} -> ${domain.level + 1})`);
    const newLevel = domain.level + 1;
    const newMagicPower = domain.isMystic ? newLevel * newLevel : 0;

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        level: newLevel,
        treasury: d.treasury - cost,
        cashFlow: [...(d.cashFlow || []), transaction],
        magicPowerLevel: newMagicPower
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Domínio ${domain.name} evoluiu para Nível ${newLevel}`, 0, 'system')
    });
    notify("Domínio evoluiu!");
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
      logs: internalAddLog(activeGuild, 'Dominio', `Construção erguida em ${domain.name}: ${building.name}`, pay ? -building.costLO * 1000 : 0, 'system')
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

  const addDomainUnit = (id: string, unit: Omit<DomainUnit, 'id'>, pay: boolean) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    if (domain.units.length >= domain.level) {
      return notify(`Limite máximo de unidades militares atingido (${domain.level}).`, "error");
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

    if (unit.requires) {
      const hasReq = domain.buildings.some(b => b.name === unit.requires);
      if (!hasReq) return notify(`Construção necessária: ${unit.requires}`, "error");
    }

    if (pay && domain.treasury < unit.costLO) return notify("Tesouro Real insuficiente.", "error");

    const newTreasury = pay ? domain.treasury - unit.costLO : domain.treasury;

    let updatedCashFlow = domain.cashFlow || [];
    if (pay && unit.costLO > 0) {
      const transaction = createTransaction('Saída', unit.costLO, `Recrutamento: ${unit.name}`);
      updatedCashFlow = [...updatedCashFlow, transaction];
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        treasury: newTreasury,
        units: [...d.units, { ...unit, id: crypto.randomUUID() }],
        cashFlow: updatedCashFlow,
        actionsRemaining: pay ? currentActions - 1 : currentActions
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Unidade recrutada em ${domain.name}: ${unit.name}`, pay ? -unit.costLO * 1000 : 0, 'system')
    });
    notify("Unidade recrutada.");
  };

  const removeDomainUnit = (id: string, unitId: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    const u = domain.units.find(x => x.id === unitId);
    const unitName = u ? u.name : 'Desconhecida';

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        units: d.units.filter(u => u.id !== unitId)
      } : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Unidade militar dispensada em ${domain.name}: ${unitName}`, 0, 'system')
    });
    notify("Unidade dispensada.");
  };

  const getMaintenanceCost = (domain: Domain): number => {
    const courtMaint = COURT_DATA[domain.court].maintenance;
    const unitMaint = domain.units.reduce((sum, u) => sum + u.maintenance, 0);
    return courtMaint + unitMaint;
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

  const resolveCaravan = (id: string, taskId: string, profitLO: number) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return notify("Domínio não encontrado.", "error");

    const task = domain.pendingTasks?.find(t => t.id === taskId);
    if (!task) return notify("Tarefa de caravana não encontrada.", "error");

    // Extrair investimento original da descrição
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
      logValue = profitLO * 1000;
      notify(`Caravana resolvida: +${profitLO} LO adicionados ao tesouro.`);
    } else {
      transaction = createTransaction('Saída', 0, `Caravana Fracassada (Investimento de ${investLO} LO perdido)`);
      logMsg = `Caravana perdida em ${domain.name}: −${investLO} LO`;
      finalTreasuryChange = 0;
      logValue = -(investLO * 1000);
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

  const applyBattleOutcome = (
    id: string,
    lostLO: number,
    lostUnitIds: string[],
    lostBuildingIds: string[],
    loseLevel: boolean
  ): ActionResult => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return { success: false, message: "Domínio não encontrado." };

    const newLevel = loseLevel ? Math.max(1, domain.level - 1) : domain.level;
    const newTreasury = Math.max(0, domain.treasury - lostLO);
    const newUnits = domain.units.filter(u => !lostUnitIds.includes(u.id));
    const newBuildings = domain.buildings.filter(b => !lostBuildingIds.includes(b.id));
    const newFortification = computeFortification(newBuildings);
    const newMagicPower = domain.isMystic ? newLevel * newLevel : 0;

    let updatedCashFlow = domain.cashFlow || [];
    if (lostLO > 0) {
      const transaction = createTransaction('Saída', lostLO, "Perdas de Batalha");
      updatedCashFlow = [...updatedCashFlow, transaction];
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        level: newLevel,
        treasury: newTreasury,
        units: newUnits,
        buildings: newBuildings,
        fortification: newFortification,
        cashFlow: updatedCashFlow,
        magicPowerLevel: newMagicPower
      } : d),
      logs: internalAddLog(
        activeGuild,
        'Dominio',
        `Batalha em ${domain.name}: Perdas registradas (LO: -${lostLO}, Nível: ${loseLevel ? '-1' : '0'}, Unidades perdidas: ${lostUnitIds.length}, Construções destruídas: ${lostBuildingIds.length})`,
        -lostLO * 1000,
        'system'
      )
    });

    return {
      success: true,
      message: "Resultado da batalha aplicado com sucesso.",
      details: [
        `Novo Nível: ${newLevel}`,
        `Tesouro: ${newTreasury} LO`,
        `Unidades restantes: ${newUnits.length}`,
        `Construções restantes: ${newBuildings.length}`
      ]
    };
  };

  const executeDomainAction = (id: string, action: DomainActionType, phase: 'pay' | 'success', params?: { value?: number; diceResult?: number }): ActionResult => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return { success: false, message: "Domínio não encontrado." };

    const maxActions = getMaxActions(domain);
    const currentActions = domain.actionsRemaining !== undefined ? domain.actionsRemaining : maxActions;

    if (action !== 'convert') {
      if (phase === 'pay') {
        if (currentActions <= 0) {
          return { success: false, message: "Sem ações restantes no turno atual." };
        }
        if (domain.revolt && ['govern', 'festival', 'caravan', 'taxLow', 'taxMedium', 'taxHigh'].includes(action)) {
          return { success: false, message: "Não é possível realizar esta ação sob revolta." };
        }
      }
    }

    switch (action) {
      case 'govern': {
        const maxLevel = getDomainMaxLevel(domain);
        if (domain.level >= maxLevel) return { success: false, message: `Domínio já no nível máximo para ${domain.terrain}.` };

        const cost = domain.level * 20;
        if (domain.treasury < cost) return { success: false, message: `Tesouro insuficiente. Necessário: ${cost} LO.` };

        const newLevel = domain.level + 1;
        const buildingLimit = newLevel * 3;
        if (domain.buildings.length > buildingLimit) return { success: false, message: `Reduza as construções para no máximo ${buildingLimit}.` };

        if (phase === 'pay') {
          const transaction = createTransaction('Saída', cost, "Governar (Custo de Ação)");
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury - cost,
              cashFlow: [...(d.cashFlow || []), transaction],
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Tentativa de Governar em ${domain.name} (Custo: ${cost} LO pago)`, -cost * 1000, 'system')
          });
          return {
            success: true,
            message: `Ação Governar declarada. Custo de ${cost} LO pago do tesouro. Realize o teste de Nobreza CD ${20 + domain.level} externamente.`,
            details: [`Custo: ${cost} LO`, `CD do Teste: Nobreza CD ${20 + domain.level}`]
          };
        } else {
          let newPopularity = domain.popularity;
          if (!domain.isMystic) {
            const popIdx = POPULARITY_LEVELS.indexOf(domain.popularity as PopularityType);
            if (popIdx < POPULARITY_LEVELS.length - 1) newPopularity = POPULARITY_LEVELS[popIdx + 1];
          }
          const newMagicPower = domain.isMystic ? newLevel * newLevel : 0;

          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              level: newLevel,
              popularity: newPopularity,
              revolt: false,
              magicPowerLevel: newMagicPower
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Governar Sucesso: ${domain.name} subiu para nível ${newLevel}`, 0, 'system')
          });

          return {
            success: true,
            message: `${domain.name} agora é nível ${newLevel}! Popularidade: ${domain.popularity} → ${newPopularity}.`,
            details: [`Novo Nível: ${newLevel}`, `Popularidade: ${newPopularity}`]
          };
        }
      }

      case 'increaseCourt': {
        const courtOrder: string[] = ['Inexistente', 'Pobre', 'Comum', 'Rica'];
        const idx = courtOrder.indexOf(domain.court);
        if (idx >= courtOrder.length - 1) return { success: false, message: "Corte já no nível máximo (Rica)." };

        if (domain.treasury < 1) return { success: false, message: "Tesouro insuficiente. Necessário: 1 LO." };

        const newCourt = courtOrder[idx + 1] as Domain['court'];

        if (phase === 'pay') {
          const transaction = createTransaction('Saída', 1, "Aumentar Corte (Custo de Ação)");
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury - 1,
              cashFlow: [...(d.cashFlow || []), transaction],
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Aumentar Corte em ${domain.name} (Declarado): Custo 1 LO pago`, -1000, 'system')
          });
          return { success: true, message: `Ação de Corte declarada. Custo de 1 LO pago. Confirme se passou no teste ou se é uma decisão aceita.` };
        } else {
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { ...d, court: newCourt } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Corte de ${domain.name} Elevada: ${domain.court} → ${newCourt}`, 0, 'system')
          });
          return { success: true, message: `Corte elevada para ${newCourt}.`, details: [`Nova manutenção: ${COURT_DATA[newCourt as keyof typeof COURT_DATA].maintenance} LO/turno`] };
        }
      }

      case 'decreaseCourt': {
        const courtOrderDesc: string[] = ['Rica', 'Comum', 'Pobre', 'Inexistente'];
        const idx = courtOrderDesc.indexOf(domain.court);
        if (idx >= courtOrderDesc.length - 1 || domain.court === 'Inexistente') return { success: false, message: "Corte já no nível mínimo (Inexistente)." };

        const newCourt = courtOrderDesc[idx + 1] as Domain['court'];
        const maxAdvisors = newCourt === 'Rica' ? 3 : newCourt === 'Comum' ? 1 : 0;
        const newAdvisors = domain.advisors.slice(0, maxAdvisors);
        const removedAdvisors = domain.advisors.slice(maxAdvisors);
        
        const updatedNPCs = activeGuild.npcs.map(n => {
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

        triggerSave({
          ...activeGuild,
          domains: activeGuild.domains.map(d => d.id === id ? { ...d, court: newCourt, advisors: newAdvisors } : d),
          npcs: updatedNPCs,
          logs: internalAddLog(activeGuild, 'Dominio', `Diminuir Corte em ${domain.name}: ${domain.court} → ${newCourt}`, 0, 'system')
        });

        return { success: true, message: `Corte reduzida para ${newCourt}.${domain.advisors.length > maxAdvisors ? ' Conselheiros excedentes perdidos.' : ''}` };
      }

      case 'festival': {
        if (domain.isMystic) return { success: false, message: "Domínios Místicos não possuem população para festivais." };
        if (domain.treasury < 1) return { success: false, message: "Tesouro insuficiente. Necessário: 1 LO." };

        let newPopularityF = domain.popularity;
        if (!domain.isMystic) {
          const popIdxF = POPULARITY_LEVELS.indexOf(domain.popularity as PopularityType);
          newPopularityF = popIdxF < POPULARITY_LEVELS.length - 1 ? POPULARITY_LEVELS[popIdxF + 1] : domain.popularity;
        }

        if (phase === 'pay') {
          const transaction = createTransaction('Saída', 1, "Realizar Festival (Custo de Ação)");
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury - 1,
              cashFlow: [...(d.cashFlow || []), transaction],
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Festival em ${domain.name} (Declarado): Custo 1 LO pago`, -1000, 'system')
          });
          return { success: true, message: `Festival declarado. Custo de 1 LO pago. Realize o teste de Diplomacia/Atuação CD 20.` };
        } else {
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? { ...d, popularity: newPopularityF, revolt: false } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Festival Realizado em ${domain.name}: Popularidade ${domain.popularity} → ${newPopularityF}`, 0, 'system')
          });
          return { success: true, message: `Festival realizado! Popularidade: ${domain.popularity} → ${newPopularityF}` };
        }
      }

      case 'extort': {
        if (domain.isMystic) return { success: false, message: "Domínios Místicos não podem ser extorquidos." };

        if (phase === 'pay') {
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Ação Extorquir declarada em ${domain.name}`, 0, 'system')
          });
          return { success: true, message: `Ação Extorquir declarada. Realize o teste de Nobreza/Intimidação CD 20.` };
        } else {
          const value = params?.diceResult ?? 1;
          const total = value + domain.level;

          let newPopularityE = domain.popularity;
          let revolt = false;
          if (!domain.isMystic) {
            const popIdxE = POPULARITY_LEVELS.indexOf(domain.popularity as PopularityType);
            newPopularityE = popIdxE > 0 ? POPULARITY_LEVELS[popIdxE - 1] : domain.popularity;
            revolt = newPopularityE === 'Odiado' && popIdxE === 0;
          }

          const transaction = createTransaction('Entrada', total, "Extorsão (Sucesso Ação)");

          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury + total,
              popularity: newPopularityE,
              revolt,
              cashFlow: [...(d.cashFlow || []), transaction]
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Extorquir Sucesso em ${domain.name}: +${total} LO, Popularidade ${domain.popularity} → ${newPopularityE}`, total * 1000, 'system')
          });

          return { success: true, message: `Extorção rendeu ${total} LO. Popularidade: ${domain.popularity} → ${newPopularityE}${revolt ? ' — REVOLTA!' : ''}`, details: [`+${total} LO no tesouro`] };
        }
      }

      case 'conscript': {
        if (domain.isMystic) return { success: false, message: "Domínios Místicos não possuem população para convocar." };
        if (domain.units.length >= domain.level) {
          return { success: false, message: `Limite máximo de unidades militares atingido (${domain.level}).` };
        }
        if (domain.treasury < 1) return { success: false, message: "Tesouro insuficiente. Necessário: 1 LO." };

        if (phase === 'pay') {
          const transaction = createTransaction('Saída', 1, "Convocar Camponeses (Custo de Ação)");
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury - 1,
              cashFlow: [...(d.cashFlow || []), transaction],
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Convocar em ${domain.name} (Declarado): Custo 1 LO pago`, -1000, 'system')
          });
          return { success: true, message: `Ação de Convocação declarada. Custo de 1 LO pago. Realize o teste de Nobreza/Guerra CD 20.` };
        } else {
          if (domain.units.length >= domain.level) {
            return { success: false, message: `Limite máximo de unidades militares atingido (${domain.level}).` };
          }
          let newPopularityC = domain.popularity;
          let revoltC = false;
          
          if (!domain.isMystic) {
            const popIdxC = POPULARITY_LEVELS.indexOf(domain.popularity as PopularityType);
            newPopularityC = popIdxC > 0 ? POPULARITY_LEVELS[popIdxC - 1] : domain.popularity;
            revoltC = newPopularityC === 'Odiado' && popIdxC === 0;
          }

          const newUnit: DomainUnit = {
            id: crypto.randomUUID(), name: 'Camponeses', type: 'Levante',
            power: 0.5, costLO: 0, maintenance: 0, defense: 10, damage: '1d6', speed: 9, requires: ''
          };

          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              popularity: newPopularityC,
              units: [...d.units, newUnit],
              revolt: revoltC
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Convocar Camponeses em ${domain.name}: +1 unidade, Popularidade ${domain.popularity} → ${newPopularityC}`, 0, 'system')
          });

          return { success: true, message: `Camponeses convocados! Popularidade: ${domain.popularity} → ${newPopularityC}${revoltC ? ' — REVOLTA!' : ''}`, details: ['+1 unidade Camponeses'] };
        }
      }

      case 'taxLow': {
        if (domain.isMystic) return { success: false, message: "Domínios Místicos não cobram impostos." };

        if (phase === 'pay') {
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Impostos Baixos declarados em ${domain.name}`, 0, 'system')
          });
          return { success: true, message: `Impostos Baixos declarados. Realize o teste de Nobreza CD 20.` };
        } else {
          const diceVal = params?.diceResult ?? 1;
          const income = diceVal;

          let newPopularityT = domain.popularity;
          if (!domain.isMystic) {
            const popIdxT = POPULARITY_LEVELS.indexOf(domain.popularity as PopularityType);
            newPopularityT = popIdxT < POPULARITY_LEVELS.length - 1 ? POPULARITY_LEVELS[popIdxT + 1] : domain.popularity;
          }

          const transaction = createTransaction('Entrada', income, "Impostos Baixos");

          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury + income,
              popularity: newPopularityT,
              revolt: false,
              cashFlow: [...(d.cashFlow || []), transaction]
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Impostos Baixos em ${domain.name}: +${income} LO, Popularidade ${domain.popularity} → ${newPopularityT}`, income * 1000, 'system')
          });

          return { success: true, message: `Impostos Baixos: +${income} LO. Popularidade: ${domain.popularity} → ${newPopularityT}` };
        }
      }

      case 'taxMedium': {
        if (domain.isMystic) return { success: false, message: "Domínios Místicos não cobram impostos." };

        if (phase === 'pay') {
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Impostos Médios declarados em ${domain.name}`, 0, 'system')
          });
          return { success: true, message: `Impostos Médios declarados. Realize o teste de Nobreza CD 20.` };
        } else {
          const diceValM = params?.diceResult ?? 1;
          const incomeM = diceValM;

          const transaction = createTransaction('Entrada', incomeM, "Impostos Médios");

          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury + incomeM,
              cashFlow: [...(d.cashFlow || []), transaction]
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Impostos Médios em ${domain.name}: +${incomeM} LO`, incomeM * 1000, 'system')
          });

          return { success: true, message: `Impostos Médios: +${incomeM} LO.` };
        }
      }

      case 'taxHigh': {
        if (domain.isMystic) return { success: false, message: "Domínios Místicos não cobram impostos." };

        if (phase === 'pay') {
          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              actionsRemaining: currentActions - 1
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Impostos Altos declarados em ${domain.name}`, 0, 'system')
          });
          return { success: true, message: `Impostos Altos declarados. Realize o teste de Nobreza CD 20.` };
        } else {
          const diceValH = params?.diceResult ?? 1;
          const incomeH = diceValH;

          let newPopularityH = domain.popularity;
          let revoltH = false;
          
          if (!domain.isMystic) {
            const popIdxH = POPULARITY_LEVELS.indexOf(domain.popularity as PopularityType);
            newPopularityH = popIdxH > 0 ? POPULARITY_LEVELS[popIdxH - 1] : domain.popularity;
            revoltH = newPopularityH === 'Odiado' && popIdxH === 0;
          }

          const tollBonus = domain.buildings.some(b => b.name === 'Posto de Pedágio') ? domain.level : 0;
          const totalIncome = incomeH + tollBonus;

          const transaction = createTransaction('Entrada', totalIncome, "Impostos Altos");

          triggerSave({
            ...activeGuild,
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury + totalIncome,
              popularity: newPopularityH,
              revolt: revoltH,
              cashFlow: [...(d.cashFlow || []), transaction]
            } : d),
            logs: internalAddLog(activeGuild, 'Dominio', `Impostos Altos em ${domain.name}: +${totalIncome} LO, Popularidade ${domain.popularity} → ${newPopularityH}`, totalIncome * 1000, 'system')
          });

          return { success: true, message: `Impostos Altos: +${totalIncome} LO. Popularidade: ${domain.popularity} → ${newPopularityH}${revoltH ? ' — REVOLTA!' : ''}` };
        }
      }

      case 'convert': {
        const result = params?.value ?? 0;
        if (result === 0) return { success: false, message: "Informe o valor em LO para converter." };

        if (result > 0) {
          const costTS = result * 1000;
          if (activeGuild.wallet.TS < costTS) return { success: false, message: `Fundos insuficientes (T$ ${costTS}).` };
          
          const transaction = createTransaction('Entrada', result, "Conversão T$ -> LO (Cofre da Guilda)");

          triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - costTS },
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury + result,
              cashFlow: [...(d.cashFlow || []), transaction]
            } : d),
            logs: internalAddLog(activeGuild, 'Conversao', `T$ → LO em ${domain.name}: +${result} LO no domínio`, -costTS, 'system')
          });
          return { success: true, message: `${result} LO adicionados ao tesouro (T$ ${costTS} gastos).` };
        } else {
          const absVal = Math.abs(result);
          if (domain.treasury < absVal) return { success: false, message: "Tesouro insuficiente." };

          const transaction = createTransaction('Saída', absVal, "Conversão LO -> T$ (Cofre da Guilda)");

          triggerSave({
            ...activeGuild,
            wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + absVal * 1000 },
            domains: activeGuild.domains.map(d => d.id === id ? {
              ...d,
              treasury: d.treasury - absVal,
              cashFlow: [...(d.cashFlow || []), transaction]
            } : d),
            logs: internalAddLog(activeGuild, 'Conversao', `LO → T$ de ${domain.name}: -${absVal} LO do domínio`, absVal * 1000, 'system')
          });
          return { success: true, message: `${absVal} LO convertidos em T$ ${absVal * 1000} para o cofre da guilda.` };
        }
      }

      case 'caravan': {
        const investLO = params?.value ?? 0;
        const numDice = params?.diceResult ?? 1;
        if (domain.isMystic) {
          return { success: false, message: "Ação Inválida: Domínios Místicos não realizam caravanas." };
        }
        if (!domain.buildings.some(b => b.name === 'Caravançará')) {
          return { success: false, message: "Ação Inválida: O domínio não possui um Caravançará construído." };
        }
        if (investLO <= 0) return { success: false, message: "Informe o valor investido da caravana (LO)." };
        if (domain.treasury < investLO) return { success: false, message: `Tesouro insuficiente. Necessário: ${investLO} LO.` };

        const cd = 20 + numDice;
        const transaction = createTransaction('Saída', investLO, "Envio de Caravana");

        triggerSave({
          ...activeGuild,
          domains: activeGuild.domains.map(d => d.id === id ? {
            ...d,
            treasury: d.treasury - investLO,
            cashFlow: [...(d.cashFlow || []), transaction],
            actionsRemaining: currentActions - 1,
            pendingTasks: [...(d.pendingTasks || []), {
              id: crypto.randomUUID(),
              name: `Caravana (${numDice}d4 LO)`,
              description: `Retorno pendente. CD Nobreza: ${cd}. Investimento: ${investLO} LO. Dados: ${numDice}.`,
              status: 'Pendente',
              progress: 0,
              history: [{ date: new Date().toISOString(), details: 'Caravana despachada' }]
            }]
          } : d),
          logs: internalAddLog(activeGuild, 'Dominio', `Caravana enviada de ${domain.name}: investido ${investLO} LO (${numDice}d4)`, -investLO * 1000, 'system')
        });

        return {
          success: true,
          message: `Caravana enviada com sucesso! Custo de ${investLO} LO pago.`,
          details: [`Investido: ${investLO} LO`, `Quantidade de dados: ${numDice}d4`, `CD do Teste (Próximo Turno): Nobreza CD ${cd}`]
        };
      }

      default:
        return { success: false, message: "Ação desconhecida." };
    }
  };

  const payMaintenance = (id: string): ActionResult => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return { success: false, message: "Domínio não encontrado." };

    const cost = getMaintenanceCost(domain);
    const passiveIncome = domain.isMystic ? domain.level : 0;

    if (domain.treasury < cost) {
      let newCourt = domain.court;
      if (cost > 0) {
        const courtOrder: string[] = ['Inexistente', 'Pobre', 'Comum', 'Rica'];
        const idx = courtOrder.indexOf(domain.court);
        newCourt = idx > 0 ? courtOrder[idx - 1] as CourtType : 'Inexistente';
      }

      const unitsKept = [] as DomainUnit[]; // Perde todas as tropas (manutenção não paga)
      const maxAdvisors = newCourt === 'Rica' ? 3 : newCourt === 'Comum' ? 1 : 0;
      const advisorsKept = domain.advisors.slice(0, maxAdvisors);
      const removedAdvisors = domain.advisors.slice(maxAdvisors);

      const updatedNPCs = activeGuild.npcs.map(n => {
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

      const actualDeducted = Math.min(domain.treasury, cost);
      let updatedCashFlow = domain.cashFlow || [];
      if (actualDeducted > 0) {
        const transaction = createTransaction('Saída', actualDeducted, "Manutenção Parcial (Tesouro Insuficiente)");
        updatedCashFlow = [...updatedCashFlow, transaction];
      }

      triggerSave({
        ...activeGuild,
        domains: activeGuild.domains.map(d => d.id === id ? {
          ...d,
          court: newCourt,
          units: unitsKept,
          advisors: advisorsKept,
          treasury: Math.max(0, d.treasury - cost),
          cashFlow: updatedCashFlow,
          tempCaosPenalty: true
        } : d),
        npcs: updatedNPCs,
        logs: internalAddLog(activeGuild, 'Dominio', `Manutenção de ${domain.name}: Tesouro insuficiente. Corte caiu para ${newCourt}. Caos instalado (-5 em ações). Tropas perdidas.`, -cost * 1000, 'system')
      });

      return { success: false, message: `Manutenção de ${cost} LO não paga. Corte: ${domain.court} → ${newCourt}. Tropas perdidas!` };
    }

    const netChange = passiveIncome - cost;
    const newTreasury = Math.max(0, domain.treasury + netChange);
    let updatedCashFlow = domain.cashFlow || [];

    if (cost > 0) {
      updatedCashFlow = [...updatedCashFlow, createTransaction('Saída', cost, "Manutenção do Turno")];
    }
    if (passiveIncome > 0) {
      updatedCashFlow = [...updatedCashFlow, createTransaction('Entrada', passiveIncome, "Rendimento Místico Passivo")];
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? {
        ...d,
        treasury: newTreasury,
        cashFlow: updatedCashFlow
      } : d),
      logs: internalAddLog(
        activeGuild,
        'Dominio',
        `Manutenção paga em ${domain.name}: ${cost} LO.${passiveIncome > 0 ? ` Rendimento Místico de +${passiveIncome} LO coletado.` : ''}`,
        netChange * 1000,
        'system'
      )
    });

    return { success: true, message: `Manutenção de ${cost} LO paga.${passiveIncome > 0 ? ` Rendimento Místico de +${passiveIncome} LO recebido.` : ''}` };
  };

  // Legacy stub — kept for backward compatibility with log calls
  const applyEvent = (id: string, eventName: string, effect: string): ActionResult => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return { success: false, message: "Domínio não encontrado." };
    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? d : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Evento: ${eventName} — ${effect}`, 0, 'system')
    });
    return { success: true, message: `Evento "${eventName}" registrado.`, details: [effect] };
  };

  const applyRandomEvent = (
    id: string,
    event: { name: string; description: string; impact: string; effect: string; range: number[] },
    boonChoice?: 'lo' | 'popularity' | 'modifier',
    invasionRoll?: number,
    penaltyValue?: number,
    loAmount?: number
  ): ActionResult => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return { success: false, message: "Domínio não encontrado." };

    let updatedDomain = { ...domain };
    const details: string[] = [];
    let logValue = 0;

    const name = event.name.trim();

    if (name === 'Ataque de Dragão') {
      const newLevel = Math.max(1, updatedDomain.level - 1);
      updatedDomain.level = newLevel;
      if (updatedDomain.isMystic) {
        updatedDomain.magicPowerLevel = newLevel * newLevel;
      }
      details.push(`Nível do domínio reduzido para ${newLevel}.`);

      if (updatedDomain.buildings.length > 0) {
        const bIdx = Math.floor(Math.random() * updatedDomain.buildings.length);
        const destroyed = updatedDomain.buildings[bIdx];
        updatedDomain.buildings = updatedDomain.buildings.filter((_, i) => i !== bIdx);
        updatedDomain.fortification = computeFortification(updatedDomain.buildings);
        details.push(`Construção destruída: "${destroyed.name}".`);
      } else {
        details.push("Nenhuma construção para destruir.");
      }

      const dice = Math.floor(Math.random() * 6) + 1;
      let lostCount = 0;
      const newUnits = [...updatedDomain.units];
      for (let i = 0; i < dice; i++) {
        if (newUnits.length > 0) {
          const uIdx = Math.floor(Math.random() * newUnits.length);
          newUnits.splice(uIdx, 1);
          lostCount++;
        }
      }
      updatedDomain.units = newUnits;
      details.push(`Perda de ${lostCount} unidades militares (rolagem de 1d6: ${dice}).`);

    } else if (name === 'Invasores' || name === 'Saqueadores') {
      const isSaqueador = name === 'Saqueadores';
      const rollDice = invasionRoll ?? (isSaqueador ? Math.floor(Math.random() * 8) + 1 : Math.floor(Math.random() * 12) + 1);
      const enemyPower = rollDice * domain.level;
      
      const gd1 = Math.floor(Math.random() * (isSaqueador ? 4 : 6)) + 1;
      const gd2 = Math.floor(Math.random() * (isSaqueador ? 4 : 6)) + 1;
      const leaderGuerra = gd1 + gd2 + 10;

      const taskName = `⚔️ Batalha: ${name}`;
      const taskDesc = `Poder do Inimigo: ${enemyPower} (${rollDice} × Nível ${domain.level}). Líder inimigo Guerra +${leaderGuerra} (rolagem: ${gd1}+${gd2}+10). Abra o Assistente de Batalha para resolver.`;

      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Evento "${name}" deflagrou ataque com poder inimigo ${enemyPower}.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push(`Ataque de ${name} registrado nas pendências (Poder Inimigo: ${enemyPower}).`);

    } else if (name === 'Monstro') {
      const taskName = `👾 Ameaça: Monstro`;
      const taskDesc = `Um monstro está assolando o domínio. Exige gastar uma ação de domínio e passar em um teste de Sobrevivência CD ${25 + 2 * domain.level}. Caso falhe ou ignore, perderá 1 popularidade e 1 construção aleatória no fim do turno.`;
      
      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Ameaça de monstro iniciada.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push("Monstro à solta! Ameaça registrada nas pendências.");

    } else if (name === 'Peste') {
      if (!updatedDomain.isMystic) {
        const idx = POPULARITY_LEVELS.indexOf(updatedDomain.popularity as PopularityType);
        const newIdx = Math.max(0, idx - 1);
        updatedDomain.popularity = POPULARITY_LEVELS[newIdx];
        details.push(`Popularidade reduzida: ${domain.popularity} → ${POPULARITY_LEVELS[newIdx]}.`);
        if (POPULARITY_LEVELS[newIdx] === 'Odiado') {
          updatedDomain.revolt = true;
          details.push("⚠️ REVOLTA DEFLAGRADA!");
        }
      }
      
      const dice = (Math.floor(Math.random() * 3) + 1) + 1; // 1d3+1
      let lostCount = 0;
      const newUnits = [...updatedDomain.units];
      for (let i = 0; i < dice; i++) {
        if (newUnits.length > 0) {
          const uIdx = Math.floor(Math.random() * newUnits.length);
          newUnits.splice(uIdx, 1);
          lostCount++;
        }
      }
      updatedDomain.units = newUnits;
      details.push(`Perda de ${lostCount} unidades militares (rolagem de 1d3+1: ${dice}).`);

    } else if (name === 'Fenômeno Natural') {
      const roll = invasionRoll ?? Math.floor(Math.random() * 6) + 1;
      if (roll === 1) {
        if (updatedDomain.level > 1) {
          updatedDomain.level -= 1;
          if (updatedDomain.isMystic) {
            updatedDomain.magicPowerLevel = updatedDomain.level * updatedDomain.level;
          }
          details.push(`Desastre natural (Terremoto/Tornado)! Nível do domínio reduzido para ${updatedDomain.level}.`);
        } else {
          details.push("Desastre natural ocorreu, mas o nível do domínio já estava no mínimo.");
        }
      } else if (roll === 2 || roll === 3) {
        if (updatedDomain.buildings.length > 0) {
          const bIdx = Math.floor(Math.random() * updatedDomain.buildings.length);
          const destroyed = updatedDomain.buildings[bIdx];
          updatedDomain.buildings = updatedDomain.buildings.filter((_, i) => i !== bIdx);
          updatedDomain.fortification = computeFortification(updatedDomain.buildings);
          details.push(`Problema maior (Inundação/Incêndio) destruiu a construção: "${destroyed.name}".`);
        } else {
          details.push("Problema maior ocorreu, mas o domínio não possuía construções.");
        }
      } else {
        const diceLoss = Math.floor(Math.random() * 6) + 1;
        const actualLoss = Math.min(diceLoss, updatedDomain.treasury);
        const tx = createTransaction('Saída', actualLoss, "Fenômeno Natural (Problema Menor)");
        updatedDomain.treasury -= actualLoss;
        updatedDomain.cashFlow = [...(updatedDomain.cashFlow || []), tx];
        logValue = -actualLoss * 1000;
        details.push(`Problema menor (Nevasca/Seca) causou prejuízo de ${actualLoss} LO no tesouro (rolagem 1d6: ${diceLoss}).`);
      }

    } else if (name === 'Fenômeno Mágico') {
      const roll = invasionRoll ?? Math.floor(Math.random() * 6) + 1;
      if (roll === 1) {
        updatedDomain.actionsRemaining = 0;
        details.push("Mortos vagam pela terra! Não é possível realizar ações de domínio neste turno.");
      } else if (roll === 2 || roll === 3) {
        updatedDomain.tempCaosPenalty = true;
        details.push("Uma comitiva feérica trouxe o caos! Você sofre -5 de penalidade nas ações neste turno.");
      } else {
        updatedDomain.actionModifier = (updatedDomain.actionModifier || 0) - 2;
        details.push("Um bruxo amaldiçoou a terra! Você sofre -2 de penalidade nas ações neste turno.");
      }

    } else if (name === 'Questão Diplomática') {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const tribute = d1 + d2;
      const troops = Math.floor(Math.random() * 4) + 1;

      const taskName = `🌐 Questão Diplomática`;
      const taskDesc = `Um emissário exige: tributo de ${tribute} LO (dados: ${d1}+${d2}) OU empréstimo de ${troops} tropas por 2 turnos. Exige gastar uma ação de domínio e passar em Diplomacia CD ${25 + 2 * domain.level}. Caso falhe ou ignore, o reino vizinho atacará no próximo turno (Invasores)!`;

      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Demanda diplomática declarada.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push("Questão diplomática registrada nas pendências.");

    } else if (name === 'Levante') {
      if (!updatedDomain.isMystic) {
        const idx = POPULARITY_LEVELS.indexOf(updatedDomain.popularity as PopularityType);
        const newIdx = Math.max(0, idx - 2);
        updatedDomain.popularity = POPULARITY_LEVELS[newIdx];
        details.push(`A população se revoltou! Popularidade reduzida em duas categorias: ${domain.popularity} → ${POPULARITY_LEVELS[newIdx]}.`);
        if (POPULARITY_LEVELS[newIdx] === 'Odiado') {
          updatedDomain.revolt = true;
          details.push("⚠️ REVOLTA DEFLAGRADA!");
        }
      } else {
        details.push("Levante ocorreu, mas o domínio místico não tem população.");
      }

    } else if (name === 'Intriga') {
      const taskName = `🎭 Intriga da Corte`;
      const taskDesc = `Documentos roubados ou chantagem na corte. Exige gastar uma ação de domínio e passar em Enganação CD ${25 + 2 * domain.level}. Se falhar ou ignorar, a corte e a popularidade diminuirão em uma categoria.`;

      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Intriga instalada na corte.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push("Intriga da corte registrada nas pendências.");

    } else if (name === 'Questão de Justiça') {
      const taskName = `⚖️ Questão de Justiça`;
      const taskDesc = `Uma disputa legal precisa ser julgada. Exige gastar uma ação de domínio e passar em Intuição ou Investigação CD ${25 + 2 * domain.level}. Se falhar ou ignorar, a popularidade diminuirá em duas categorias.`;

      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Questão legal apresentada.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push("Questão de justiça registrada nas pendências.");

    } else if (name === 'Bandidos') {
      const d1 = Math.floor(Math.random() * 4) + 1;
      const d2 = Math.floor(Math.random() * 4) + 1;
      const banditsPower = d1 + d2 + domain.level;
      const ld1 = Math.floor(Math.random() * 4) + 1;
      const ld2 = Math.floor(Math.random() * 4) + 1;
      const leaderGuerra = ld1 + ld2 + 5;

      const taskName = `🏴‍☠️ Ameaça: Bandidos`;
      const taskDesc = `Bandoleiros roubam o povo. Poder dos Bandidos: ${banditsPower} (rolagem: ${d1}+${d2} + Nível ${domain.level}), Líder Guerra: +${leaderGuerra} (${ld1}+${ld2}+5). A cada fim de turno, a popularidade cairá em uma categoria até eles serem atacados e derrotados via Batalha Simplificada.`;

      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Bandidos atacaram e estabeleceram acampamento.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push("Ameaça de bandidos registrada nas pendências.");

    } else if (name === 'Corrupção') {
      const taskName = `💰 Problema: Corrupção`;
      const taskDesc = `A corte está tomada por falcatruas. A cada fim de turno, o tesouro perderá 1d6 LO. Exige gastar uma ação de domínio e passar em Intuição ou Investigação CD ${25 + 2 * domain.level}. Se resolver, a corrupção acaba, mas a corte cairá de categoria devido às demissões.`;

      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Corrupção instalada.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push("Corrupção na corte registrada nas pendências.");

    } else if (name === 'Questão Comercial') {
      const taskName = `🤝 Questão Comercial`;
      const taskDesc = `Disputa entre guildas ou contrabandistas. Exige gastar uma ação de domínio e passar em Diplomacia CD ${25 + 2 * domain.level}. Se falhar ou ignorar, o tesouro perderá 2d6 LO neste turno.`;

      const newTask: DomainPendingTask = {
        id: crypto.randomUUID(),
        name: taskName,
        description: taskDesc,
        status: 'Pendente',
        progress: 0,
        history: [{ date: new Date().toISOString(), details: `Questão comercial iniciada.` }]
      };
      updatedDomain.pendingTasks = [...(updatedDomain.pendingTasks || []), newTask];
      details.push("Questão comercial registrada nas pendências.");

    } else if (name === 'Regalia') {
      const roll = invasionRoll ?? Math.floor(Math.random() * 6) + 1;
      if (roll === 1 || roll === 2) {
        const loGain = loAmount ?? Math.floor(Math.random() * 6) + 1;
        const tx = createTransaction('Entrada', loGain, `Regalia: Clima Bom`);
        updatedDomain.treasury += loGain;
        updatedDomain.cashFlow = [...(updatedDomain.cashFlow || []), tx];
        logValue = loGain * 1000;
        details.push(`Clima bom e colheitas fartas! Adicionado +${loGain} LO ao tesouro.`);
      } else if (roll === 3 || roll === 4) {
        updatedDomain.actionModifier = (updatedDomain.actionModifier || 0) + 2;
        details.push("Um conselheiro deu uma boa ideia! +2 nos testes de ação neste turno.");
      } else {
        if (!updatedDomain.isMystic) {
          const idx = POPULARITY_LEVELS.indexOf(updatedDomain.popularity as PopularityType);
          const newIdx = Math.min(POPULARITY_LEVELS.length - 1, idx + 1);
          updatedDomain.popularity = POPULARITY_LEVELS[newIdx];
          details.push(`Um festival ocorre! Popularidade aumentada: ${domain.popularity} → ${POPULARITY_LEVELS[newIdx]}.`);
          if (newIdx > 0 && updatedDomain.revolt) {
            updatedDomain.revolt = false;
            details.push("✅ A revolta terminou!");
          }
        } else {
          details.push("Um festival alegrou a torre (sem efeitos de moral).");
        }
      }

    } else {
      details.push("Nenhum efeito. O domínio continua estável.");
    }

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? updatedDomain : d),
      logs: internalAddLog(activeGuild, 'Dominio', `Evento: "${event.name}" — ${details.join(' ')}`, logValue, 'system')
    });

    notify(`Evento "${event.name}" aplicado.`, 'success');
    return { success: true, message: `Evento "${event.name}" aplicado com efeitos mecânicos!`, details };
  };

  const resolveRevolt = (id: string, testSuccess: boolean): ActionResult => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return { success: false, message: "Domínio não encontrado." };
    if (!domain.revolt) return { success: true, message: "Domínio não está em revolta." };

    if (testSuccess) {
      const newPopularity = domain.isMystic ? 'N/A' : 'Tolerado';
      triggerSave({
        ...activeGuild,
        domains: activeGuild.domains.map(d => d.id === id ? { ...d, revolt: false, popularity: newPopularity } : d),
        logs: internalAddLog(activeGuild, 'Dominio', `Revolta sufocada: a ordem foi restaurada e a popularidade retornou para ${newPopularity}`, 0, 'system')
      });
      return { success: true, message: "Revolta sufocada com sucesso! A ordem foi restaurada e a popularidade retornou para Tolerado." };
    } else {
      if (domain.buildings.length > 0) {
        const buildingsAfter = domain.buildings.slice(0, -1);
        const fortAfter = computeFortification(buildingsAfter);
        const destroyed = domain.buildings[domain.buildings.length - 1].name;

        triggerSave({
          ...activeGuild,
          domains: activeGuild.domains.map(d => d.id === id ? { ...d, buildings: buildingsAfter, fortification: fortAfter } : d),
          logs: internalAddLog(activeGuild, 'Dominio', `Falha ao sufocar revolta: a construção ${destroyed} foi destruída pelo povo em fúria.`, 0, 'system')
        });

        return { success: false, message: `Falha ao sufocar a revolta! A revolta continua e a construção "${destroyed}" foi totalmente destruída pela turba enfurecida.` };
      } else {
        const die1 = Math.floor(Math.random() * 4) + 1;
        const die2 = Math.floor(Math.random() * 4) + 1;
        const lostLO = die1 + die2;
        const actualLost = Math.min(domain.treasury, lostLO);
        const newTreasury = Math.max(0, domain.treasury - lostLO);

        const transaction = createTransaction('Saída', actualLost, "Saque de Revolta (Falha ao Sufocar)");

        triggerSave({
          ...activeGuild,
          domains: activeGuild.domains.map(d => d.id === id ? {
            ...d,
            treasury: newTreasury,
            cashFlow: [...(d.cashFlow || []), transaction]
          } : d),
          logs: internalAddLog(activeGuild, 'Dominio', `Falha ao sufocar revolta: tesouro real saqueado em ${actualLost} LO (dados: ${die1}+${die2}).`, -actualLost * 1000, 'system')
        });

        return { success: false, message: `Falha ao sufocar a revolta! Como não havia construções, a população invadiu os cofres reais e saqueou ${actualLost} LO (rolagem de 2d4: ${die1} + ${die2} = ${lostLO}).` };
      }
    }
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
          
          // Check for Corrupção resolution aftermath
          if (data.status === 'Concluido' && t.name.includes('Corrupção')) {
            const courtOrderDesc: CourtType[] = ['Rica', 'Comum', 'Pobre', 'Inexistente'];
            const idx = courtOrderDesc.indexOf(d.court);
            if (idx < courtOrderDesc.length - 1 && d.court !== 'Inexistente') {
              updatedCourt = courtOrderDesc[idx + 1];
              const maxAdvisors = updatedCourt === 'Rica' ? 3 : updatedCourt === 'Comum' ? 1 : 0;
              const removedAdvisors = d.advisors.slice(maxAdvisors);
              updatedAdvisors = d.advisors.slice(0, maxAdvisors);
              
              // Update NPCs
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
              
              // Add a local log for court category degradation
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

  const processEndOfTurn = (
    domain: Domain,
    currentNPCs: import('../../types').NPC[],
    currentGuildState: GuildState
  ) => {
    let updatedDomain = { ...domain };
    let tempNPCs = [...currentNPCs];
    let addedLogs: LogEntry[] = [];

    // Helper to add logs to the local accumulator
    const addLocalLog = (category: LogCategory, details: string, value: number) => {
      const tempState = { ...currentGuildState, logs: [...currentGuildState.logs, ...addedLogs] };
      const log = internalAddLog(tempState, category, details, value, 'system');
      addedLogs = [...addedLogs, ...log];
    };

    // 1. Process Revolt
    if (updatedDomain.revolt) {
      if (updatedDomain.buildings.length > 0) {
        const bIdx = Math.floor(Math.random() * updatedDomain.buildings.length);
        const destroyed = updatedDomain.buildings[bIdx];
        updatedDomain.buildings = updatedDomain.buildings.filter((_, i) => i !== bIdx);
        updatedDomain.fortification = computeFortification(updatedDomain.buildings);
        
        addLocalLog(
          'Dominio',
          `Revolta em ${domain.name}: A fúria popular destruiu a construção "${destroyed.name}".`,
          0
        );
      } else {
        const d1 = Math.floor(Math.random() * 4) + 1;
        const d2 = Math.floor(Math.random() * 4) + 1;
        const loss = d1 + d2;
        const actualLoss = Math.min(updatedDomain.treasury, loss);
        
        updatedDomain.treasury = Math.max(0, updatedDomain.treasury - loss);
        if (actualLoss > 0) {
          const transaction = createTransaction('Saída', actualLoss, "Saque da Turba Revoltoza");
          updatedDomain.cashFlow = [...(updatedDomain.cashFlow || []), transaction];
        }
        
        addLocalLog(
          'Dominio',
          `Revolta em ${domain.name}: Sem construções para destruir, a turba saqueou os cofres reais em ${actualLoss} LO (dados: ${d1}+${d2}).`,
          -actualLoss * 1000
        );
      }
    }

    // 2. Process Pending Threats
    if (updatedDomain.pendingTasks && updatedDomain.pendingTasks.length > 0) {
      const remainingTasks: DomainPendingTask[] = [];

      for (const task of updatedDomain.pendingTasks) {
        if (task.status === 'Concluido') {
          // Completed tasks are preserved
          remainingTasks.push(task);
          continue;
        }

        const name = task.name;
        // Bandidos: reduces popularity by 1 category per turn
        if (name.includes('Bandidos')) {
          if (!updatedDomain.isMystic) {
            const popIdx = POPULARITY_LEVELS.indexOf(updatedDomain.popularity as PopularityType);
            if (popIdx > 0) {
              const newPop = POPULARITY_LEVELS[popIdx - 1];
              updatedDomain.popularity = newPop;
              if (newPop === 'Odiado') {
                updatedDomain.revolt = true;
              }
              addLocalLog(
                'Dominio',
                `Ameaça Bandidos em ${domain.name}: Popularidade reduzida para ${newPop} por saques contínuos.`,
                0
              );
            } else {
              addLocalLog(
                'Dominio',
                `Ameaça Bandidos em ${domain.name}: Povo continua revoltado e sofrendo saques.`,
                0
              );
            }
          }
          remainingTasks.push(task); // Continues to next turn
        }
        // Corrupção: loses 1d6 LO per turn
        else if (name.includes('Corrupção')) {
          const roll = Math.floor(Math.random() * 6) + 1;
          const actualLoss = Math.min(updatedDomain.treasury, roll);
          updatedDomain.treasury = Math.max(0, updatedDomain.treasury - roll);
          if (actualLoss > 0) {
            const transaction = createTransaction('Saída', actualLoss, "Dreno de Corrupção na Corte");
            updatedDomain.cashFlow = [...(updatedDomain.cashFlow || []), transaction];
          }
          addLocalLog(
            'Dominio',
            `Corrupção em ${domain.name}: Desvio de ${actualLoss} LO detectado nos cofres reais (dado: 1d6 = ${roll}).`,
            -actualLoss * 1000
          );
          remainingTasks.push(task); // Continues to next turn
        }
        // Monstro: 1 popularity and 1 random building destroyed, then remove task
        else if (name.includes('Monstro')) {
          if (!updatedDomain.isMystic) {
            const popIdx = POPULARITY_LEVELS.indexOf(updatedDomain.popularity as PopularityType);
            if (popIdx > 0) {
              const newPop = POPULARITY_LEVELS[popIdx - 1];
              updatedDomain.popularity = newPop;
              if (newPop === 'Odiado') updatedDomain.revolt = true;
            }
          }
          let buildDesc = "";
          if (updatedDomain.buildings.length > 0) {
            const bIdx = Math.floor(Math.random() * updatedDomain.buildings.length);
            const destroyed = updatedDomain.buildings[bIdx];
            updatedDomain.buildings = updatedDomain.buildings.filter((_, i) => i !== bIdx);
            updatedDomain.fortification = computeFortification(updatedDomain.buildings);
            buildDesc = ` A construção "${destroyed.name}" foi destruída.`;
          }
          addLocalLog(
            'Dominio',
            `Ameaça Monstro em ${domain.name}: Ameaça não resolvida! Popularidade reduzida.${buildDesc}`,
            0
          );
          // Removed from pending tasks
        }
        // Intriga: court and popularity decrease by 1 category, then remove task
        else if (name.includes('Intriga')) {
          if (!updatedDomain.isMystic) {
            const popIdx = POPULARITY_LEVELS.indexOf(updatedDomain.popularity as PopularityType);
            if (popIdx > 0) {
              const newPop = POPULARITY_LEVELS[popIdx - 1];
              updatedDomain.popularity = newPop;
              if (newPop === 'Odiado') updatedDomain.revolt = true;
            }
          }
          const courtOrderDesc: CourtType[] = ['Rica', 'Comum', 'Pobre', 'Inexistente'];
          const cIdx = courtOrderDesc.indexOf(updatedDomain.court);
          let courtDesc = "";
          if (cIdx < courtOrderDesc.length - 1 && updatedDomain.court !== 'Inexistente') {
            const newCourt = courtOrderDesc[cIdx + 1];
            const maxAdvisors = newCourt === 'Rica' ? 3 : newCourt === 'Comum' ? 1 : 0;
            const removedAdvisors = updatedDomain.advisors.slice(maxAdvisors);
            updatedDomain.advisors = updatedDomain.advisors.slice(0, maxAdvisors);
            updatedDomain.court = newCourt;
            courtDesc = ` Nível da corte rebaixado para ${newCourt}.`;

            // Update NPCs
            tempNPCs = tempNPCs.map(n => {
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
          }
          addLocalLog(
            'Dominio',
            `Intriga na Corte em ${domain.name}: Ameaça não resolvida! Popularidade reduzida.${courtDesc}`,
            0
          );
          // Removed from pending tasks
        }
        // Justiça: popularity decreases by 2 categories, then remove task
        else if (name.includes('Justiça')) {
          if (!updatedDomain.isMystic) {
            const popIdx = POPULARITY_LEVELS.indexOf(updatedDomain.popularity as PopularityType);
            const newIdx = Math.max(0, popIdx - 2);
            const newPop = POPULARITY_LEVELS[newIdx];
            updatedDomain.popularity = newPop;
            if (newPop === 'Odiado') updatedDomain.revolt = true;
            addLocalLog(
              'Dominio',
              `Questão de Justiça em ${domain.name}: Justiça ignorada! Popularidade reduzida para ${newPop}.`,
              0
            );
          }
          // Removed from pending tasks
        }
        // Comercial: loses 2d6 LO, then remove task
        else if (name.includes('Comercial')) {
          const d1 = Math.floor(Math.random() * 6) + 1;
          const d2 = Math.floor(Math.random() * 6) + 1;
          const loss = d1 + d2;
          const actualLoss = Math.min(updatedDomain.treasury, loss);
          updatedDomain.treasury = Math.max(0, updatedDomain.treasury - loss);
          if (actualLoss > 0) {
            const transaction = createTransaction('Saída', actualLoss, "Prejuízo de Questão Comercial");
            updatedDomain.cashFlow = [...(updatedDomain.cashFlow || []), transaction];
          }
          addLocalLog(
            'Dominio',
            `Questão Comercial em ${domain.name}: Prejuízo comercial de ${actualLoss} LO devido a conflito de guildas (dados: ${d1}+${d2}).`,
            -actualLoss * 1000
          );
          // Removed from pending tasks
        }
        // Diplomática: Kingdom attacks next turn (Invasores), then remove task
        else if (name.includes('Diplomática')) {
          const rollDice = Math.floor(Math.random() * 12) + 1;
          const enemyPower = rollDice * updatedDomain.level;
          const gd1 = Math.floor(Math.random() * 6) + 1;
          const gd2 = Math.floor(Math.random() * 6) + 1;
          const leaderGuerra = gd1 + gd2 + 10;

          const battleTask: DomainPendingTask = {
            id: crypto.randomUUID(),
            name: `⚔️ Batalha: Invasores (Fronteira)`,
            description: `Ataque do reino vizinho por insolvência diplomática. Poder Inimigo: ${enemyPower} (${rollDice} × Nível ${updatedDomain.level}). Líder inimigo Guerra +${leaderGuerra} (${gd1}+${gd2}+10). Abra o Assistente de Batalha para resolver.`,
            status: 'Pendente',
            progress: 0,
            history: [{ date: new Date().toISOString(), details: `Reino vizinho declarou guerra devido à Questão Diplomática ignorada.` }]
          };
          
          remainingTasks.push(battleTask);
          addLocalLog(
            'Dominio',
            `Questão Diplomática em ${domain.name}: Incidente diplomático resultou em ataque na fronteira! Poder Inimigo: ${enemyPower}.`,
            0
          );
          // Removed original Diplomática task
        }
        // If it's a caravan or other task, keep it
        else {
          remainingTasks.push(task);
        }
      }

      updatedDomain.pendingTasks = remainingTasks;
    }

    // 3. Reset turn-only states
    updatedDomain.actionModifier = 0; // Reset turn action modifier

    // 4. Sanitize to enforce invariants (Mystic constraints, Revolt cure/trigger)
    if (updatedDomain.isMystic) {
      updatedDomain.popularity = 'N/A';
      updatedDomain.revolt = false;
      updatedDomain.magicPowerLevel = updatedDomain.level * updatedDomain.level;
    } else {
      if (updatedDomain.popularity === 'Odiado') {
        updatedDomain.revolt = true;
      } else {
        updatedDomain.revolt = false;
      }
    }

    return { updatedDomain, updatedNPCs: tempNPCs, addedLogs };
  };

  const resetDomainTurn = (id: string) => {
    const domain = activeGuild.domains.find(d => d.id === id);
    if (!domain) return;

    // Apply end of turn effects to this domain
    const { updatedDomain, updatedNPCs, addedLogs } = processEndOfTurn(domain, activeGuild.npcs, activeGuild);

    const maxActions = getMaxActions(updatedDomain);
    const finalDomain = {
      ...updatedDomain,
      actionsRemaining: maxActions,
      tempCaosPenalty: false
    };

    triggerSave({
      ...activeGuild,
      domains: activeGuild.domains.map(d => d.id === id ? finalDomain : d),
      npcs: updatedNPCs,
      logs: [...activeGuild.logs, ...addedLogs, ...internalAddLog(
        { ...activeGuild, logs: [...activeGuild.logs, ...addedLogs] },
        'Dominio',
        `Turno reiniciado para o domínio ${domain.name}: ${maxActions} ações reestabelecidas`,
        0,
        'system'
      )]
    });
    notify(`Turno reiniciado: ${maxActions} ações disponíveis.`);
  };

  const resetAllDomainsTurns = () => {
    if (activeGuild.domains.length === 0) {
      return notify("Nenhum domínio registrado para reiniciar.", "error");
    }

    let currentNPCs = activeGuild.npcs;
    let currentLogs = [...activeGuild.logs];
    
    const updatedDomains = activeGuild.domains.map(d => {
      // 1. Process end of turn effects
      const { updatedDomain, updatedNPCs, addedLogs } = processEndOfTurn(d, currentNPCs, { ...activeGuild, logs: currentLogs });
      currentNPCs = updatedNPCs;
      currentLogs = [...currentLogs, ...addedLogs];

      // 2. Reset actions
      const maxActions = getMaxActions(updatedDomain);
      
      const resetLog = internalAddLog(
        { ...activeGuild, logs: currentLogs },
        'Dominio',
        `Turno reiniciado para o domínio ${updatedDomain.name}: ${maxActions} ações reestabelecidas`,
        0,
        'system'
      );
      currentLogs = [...currentLogs, ...resetLog];

      return {
        ...updatedDomain,
        actionsRemaining: maxActions,
        tempCaosPenalty: false
      };
    });

    triggerSave({
      ...activeGuild,
      domains: updatedDomains,
      npcs: currentNPCs,
      logs: currentLogs
    });

    notify("Turno de todos os domínios reiniciado com sucesso!");
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
