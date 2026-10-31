import { GuildState, Domain, DomainUnit, ActionResult, LogCategory, LogEntry } from '../../../types';

export interface DomainMilitaryDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
  createTransaction: (type: 'Entrada' | 'Saída', amount: number, reason: string) => import('../../../types').DomainTransaction;
  getMaxActions: (domain: Domain) => number;
  computeFortification: (buildings: import('../../../types').DomainBuilding[]) => number;
}

export const createDomainMilitaryHandlers = (deps: DomainMilitaryDeps) => {
  const {
    activeGuild,
    triggerSave,
    notify,
    internalAddLog,
    createTransaction,
    getMaxActions,
    computeFortification
  } = deps;

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
      logs: internalAddLog(activeGuild, 'Dominio', `Unidade recrutada em ${domain.name}: ${unit.name}`, 0, 'system')
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
        0,
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

  return { addDomainUnit, removeDomainUnit, applyBattleOutcome };
};
