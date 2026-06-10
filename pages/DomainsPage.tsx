import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { LandPlot, Castle, Shield, Crown, Building2, Coins, Plus, Trash2, X, Zap, Gavel, Map as MapIcon, Settings, UserCircle, Swords, TrendingUp, TrendingDown, Dices, ArrowLeftRight, Heart, AlertTriangle, Users, ShoppingCart, Scale, Hand, Sparkles, RotateCcw, Scroll } from 'lucide-react';
import { POPULARITY_LEVELS, TERRAIN_TYPES, COURT_DATA, CRISIS_EVENTS, DOMAIN_BUILDINGS_CATALOG, DOMAIN_UNITS_CATALOG, RANDOM_EVENTS_TABLE, TAX_TABLE, TERRAIN_MAX_LEVEL, POPULARITY_MODIFIERS } from '../constants';
import { PopularityType, CourtType, DomainActionType, ActionResult, DomainUnit, DomainBuilding, TaskStatus, AdvisorRole } from '../types';

const DomainsPage: React.FC = () => {
  const { 
    domains, createDomain, updateDomain, investDomain, wallet,
    withdrawDomain, manageDomainTreasury, demolishDomain, levelUpDomain,
    addDomainBuilding, removeDomainBuilding, addDomainUnit, removeDomainUnit, notify,
    executeDomainAction, payMaintenance, getMaintenanceCost, applyEvent, applyRandomEvent, resolveRevolt,
    applyBattleOutcome, resolveCaravan, withdraw,
    addPendingTask, updatePendingTask, removePendingTask, addAdvisor, removeAdvisor, updateAdvisor,
    resetDomainTurn, resetAllDomainsTurns, members, npcs,
    getDomainMaxLevel, getDomainMagicPotential
  } = useGuild();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [newRegent, setNewRegent] = useState('');
  const [newTerrain, setNewTerrain] = useState(TERRAIN_TYPES[0]);
  const [newIsMystic, setNewIsMystic] = useState(false);
  const [newRevolt, setNewRevolt] = useState(false);
  const [newHasWaterAccess, setNewHasWaterAccess] = useState(false);
  const [newHasMysticElement, setNewHasMysticElement] = useState(false);
  const [newIsNatureBoundRace, setNewIsNatureBoundRace] = useState(false);
  const [newIsSubterraneanBoundRace, setNewIsSubterraneanBoundRace] = useState(false);
  const [newCoexistingDomainId, setNewCoexistingDomainId] = useState('');
  const [creationMethod, setCreationMethod] = useState<'create' | 'conquer'>('create');

  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'finance' | 'unit' | 'building' | 'govern' | 'crisis' | 'stats' | 'levelup' | 'action' | 'event' | 'tax' | 'convert' | 'advisors' | 'losses' | 'bonuses' | 'pending' | 'caravan' | 'resolveRevolt' | null>(null);
  const [subTab, setSubTab] = useState<'catalog' | 'custom'>('catalog');
  
  // Finance States
  const [transAmount, setTransAmount] = useState(0);
  const [financeTab, setFinanceTab] = useState<'transfer' | 'manage' | 'cashflow'>('transfer');
  const [transferType, setTransferType] = useState<'invest' | 'withdraw'>('invest');
  const [manageType, setManageType] = useState<'Income' | 'Expense'>('Income');
  const [transReason, setTransReason] = useState('');

  // Action States
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [actionPhase, setActionPhase] = useState<'pay' | 'success'>('pay');
  const [selectedAction, setSelectedAction] = useState<DomainActionType | null>(null);
  const [diceInput, setDiceInput] = useState(1);
  const [convertAmount, setConvertAmount] = useState(0);
  const [convertDirection, setConvertDirection] = useState<'toDomain' | 'toGuild'>('toDomain');
  const [actionsRemaining, setActionsRemaining] = useState(2);

  // Event States
  const [selectedEvent, setSelectedEvent] = useState<typeof RANDOM_EVENTS_TABLE[0] | null>(null);
  const [eventBoonChoice, setEventBoonChoice] = useState<'lo' | 'popularity' | 'modifier'>('lo');
  const [eventInvasionRoll, setEventInvasionRoll] = useState(1);
  const [eventLOAmount, setEventLOAmount] = useState(1);
  const [eventPenaltyValue, setEventPenaltyValue] = useState(2);
  const [eventResult, setEventResult] = useState<ActionResult | null>(null);

  // Crisis States
  const [activeCrisis, setActiveCrisis] = useState<typeof CRISIS_EVENTS[0] | null>(null);

  // Manual Stats States
  const [editName, setEditName] = useState('');
  const [editRegent, setEditRegent] = useState('');
  const [editPopularity, setEditPopularity] = useState<PopularityType | 'N/A'>('Tolerado');
  const [editFortification, setEditFortification] = useState(0);
  const [editCourt, setEditCourt] = useState<CourtType>('Inexistente');
  const [editLevel, setEditLevel] = useState(1);
  const [editTerrain, setEditTerrain] = useState(TERRAIN_TYPES[0]);
  const [editIsMystic, setEditIsMystic] = useState(false);
  const [editTreasury, setEditTreasury] = useState(0);
  const [editActionsRemaining, setEditActionsRemaining] = useState(2);
  const [editActionModifier, setEditActionModifier] = useState(0);
  const [editMaintenanceMod, setEditMaintenanceMod] = useState(0);
  const [editMagicPowerLevel, setEditMagicPowerLevel] = useState(0);
  const [editRevolt, setEditRevolt] = useState(false);
  const [editHasWaterAccess, setEditHasWaterAccess] = useState(false);
  const [editHasMysticElement, setEditHasMysticElement] = useState(false);
  const [editIsNatureBoundRace, setEditIsNatureBoundRace] = useState(false);
  const [editIsSubterraneanBoundRace, setEditIsSubterraneanBoundRace] = useState(false);
  const [editCoexistingDomainId, setEditCoexistingDomainId] = useState('');

  // Custom Building States
  const [customBuildName, setCustomBuildName] = useState('');
  const [customBuildDesc, setCustomBuildDesc] = useState('');
  const [customBuildCost, setCustomBuildCost] = useState(0);
  const [customBuildBenefit, setCustomBuildBenefit] = useState('');
  const [customBuildPaid, setCustomBuildPaid] = useState(true);

  // Custom Unit States
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitType, setCustomUnitType] = useState('');
  const [customUnitPower, setCustomUnitPower] = useState(1);
  const [customUnitCost, setCustomUnitCost] = useState(0);
  const [customUnitPaid, setCustomUnitPaid] = useState(true);


  // Loss States
  const [lossLO, setLossLO] = useState(0);
  const [lossUnits, setLossUnits] = useState<string[]>([]);
  const [lossBuildings, setLossBuildings] = useState<string[]>([]);
  const [lossLevel, setLossLevel] = useState(0);

  // Battle Assistant States
  const [enemyPower, setEnemyPower] = useState(0);
  const [battleOutcome, setBattleOutcome] = useState<'victory10' | 'victory5' | 'victory' | 'defeat' | 'defeat5' | 'defeat10' | null>(null);

  // Caravan States
  const [caravanInvestLO, setCaravanInvestLO] = useState(1);
  const [caravanDice, setCaravanDice] = useState(1);
  const [selectedCaravanTask, setSelectedCaravanTask] = useState<any | null>(null);
  const [resolveCaravanProfit, setResolveCaravanProfit] = useState(0);

  // Claiming State
  const [claimAttempt, setClaimAttempt] = useState<{
    name: string;
    regent: string;
    terrain: string;
    isMystic: boolean;
    revolt: boolean;
    hasWaterAccess: boolean;
    hasMysticElement: boolean;
    isNatureBoundRace: boolean;
    isSubterraneanBoundRace: boolean;
  } | null>(null);

  // Pending Tasks States
  const [pendingTaskName, setPendingTaskName] = useState('');
  const [pendingTaskDesc, setPendingTaskDesc] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>('Pendente');
  const [editTaskProgress, setEditTaskProgress] = useState(0);
  const [editTaskNote, setEditTaskNote] = useState('');
  const [taxLevel, setTaxLevel] = useState<'taxLow' | 'taxMedium' | 'taxHigh'>('taxLow');
  const [customAdvisorName, setCustomAdvisorName] = useState('');
  const [customAdvisorRole, setCustomAdvisorRole] = useState<AdvisorRole>('Senescal');
  const [newAdvisorType, setNewAdvisorType] = useState<'Member' | 'NPC' | 'None'>('None');
  const [newAdvisorAssocId, setNewAdvisorAssocId] = useState('');

  // Editing Advisor States
  const [editingAdvisorId, setEditingAdvisorId] = useState<string | null>(null);
  const [editAdvisorName, setEditAdvisorName] = useState('');
  const [editAdvisorRole, setEditAdvisorRole] = useState<AdvisorRole>('Senescal');
  const [editAdvisorType, setEditAdvisorType] = useState<'Member' | 'NPC' | 'None'>('None');
  const [editAdvisorAssocId, setEditAdvisorAssocId] = useState('');
  const [editAdvisorDomainId, setEditAdvisorDomainId] = useState('');
  
  const ADVISOR_ROLES: { role: AdvisorRole, skill: string }[] = [
    { role: 'Bispo', skill: 'Religião' },
    { role: 'Capitão da Guarda', skill: 'Guerra' },
    { role: 'Embaixador', skill: 'Diplomacia' },
    { role: 'Espião', skill: 'Enganação' },
    { role: 'Falcoeiro', skill: 'Sobrevivência' },
    { role: 'Magistrado', skill: 'Investigação' },
    { role: 'Mago da Corte', skill: 'Misticismo' },
    { role: 'Menestrel', skill: 'Atuação' },
    { role: 'Senescal', skill: 'Nobreza' }
  ];

  const activeDomain = domains.find(d => d.id === activeDomainId);

  const getDomainActionModifier = (domain: any): number => {
    const courtMod = domain.court === 'Inexistente' ? -2 : 0;
    const popMod = domain.isMystic ? 0 : (POPULARITY_MODIFIERS[domain.popularity as PopularityType] || 0);
    const regentMod = (!domain.regent || !domain.regent.trim()) ? -5 : 0;
    const buildingMod = domain.buildings.some((b: any) => b.name === 'Banhos Públicos') ? 5 : 0;
    const caosMod = domain.tempCaosPenalty ? -5 : 0;
    return courtMod + popMod + regentMod + buildingMod + (domain.actionModifier || 0) + caosMod;
  };

  const renderActionTestInfo = (action: DomainActionType) => {
    if (!activeDomain) return null;

    let skillName = '';
    let cdText = '';
    let advisorRoles: string[] = [];

    if (action === 'govern') {
      skillName = 'Nobreza';
      cdText = `CD ${20 + activeDomain.level}`;
      advisorRoles = ['Senescal'];
    } else if (action === 'festival') {
      skillName = 'Diplomacia ou Atuação';
      cdText = 'CD 20';
      advisorRoles = ['Embaixador', 'Menestrel'];
    } else if (action === 'extort') {
      skillName = 'Nobreza ou Intimidação';
      cdText = 'CD 20';
      advisorRoles = ['Senescal'];
    } else if (action === 'conscript') {
      skillName = 'Nobreza ou Guerra';
      cdText = 'CD 20';
      advisorRoles = ['Senescal', 'Capitão da Guarda'];
    } else {
      return null;
    }

    const domainMod = getDomainActionModifier(activeDomain);
    const modStr = domainMod >= 0 ? `+${domainMod}` : `${domainMod}`;

    // Check if we have any matching advisors
    const matchingAdvisors = activeDomain.advisors.filter(a => advisorRoles.includes(a.role));

    return (
      <div className="mt-6 p-6 bg-indigo-900/10 dark:bg-indigo-900/20 border-2 border-indigo-900/20 rounded-[32px] text-left space-y-3">
        <h5 className="text-xs font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-400">Orientação de Teste (Tormenta 20)</h5>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase font-black text-[9px] tracking-wider">Teste Necessário</span>
            <span className="font-medieval text-sm text-fantasy-wood dark:text-fantasy-parchment">{skillName}</span>
          </div>
          <div>
            <span className="block text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase font-black text-[9px] tracking-wider">Dificuldade</span>
            <span className="font-medieval text-sm text-fantasy-gold">{cdText}</span>
          </div>
        </div>
        <div className="text-xs border-t border-indigo-900/15 dark:border-indigo-900/30 pt-2 flex justify-between items-center">
          <span className="text-fantasy-wood/60 dark:text-fantasy-parchment/50">Modificador do Domínio a somar no dado:</span>
          <span className={`font-medieval text-lg font-black ${domainMod >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{modStr}</span>
        </div>
        <div className="text-[10px] border-t border-indigo-900/15 dark:border-indigo-900/30 pt-2 font-serif italic">
          {matchingAdvisors.length > 0 ? (
            <div className="text-emerald-700 dark:text-emerald-400 font-bold flex flex-wrap items-center gap-1.5">
              <span>✓ Conselheiro ativo para este teste:</span>
              {matchingAdvisors.map((a) => (
                <span key={a.id} className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[9px] uppercase tracking-wide">
                  {a.name} ({a.role})
                </span>
              ))}
            </div>
          ) : (
            <div className="text-amber-700 dark:text-amber-500">
              ⚠️ Sem conselheiro treinado neste domínio para as perícias necessárias ({advisorRoles.join(' / ')}).
            </div>
          )}
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    if (activeDomain) {
      setActionsRemaining(activeDomain.actionsRemaining !== undefined ? activeDomain.actionsRemaining : (activeDomain.court === 'Rica' ? 3 : 2));
    }
  }, [activeDomainId, activeDomain?.actionsRemaining, activeDomain?.court]);

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      if (creationMethod === 'create') {
        if (wallet.TS < 5000) {
          notify("Saldo da Guilda insuficiente. Necessário T$ 5.000.", "error");
          return;
        }
        withdraw('system', 5000, 'TS', `Tentativa de Reivindicação: ${newDomainName}`);
        setClaimAttempt({
          name: newDomainName,
          regent: newRegent,
          terrain: newTerrain,
          isMystic: newIsMystic,
          revolt: newRevolt,
          hasWaterAccess: newHasWaterAccess,
          hasMysticElement: newHasMysticElement,
          isNatureBoundRace: newIsNatureBoundRace,
          isSubterraneanBoundRace: newIsSubterraneanBoundRace,
          coexistingDomainId: newCoexistingDomainId
        } as any);
      } else {
        createDomain(
          newDomainName,
          newRegent,
          newTerrain,
          false,
          newIsMystic,
          newRevolt,
          newHasWaterAccess,
          newHasMysticElement,
          newIsNatureBoundRace,
          newIsSubterraneanBoundRace,
          newCoexistingDomainId || undefined
        );
        setNewDomainName('');
        setNewRegent('');
        setNewIsMystic(false);
        setNewRevolt(false);
        setNewHasWaterAccess(false);
        setNewHasMysticElement(false);
        setNewIsNatureBoundRace(false);
        setNewIsSubterraneanBoundRace(false);
        setNewCoexistingDomainId('');
        setShowAddModal(false);
      }
  };

  const handleFinanceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!activeDomainId || transAmount <= 0) return;

      if (financeTab === 'transfer') {
        if(transferType === 'invest') investDomain(activeDomainId, transAmount);
        else withdrawDomain(activeDomainId, transAmount);
      } else {
        manageDomainTreasury(activeDomainId, transAmount, manageType, transReason || 'Ajuste Manual');
      }
      closeModal();
  };

  const handleCustomBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    addDomainBuilding(activeDomainId, {
        name: customBuildName,
        description: customBuildDesc,
        costLO: customBuildCost,
        benefit: customBuildBenefit,
        fortificationBonus: 0,
        requires: [],
        skill: 'Nobreza',
        income: ''
    }, customBuildPaid);
    closeModal();
  };

  const handleCustomUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    addDomainUnit(activeDomainId, {
        name: customUnitName,
        type: customUnitType,
        power: customUnitPower,
        costLO: customUnitCost,
        maintenance: 0.5,
        defense: 15,
        damage: '1d8',
        speed: 9,
        requires: ''
    }, customUnitPaid);
    closeModal();
  };

  const handlePendingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    addPendingTask(activeDomainId, {
      name: pendingTaskName,
      description: pendingTaskDesc,
      status: 'Pendente',
      progress: 0,
      history: []
    });
    setPendingTaskName('');
    setPendingTaskDesc('');
  };
  const handleAdvisorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    const skill = ADVISOR_ROLES.find(r => r.role === customAdvisorRole)?.skill || 'Nobreza';
    
    if (newAdvisorType !== 'None' && !newAdvisorAssocId) {
      return notify("Selecione um personagem ou NPC válido.", "error");
    }

    let finalName = customAdvisorName;
    if (newAdvisorType === 'Member') {
      finalName = members.find(m => m.id === newAdvisorAssocId)?.name || customAdvisorName;
    } else if (newAdvisorType === 'NPC') {
      finalName = npcs.find(n => n.id === newAdvisorAssocId)?.name || customAdvisorName;
    }

    addAdvisor(activeDomainId, {
      id: crypto.randomUUID(),
      name: finalName,
      role: customAdvisorRole,
      skill,
      associatedId: newAdvisorType !== 'None' ? newAdvisorAssocId : undefined,
      associatedType: newAdvisorType !== 'None' ? newAdvisorType : undefined
    });
    setCustomAdvisorName('');
    setNewAdvisorAssocId('');
    setNewAdvisorType('None');
  };

  const handleAdvisorEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId || !editingAdvisorId) return;
    const skill = ADVISOR_ROLES.find(r => r.role === editAdvisorRole)?.skill || 'Nobreza';

    if (editAdvisorType !== 'None' && !editAdvisorAssocId) {
      return notify("Selecione um personagem ou NPC válido para vincular.", "error");
    }

    let finalName = editAdvisorName;
    if (editAdvisorType === 'Member') {
      finalName = members.find(m => m.id === editAdvisorAssocId)?.name || editAdvisorName;
    } else if (editAdvisorType === 'NPC') {
      finalName = npcs.find(n => n.id === editAdvisorAssocId)?.name || editAdvisorName;
    }

    updateAdvisor(activeDomainId, editingAdvisorId, {
      name: finalName,
      role: editAdvisorRole,
      skill,
      associatedId: editAdvisorType !== 'None' ? editAdvisorAssocId : undefined,
      associatedType: editAdvisorType !== 'None' ? editAdvisorType : undefined
    }, editAdvisorDomainId);

    setEditingAdvisorId(null);
  };

  const handleApplyLosses = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;
    const res = applyBattleOutcome(activeDomainId, lossLO, lossUnits, lossBuildings, lossLevel > 0);
    if (res.success) {
      notify(res.message);
      closeModal();
    } else {
      notify(res.message, 'error');
    }
  };

  const handleOutcomeSelect = (outcome: 'victory10' | 'victory5' | 'victory' | 'defeat' | 'defeat5' | 'defeat10') => {
    setBattleOutcome(outcome);
    if (!activeDomain) return;

    // Helper to roll NdS dice
    const rollDice = (n: number, s: number): number => {
      let total = 0;
      for (let i = 0; i < n; i++) {
        total += Math.floor(Math.random() * s) + 1;
      }
      return total;
    };

    // Helper to get random subset of items
    const getRandomSubset = <T extends { id: string }>(arr: T[], count: number): string[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map(x => x.id);
    };

    if (outcome === 'victory10') {
      setLossLO(0);
      setLossLevel(0);
      setLossUnits([]);
      setLossBuildings([]);
    } else if (outcome === 'victory5') {
      const count = rollDice(1, 3);
      setLossLO(0);
      setLossLevel(0);
      setLossUnits(getRandomSubset(activeDomain.units, count));
      setLossBuildings([]);
    } else if (outcome === 'victory') {
      const unitsCount = rollDice(1, 3) + 1;
      const loLoss = rollDice(2, 6);
      setLossLO(loLoss);
      setLossLevel(0);
      setLossUnits(getRandomSubset(activeDomain.units, unitsCount));
      setLossBuildings([]);
    } else if (outcome === 'defeat') {
      const unitsCount = rollDice(1, 4) + 1;
      const loLoss = rollDice(3, 6);
      setLossLO(loLoss);
      setLossLevel(0);
      setLossUnits(getRandomSubset(activeDomain.units, unitsCount));
      setLossBuildings(getRandomSubset(activeDomain.buildings, 1));
    } else if (outcome === 'defeat5') {
      const unitsCount = rollDice(2, 4) + 1;
      const loLoss = rollDice(4, 6);
      const buildCount = rollDice(1, 3);
      setLossLO(loLoss);
      setLossLevel(0);
      setLossUnits(getRandomSubset(activeDomain.units, unitsCount));
      setLossBuildings(getRandomSubset(activeDomain.buildings, buildCount));
    } else if (outcome === 'defeat10') {
      const loLoss = rollDice(5, 6);
      setLossLO(loLoss);
      setLossLevel(1);
      setLossUnits(activeDomain.units.map(u => u.id));
      setLossBuildings(activeDomain.buildings.map(b => b.id));
    }
  };

  const handleActionPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId || !selectedAction) return;
    
    let actionToExecute = selectedAction;
    if (selectedAction === 'taxLow' || selectedAction === 'taxMedium' || selectedAction === 'taxHigh') {
      actionToExecute = taxLevel;
    }

    const params = actionToExecute === 'convert'
      ? { value: convertDirection === 'toDomain' ? convertAmount : -convertAmount }
      : undefined;

    const res = executeDomainAction(activeDomainId, actionToExecute, 'pay', params);
    setActionResult(res);
    setActionPhase('pay');
    if (res.success && actionToExecute !== 'convert') setActionsRemaining(prev => Math.max(0, prev - 1));
  };

  const handleActionSuccess = () => {
    if (!activeDomainId || !selectedAction) return;
    
    let actionToExecute = selectedAction;
    if (selectedAction === 'taxLow' || selectedAction === 'taxMedium' || selectedAction === 'taxHigh') {
      actionToExecute = taxLevel;
    }

    const params = actionToExecute === 'extort' || actionToExecute === 'taxLow' || actionToExecute === 'taxMedium' || actionToExecute === 'taxHigh'
      ? { diceResult: diceInput }
      : actionToExecute === 'convert'
        ? { value: convertDirection === 'toDomain' ? convertAmount : -convertAmount }
        : undefined;

    const res = executeDomainAction(activeDomainId, actionToExecute, 'success', params);
    setActionResult(res);
    setActionPhase('success');
  };

  const handleMaintenanceClick = (domainId: string) => {
    const res = payMaintenance(domainId);
    if (res.success) {
      notify(res.message, 'success');
    } else {
      notify(res.message, 'error');
    }
  };

  // resolveRevolt is called directly from the modal with testSuccess: boolean

  const handleEventApply = () => {
    if (!activeDomainId || !selectedEvent) return;
    const res = applyRandomEvent(
      activeDomainId,
      selectedEvent,
      eventBoonChoice,
      eventInvasionRoll,
      eventPenaltyValue,
      eventLOAmount
    );
    setEventResult(res);
  };

  const handleUpdateStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomainId) return;

    const currentMaxLevel = getDomainMaxLevel({
      terrain: editTerrain,
      isNatureBoundRace: editIsNatureBoundRace,
      isSubterraneanBoundRace: editIsSubterraneanBoundRace,
      hasWaterAccess: editHasWaterAccess
    });
    const finalLevel = Math.min(currentMaxLevel, editLevel);

    const currentMagicPotential = getDomainMagicPotential({
      terrain: editTerrain,
      hasMysticElement: editHasMysticElement
    });
    const finalMagicPowerLevel = editIsMystic ? Math.min(currentMagicPotential, editMagicPowerLevel) : 0;

    updateDomain(activeDomainId, {
      name: editName,
      regent: editRegent,
      popularity: editIsMystic ? 'N/A' : editPopularity,
      fortification: editFortification,
      court: editCourt,
      level: finalLevel,
      terrain: editTerrain,
      isMystic: editIsMystic,
      treasury: editTreasury,
      actionsRemaining: editActionsRemaining,
      actionModifier: editActionModifier,
      maintenanceMod: editMaintenanceMod,
      magicPowerLevel: finalMagicPowerLevel,
      revolt: editRevolt,
      hasWaterAccess: editHasWaterAccess,
      hasMysticElement: editHasMysticElement,
      isNatureBoundRace: editIsNatureBoundRace,
      isSubterraneanBoundRace: editIsSubterraneanBoundRace,
      coexistingDomainId: editCoexistingDomainId || undefined
    });
    notify("Estatutos Reais atualizados com sucesso.");
    closeModal();
  };

  const rollCrisis = () => {
    const event = CRISIS_EVENTS[Math.floor(Math.random() * CRISIS_EVENTS.length)];
    setActiveCrisis(event);
  };

  const applyCrisis = () => {
    if (!activeDomainId || !activeCrisis) return;
    const d = domains.find(x => x.id === activeDomainId);
    if (!d) return;

    if (activeCrisis.impact === 'popularity' && !d.isMystic) {
        const idx = POPULARITY_LEVELS.indexOf(d.popularity as PopularityType);
        const newIdx = Math.max(0, Math.min(POPULARITY_LEVELS.length - 1, idx + activeCrisis.value));
        const newPop = POPULARITY_LEVELS[newIdx];
        updateDomain(activeDomainId, {
          popularity: newPop,
          revolt: newPop === 'Odiado' ? true : d.revolt
        });
    } else if (activeCrisis.impact === 'treasury') {
        // Use manageDomainTreasury so cashFlow is also updated
        const type = activeCrisis.value >= 0 ? 'Income' : 'Expense';
        manageDomainTreasury(activeDomainId, Math.abs(activeCrisis.value), type, `Crise: ${activeCrisis.name}`);
    } else if (activeCrisis.impact === 'fortification') {
        updateDomain(activeDomainId, { fortification: Math.max(0, d.fortification + activeCrisis.value) });
    }
    notify(`Destino selado: ${activeCrisis.name}`);
    closeModal();
  };

  const openStatsModal = (d: any) => {
    setActiveDomainId(d.id);
    setEditName(d.name);
    setEditRegent(d.regent);
    setEditPopularity(d.popularity);
    setEditFortification(d.fortification);
    setEditCourt(d.court);
    setEditLevel(d.level ?? 1);
    setEditTerrain(d.terrain ?? TERRAIN_TYPES[0]);
    setEditIsMystic(!!d.isMystic);
    setEditTreasury(d.treasury ?? 0);
    setEditActionsRemaining(d.actionsRemaining ?? (d.court === 'Rica' ? 3 : 2));
    setEditActionModifier(d.actionModifier ?? 0);
    setEditMaintenanceMod(d.maintenanceMod ?? 0);
    setEditMagicPowerLevel(d.magicPowerLevel ?? 0);
    setEditRevolt(!!d.revolt);
    setEditHasWaterAccess(!!d.hasWaterAccess);
    setEditHasMysticElement(!!d.hasMysticElement);
    setEditIsNatureBoundRace(!!d.isNatureBoundRace);
    setEditIsSubterraneanBoundRace(!!d.isSubterraneanBoundRace);
    setEditCoexistingDomainId(d.coexistingDomainId || '');
    setModalMode('stats');
  };

  const openActionModal = (domainId: string, action: DomainActionType) => {
    const domain = domains.find(d => d.id === domainId);
    if (domain?.isMystic && ['festival', 'extort', 'conscript', 'taxLow', 'taxMedium', 'taxHigh'].includes(action)) {
      notify("O domínio místico não suporta essa operação.", "error");
      return;
    }
    setActiveDomainId(domainId);
    setSelectedAction(action);
    setActionResult(null);
    setActionPhase('pay');
    setDiceInput(1);
    setConvertAmount(0);
    setConvertDirection('toDomain');
    setModalMode('action');
  };

  const closeModal = () => {
    setActiveDomainId(null); setModalMode(null); setTransAmount(0); setTransReason('');
    setActionResult(null); setSelectedAction(null); setDiceInput(1);
    setActiveCrisis(null); setSubTab('catalog'); setSelectedEvent(null);
    setConvertAmount(0); setConvertDirection('toDomain');
    setEventBoonChoice('lo'); setEventInvasionRoll(1); setEventLOAmount(1); setEventPenaltyValue(2); setEventResult(null);
    setNewCoexistingDomainId(''); setEditCoexistingDomainId('');
    
    setCustomBuildName(''); setCustomBuildDesc(''); setCustomBuildCost(0); setCustomBuildBenefit(''); setCustomBuildPaid(true);
    setCustomUnitName(''); setCustomUnitType(''); setCustomUnitPower(1); setCustomUnitCost(0); setCustomUnitPaid(true);
    setLossLO(0); setLossUnits([]); setLossBuildings([]); setLossLevel(0);
    setPendingTaskName(''); setPendingTaskDesc('');
    setEditingTaskId(null); setEditTaskStatus('Pendente'); setEditTaskProgress(0); setEditTaskNote('');
    setCustomAdvisorName('');
    setNewAdvisorType('None');
    setNewAdvisorAssocId('');
    setEditingAdvisorId(null);
    setEditAdvisorName('');
    setEditAdvisorRole('Senescal');
    setEditAdvisorType('None');
    setEditAdvisorAssocId('');
    setEditAdvisorDomainId('');

    setEnemyPower(0);
    setBattleOutcome(null);
    setCaravanInvestLO(1);
    setCaravanDice(1);
    setSelectedCaravanTask(null);
    setResolveCaravanProfit(0);
    setClaimAttempt(null);
    setEditHasWaterAccess(false);
    setEditHasMysticElement(false);
    setEditIsNatureBoundRace(false);
    setEditIsSubterraneanBoundRace(false);

    setNewDomainName('');
    setNewRegent('');
    setNewIsMystic(false);
    setNewRevolt(false);
    setNewHasWaterAccess(false);
    setNewHasMysticElement(false);
    setNewIsNatureBoundRace(false);
    setNewIsSubterraneanBoundRace(false);
  };

  const LevelDot = ({ level, maxLevel }: { level: number; maxLevel: number }) => {
    const pct = maxLevel > 1 ? ((level - 1) / (maxLevel - 1)) * 100 : 100;
    return (
      <div className="flex items-center gap-1" title={`Nível ${level}/${maxLevel}`}>
        <div className="h-1.5 w-16 bg-fantasy-wood/15 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-600 to-fantasy-gold rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/50">{level}/{maxLevel}</span>
      </div>
    );
  };

  const ActionButton = ({ icon: Icon, label, onClick, color = 'bg-indigo-900/40 text-indigo-200 border-indigo-900/50 hover:bg-indigo-900/60', disabled = false }: { icon: any; label: string; onClick: () => void; color?: string; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}
      className={`${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${color} border px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg`}>
      <Icon size={14} /> {label}
    </button>
  );

  const popColors = [
    { fill: 'bg-red-500', dim: 'bg-red-500/30', text: 'text-red-600 dark:text-red-400' },
    { fill: 'bg-orange-500', dim: 'bg-orange-500/30', text: 'text-orange-600 dark:text-orange-400' },
    { fill: 'bg-yellow-500', dim: 'bg-yellow-500/30', text: 'text-yellow-600 dark:text-yellow-400' },
    { fill: 'bg-emerald-500', dim: 'bg-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { fill: 'bg-amber-400', dim: 'bg-amber-400/30', text: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-medieval text-fantasy-wood dark:text-white tracking-tighter uppercase leading-none mb-3">Domínios Reais</h2>
          <p className="text-xs md:text-lg text-fantasy-gold font-bold uppercase tracking-[0.3em]">Gestão de Territórios, Tropas e Regência.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => {
            resetAllDomainsTurns();
          }}
            className="bg-fantasy-wood/10 hover:bg-fantasy-wood/20 text-fantasy-wood dark:text-fantasy-parchment px-6 py-4 rounded-[32px] flex items-center gap-3 font-medieval uppercase tracking-widest text-sm border-2 border-fantasy-wood/20 transition-all">
            <RotateCcw size={18} /> Reiniciar Turno
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="bg-fantasy-blood hover:bg-red-700 text-white px-8 md:px-12 py-4 md:py-6 rounded-[32px] flex items-center gap-4 font-medieval uppercase tracking-widest shadow-2xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
             <LandPlot size={28} /> Conquistar Terras
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
          {domains.length === 0 ? (
             <div className="parchment-card p-24 md:p-36 rounded-[60px] border-4 border-dashed border-fantasy-wood/10 dark:border-white/10 text-center opacity-60">
                <MapIcon size={80} className="mx-auto mb-10 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
                <p className="font-medieval text-3xl md:text-4xl uppercase tracking-widest italic text-fantasy-wood dark:text-fantasy-parchment">O mapa está em branco...</p>
             </div>
          ) : (
             domains.map((domain, idx) => {
                const totalMaint = getMaintenanceCost(domain);
                const popIdx = domain.isMystic ? 2 : POPULARITY_LEVELS.indexOf(domain.popularity as PopularityType);
                const maxLevel = getDomainMaxLevel(domain);
                const perc = popColors[popIdx] || popColors[2];
                const revolt = (domain as any).revolt === true;
                const hasCaravanserai = domain.buildings.some((b: any) => b.name === 'Caravançará');
                const domainActions = domain.actionsRemaining !== undefined ? domain.actionsRemaining : (domain.court === 'Rica' ? 3 : 2);
                return (
                <div key={domain.id} className={`parchment-card rounded-[60px] shadow-5xl overflow-hidden border-4 ${revolt ? 'border-red-600/50 animate-pulse' : 'border-fantasy-gold/20'} animate-slide-up`} style={{ animationDelay: `${idx*100}ms` }}>
                    {/* Header */}
                    <div className={`${revolt ? 'bg-red-900/20' : domain.isMystic ? 'bg-purple-900/20' : 'bg-fantasy-wood/10 dark:bg-black/20'} p-8 md:p-12 border-b-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8`}>
                       <div className="flex items-center gap-6 md:gap-8">
                          <div className={`wax-seal w-20 h-20 md:w-28 md:h-28 flex items-center justify-center animate-float shrink-0 ${revolt ? 'bg-red-900 border-red-950' : domain.isMystic ? 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-950' : 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-950'}`}>
                             {revolt ? <AlertTriangle size={40} className="text-red-400"/> : domain.isMystic ? <Sparkles size={40} className="text-purple-300"/> : <Crown size={40} className="text-fantasy-gold"/>}
                          </div>
                          <div>
                             <div className="flex items-center gap-3 flex-wrap">
                               <h3 className="text-3xl md:text-5xl font-medieval text-fantasy-wood dark:text-fantasy-parchment uppercase tracking-tighter mb-1 leading-none">{domain.name}</h3>
                               {revolt && <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">REVOLTA</span>}
                               {domain.isMystic && <span className="px-3 py-1 bg-purple-800 text-purple-100 text-[10px] font-black uppercase tracking-widest rounded-full">MÍSTICO</span>}
                             </div>
                             <p className={`text-xs md:text-sm font-black uppercase tracking-[0.3em] ${!domain.regent.trim() ? 'text-red-600 dark:text-red-400' : 'text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>Regente: {domain.regent || 'VACANTE (Penalidade -5)'}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <LevelDot level={domain.level} maxLevel={maxLevel} />
                                <span className="text-[10px] font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase">
                                   {domain.terrain} (Potencial Mágico: {getDomainMagicPotential(domain)})
                                 </span>
                                <span className="h-3 w-px bg-fantasy-wood/20 dark:bg-white/10" />
                                <span className="text-[10px] font-black text-fantasy-gold uppercase">Corte: {domain.court}</span>
                             </div>
                             <div className="text-[10px] font-semibold text-fantasy-wood/65 dark:text-fantasy-parchment/65 mt-1 text-left">
                               População: {
                                 domain.level <= 2 ? '1.000 a 2.500 habitantes (Camponeses, caçadores e rústicos)' :
                                 domain.level <= 5 ? '5.000 a 25.000 habitantes (Mercados, oficinas, arautos e bardos)' :
                                 '50.000 a 100.000 habitantes (Densamente povoada, guildas, indústrias, alquimistas e magos)'
                               }
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          <button onClick={() => { setActiveDomainId(domain.id); setModalMode('finance'); }} className="px-6 py-3 rounded-2xl bg-amber-500 dark:bg-fantasy-gold text-stone-950 dark:text-black hover:bg-amber-600 dark:hover:bg-fantasy-gold/90 font-medieval uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-md font-bold">
                             <Coins size={18}/> Tesouro
                          </button>
                          <button onClick={() => { setActiveDomainId(domain.id); setModalMode('event'); }} className="px-6 py-3 rounded-2xl bg-orange-600 dark:bg-amber-800 text-white dark:text-amber-100 hover:bg-orange-700 dark:hover:bg-amber-700 font-medieval uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-md font-bold">
                             <Dices size={18}/> Eventos
                          </button>
                           <button onClick={() => { setActiveDomainId(domain.id); setModalMode('crisis'); }} className="px-6 py-3 rounded-2xl bg-red-800 dark:bg-red-950 text-white dark:text-red-200 hover:bg-red-900 dark:hover:bg-red-900 font-medieval uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-md font-bold">
                              <Zap size={18}/> Crise
                           </button>
                           <button onClick={() => { setActiveDomainId(domain.id); setModalMode('levelup'); }} className="px-6 py-3 rounded-2xl bg-purple-700 dark:bg-purple-900 text-white dark:text-purple-200 hover:bg-purple-800 dark:hover:bg-purple-800 font-medieval uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-md font-bold" title="Concessão do Mestre — evolução gratuita sem custo de ação">
                              <Sparkles size={18}/> Mestre
                           </button>
                           <button onClick={() => openStatsModal(domain)} className="px-4 py-3 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-all border border-stone-300 dark:border-stone-700 shadow-md">
                              <Settings size={20}/>
                           </button>
                          {(domain.court === 'Comum' || domain.court === 'Rica') && (
                             <button onClick={() => { setActiveDomainId(domain.id); setModalMode('advisors'); }} className="px-4 py-3 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-all border border-purple-200 dark:border-purple-900/50 shadow-md" title="Conselheiros da Corte">
                                <Crown size={20}/>
                             </button>
                          )}
                          <button onClick={() => { if(confirm("Abandonar este domínio?")) demolishDomain(domain.id); }} className="px-4 py-3 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-all border border-red-200 dark:border-red-900/50 shadow-md">
                             <Trash2 size={20}/>
                          </button>
                       </div>
                    </div>

                    {/* Revolt Banner */}
                    {revolt && (
                      <div className="bg-red-900/20 border-b-2 border-red-600/30 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={20} className="text-red-500" />
                          <span className="text-sm font-medieval text-red-700 dark:text-red-400">REVOLTA — Impostos zerados, construções em risco. Aumente a popularidade para sufocar a revolta.</span>
                        </div>
                        <button onClick={() => { setActiveDomainId(domain.id); setModalMode('resolveRevolt'); }} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                          Tentar Sufocar
                        </button>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="bg-black/5 dark:bg-white/5 border-b-2 border-fantasy-wood/10 dark:border-white/10 px-8 py-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-fantasy-gold" />
                          <span className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Ações de Domínio:</span>
                          <div className="flex gap-1">
                            {Array.from({ length: domain.court === 'Rica' ? 3 : 2 }).map((_, i) => (
                              <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < domainActions ? 'bg-emerald-500 border-emerald-600' : 'bg-fantasy-wood/10 dark:bg-white/10 border-fantasy-wood/20 dark:border-white/20'} transition-all`} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <ActionButton icon={Gavel} label="Governar" onClick={() => openActionModal(domain.id, 'govern')} disabled={domainActions <= 0 || revolt} color="bg-indigo-700 dark:bg-indigo-900 text-white dark:text-indigo-200 border-indigo-600/30 dark:border-indigo-800/40 hover:bg-indigo-800 dark:hover:bg-indigo-800" />
                          <ActionButton icon={Sparkles} label="Festival" onClick={() => openActionModal(domain.id, 'festival')} disabled={domainActions <= 0 || revolt} color="bg-emerald-700 dark:bg-emerald-900 text-white dark:text-emerald-200 border-emerald-600/30 dark:border-emerald-800/40 hover:bg-emerald-800 dark:hover:bg-emerald-800" />
                          <ActionButton icon={TrendingUp} label="Caravana" onClick={() => { if (domain.isMystic) { notify("O domínio místico não suporta essa operação.", "error"); return; } setActiveDomainId(domain.id); setModalMode('caravan'); }} disabled={domainActions <= 0 || revolt} color="bg-orange-700 dark:bg-orange-900 text-white dark:text-orange-200 border-orange-600/30 dark:border-orange-800/40 hover:bg-orange-800 dark:hover:bg-orange-800" />
                          <ActionButton icon={TrendingDown} label="Extorquir" onClick={() => openActionModal(domain.id, 'extort')} disabled={domainActions <= 0} color="bg-amber-700 dark:bg-amber-900 text-white dark:text-amber-200 border-amber-600/30 dark:border-amber-800/40 hover:bg-amber-800 dark:hover:bg-amber-800" />
                          <ActionButton icon={Users} label="Convocar" onClick={() => openActionModal(domain.id, 'conscript')} disabled={domainActions <= 0} color="bg-yellow-600 dark:bg-yellow-900 text-stone-950 dark:text-yellow-100 border-yellow-500/30 dark:border-yellow-800/40 hover:bg-yellow-700 dark:hover:bg-yellow-800" />
                          <ActionButton icon={Scale} label="Impostos" onClick={() => { setTaxLevel('taxLow'); openActionModal(domain.id, 'taxLow'); }} disabled={domainActions <= 0 || revolt} color="bg-stone-700 dark:bg-fantasy-wood text-white dark:text-fantasy-parchment border-stone-600/30 dark:border-fantasy-wood/30 hover:bg-stone-800 dark:hover:bg-fantasy-wood/50" />
                          <ActionButton icon={Hand} label="Elevar Corte" onClick={() => openActionModal(domain.id, 'increaseCourt')} disabled={domainActions <= 0} color="bg-amber-500 dark:bg-fantasy-gold text-stone-950 dark:text-black border-amber-400/30 dark:border-fantasy-gold/30 hover:bg-amber-600 dark:hover:bg-fantasy-gold/90" />
                          <ActionButton icon={TrendingDown} label="Rebaixar Corte" onClick={() => openActionModal(domain.id, 'decreaseCourt')} color="bg-red-700 dark:bg-red-900 text-white dark:text-red-200 border-red-600/30 dark:border-red-800/40 hover:bg-red-800 dark:hover:bg-red-800" />
                          <ActionButton icon={ArrowLeftRight} label="Converter" onClick={() => openActionModal(domain.id, 'convert')} color="bg-purple-700 dark:bg-purple-900 text-white dark:text-purple-200 border-purple-600/30 dark:border-purple-800/40 hover:bg-purple-800 dark:hover:bg-purple-800" />
                          <ActionButton icon={Scroll} label="Pendências" onClick={() => { setActiveDomainId(domain.id); setModalMode('pending'); }} color="bg-teal-700 dark:bg-teal-900 text-white dark:text-teal-200 border-teal-600/30 dark:border-teal-800/40 hover:bg-teal-800 dark:hover:bg-teal-800" />
                          <ActionButton icon={Coins} label="Manutenção" onClick={() => handleMaintenanceClick(domain.id)} color="bg-slate-700 dark:bg-slate-800 text-white dark:text-slate-200 border-slate-600/30 dark:border-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-700" />
                          <ActionButton icon={AlertTriangle} label="Perdas/Danos" onClick={() => { setActiveDomainId(domain.id); setModalMode('losses'); }} color="bg-rose-700 dark:bg-rose-950 text-white dark:text-rose-200 border-rose-600/30 dark:border-rose-900/40 hover:bg-rose-800 dark:hover:bg-rose-900" />
                          <ActionButton icon={Sparkles} label="Ver Bônus" onClick={() => { setActiveDomainId(domain.id); setModalMode('bonuses'); }} color="bg-violet-700 dark:bg-violet-900 text-white dark:text-violet-200 border-violet-600/30 dark:border-violet-800/40 hover:bg-violet-800 dark:hover:bg-violet-800" />
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 border-b-2 border-fantasy-wood/10 dark:border-white/10 divide-x-2 divide-y lg:divide-y-0 divide-fantasy-wood/10 dark:divide-white/10">
                        {[
                          { label: 'Nível de Poder', val: domain.level, sub: 'Tier', icon: Castle, isPop: false, isMagic: false },
                          { label: 'Tesouro Real', val: `${domain.treasury} LO`, sub: 'Riqueza', icon: Coins, isPop: false, isMagic: false },
                          { label: 'Manutenção', val: `${totalMaint} LO`, sub: 'por Turno', icon: TrendingDown, isPop: false, isMagic: false },
                          { label: domain.isMystic ? 'Poder Mágico' : 'Popularidade', val: domain.isMystic ? `+${domain.magicPowerLevel || 0} PM` : domain.popularity, sub: domain.isMystic ? `Potencial: ${getDomainMagicPotential(domain)}` : 'Moral', icon: domain.isMystic ? Sparkles : UserCircle, isPop: !domain.isMystic, isMagic: domain.isMystic },
                          { label: 'Fortificação', val: domain.fortification, sub: '+Defesa', icon: Shield, isPop: false, isMagic: false },
                          { label: 'Modificador de Ação', val: (() => {
                            const totalMod = getDomainActionModifier(domain);
                            return totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                          })(), sub: 'Corte/Pop/Reg/Obra/Ajustes', icon: Gavel, isPop: false, isMagic: false }
                        ].map((stat, i) => (
                           <div key={i} className={`p-8 text-center transition-colors group ${stat.isMagic ? 'hover:bg-purple-900/5' : 'hover:bg-fantasy-gold/5'}`}>
                              {stat.isPop ? (
                                <>
                                  <div className="flex items-center justify-center gap-1 mb-3 mt-1">
                                    {POPULARITY_LEVELS.map((_, li) => (
                                      <div key={li} className={`h-2 rounded-full transition-all duration-300 ${
                                        li === popIdx
                                          ? `w-6 ${popColors[li].fill} shadow-lg`
                                          : li < popIdx
                                            ? `w-4 ${popColors[li].dim}`
                                            : 'w-4 bg-fantasy-wood/15 dark:bg-white/10'
                                      }`}/>
                                    ))}
                                  </div>
                                  <div className={`text-xl md:text-2xl font-medieval mb-1 ${perc.text}`}>{domain.popularity}</div>
                                  <div className="text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Nível {popIdx + 1}/{POPULARITY_LEVELS.length}</div>
                                </>
                              ) : (
                                <>
                                  <stat.icon size={24} className="mx-auto mb-4 text-fantasy-wood/30 dark:text-fantasy-parchment/20 group-hover:text-fantasy-gold transition-colors"/>
                                  <div className="text-xl md:text-2xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-1">{stat.val}</div>
                                  <div className="text-[9px] md:text-[10px] font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">{stat.label}</div>
                                </>
                              )}
                           </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 grid grid-cols-1 xl:grid-cols-2 gap-12">
                       {/* Buildings */}
                       <div className="space-y-8">
                          <div className="flex justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6">
                             <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tight flex items-center gap-3"><Building2 size={24}/> Infraestrutura <span className="text-xs text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-mono">({domain.buildings.length}/{domain.level * 3})</span></h4>
                             <button onClick={() => { setActiveDomainId(domain.id); setModalMode('building'); }} disabled={domainActions <= 0 || revolt} className={`p-3 bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black rounded-full transition-all shadow-lg ${domainActions <= 0 || revolt ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}><Plus size={16}/></button>
                          </div>
                          <div className="space-y-4">
                             {domain.buildings.length === 0 && <p className="text-center py-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 italic font-serif">Nenhuma construção erguida.</p>}
                             {domain.buildings.map(b => (
                                <div key={b.id} className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-fantasy-wood/5 dark:border-white/5 flex justify-between items-center group hover:border-fantasy-gold/30 transition-all">
                                   <div>
                                      <div className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment">{b.name}</div>
                                      <div className="text-xs text-fantasy-wood/60 dark:text-fantasy-parchment/60 italic">{b.benefit}</div>
                                      {(b as any).fortificationBonus > 0 && <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">Fortificação +{(b as any).fortificationBonus}</div>}
                                   </div>
                                   <button onClick={() => removeDomainBuilding(domain.id, b.id)} className="text-fantasy-wood/20 hover:text-red-800 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={18}/></button>
                                </div>
                             ))}
                          </div>
                          {domain.level < maxLevel && (
                              <button onClick={() => openActionModal(domain.id, 'govern')} className="w-full py-4 border-2 border-dashed border-fantasy-wood/40 dark:border-white/20 rounded-3xl text-xs font-black uppercase tracking-widest text-fantasy-wood/70 dark:text-fantasy-parchment/70 hover:bg-fantasy-gold/15 hover:border-fantasy-gold/50 hover:text-fantasy-gold bg-black/5 dark:bg-white/5 transition-all shadow-inner">
                                  Ação Governar: {domain.level * 20} LO (consome 1 ação)
                              </button>
                          )}
                       </div>

                       {/* Units */}
                       <div className="space-y-8">
                          <div className="flex justify-between items-center border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-6">
                             <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tight flex items-center gap-3"><Swords size={24}/> Poder Militar <span className="text-xs text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-mono">({domain.units.length}/{domain.level})</span></h4>
                             <button onClick={() => { setActiveDomainId(domain.id); setModalMode('unit'); }} disabled={domainActions <= 0 || revolt} className={`p-3 bg-indigo-900 dark:bg-indigo-500 text-white rounded-full transition-all shadow-lg ${domainActions <= 0 || revolt ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}><Plus size={16}/></button>
                          </div>
                          <div className="space-y-4">
                             {domain.units.length === 0 && <p className="text-center py-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 italic font-serif">Nenhuma tropa alistada.</p>}
                             {domain.units.map(u => (
                                <div key={u.id} className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-fantasy-wood/5 dark:border-white/5 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                                   <div>
                                      <div className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment">{u.name}</div>
                                      <div className="text-xs font-black uppercase text-indigo-800 dark:text-indigo-400 tracking-widest">{u.type} • PWR {(u as any).power} • {(u as any).maintenance > 0 ? `Mant ${(u as any).maintenance} LO` : 'Sem custo'}</div>
                                   </div>
                                   <button onClick={() => removeDomainUnit(domain.id, u.id)} className="text-fantasy-wood/20 hover:text-red-800 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={18}/></button>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                </div>
             )})
          )}
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
         <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
             <div className="parchment-card p-6 md:p-12 rounded-[40px] md:rounded-[56px] w-full max-w-lg border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-2 md:p-3 bg-white/20 dark:bg-black/20 rounded-full"><X size={28}/></button>
                 
                 <div className="text-center mb-10">
                    <div className="wax-seal w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 flex items-center justify-center text-white"><LandPlot size={40}/></div>
                    <h3 className="text-3xl md:text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Carta de Domínio</h3>
                 </div>

                  {claimAttempt ? (
                     <div className="space-y-8 text-center animate-fade-in">
                        <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white bg-indigo-900 border-indigo-950"><Crown size={40}/></div>
                        <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Tentativa de Reivindicação</h3>
                        <div className="p-8 bg-black/5 dark:bg-black/20 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 space-y-4">
                           <p className="font-serif italic text-lg text-fantasy-wood dark:text-fantasy-parchment">
                              "Para clamar as terras de <strong>{claimAttempt.name}</strong>, o regente deve provar sua legitimidade perante o reino."
                           </p>
                           <div className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment">
                              Custo de T$ 5.000 foi pago da guilda.
                           </div>
                           <div className="text-2xl font-medieval text-indigo-900 dark:text-indigo-400">
                              Rolar Nobreza CD 20 na mesa
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button type="button" onClick={() => {
                              setClaimAttempt(null);
                              setShowAddModal(false);
                              notify("Reivindicação falhou. Terras perdidas.", "error");
                           }} className="flex-1 bg-red-900/20 text-red-900 dark:text-red-400 py-6 rounded-[40px] font-medieval text-xl uppercase tracking-widest border-2 border-red-900/20 hover:bg-red-900/40 transition-all">
                              Falhei no Teste
                           </button>
                           <button type="button" onClick={() => {
                              createDomain(
                                claimAttempt.name,
                                claimAttempt.regent,
                                claimAttempt.terrain,
                                false,
                                claimAttempt.isMystic,
                                claimAttempt.revolt,
                                claimAttempt.hasWaterAccess,
                                claimAttempt.hasMysticElement,
                                claimAttempt.isNatureBoundRace,
                                claimAttempt.isSubterraneanBoundRace
                              );
                              setClaimAttempt(null);
                              setShowAddModal(false);
                           }} className="flex-1 bg-emerald-800 text-white py-6 rounded-[40px] font-medieval text-xl uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all">
                              Passei no Teste
                           </button>
                        </div>
                     </div>
                  ) : (
                     <form onSubmit={handleCreate} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Território</label>
                            <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl focus:outline-none shadow-inner" required value={newDomainName} onChange={e => setNewDomainName(e.target.value)} placeholder="Condado de..." />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Regente Designado</label>
                            <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl focus:outline-none shadow-inner" required value={newRegent} onChange={e => setNewRegent(e.target.value)} placeholder="Lorde/Lady..." />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Terreno Predominante</label>
                            <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={newTerrain} onChange={e => setNewTerrain(e.target.value)}>
                                {TERRAIN_TYPES.map(t => <option key={t} value={t} className="dark:bg-black">{t}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-4 bg-purple-900/10 dark:bg-purple-900/20 border-2 border-purple-900/20 rounded-[28px] cursor-pointer">
                                    <input type="checkbox" checked={newIsMystic} onChange={e => setNewIsMystic(e.target.checked)} className="w-5 h-5 accent-purple-800" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-purple-900 dark:text-purple-400">Domínio Místico</span>
                                        <span className="block text-[10px] font-serif italic text-purple-700/70 dark:text-purple-300/70">Bônus de PM, sem popularidade</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-red-900/10 dark:bg-red-900/20 border-2 border-red-900/20 rounded-[28px] cursor-pointer">
                                    <input type="checkbox" checked={newRevolt} onChange={e => setNewRevolt(e.target.checked)} className="w-5 h-5 accent-red-800" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-red-900 dark:text-red-400">Revolta Ativa</span>
                                        <span className="block text-[10px] font-serif italic text-red-700/70 dark:text-red-300/70">Liga/Desliga estado de revolta</span>
                                    </div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-4 bg-blue-900/10 dark:bg-blue-900/20 border-2 border-blue-900/20 rounded-[28px] cursor-pointer">
                                    <input type="checkbox" checked={newHasWaterAccess} onChange={e => setNewHasWaterAccess(e.target.checked)} className="w-5 h-5 accent-blue-800" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-400">Rio ou Mar</span>
                                        <span className="block text-[10px] font-serif italic text-blue-700/70 dark:text-blue-300/70">+1 ao Nível Máximo do Domínio</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-fuchsia-900/10 dark:bg-fuchsia-900/20 border-2 border-fuchsia-900/20 rounded-[28px] cursor-pointer">
                                    <input type="checkbox" checked={newHasMysticElement} onChange={e => setNewHasMysticElement(e.target.checked)} className="w-5 h-5 accent-fuchsia-800" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-fuchsia-900 dark:text-fuchsia-400">Elemento Místico</span>
                                        <span className="block text-[10px] font-serif italic text-fuchsia-700/70 dark:text-fuchsia-300/70">+1 ao Potencial Mágico</span>
                                    </div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-4 bg-emerald-900/10 dark:bg-emerald-900/20 border-2 border-emerald-900/20 rounded-[28px] cursor-pointer">
                                    <input type="checkbox" checked={newIsNatureBoundRace} onChange={e => setNewIsNatureBoundRace(e.target.checked)} className="w-5 h-5 accent-emerald-800" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-400">Regente Feérico/Natural</span>
                                        <span className="block text-[10px] font-serif italic text-emerald-700/70 dark:text-emerald-300/70">Nível máx 6 em Florestas</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-amber-900/10 dark:bg-amber-900/20 border-2 border-amber-900/20 rounded-[28px] cursor-pointer">
                                    <input type="checkbox" checked={newIsSubterraneanBoundRace} onChange={e => setNewIsSubterraneanBoundRace(e.target.checked)} className="w-5 h-5 accent-amber-800" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-amber-900 dark:text-amber-400">Regente Subterrâneo</span>
                                        <span className="block text-[10px] font-serif italic text-amber-700/70 dark:text-amber-300/70">Nível máx 6 em Subterrâneos</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {newIsMystic && (
                            <div className="space-y-3 p-4 bg-purple-900/5 dark:bg-purple-900/10 border-2 border-purple-900/10 rounded-[28px] animate-fade-in">
                                <label className="text-[10px] font-black text-purple-900 dark:text-purple-400 uppercase tracking-widest ml-4">Domínio Civil Coexistente (Mesmo Terreno)</label>
                                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={newCoexistingDomainId} onChange={e => setNewCoexistingDomainId(e.target.value)}>
                                    <option value="" className="dark:bg-black text-fantasy-wood">Nenhum (Independente)</option>
                                    {domains.filter(d => !d.isMystic).map(d => (
                                        <option key={d.id} value={d.id} className="dark:bg-black text-fantasy-wood">{d.name} ({d.terrain})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="bg-black/5 dark:bg-black/20 p-6 rounded-[32px] border-4 border-fantasy-wood/10 dark:border-white/10 flex flex-col gap-4">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input type="radio" checked={creationMethod === 'create'} onChange={() => setCreationMethod('create')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Reivindicar (Custo: T$ 5.000)</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input type="radio" checked={creationMethod === 'conquer'} onChange={() => setCreationMethod('conquer')} className="accent-red-900 w-6 h-6 shrink-0" />
                                <span className="text-xs font-black text-fantasy-wood/70 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors uppercase tracking-widest">Conquista / Herança (Grátis)</span>
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-fantasy-blood text-white py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-red-950 hover:translate-y-1 active:border-b-0 transition-all">
                            Estabelecer Domínio
                        </button>
                     </form>
                  )}
             </div>
         </div>
      )}

      {/* Action Modals */}
      {modalMode && activeDomain && (
          <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-10 rounded-[60px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <button onClick={closeModal} className="absolute top-8 right-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-3 bg-white/20 dark:bg-black/20 rounded-full"><X size={24}/></button>
                  
                  {/* Finance Modal */}
                  {modalMode === 'finance' && (
                      <div className="space-y-8">
                          <div className="text-center">
                              <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Tesouro Real: {activeDomain.treasury} LO</h3>
                              <div className="flex justify-center gap-4 mt-6">
                                 <button onClick={() => setFinanceTab('transfer')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${financeTab === 'transfer' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-transparent text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Transferência</button>
                                 <button onClick={() => setFinanceTab('manage')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${financeTab === 'manage' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-transparent text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Gestão Manual</button>
                                 <button onClick={() => setFinanceTab('cashflow')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${financeTab === 'cashflow' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-transparent text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Fluxo de Caixa</button>
                              </div>
                          </div>
                          
                          {financeTab === 'cashflow' ? (
                              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 text-left">
                                  {(!activeDomain.cashFlow || activeDomain.cashFlow.length === 0) ? (
                                      <p className="text-center py-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 italic font-serif">Nenhuma movimentação financeira registrada.</p>
                                  ) : (
                                      <div className="border border-fantasy-wood/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-inner">
                                          <table className="w-full text-xs font-mono text-fantasy-wood dark:text-fantasy-parchment border-collapse">
                                              <thead>
                                                  <tr className="bg-black/10 dark:bg-white/5 border-b border-fantasy-wood/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">
                                                      <th className="px-4 py-3 text-left">Data</th>
                                                      <th className="px-4 py-3 text-center">Tipo</th>
                                                      <th className="px-4 py-3 text-right">Valor</th>
                                                      <th className="px-4 py-3 text-left">Descrição</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-fantasy-wood/10 dark:divide-white/5">
                                                  {[...(activeDomain.cashFlow || [])].reverse().map(cf => (
                                                      <tr key={cf.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                                          <td className="px-4 py-3 whitespace-nowrap text-fantasy-wood/60 dark:text-fantasy-parchment/60">
                                                              {new Date(cf.date).toLocaleDateString('pt-BR')} {new Date(cf.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                          </td>
                                                          <td className="px-4 py-3 text-center">
                                                              <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${cf.type === 'Entrada' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                                                  {cf.type}
                                                              </span>
                                                          </td>
                                                          <td className={`px-4 py-3 text-right font-bold ${cf.type === 'Entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                              {cf.type === 'Entrada' ? '+' : '-'}{cf.amount} LO
                                                          </td>
                                                          <td className="px-4 py-3 text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                                              {cf.reason}
                                                          </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                      </div>
                                  )}
                              </div>
                          ) : (
                              <form onSubmit={handleFinanceSubmit} className="space-y-6">
                                  {financeTab === 'transfer' ? (
                                      <>
                                         <div className="flex gap-4 p-2 bg-black/5 dark:bg-black/20 rounded-2xl">
                                             <button type="button" onClick={() => setTransferType('invest')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${transferType === 'invest' ? 'bg-emerald-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><ArrowLeftRight size={16}/> Investir (Cofre &rarr; Domínio)</button>
                                             <button type="button" onClick={() => setTransferType('withdraw')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${transferType === 'withdraw' ? 'bg-indigo-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><ArrowLeftRight size={16}/> Resgatar (Domínio &rarr; Cofre)</button>
                                         </div>
                                         <div className="text-center text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Disponível no Cofre: {wallet.LO} LO</div>
                                      </>
                                  ) : (
                                      <div className="flex gap-4 p-2 bg-black/5 dark:bg-black/20 rounded-2xl">
                                          <button type="button" onClick={() => setManageType('Income')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${manageType === 'Income' ? 'bg-emerald-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><TrendingUp size={16}/> Adicionar Fundos</button>
                                          <button type="button" onClick={() => setManageType('Expense')} className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${manageType === 'Expense' ? 'bg-red-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:bg-white/10'}`}><TrendingDown size={16}/> Deduzir Fundos</button>
                                      </div>
                                  )}
    
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Quantidade (LO)</label>
                                      <input 
                                        type="number" 
                                        min="1" 
                                        className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-3xl text-center shadow-inner" 
                                        required 
                                        value={transAmount} 
                                        onChange={e => setTransAmount(Number(e.target.value))}
                                        onFocus={(e) => e.target.select()}
                                      />
                                  </div>
    
                                  {financeTab === 'manage' && (
                                      <div className="space-y-2">
                                          <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Motivo do Ajuste</label>
                                          <input type="text" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-5 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" value={transReason} onChange={e => setTransReason(e.target.value)} placeholder="Ex: Doação de Nobre..." />
                                      </div>
                                  )}
    
                                  <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-black/50 active:translate-y-1 active:border-b-0 transition-all">Confirmar Operação</button>
                              </form>
                          )}
                      </div>
                  )}

                  {/* Resolve Revolt Modal */}
                  {modalMode === 'resolveRevolt' && (
                      <div className="space-y-8 text-center animate-fade-in">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white bg-red-950 border-red-900">
                              <AlertTriangle size={40} className="text-red-500" />
                          </div>
                          <h3 className="text-3xl font-medieval text-red-900 dark:text-red-500 uppercase tracking-tighter">Sufocar Revolta</h3>
                          <div className="p-8 bg-black/5 dark:bg-black/35 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10 space-y-4">
                              <p className="font-serif italic text-lg text-fantasy-wood dark:text-fantasy-parchment">
                                  "O povo está revoltado! Para sufocar a revolta, o regente deve realizar um teste de <strong>Guerra</strong> ou <strong>Intimidação</strong> contra uma <strong>CD 20</strong>."
                              </p>
                              <div className="text-xs font-black uppercase text-red-600 dark:text-red-400">
                                  Efeitos da Falha:
                              </div>
                              <p className="text-xs font-serif text-fantasy-wood/75 dark:text-fantasy-parchment/75">
                                  Destruição da última construção erguida ({activeDomain.buildings.length > 0 ? <strong>{activeDomain.buildings[activeDomain.buildings.length - 1].name}</strong> : "Nenhuma construção para ser destruída"}). Se não houver construções, o domínio perde <strong>2d4 LO</strong> do tesouro.
                              </p>
                          </div>
                          <div className="flex gap-4">
                              <button type="button" onClick={() => {
                                  const res = resolveRevolt(activeDomain.id, false);
                                  if (res.success) {
                                      notify(res.message, 'success');
                                  } else {
                                      notify(res.message, 'error');
                                  }
                                  closeModal();
                              }} className="flex-1 bg-red-900/20 text-red-900 dark:text-red-400 py-6 rounded-[40px] font-medieval text-xl uppercase tracking-widest border-2 border-red-900/20 hover:bg-red-900/40 transition-all">
                                  Falhei no Teste
                              </button>
                              <button type="button" onClick={() => {
                                  const res = resolveRevolt(activeDomain.id, true);
                                  if (res.success) {
                                      notify(res.message, 'success');
                                  } else {
                                      notify(res.message, 'error');
                                  }
                                  closeModal();
                              }} className="flex-1 bg-emerald-800 text-white py-6 rounded-[40px] font-medieval text-xl uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all">
                                  Passei no Teste
                              </button>
                          </div>
                      </div>
                  )}

                  {/* Advisors Modal */}
                  {modalMode === 'advisors' && activeDomain && (
                      <div className="space-y-8">
                         <div className="text-center mb-6">
                            <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter mb-2">Conselho do Regente</h3>
                            <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">
                               Vagas: {activeDomain.advisors.length} / {activeDomain.court === 'Rica' ? 3 : activeDomain.court === 'Comum' ? 1 : 0}
                            </p>
                         </div>
                         
                         <div className="space-y-4">
                            {activeDomain.advisors.length === 0 && <p className="text-center py-8 text-fantasy-wood/40 dark:text-fantasy-parchment/40 italic font-serif">A corte está vazia. O regente governa só.</p>}
                            {activeDomain.advisors.map(adv => (
                               <div key={adv.id} className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl border border-purple-900/20 dark:border-purple-400/20 flex justify-between items-center group hover:border-purple-500/50 hover:bg-purple-900/5 transition-all">
                                  <div>
                                     <div className="font-medieval text-xl text-fantasy-wood dark:text-fantasy-parchment flex items-center gap-2">
                                        {adv.name}
                                        {adv.associatedType && (
                                           <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-900/20 text-purple-800 dark:bg-purple-400/20 dark:text-purple-300">
                                              {adv.associatedType === 'Member' ? 'Herói' : 'NPC'}
                                           </span>
                                        )}
                                     </div>
                                     <div className="text-xs font-black uppercase text-purple-800 dark:text-purple-400 tracking-widest mt-1">{adv.role} • Bônus em {adv.skill}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <button type="button" onClick={() => {
                                        setEditingAdvisorId(adv.id);
                                        setEditAdvisorName(adv.name);
                                        setEditAdvisorRole(adv.role);
                                        setEditAdvisorType(adv.associatedType || 'None');
                                        setEditAdvisorAssocId(adv.associatedId || '');
                                        setEditAdvisorDomainId(activeDomain.id);
                                     }} className="p-2 text-fantasy-wood/40 hover:text-purple-800 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-all" title="Editar Conselheiro">
                                        <Settings size={16}/>
                                     </button>
                                     <button type="button" onClick={() => removeAdvisor(activeDomain.id, adv.id)} className="p-2 text-fantasy-wood/40 hover:text-red-800 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-all" title="Dispensar Conselheiro">
                                        <X size={16}/>
                                     </button>
                                  </div>
                               </div>
                            ))}
                         </div>

                         {editingAdvisorId ? (
                             <form onSubmit={handleAdvisorEditSubmit} className="space-y-6 mt-8 pt-8 border-t-2 border-fantasy-wood/10 dark:border-white/10">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment">Editar Conselheiro</h4>
                                    <button type="button" onClick={() => setEditingAdvisorId(null)} className="text-xs font-bold text-red-500 hover:underline">Cancelar</button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Origem do Conselheiro</label>
                                    <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={editAdvisorType} onChange={e => {
                                        const type = e.target.value as 'Member' | 'NPC' | 'None';
                                        setEditAdvisorType(type);
                                        if (type === 'None') {
                                            setEditAdvisorAssocId('');
                                        } else if (type === 'Member') {
                                            const firstId = members[0]?.id || '';
                                            setEditAdvisorAssocId(firstId);
                                            setEditAdvisorName(members[0]?.name || '');
                                        } else if (type === 'NPC') {
                                            const firstId = npcs[0]?.id || '';
                                            setEditAdvisorAssocId(firstId);
                                            setEditAdvisorName(npcs[0]?.name || '');
                                        }
                                    }}>
                                        <option value="None" className="dark:bg-black">Nome Personalizado (Sem vínculo)</option>
                                        <option value="Member" className="dark:bg-black">Personagem Jogador (Membro da Guilda)</option>
                                        <option value="NPC" className="dark:bg-black">NPC Cadastrado (Funcionário/Prestador)</option>
                                    </select>
                                </div>

                                {editAdvisorType !== 'None' ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Selecionar Personagem/NPC</label>
                                        <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={editAdvisorAssocId} onChange={e => {
                                            const id = e.target.value;
                                            setEditAdvisorAssocId(id);
                                            if (editAdvisorType === 'Member') {
                                                setEditAdvisorName(members.find(m => m.id === id)?.name || '');
                                            } else {
                                                setEditAdvisorName(npcs.find(n => n.id === id)?.name || '');
                                            }
                                        }}>
                                            {editAdvisorType === 'Member' ? (
                                                members.length === 0 ? (
                                                    <option value="" disabled className="dark:bg-black">Nenhum herói cadastrado</option>
                                                ) : (
                                                    members.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name} ({m.status})</option>)
                                                )
                                            ) : (
                                                npcs.length === 0 ? (
                                                    <option value="" disabled className="dark:bg-black">Nenhum NPC cadastrado</option>
                                                ) : (
                                                    npcs.map(n => <option key={n.id} value={n.id} className="dark:bg-black">{n.name} ({n.role})</option>)
                                                )
                                            )}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Conselheiro</label>
                                        <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={editAdvisorName} onChange={e => setEditAdvisorName(e.target.value)} placeholder="Nome do Conselheiro" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Cargo e Perícia</label>
                                    <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={editAdvisorRole} onChange={e => setEditAdvisorRole(e.target.value as AdvisorRole)}>
                                        {ADVISOR_ROLES.map(r => <option key={r.role} value={r.role} className="dark:bg-black">{r.role} ({r.skill})</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Domínio (Movimentação)</label>
                                    <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={editAdvisorDomainId} onChange={e => setEditAdvisorDomainId(e.target.value)}>
                                        {domains.map(d => <option key={d.id} value={d.id} className="dark:bg-black">{d.name}</option>)}
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-purple-900 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-purple-950 active:translate-y-1 active:border-b-0 transition-all">Salvar Alterações</button>
                             </form>
                         ) : (
                             activeDomain.advisors.length < (activeDomain.court === 'Rica' ? 3 : activeDomain.court === 'Comum' ? 1 : 0) ? (
                                 <form onSubmit={handleAdvisorSubmit} className="space-y-6 mt-8 pt-8 border-t-2 border-fantasy-wood/10 dark:border-white/10">
                                    <h4 className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment text-center">Nomear Conselheiro</h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Origem do Conselheiro</label>
                                        <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={newAdvisorType} onChange={e => {
                                            const type = e.target.value as 'Member' | 'NPC' | 'None';
                                            setNewAdvisorType(type);
                                            if (type === 'None') {
                                                setNewAdvisorAssocId('');
                                            } else if (type === 'Member') {
                                                const firstId = members[0]?.id || '';
                                                setNewAdvisorAssocId(firstId);
                                                setCustomAdvisorName(members[0]?.name || '');
                                            } else if (type === 'NPC') {
                                                const firstId = npcs[0]?.id || '';
                                                setNewAdvisorAssocId(firstId);
                                                setCustomAdvisorName(npcs[0]?.name || '');
                                            }
                                        }}>
                                            <option value="None" className="dark:bg-black">Nome Personalizado (Sem vínculo)</option>
                                            <option value="Member" className="dark:bg-black">Personagem Jogador (Membro da Guilda)</option>
                                            <option value="NPC" className="dark:bg-black">NPC Cadastrado (Funcionário/Prestador)</option>
                                        </select>
                                    </div>

                                    {newAdvisorType !== 'None' ? (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Selecionar Personagem/NPC</label>
                                            <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={newAdvisorAssocId} onChange={e => {
                                                const id = e.target.value;
                                                setNewAdvisorAssocId(id);
                                                if (newAdvisorType === 'Member') {
                                                    setCustomAdvisorName(members.find(m => m.id === id)?.name || '');
                                                } else {
                                                    setCustomAdvisorName(npcs.find(n => n.id === id)?.name || '');
                                                }
                                            }}>
                                                {newAdvisorType === 'Member' ? (
                                                    members.length === 0 ? (
                                                        <option value="" disabled className="dark:bg-black">Nenhum herói cadastrado</option>
                                                    ) : (
                                                        members.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name} ({m.status})</option>)
                                                    )
                                                ) : (
                                                    npcs.length === 0 ? (
                                                        <option value="" disabled className="dark:bg-black">Nenhum NPC cadastrado</option>
                                                    ) : (
                                                        npcs.map(n => <option key={n.id} value={n.id} className="dark:bg-black">{n.name} ({n.role})</option>)
                                                    )
                                                )}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Conselheiro</label>
                                            <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customAdvisorName} onChange={e => setCustomAdvisorName(e.target.value)} placeholder="Ex: Lorde Baelish" />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Cargo e Perícia</label>
                                        <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl appearance-none cursor-pointer" value={customAdvisorRole} onChange={e => setCustomAdvisorRole(e.target.value as AdvisorRole)}>
                                            {ADVISOR_ROLES.map(r => <option key={r.role} value={r.role} className="dark:bg-black">{r.role} ({r.skill})</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-purple-900 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-purple-950 active:translate-y-1 active:border-b-0 transition-all">Conceder Título</button>
                                 </form>
                             ) : (
                                 <p className="text-center text-xs text-fantasy-wood/50 dark:text-fantasy-parchment/50 font-serif italic mt-8 pt-8 border-t border-fantasy-wood/10 dark:border-white/10">Limite máximo de conselheiros atingido para o nível de corte atual.</p>
                             )
                         )}
                      </div>
                  )}

                  {/* Level Up Modal — Concessão do Mestre (gratuita, sem custo de ação) */}
                  {modalMode === 'levelup' && (
                      <div className="space-y-8 text-center">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white"><Sparkles size={40}/></div>
                          <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Concessão do Mestre</h3>
                          <div className="p-8 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-[40px] border-4 border-purple-300/20 dark:border-purple-700/30">
                              <p className="font-serif italic text-lg mb-6 text-purple-800 dark:text-purple-300">"Os deuses sorriem para seu domínio. Uma bênção é concedida."</p>
                              <div className="text-2xl font-medieval text-purple-700 dark:text-purple-400 mb-2">✦ Evolução Gratuita ✦</div>
                              <div className="text-xs font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest mt-2">Nível Atual: {activeDomain.level} → {activeDomain.level + 1}</div>
                              <div className="text-xs font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Limite do Terreno: {getDomainMaxLevel(activeDomain)}</div>
                              <div className="text-xs font-black uppercase text-fantasy-wood/40 dark:text-fantasy-parchment/40 tracking-widest">Construções: {activeDomain.buildings.length}/{activeDomain.level * 3}</div>
                              <div className="text-xs font-serif text-fantasy-wood/60 dark:text-fantasy-parchment/60 mt-3 border-t border-fantasy-wood/10 dark:border-white/10 pt-3 text-center">
                                 A população estimada passará para:{' '}
                                 {
                                   (activeDomain.level + 1) <= 2 ? '1.000 a 2.500' :
                                   (activeDomain.level + 1) <= 5 ? '5.000 a 25.000' :
                                   '50.000 a 100.000'
                                 } habitantes.
                              </div>
                              <div className="text-[10px] font-black uppercase text-purple-500/50 dark:text-purple-400/50 mt-3 tracking-widest">Nenhum custo de LO ou ação de turno</div>
                          </div>
                          <button onClick={() => { if (activeDomainId) { levelUpDomain(activeDomainId); closeModal(); } }} className="w-full bg-purple-900 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-8 border-purple-950 active:translate-y-2 active:border-b-0 transition-all">
                              ✦ Conceder Evolução ✦
                          </button>
                      </div>
                  )}

                  {/* Building Modal */}
                  {modalMode === 'building' && (
                      <div className="space-y-8">
                         <div className="text-center mb-6">
                            <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter mb-2">Novo Projeto de Obra</h3>
                            <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Espaços Disponíveis: {activeDomain.level * 3 - activeDomain.buildings.length}</p>
                         </div>
                         
                         <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-full mb-6">
                            <button onClick={() => setSubTab('catalog')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'catalog' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Catálogo Oficial</button>
                            <button onClick={() => setSubTab('custom')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'custom' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Projeto Personalizado</button>
                         </div>

                         {subTab === 'catalog' ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {DOMAIN_BUILDINGS_CATALOG.map((b, i) => {
                                   const isMysticBlocked = activeDomain.isMystic && b.skill !== 'Misticismo' && b.skill !== 'Religião';
                                   return (
                                   <button key={i} onClick={() => {
                                       if (isMysticBlocked) {
                                           notify("Domínios Místicos só suportam construções de Misticismo ou Religião.", "error");
                                           return;
                                       }
                                       addDomainBuilding(activeDomain.id, b, true);
                                       closeModal();
                                   }}
                                     className={`text-left bg-white/40 dark:bg-black/20 p-5 rounded-3xl border transition-all group hover:bg-fantasy-gold/10 ${
                                       activeDomain.buildings.some(db => db.name === b.name) ? 'border-emerald-500/40 opacity-60' :
                                       isMysticBlocked ? 'border-red-500/20 opacity-50' :
                                       actionsRemaining <= 0 || activeDomain.revolt ? 'opacity-40 cursor-not-allowed border-fantasy-wood/5 dark:border-white/5' :
                                       'border-fantasy-wood/5 dark:border-white/5 hover:border-fantasy-gold'
                                     }`}
                                     disabled={activeDomain.buildings.some(db => db.name === b.name) || (!isMysticBlocked && (actionsRemaining <= 0 || activeDomain.revolt))}>
                                       <div className="flex justify-between items-start mb-2">
                                           <span className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment">{b.name}</span>
                                           <span className="text-xs font-black bg-black/10 dark:bg-white/10 px-2 py-1 rounded-md text-fantasy-wood/70 dark:text-fantasy-parchment/70">{b.costLO} LO</span>
                                       </div>
                                       <p className="text-xs text-fantasy-wood/60 dark:text-fantasy-parchment/60 italic leading-tight">{b.description}</p>
                                       <div className="mt-2 flex flex-wrap gap-1">
                                         <span className="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">{b.benefit}</span>
                                         {b.fortificationBonus > 0 && <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest ml-2">Fort +{b.fortificationBonus}</span>}
                                       </div>
                                       {b.requires.length > 0 && <div className="mt-1 text-[9px] font-mono text-fantasy-wood/40 dark:text-fantasy-parchment/40">Requer: {b.requires.join(', ')}</div>}
                                       {activeDomain.buildings.some(db => db.name === b.name) && <div className="mt-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest">✓ Já construída</div>}
                                       {isMysticBlocked && <div className="mt-1 text-[9px] font-black text-red-500 dark:text-red-400 uppercase tracking-widest">✗ Bloqueado (Misticismo/Religião)</div>}
                                   </button>
                                )})}
                             </div>
                         ) : (
                             <form onSubmit={handleCustomBuildingSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome da Obra</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customBuildName} onChange={e => setCustomBuildName(e.target.value)} placeholder="Ex: Estátua do Herói" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Descrição Temática</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" value={customBuildDesc} onChange={e => setCustomBuildDesc(e.target.value)} placeholder="Detalhes visuais..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Benefício Mecânico</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customBuildBenefit} onChange={e => setCustomBuildBenefit(e.target.value)} placeholder="Ex: +1 Moral" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo (LO)</label>
                                    <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customBuildCost} onChange={e => setCustomBuildCost(Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                </div>
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-black/5 dark:bg-black/20 rounded-2xl">
                                    <input type="checkbox" checked={customBuildPaid} onChange={e => setCustomBuildPaid(e.target.checked)} className="w-5 h-5 accent-emerald-800" />
                                    <span className="text-xs font-black uppercase text-fantasy-wood/70 dark:text-fantasy-parchment/60">Deduzir custo do Tesouro Real</span>
                                </label>
                                <button type="submit" disabled={actionsRemaining <= 0 || activeDomain.revolt} className={`w-full py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all ${actionsRemaining <= 0 || activeDomain.revolt ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-emerald-800 text-white'}`}>Erguer Estrutura</button>
                             </form>
                         )}
                      </div>
                  )}

                  {/* Unit Modal */}
                  {modalMode === 'unit' && (
                      <div className="space-y-8">
                         <div className="text-center mb-6">
                            <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter mb-2">Recrutamento Militar</h3>
                            <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Máx {activeDomain.level} unidades por ação. Manutenção por turno.</p>
                         </div>

                         <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-full mb-6">
                            <button onClick={() => setSubTab('catalog')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'catalog' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Mercenários Padrão</button>
                            <button onClick={() => setSubTab('custom')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'custom' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Tropa Especializada</button>
                         </div>

                         {subTab === 'catalog' ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DOMAIN_UNITS_CATALOG.map((u, i) => (
                                    <button key={i} onClick={() => { addDomainUnit(activeDomain.id, u, true); closeModal(); }}
                                      className={`text-left bg-white/40 dark:bg-black/20 p-5 rounded-3xl border transition-all group ${
                                        activeDomain.units.length >= activeDomain.level ? 'opacity-30 cursor-not-allowed' :
                                        actionsRemaining <= 0 || activeDomain.revolt ? 'opacity-40 cursor-not-allowed border-fantasy-wood/5 dark:border-white/5' :
                                        'border-fantasy-wood/5 dark:border-white/5 hover:border-indigo-500 hover:bg-indigo-500/10'
                                      }`}
                                      disabled={activeDomain.units.length >= activeDomain.level || actionsRemaining <= 0 || activeDomain.revolt}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment">{u.name}</span>
                                            <span className="text-xs font-black bg-black/10 dark:bg-white/10 px-2 py-1 rounded-md text-fantasy-wood/70 dark:text-fantasy-parchment/70">{u.costLO} LO</span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <span className="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">{u.type} • PWR {u.power}</span>
                                          <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Mant {u.maintenance} LO</span>
                                        </div>
                                        {u.requires && <div className="mt-1 text-[9px] font-mono text-fantasy-wood/40 dark:text-fantasy-parchment/40">Requer: {u.requires}</div>}
                                    </button>
                                ))}
                             </div>
                         ) : (
                             <form onSubmit={handleCustomUnitSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Nome do Batalhão</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customUnitName} onChange={e => setCustomUnitName(e.target.value)} placeholder="Ex: Cavaleiros do Falcão" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Tipo de Tropa</label>
                                    <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner" required value={customUnitType} onChange={e => setCustomUnitType(e.target.value)} placeholder="Ex: Infantaria Pesada" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Poder (PWR)</label>
                                        <input type="number" min="1" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner text-center" required value={customUnitPower} onChange={e => setCustomUnitPower(Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-4 tracking-widest">Custo (LO)</label>
                                        <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl shadow-inner text-center" required value={customUnitCost} onChange={e => setCustomUnitCost(Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                    </div>
                                </div>
                                <label className="flex items-center gap-4 cursor-pointer p-4 bg-black/5 dark:bg-black/20 rounded-2xl">
                                    <input type="checkbox" checked={customUnitPaid} onChange={e => setCustomUnitPaid(e.target.checked)} className="w-5 h-5 accent-indigo-800" />
                                    <span className="text-xs font-black uppercase text-fantasy-wood/70 dark:text-fantasy-parchment/60">Deduzir custo do Tesouro Real</span>
                                </label>
                                <button type="submit" disabled={actionsRemaining <= 0 || activeDomain.revolt} className={`w-full py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-indigo-950 active:translate-y-1 active:border-b-0 transition-all ${actionsRemaining <= 0 || activeDomain.revolt ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-indigo-800 text-white'}`}>Alistar Unidade</button>
                             </form>
                         )}
                      </div>
                  )}

                  {/* Action Execution Modal */}
                  {modalMode === 'action' && selectedAction && (
                      <div className="space-y-8 text-center">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white">
                            {selectedAction === 'govern' ? <Gavel size={40}/> :
                             selectedAction === 'festival' ? <Sparkles size={40}/> :
                             selectedAction === 'extort' ? <TrendingDown size={40}/> :
                             selectedAction === 'conscript' ? <Users size={40}/> :
                             selectedAction === 'taxLow' || selectedAction === 'taxMedium' || selectedAction === 'taxHigh' ? <Scale size={40}/> :
                             selectedAction === 'convert' ? <ArrowLeftRight size={40}/> :
                             selectedAction === 'increaseCourt' || selectedAction === 'decreaseCourt' ? <Building2 size={40}/> :
                             <Gavel size={40}/>}
                          </div>
                          <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">
                            {selectedAction === 'govern' ? 'Governar' :
                             selectedAction === 'festival' ? 'Realizar Festival' :
                             selectedAction === 'extort' ? 'Extorquir' :
                             selectedAction === 'conscript' ? 'Convocar Camponeses' :
                             selectedAction === 'taxLow' ? 'Impostos Baixos' :
                             selectedAction === 'taxMedium' ? 'Impostos Médios' :
                             selectedAction === 'taxHigh' ? 'Impostos Altos' :
                             selectedAction === 'convert' ? 'Converter Finanças' :
                             selectedAction === 'increaseCourt' ? 'Aumentar Corte' :
                             selectedAction === 'decreaseCourt' ? 'Diminuir Corte' : 'Ação'}
                          </h3>
                          
                          {!actionResult ? (
                              <form onSubmit={handleActionPay} className="space-y-8">
                                  <div className="bg-black/5 dark:bg-black/20 p-6 rounded-[40px] border-2 border-fantasy-wood/10 dark:border-white/10">
                                    {(selectedAction === 'taxLow' || selectedAction === 'taxMedium' || selectedAction === 'taxHigh') && (
                                       <div className="space-y-4">
                                         {(() => {
                                           const taxRow = TAX_TABLE[activeDomain.level] || { low: '1', medium: '1d3', high: '1d3+1' };
                                           return (
                                             <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-full mb-4">
                                               <button type="button" onClick={() => setTaxLevel('taxLow')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${taxLevel === 'taxLow' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Baixos ({taxRow.low})</button>
                                               <button type="button" onClick={() => setTaxLevel('taxMedium')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${taxLevel === 'taxMedium' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Médios ({taxRow.medium})</button>
                                               <button type="button" onClick={() => setTaxLevel('taxHigh')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${taxLevel === 'taxHigh' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>Altos ({taxRow.high})</button>
                                             </div>
                                           );
                                         })()}
                                         <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80 mb-4">
                                           {taxLevel === 'taxLow' ? 'Impostos baixos: o povo ama seu regente. +1 Popularidade.' :
                                            taxLevel === 'taxMedium' ? 'Impostos médios: justos e equilibrados. Sem alteração de popularidade.' :
                                            'Impostos altos: mais LO, mas o povo reclama. -1 Popularidade.'}
                                         </p>
                                         <div className="flex items-center justify-center gap-4">
                                           <label className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Rolagem na Mesa:</label>
                                           <input type="number" min="1" className="w-24 bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/20 dark:border-white/20 rounded-2xl py-3 text-center font-medieval text-3xl text-fantasy-wood dark:text-fantasy-gold" value={diceInput} onChange={e => setDiceInput(Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                         </div>
                                       </div>
                                     )}
                                    {selectedAction === 'extort' && (
                                      <div className="space-y-4">
                                        <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80 mb-4">
                                          Informe o resultado do dado (1d6 + nível do domínio):
                                        </p>
                                        <div className="flex items-center justify-center gap-4">
                                          <label className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Resultado:</label>
                                          <input type="number" min="1" className="w-24 bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/20 dark:border-white/20 rounded-2xl py-3 text-center font-medieval text-3xl text-fantasy-wood dark:text-fantasy-gold" value={diceInput} onChange={e => setDiceInput(Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                        </div>
                                      </div>
                                    )}
                                    {selectedAction === 'convert' && (
                                      <div className="space-y-4">
                                        <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80 mb-2">"Taxa de câmbio: T$ 1.000 = 1 LO"</p>
                                        <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-full mb-4">
                                          <button type="button" onClick={() => setConvertDirection('toDomain')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${convertDirection === 'toDomain' ? 'bg-emerald-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>T$ &rarr; LO</button>
                                          <button type="button" onClick={() => setConvertDirection('toGuild')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${convertDirection === 'toGuild' ? 'bg-indigo-800 text-white shadow-md' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40'}`}>LO &rarr; T$</button>
                                        </div>
                                        <div className="flex items-center justify-center gap-4">
                                          <label className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Valor (LO):</label>
                                          <input type="number" min="0" className="w-24 bg-white/60 dark:bg-black/40 border-2 border-fantasy-wood/20 dark:border-white/20 rounded-2xl py-3 text-center font-medieval text-3xl text-fantasy-wood dark:text-fantasy-gold" value={convertAmount} onChange={e => setConvertAmount(Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                        </div>
                                        <div className="text-xs font-mono text-fantasy-wood/50 dark:text-fantasy-parchment/50">
                                          {convertDirection === 'toDomain' ? `${wallet.TS} T$ disponíveis → até ${Math.floor(wallet.TS / 1000)} LO` : `${activeDomain.treasury} LO no tesouro`}
                                        </div>
                                      </div>
                                    )}
                                    {selectedAction === 'govern' && (
                                      <div className="space-y-3">
                                        <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Com teste bem-sucedido, o domínio sobe de nível."</p>
                                        <div className="text-xs font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/50">
                                          Custo: {activeDomain.level * 20} LO | Próximo Nível: {activeDomain.level + 1}
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-indigo-500/60 dark:text-indigo-400/50 tracking-widest">
                                          Consome 1 ação de turno • +1 Popularidade se bem-sucedido
                                        </div>
                                      </div>
                                    )}
                                    {selectedAction === 'festival' && (
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Uma grande festa para alegrar o povo. Custo: 1 LO."</p>
                                    )}
                                    {selectedAction === 'conscript' && (
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"O povo pega em armas para defender o domínio. Custo: 1 LO. -1 Popularidade."</p>
                                    )}
                                    {selectedAction === 'taxLow' && (
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Impostos baixos: o povo ama seu regente. +1 Popularidade."</p>
                                    )}
                                    {selectedAction === 'taxMedium' && (
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Impostos médios: justos e equilibrados. Sem alteração de popularidade."</p>
                                    )}
                                    {selectedAction === 'taxHigh' && (
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Impostos altos: mais LO, mas o povo reclama. -1 Popularidade."</p>
                                    )}
                                    {selectedAction === 'increaseCourt' && (
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Contrate servos e cortesãos para melhorar sua corte. Custo: 1 LO."</p>
                                    )}
                                    {selectedAction === 'decreaseCourt' && (
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Reduza o tamanho da corte para economizar."</p>
                                    )}
                                  </div>

                                  {renderActionTestInfo(selectedAction)}

                                  <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-black/50 active:translate-y-1 active:border-b-0 transition-all">
                                    Declarar Ação (Pagar Custo)
                                  </button>
                              </form>
                          ) : (
                              <div className="space-y-8 animate-fade-in">
                                  <div className={`p-8 rounded-[40px] border-4 ${actionResult.success ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-red-900/10 border-red-900/20'}`}>
                                      <h4 className={`text-4xl font-medieval uppercase tracking-widest mb-2 ${actionResult.success ? 'text-emerald-900 dark:text-emerald-400' : 'text-red-900 dark:text-red-400'}`}>{actionResult.success ? (actionPhase === 'pay' ? 'Custo Pago!' : 'Sucesso!') : 'Falha!'}</h4>
                                      <div className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment my-4">{actionResult.message}</div>
                                      {actionResult.details && actionResult.details.length > 0 && (
                                        <div className="space-y-2 text-left bg-white/40 dark:bg-black/20 p-6 rounded-3xl text-xs font-mono opacity-80">
                                            {actionResult.details.map((d, i) => <div key={i}>• {d}</div>)}
                                        </div>
                                      )}
                                  </div>
                                  {actionResult.success && actionPhase === 'pay' && selectedAction !== 'convert' && (
                                    <div className="flex gap-4">
                                      <button type="button" onClick={closeModal} className="flex-1 bg-red-900/20 text-red-900 dark:text-red-400 py-6 rounded-[40px] font-medieval text-xl uppercase tracking-widest border-2 border-red-900/20 hover:bg-red-900/40 transition-all">
                                        Falhei na Rolagem (Encerrar)
                                      </button>
                                      <button type="button" onClick={handleActionSuccess} className="flex-1 bg-emerald-800 text-white py-6 rounded-[40px] font-medieval text-xl uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all">
                                        Passei no Teste (Aplicar Sucesso)
                                      </button>
                                    </div>
                                  )}
                                  {(!actionResult.success || actionPhase === 'success' || selectedAction === 'convert') && (
                                    <button onClick={closeModal} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl">Encerrar</button>
                                  )}
                              </div>
                          )}
                      </div>
                  )}

                  {/* Event Modal */}
                  {modalMode === 'event' && (
                      <div className="space-y-8">
                          <div className="text-center">
                              <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white bg-amber-900 border-amber-950"><Dices size={40}/></div>
                              <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Eventos do Turno</h3>
                              {activeDomain && activeDomain.level < 3 ? (
                                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-3xl text-sm font-serif italic text-left">
                                      ⚠️ <strong>Regra de Tormenta 20:</strong> Domínios de nível 1 ou 2 são muito pequenos e pacatos para serem afetados por eventos aleatórios (p. 323). 
                                      <br/><span className="text-xs opacity-80">Você pode prosseguir apenas se o mestre desejar aplicar eventos sob regras customizadas.</span>
                                  </div>
                              ) : (
                                  <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest mt-2">Role 1d% fora do app e clique no evento correspondente</p>
                              )}
                          </div>

                          {/* Result display after applying */}
                          {eventResult ? (
                              <div className="space-y-6 animate-bounce-in">
                                  <div className={`p-8 rounded-[40px] border-4 ${eventResult.success ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-red-900/10 border-red-900/20'}`}>
                                      <h4 className={`text-2xl font-medieval uppercase tracking-widest mb-4 ${eventResult.success ? 'text-emerald-900 dark:text-emerald-400' : 'text-red-900 dark:text-red-400'}`}>
                                          {eventResult.success ? '✅ Evento Aplicado!' : '❌ Falha'}
                                      </h4>
                                      <p className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-parchment mb-4">{eventResult.message}</p>
                                      {eventResult.details && eventResult.details.length > 0 && (
                                          <ul className="space-y-2 text-sm font-serif text-fantasy-wood/80 dark:text-fantasy-parchment/80 bg-black/5 dark:bg-black/20 rounded-2xl p-4">
                                              {eventResult.details.map((d, i) => <li key={i}>• {d}</li>)}
                                          </ul>
                                      )}
                                  </div>
                                  <button onClick={closeModal} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl">Fechar</button>
                              </div>
                          ) : !selectedEvent ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                  {RANDOM_EVENTS_TABLE.map((evt, i) => (
                                      <button key={i} onClick={() => { setSelectedEvent(evt); setEventBoonChoice('lo'); setEventInvasionRoll(1); setEventLOAmount(1); setEventPenaltyValue(2); }}
                                        className={`text-left bg-white/40 dark:bg-black/20 p-4 rounded-3xl border transition-all hover:bg-fantasy-gold/10 ${
                                          evt.impact === 'none' ? 'border-fantasy-wood/5 dark:border-white/5 hover:border-fantasy-gold/30' :
                                          evt.impact === 'boon' ? 'border-emerald-500/30 hover:border-emerald-500' :
                                          evt.impact === 'disaster' ? 'border-red-500/30 hover:border-red-500' :
                                          evt.impact === 'invasion' ? 'border-red-700/30 hover:border-red-700' :
                                          'border-fantasy-wood/5 dark:border-white/5 hover:border-amber-500'
                                        }`}>
                                          <div className="flex justify-between items-start mb-1">
                                              <span className="font-medieval text-sm text-fantasy-wood dark:text-fantasy-parchment">{evt.name}</span>
                                              <span className="text-[10px] font-mono text-fantasy-wood/40 dark:text-fantasy-parchment/40">{evt.range[0]}-{evt.range[1]}%</span>
                                          </div>
                                          <p className="text-[10px] text-fantasy-wood/60 dark:text-fantasy-parchment/60 italic">{evt.description}</p>
                                          <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                            evt.impact === 'boon' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                            evt.impact === 'none' ? 'bg-gray-500/10 text-gray-500' :
                                            evt.impact === 'disaster' || evt.impact === 'invasion' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                                            evt.impact === 'penalty' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                            'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                          }`}>{evt.impact}</span>
                                      </button>
                                  ))}
                              </div>
                          ) : (
                              <div className="space-y-6 animate-bounce-in">
                                  <div className={`p-6 rounded-[32px] border-4 ${
                                    selectedEvent.impact === 'boon' ? 'bg-emerald-900/10 border-emerald-900/20' :
                                    selectedEvent.impact === 'disaster' || selectedEvent.impact === 'invasion' ? 'bg-red-900/10 border-red-900/20' :
                                    'bg-black/5 dark:bg-black/30 border-fantasy-wood/10 dark:border-white/10'
                                  }`}>
                                      <h4 className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-1">{selectedEvent.name}</h4>
                                      <p className="font-serif italic text-sm mb-3">"{selectedEvent.description}"</p>
                                      <div className="text-xs font-mono bg-black/10 dark:bg-white/10 rounded-xl px-4 py-2">{selectedEvent.effect}</div>
                                  </div>

                                  {/* BOON — choose bonus type */}
                                  {selectedEvent.impact === 'boon' && (
                                      <div className="space-y-4">
                                          <p className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Escolha o tipo de bônus a receber:</p>
                                          <div className="grid grid-cols-3 gap-3">
                                              {([['lo', '💰 Lingotes de Ouro'], ['popularity', '❤️ Popularidade'], ['modifier', '⚡ Modificador']] as const).map(([val, label]) => (
                                                  <button key={val} type="button" onClick={() => setEventBoonChoice(val)}
                                                      className={`py-3 px-2 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                                                          eventBoonChoice === val ? 'bg-emerald-800 border-emerald-950 text-white shadow-lg' : 'bg-white/20 dark:bg-black/20 text-fantasy-wood/60 dark:text-fantasy-parchment/60 border-fantasy-wood/10 dark:border-white/10 hover:bg-black/10'
                                                      }`}>{label}</button>
                                              ))}
                                          </div>
                                          {eventBoonChoice === 'lo' && (
                                              <div className="space-y-2">
                                                  <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">LO a receber (role 1d6 na mesa):</label>
                                                  <input type="number" min="1" max="20" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-xl text-center" value={eventLOAmount} onChange={e => setEventLOAmount(Number(e.target.value))} onFocus={e => e.target.select()} />
                                              </div>
                                          )}
                                      </div>
                                  )}

                                  {/* INVASION — enter dice roll */}
                                  {selectedEvent.impact === 'invasion' && (
                                      <div className="space-y-3">
                                          <p className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400">Invasão! Role os dados na mesa e informe o resultado:</p>
                                          <div className="text-xs font-mono bg-black/10 dark:bg-white/10 rounded-xl px-4 py-2">
                                              {selectedEvent.effect.includes('1d12') ? 'Role 1d12 × Nível do domínio' : 'Role 1d8 × Nível do domínio'}
                                          </div>
                                          <div className="space-y-2">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Resultado dado (d8 ou d12):</label>
                                              <input type="number" min="1" max="12" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-xl text-center" value={eventInvasionRoll} onChange={e => setEventInvasionRoll(Number(e.target.value))} onFocus={e => e.target.select()} />
                                          </div>
                                          <p className="text-xs font-serif italic text-fantasy-wood/60 dark:text-fantasy-parchment/60">
                                              Poder do inimigo calculado: {eventInvasionRoll} × {activeDomain?.level ?? 1} = <strong>{eventInvasionRoll * (activeDomain?.level ?? 1)}</strong>
                                          </p>
                                      </div>
                                  )}

                                  {/* PENALTY — show what will be deducted */}
                                  {selectedEvent.impact === 'penalty' && (
                                      <div className="space-y-3">
                                          <p className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Penalidade de ação aplicada:</p>
                                          <div className="space-y-2">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Pontos a reduzir do Modificador de Ação:</label>
                                              <input type="number" min="1" max="10" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-xl text-center" value={eventPenaltyValue} onChange={e => setEventPenaltyValue(Number(e.target.value))} onFocus={e => e.target.select()} />
                                          </div>
                                          <p className="text-xs font-serif italic text-fantasy-wood/60 dark:text-fantasy-parchment/60">O modificador de ação atual ({activeDomain?.actionModifier ?? 0}) será reduzido em {eventPenaltyValue}.</p>
                                      </div>
                                  )}

                                  {/* DISASTER — show what will happen */}
                                  {selectedEvent.impact === 'disaster' && activeDomain && (
                                      <div className="p-4 bg-red-900/10 border-2 border-red-900/20 rounded-2xl text-xs font-mono space-y-1">
                                          <div className="text-red-700 dark:text-red-400 font-black">⚠️ Efeitos a serem aplicados:</div>
                                          {activeDomain.level > 1 ? <div>• Nível do domínio: {activeDomain.level} → {activeDomain.level - 1}</div> : <div>• Nível já no mínimo (1), sem queda.</div>}
                                          {activeDomain.buildings.length > 0 ? <div>• 1 construção aleatória será destruída</div> : <div>• Nenhuma construção para destruir</div>}
                                      </div>
                                  )}

                                  {/* POPULARITY — show new value */}
                                  {selectedEvent.impact === 'popularity' && activeDomain && !activeDomain.isMystic && (() => {
                                      const match = selectedEvent.effect.match(/([+-]?\d+)\s*popularidade/i);
                                      const delta = match ? parseInt(match[1]) : -1;
                                      const idx = POPULARITY_LEVELS.indexOf(activeDomain.popularity as PopularityType);
                                      const newIdx = Math.max(0, Math.min(POPULARITY_LEVELS.length - 1, idx + delta));
                                      return (
                                          <div className="p-4 bg-amber-900/10 border-2 border-amber-900/20 rounded-2xl text-xs font-mono">
                                              Popularidade: {activeDomain.popularity} → <strong>{POPULARITY_LEVELS[newIdx]}</strong>
                                              {POPULARITY_LEVELS[newIdx] === 'Odiado' && <span className="ml-2 text-red-600 dark:text-red-400 font-black">⚠️ REVOLTA DEFLAGRADA!</span>}
                                          </div>
                                      );
                                  })()}

                                  {/* TREASURY — show range */}
                                  {selectedEvent.impact === 'treasury' && (
                                      <div className="p-4 bg-amber-900/10 border-2 border-amber-900/20 rounded-2xl text-xs font-mono">
                                          Será deduzido um valor aleatório conforme: {selectedEvent.effect}
                                      </div>
                                  )}

                                  {/* NONE */}
                                  {selectedEvent.impact === 'none' && (
                                      <div className="p-4 bg-green-900/10 border-2 border-green-900/20 rounded-2xl text-xs font-mono text-center text-green-700 dark:text-green-400">
                                          ✅ Nenhum evento — o domínio continua estável.
                                      </div>
                                  )}

                                  <div className="flex gap-4">
                                    <button onClick={() => setSelectedEvent(null)} className="flex-1 bg-fantasy-wood/20 text-fantasy-wood dark:text-fantasy-parchment py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest">Voltar</button>
                                    <button onClick={handleEventApply} className="flex-1 bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest shadow-xl">Aplicar Efeitos</button>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Crisis Modal */}
                  {modalMode === 'crisis' && (
                      <div className="space-y-8 text-center">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white bg-red-900 border-red-950"><Zap size={40}/></div>
                          <h3 className="text-3xl font-medieval text-red-900 dark:text-red-500 uppercase tracking-tighter">Evento Aleatório</h3>
                          
                          {!activeCrisis ? (
                              <div className="space-y-8">
                                  <p className="text-lg font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">"Os ventos da mudança sopram sobre o domínio..."</p>
                                  <button onClick={rollCrisis} className="w-full bg-red-800 text-white py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all">
                                      Consultar os Presságios
                                  </button>
                              </div>
                          ) : (
                              <div className="space-y-8 animate-bounce-in">
                                  <div className="p-8 bg-black/5 dark:bg-black/30 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/10">
                                      <h4 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment mb-4">{activeCrisis.name}</h4>
                                      <p className="font-serif italic text-lg mb-6">"{activeCrisis.details}"</p>
                                      <div className="inline-block px-6 py-2 bg-red-900/20 text-red-900 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-widest">
                                          Impacto: {activeCrisis.value > 0 ? '+' : ''}{activeCrisis.value} em {activeCrisis.impact}
                                      </div>
                                  </div>
                                  <button onClick={applyCrisis} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl">Aceitar o Destino</button>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Losses Modal */}
                  {modalMode === 'losses' && (
                      <div className="space-y-8 text-center animate-fade-in">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white bg-red-900 border-red-950"><Swords size={40}/></div>
                          <h3 className="text-3xl font-medieval text-red-900 dark:text-red-500 uppercase tracking-tighter">Assistente de Batalha</h3>
                          
                          <div className="p-6 bg-black/5 dark:bg-black/20 rounded-[32px] border-4 border-fantasy-wood/10 dark:border-white/10 text-left space-y-4 text-xs font-mono">
                             <div>• Poder Militar do Regente: {activeDomain.units.reduce((s, u) => s + (u.power || 0), 0)}</div>
                             <div>• Fortificação do Domínio: {activeDomain.buildings.reduce((s, b) => s + (b.fortificationBonus || 0), 0)}</div>
                             <div className="text-sm font-medieval border-t-2 border-fantasy-wood/10 dark:border-white/10 pt-2 text-fantasy-gold">
                                Total Regent Power: {activeDomain.units.reduce((s, u) => s + (u.power || 0), 0) + activeDomain.buildings.reduce((s, b) => s + (b.fortificationBonus || 0), 0)}
                             </div>
                             <div className="space-y-2 mt-3 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Inserir Poder do Inimigo</label>
                                <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl text-center" value={enemyPower} onChange={e => setEnemyPower(Number(e.target.value))} onFocus={e => e.target.select()} />
                             </div>
                             <div className="text-sm font-medieval text-indigo-900 dark:text-indigo-400">
                                Modificador para Teste de Guerra: {
                                  (activeDomain.units.reduce((s, u) => s + (u.power || 0), 0) + activeDomain.buildings.reduce((s, b) => s + (b.fortificationBonus || 0), 0)) - enemyPower
                                }
                             </div>
                          </div>

                          <div className="space-y-3 text-left">
                             <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Resultado da Batalha (Mesa)</label>
                             <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: 'Vitória por 10+', code: 'victory10' },
                                  { label: 'Vitória por 5+', code: 'victory5' },
                                  { label: 'Vitória Simples', code: 'victory' },
                                  { label: 'Derrota Simples', code: 'defeat' },
                                  { label: 'Derrota por 5+', code: 'defeat5' },
                                  { label: 'Derrota por 10+', code: 'defeat10' },
                                ].map((outcome) => (
                                  <button key={outcome.code} type="button" onClick={() => handleOutcomeSelect(outcome.code as any)}
                                    className={`py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                                      battleOutcome === outcome.code ? 'bg-red-800 border-red-950 text-white shadow-lg' : 'bg-fantasy-wood/5 dark:bg-white/5 text-fantasy-wood/50 dark:text-fantasy-parchment/50 border-fantasy-wood/10 dark:border-white/10 hover:bg-black/10'
                                    }`}>
                                    {outcome.label}
                                  </button>
                                ))}
                             </div>
                          </div>

                          <form onSubmit={handleApplyLosses} className="space-y-6 text-left border-t-2 border-fantasy-wood/10 dark:border-white/10 pt-6">
                              <h4 className="text-lg font-medieval uppercase tracking-widest text-fantasy-gold mb-2 text-center">Detalhamento das Perdas</h4>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Tesouro Perdido (LO)</label>
                                    <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl text-center" value={lossLO} onChange={e => setLossLO(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nível Perdido (S/N)</label>
                                    <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl text-center appearance-none" value={lossLevel} onChange={e => setLossLevel(Number(e.target.value))}>
                                       <option value={0}>Não</option>
                                       <option value={1}>Sim (-1 Nível)</option>
                                    </select>
                                </div>
                              </div>
                              
                              {activeDomain.units.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Unidades Perdidas ({lossUnits.length} selecionadas)</label>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar p-2 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] bg-white/20 dark:bg-black/20">
                                      {activeDomain.units.map(u => (
                                        <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                                          <input type="checkbox" checked={lossUnits.includes(u.id)} onChange={(e) => {
                                            if (e.target.checked) setLossUnits([...lossUnits, u.id]);
                                            else setLossUnits(lossUnits.filter(id => id !== u.id));
                                          }} className="accent-red-800 w-5 h-5" />
                                          <span className="font-serif text-sm text-fantasy-wood dark:text-fantasy-parchment">{u.name} ({u.type})</span>
                                        </label>
                                      ))}
                                    </div>
                                </div>
                              )}

                              {activeDomain.buildings.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Construções Destruídas ({lossBuildings.length} selecionadas)</label>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar p-2 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] bg-white/20 dark:bg-black/20">
                                      {activeDomain.buildings.map(b => (
                                        <label key={b.id} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                                          <input type="checkbox" checked={lossBuildings.includes(b.id)} onChange={(e) => {
                                            if (e.target.checked) setLossBuildings([...lossBuildings, b.id]);
                                            else setLossBuildings(lossBuildings.filter(id => id !== b.id));
                                          }} className="accent-red-800 w-5 h-5" />
                                          <span className="font-serif text-sm text-fantasy-wood dark:text-fantasy-parchment">{b.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                </div>
                              )}

                              <button type="submit" className="w-full bg-red-950 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-red-900 active:translate-y-1 active:border-b-0 transition-all">Aplicar Perdas de Batalha</button>
                          </form>
                      </div>
                  )}

                  {/* Caravan Dispatcher Modal */}
                  {modalMode === 'caravan' && (
                      <div className="space-y-8 text-center animate-fade-in">
                          <div className="wax-seal w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white bg-amber-900 border-amber-950"><TrendingUp size={40}/></div>
                          <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Despachar Caravana</h3>
                          
                          {activeDomain.isMystic ? (
                              <div className="space-y-6">
                                  <div className="p-6 bg-red-900/10 border-2 border-red-900/20 rounded-[32px] text-center space-y-4">
                                      <p className="text-base font-medieval text-red-700 dark:text-red-400 uppercase tracking-widest">
                                         Domínio Místico
                                      </p>
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                         Domínios Místicos não realizam caravanas comerciais terrestres.
                                      </p>
                                  </div>
                                  <button type="button" onClick={closeModal} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest shadow-xl">
                                     Voltar
                                  </button>
                              </div>
                          ) : !activeDomain.buildings.some((b: any) => b.name === 'Caravançará') ? (
                              <div className="space-y-6">
                                  <div className="p-6 bg-amber-900/10 border-2 border-amber-900/20 rounded-[32px] text-center space-y-4">
                                      <p className="text-base font-medieval text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                         Requer Caravançará
                                      </p>
                                      <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                         Para despachar uma caravana comercial, você precisa primeiro construir o prédio <strong>Caravançará</strong> neste domínio.
                                      </p>
                                  </div>
                                  <button type="button" onClick={closeModal} className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest shadow-xl">
                                     Voltar
                                  </button>
                              </div>
                          ) : (
                              <>
                                  <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">
                                     Caravançará Comercial (Requer Bazar e Estrada)
                                  </p>

                                  <div className="p-6 bg-black/5 dark:bg-black/20 rounded-[32px] border-4 border-fantasy-wood/10 dark:border-white/10 text-left space-y-4">
                                     <p className="text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                        "O Caravançará permite organizar expedições comerciais. Você investe recursos e dados para retornos futuros."
                                     </p>
                                     <div className="text-xs font-mono text-fantasy-wood/60 dark:text-fantasy-parchment/60">
                                        • Limite de dados (d4): {activeDomain.level} (Baseado no nível do domínio)
                                     </div>
                                  </div>

                                  <form onSubmit={(e) => {
                                     e.preventDefault();
                                     if (activeDomain.treasury < caravanInvestLO) {
                                       notify("Tesouro do domínio insuficiente.", "error");
                                       return;
                                     }
                                     const res = executeDomainAction(activeDomain.id, 'caravan', 'pay', { value: caravanInvestLO, diceResult: caravanDice });
                                     if (res.success) {
                                       notify(res.message);
                                       closeModal();
                                     } else {
                                       notify(res.message, 'error');
                                     }
                                  }} className="space-y-6 text-left">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Lingotes de Ouro (LO) a investir</label>
                                            <input type="number" min="1" max={activeDomain.treasury} className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl text-center shadow-inner" required value={caravanInvestLO} onChange={e => setCaravanInvestLO(Number(e.target.value))} onFocus={e => e.target.select()} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Quantidade de Dados (d4)</label>
                                            <input type="number" min="1" max={activeDomain.level} className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl text-center shadow-inner" required value={caravanDice} onChange={e => setCaravanDice(Number(e.target.value))} onFocus={e => e.target.select()} />
                                        </div>
                                      </div>

                                      <div className="p-4 bg-black/5 dark:bg-black/20 rounded-2xl text-xs font-mono text-center">
                                        Nobreza CD: {20 + caravanDice} | Custo: {caravanInvestLO} LO
                                      </div>

                                      <button type="submit" disabled={actionsRemaining <= 0 || activeDomain.revolt} className={`w-full py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-amber-950 active:translate-y-1 active:border-b-0 transition-all ${actionsRemaining <= 0 || activeDomain.revolt ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-amber-800 text-white'}`}>Enviar Expedição Comercial</button>
                                  </form>
                              </>
                          )}
                      </div>
                  )}

                  {/* Bonuses Modal */}
                  {modalMode === 'bonuses' && (
                      <div className="space-y-8">
                          <div className="text-center mb-6">
                              <h3 className="text-3xl font-medieval text-purple-900 dark:text-purple-400 uppercase tracking-tighter">Resumo de Bônus</h3>
                              <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Efeitos passivos fornecidos por este domínio</p>
                          </div>
                          
                          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                             {activeDomain.isMystic && (
                               <div className="p-6 bg-purple-900/10 border-2 border-purple-900/20 rounded-3xl">
                                  <h4 className="font-medieval text-xl text-purple-900 dark:text-purple-400 mb-2 flex items-center gap-2"><Sparkles size={18}/> Domínio Místico</h4>
                                  <ul className="space-y-2 text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                    <li>• +{activeDomain.magicPowerLevel || 0} Pontos de Mana (Passivo contínuo)</li>
                                    <li>• Potencial Mágico Máximo do Terreno: {getDomainMagicPotential(activeDomain)}</li>
                                  </ul>
                               </div>
                             )}

                             {activeDomain.court !== 'Inexistente' && (
                               <div className="p-6 bg-fantasy-gold/10 border-2 border-fantasy-gold/20 rounded-3xl">
                                  <h4 className="font-medieval text-xl text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2"><Crown size={18}/> Corte {activeDomain.court}</h4>
                                  <ul className="space-y-2 text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                    {COURT_DATA[activeDomain.court]?.bonus?.split(', ').map((b, i) => <li key={i}>• {b}</li>)}
                                    {activeDomain.advisors?.map(a => <li key={a.id}>• Conselheiro {a.name} ({a.role}): Considerado treinado em {a.skill} (para Ações de Domínio)</li>)}
                                  </ul>
                               </div>
                             )}

                             {activeDomain.buildings.length > 0 && (
                               <div className="p-6 bg-amber-900/10 border-2 border-amber-900/20 rounded-3xl">
                                  <h4 className="font-medieval text-xl text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2"><Building2 size={18}/> Construções</h4>
                                  <ul className="space-y-2 text-sm font-serif italic text-fantasy-wood/80 dark:text-fantasy-parchment/80">
                                    {activeDomain.buildings.map(b => <li key={b.id}>• <strong>{b.name}:</strong> {b.benefit}</li>)}
                                  </ul>
                               </div>
                             )}
                          </div>
                      </div>
                  )}

                  {/* Pending Tasks Modal */}
                  {modalMode === 'pending' && (
                      <div className="space-y-8">
                          <div className="text-center mb-6">
                             <h3 className="text-3xl font-medieval text-orange-900 dark:text-orange-400 uppercase tracking-tighter mb-2">Pendências</h3>
                             <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">
                                Acompanhe e atualize ações assíncronas (ex: Caravanas, Construções)
                             </p>
                          </div>
                          
                          {selectedCaravanTask ? (
                              <div className="space-y-6 animate-bounce-in">
                                 <h4 className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment text-center">Resolver {selectedCaravanTask.name}</h4>
                                 <p className="text-xs font-serif italic text-fantasy-wood/70 dark:text-fantasy-parchment/70 text-center">
                                   {selectedCaravanTask.description}
                                 </p>
                                 <div className="space-y-4">
                                   <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Total Retornado ao Tesouro (LO)</label>
                                     <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl text-center shadow-inner" value={resolveCaravanProfit} onChange={e => setResolveCaravanProfit(Number(e.target.value))} onFocus={e => e.target.select()} />
                                     <span className="text-[10px] font-serif italic text-fantasy-wood/40 dark:text-fantasy-parchment/40 block text-center mt-1">
                                       Sucesso: Digite o investimento inicial + lucro rolado na mesa. Falha: Digite 0 LO.
                                     </span>
                                   </div>
                                   <div className="flex flex-col sm:flex-row gap-4">
                                      <button type="button" onClick={() => setSelectedCaravanTask(null)} className="flex-1 bg-fantasy-wood/20 text-fantasy-wood dark:text-fantasy-parchment py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest hover:bg-fantasy-wood/30 transition-all">
                                        Voltar
                                      </button>
                                      <button type="button" onClick={() => {
                                        if (confirm("Marcar esta caravana como fracassada? O investimento inicial será totalmente perdido.")) {
                                          resolveCaravan(activeDomain.id, selectedCaravanTask.id, 0);
                                          setSelectedCaravanTask(null);
                                        }
                                      }} className="flex-1 bg-red-950 text-white py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest shadow-xl border-b-4 border-red-900 active:translate-y-1 active:border-b-0 hover:bg-red-900 transition-all">
                                        Caravana Fracassada
                                      </button>
                                      <button type="button" onClick={() => {
                                        resolveCaravan(activeDomain.id, selectedCaravanTask.id, resolveCaravanProfit);
                                        setSelectedCaravanTask(null);
                                      }} className="flex-1 bg-emerald-800 text-white py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 hover:bg-emerald-700 transition-all">
                                        Confirmar Retorno
                                      </button>
                                    </div>
                                 </div>
                              </div>
                          ) : editingTaskId ? (
                              <form onSubmit={(e) => {
                                  e.preventDefault();
                                  updatePendingTask(activeDomain.id, editingTaskId, {
                                      status: editTaskStatus,
                                      progress: editTaskProgress,
                                      note: editTaskNote
                                  });
                                  setEditingTaskId(null);
                                  setEditTaskNote('');
                              }} className="space-y-6 text-left">
                                  <h4 className="text-xl font-medieval text-fantasy-gold uppercase text-center">Evoluir Pendência</h4>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Status</label>
                                      <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-4 font-medieval text-xl appearance-none" value={editTaskStatus} onChange={e => setEditTaskStatus(e.target.value as TaskStatus)}>
                                          <option value="Pendente" className="dark:bg-black">Pendente</option>
                                          <option value="Em Progresso" className="dark:bg-black">Em Progresso</option>
                                          <option value="Concluido" className="dark:bg-black">Concluído</option>
                                          <option value="Cancelado" className="dark:bg-black">Cancelado</option>
                                      </select>
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Progresso ({editTaskProgress}%)</label>
                                      <input type="range" min="0" max="100" className="w-full accent-amber-800" value={editTaskProgress} onChange={e => setEditTaskProgress(Number(e.target.value))} />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nota de Evolução (Histórico)</label>
                                      <textarea className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-2xl p-4 font-serif text-sm" placeholder="Ex: Construção pausada por falta de materiais..." value={editTaskNote} onChange={e => setEditTaskNote(e.target.value)} />
                                  </div>
                                  <div className="flex gap-4">
                                      <button type="button" onClick={() => setEditingTaskId(null)} className="flex-1 bg-fantasy-wood/20 text-fantasy-wood dark:text-fantasy-parchment py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest">
                                          Voltar
                                      </button>
                                      <button type="submit" className="flex-1 bg-emerald-800 text-white py-4 rounded-[40px] font-medieval text-lg uppercase tracking-widest shadow-xl">
                                          Salvar Evolução
                                      </button>
                                  </div>
                              </form>
                          ) : (
                              <div className="space-y-6 text-left">
                                  {(!activeDomain.pendingTasks || activeDomain.pendingTasks.length === 0) ? (
                                      <p className="text-center font-serif italic text-fantasy-wood/60 dark:text-fantasy-parchment/60 py-6">Nenhuma pendência ou tarefa assíncrona registrada.</p>
                                  ) : (
                                      <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                                          {activeDomain.pendingTasks.map(task => (
                                              <div key={task.id} className="p-4 bg-black/5 dark:bg-black/25 rounded-2xl border border-fantasy-wood/10 dark:border-white/10 space-y-3">
                                                  <div className="flex justify-between items-start">
                                                      <div>
                                                          <h4 className="font-medieval text-lg text-fantasy-wood dark:text-fantasy-gold">{task.name}</h4>
                                                          <p className="text-xs font-serif text-fantasy-wood/75 dark:text-fantasy-parchment/75">{task.description}</p>
                                                      </div>
                                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                          task.status === 'Concluido' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                                                          task.status === 'Cancelado' ? 'bg-red-950/40 text-red-400 border border-red-500/20' :
                                                          task.status === 'Em Progresso' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/20' :
                                                          'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                                                      }`}>
                                                          {task.status || 'Pendente'}
                                                      </span>
                                                  </div>
                                                  
                                                  <div className="space-y-1">
                                                      <div className="flex justify-between text-[10px] font-mono text-fantasy-wood/50 dark:text-fantasy-parchment/50">
                                                          <span>Progresso</span>
                                                          <span>{task.progress || 0}%</span>
                                                      </div>
                                                      <div className="w-full bg-black/20 dark:bg-black/40 rounded-full h-2 overflow-hidden">
                                                          <div className="bg-amber-800 h-full transition-all duration-300" style={{ width: `${task.progress || 0}%` }}></div>
                                                      </div>
                                                  </div>

                                                  {task.history && task.history.length > 0 && (
                                                      <div className="space-y-1 border-t border-fantasy-wood/5 dark:border-white/5 pt-2">
                                                          <span className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/40 dark:text-fantasy-parchment/40">Histórico de Evolução:</span>
                                                          <div className="space-y-1 max-h-24 overflow-y-auto text-[10px] font-mono text-fantasy-wood/60 dark:text-fantasy-parchment/60 pl-2">
                                                              {task.history.slice().reverse().map((h, idx) => (
                                                                  <div key={idx} className="border-l-2 border-amber-800/30 pl-2 py-0.5">
                                                                      <span className="text-fantasy-gold">{new Date(h.date).toLocaleDateString()}: </span>
                                                                      <span>{h.details}</span>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </div>
                                                  )}

                                                  <div className="flex gap-2 justify-end pt-2">
                                                      {task.name.startsWith('Caravana') && task.status === 'Pendente' && (
                                                          <button type="button" onClick={() => {
                                                              setSelectedCaravanTask(task);
                                                              setResolveCaravanProfit(0);
                                                          }} className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-medieval uppercase tracking-widest transition-colors">
                                                              Resolver Retorno
                                                          </button>
                                                      )}
                                                      {task.status !== 'Concluido' && task.status !== 'Cancelado' && (
                                                          <button type="button" onClick={() => {
                                                              setEditingTaskId(task.id);
                                                              setEditTaskStatus(task.status || 'Pendente');
                                                              setEditTaskProgress(task.progress || 0);
                                                              setEditTaskNote('');
                                                          }} className="px-3 py-1.5 bg-fantasy-wood/10 dark:bg-white/10 text-fantasy-wood dark:text-fantasy-parchment hover:bg-fantasy-gold/25 rounded-xl text-xs font-medieval uppercase tracking-widest transition-colors">
                                                              Evoluir
                                                          </button>
                                                      )}
                                                      <button type="button" onClick={() => {
                                                          if (confirm("Deseja realmente remover esta pendência?")) {
                                                              removePendingTask(activeDomain.id, task.id);
                                                          }
                                                      }} className="p-1.5 bg-red-900/10 hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-colors">
                                                          <Trash2 size={14} />
                                                      </button>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                                  
                                  <form onSubmit={(e) => {
                                      e.preventDefault();
                                      if (!pendingTaskName.trim()) return;
                                      addPendingTask(activeDomain.id, {
                                          name: pendingTaskName.trim(),
                                          description: pendingTaskDesc.trim(),
                                          status: 'Pendente',
                                          progress: 0,
                                          history: []
                                      });
                                      setPendingTaskName('');
                                      setPendingTaskDesc('');
                                  }} className="border-t border-fantasy-wood/10 dark:border-white/10 pt-4 space-y-3">
                                      <h5 className="text-xs font-black uppercase tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nova Ação Assíncrona Manual</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          <input type="text" placeholder="Nome (ex: Construção da Ponte)" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm" value={pendingTaskName} onChange={e => setPendingTaskName(e.target.value)} required />
                                          <input type="text" placeholder="Descrição (ex: Leva 3 turnos, custo 10 LO)" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm" value={pendingTaskDesc} onChange={e => setPendingTaskDesc(e.target.value)} />
                                      </div>
                                      <button type="submit" className="w-full bg-amber-800 text-white py-2 rounded-xl text-xs font-medieval uppercase tracking-widest hover:bg-amber-900 transition-colors">
                                          Registrar Nova Pendência
                                      </button>
                                  </form>
                              </div>
                          )}
                      </div>
                  )}
                  {/* Stats Modal */}
                  {modalMode === 'stats' && (
                      <div className="space-y-6">
                          <div className="text-center mb-4">
                              <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Estatutos Reais</h3>
                              <p className="text-xs font-black text-fantasy-wood/40 dark:text-fantasy-parchment/40 uppercase tracking-widest">Ajuste manual de todas as variáveis de progressão</p>
                          </div>
                          <form onSubmit={handleUpdateStats} className="space-y-5">
                              {/* Row 1: Name, Regent */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nome do Domínio</label>
                                      <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg" value={editName} onChange={e => setEditName(e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Regente</label>
                                      <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg" value={editRegent} onChange={e => setEditRegent(e.target.value)} />
                                  </div>
                              </div>

                              {/* Row 2: Level, Terrain */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(() => {
                                      const currentMaxLevel = getDomainMaxLevel({
                                          terrain: editTerrain,
                                          isNatureBoundRace: editIsNatureBoundRace,
                                          isSubterraneanBoundRace: editIsSubterraneanBoundRace,
                                          hasWaterAccess: editHasWaterAccess
                                      });
                                      return (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nível do Domínio (1–{currentMaxLevel})</label>
                                            <input type="number" min="1" max={currentMaxLevel} className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg text-center" value={editLevel} onChange={e => setEditLevel(Math.min(currentMaxLevel, Number(e.target.value)))} onFocus={e => e.target.select()} />
                                        </div>
                                      );
                                  })()}
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Terreno</label>
                                      <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg appearance-none" value={editTerrain} onChange={e => setEditTerrain(e.target.value)}>
                                          {TERRAIN_TYPES.map(t => {
                                              const currentMaxLevelForT = getDomainMaxLevel({
                                                  terrain: t,
                                                  isNatureBoundRace: editIsNatureBoundRace,
                                                  isSubterraneanBoundRace: editIsSubterraneanBoundRace,
                                                  hasWaterAccess: editHasWaterAccess
                                              });
                                              return <option key={t} value={t} className="dark:bg-black">{t} (max Nível {currentMaxLevelForT})</option>;
                                          })}
                                      </select>
                                  </div>
                              </div>

                              {/* Row 3: Court, Popularity */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nível da Corte</label>
                                      <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg appearance-none" value={editCourt} onChange={e => setEditCourt(e.target.value as CourtType)}>
                                          {Object.keys(COURT_DATA).map(c => <option key={c} value={c} className="dark:bg-black">{c}</option>)}
                                      </select>
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Popularidade</label>
                                      <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg appearance-none" value={editPopularity} onChange={e => setEditPopularity(e.target.value as PopularityType | 'N/A')} disabled={editIsMystic}>
                                          {editIsMystic ? (
                                              <option value="N/A" className="dark:bg-black">N/A (Domínio Místico)</option>
                                          ) : (
                                              POPULARITY_LEVELS.map(p => <option key={p} value={p} className="dark:bg-black">{p}</option>)
                                          )}
                                      </select>
                                  </div>
                              </div>

                              {/* Row 4: Treasury, Fortification */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Tesouro (LO)</label>
                                      <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg text-center" value={editTreasury} onChange={e => setEditTreasury(Number(e.target.value))} onFocus={e => e.target.select()} />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Fortificação (Manual)</label>
                                      <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg text-center" value={editFortification} onChange={e => setEditFortification(Number(e.target.value))} onFocus={e => e.target.select()} />
                                  </div>
                              </div>

                              {/* Row 5: Actions Remaining, Action Modifier */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Ações Restantes (turno atual)</label>
                                      <input type="number" min="0" max="5" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg text-center" value={editActionsRemaining} onChange={e => setEditActionsRemaining(Number(e.target.value))} onFocus={e => e.target.select()} />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Modificador de Ação (+/-)</label>
                                      <input type="number" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg text-center" value={editActionModifier} onChange={e => setEditActionModifier(Number(e.target.value))} onFocus={e => e.target.select()} />
                                  </div>
                              </div>

                              {/* Row 6: Maintenance Mod, Magic Power Level */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Custo de Manutenção Extra (LO/turno)</label>
                                      <input type="number" min="0" className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg text-center" value={editMaintenanceMod} onChange={e => setEditMaintenanceMod(Number(e.target.value))} onFocus={e => e.target.select()} />
                                  </div>
                                  {(() => {
                                      const currentMagicPotential = getDomainMagicPotential({
                                          terrain: editTerrain,
                                          hasMysticElement: editHasMysticElement
                                      });
                                      return (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase ml-4 tracking-widest text-fantasy-wood/50 dark:text-fantasy-parchment/50">Nível de Poder Mágico (0–{currentMagicPotential}) {!editIsMystic && '(Apenas Místicos)'}</label>
                                            <input type="number" min="0" max={currentMagicPotential} disabled={!editIsMystic} className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg text-center disabled:opacity-30" value={editMagicPowerLevel} onChange={e => setEditMagicPowerLevel(Math.min(currentMagicPotential, Number(e.target.value)))} onFocus={e => e.target.select()} />
                                        </div>
                                      );
                                  })()}
                              </div>

                              {/* Checkboxes */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <label className="flex items-center gap-3 p-4 bg-purple-900/10 dark:bg-purple-900/20 border-2 border-purple-900/20 rounded-[28px] cursor-pointer">
                                      <input type="checkbox" checked={editIsMystic} onChange={e => { setEditIsMystic(e.target.checked); if (e.target.checked) setEditPopularity('N/A'); }} className="w-5 h-5 accent-purple-800" />
                                      <div>
                                          <span className="block text-xs font-black uppercase tracking-widest text-purple-900 dark:text-purple-400">Domínio Místico</span>
                                          <span className="block text-[10px] font-serif italic text-purple-700/70 dark:text-purple-300/70">Bônus de PM, sem popularidade</span>
                                      </div>
                                  </label>
                                  <label className="flex items-center gap-3 p-4 bg-red-900/10 dark:bg-red-900/20 border-2 border-red-900/20 rounded-[28px] cursor-pointer">
                                      <input type="checkbox" checked={editRevolt} onChange={e => setEditRevolt(e.target.checked)} className="w-5 h-5 accent-red-800" />
                                      <div>
                                          <span className="block text-xs font-black uppercase tracking-widest text-red-900 dark:text-red-400">Revolta Ativa</span>
                                          <span className="block text-[10px] font-serif italic text-red-700/70 dark:text-red-300/70">Liga/Desliga estado de revolta</span>
                                      </div>
                                  </label>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <label className="flex items-center gap-3 p-4 bg-blue-900/10 dark:bg-blue-900/20 border-2 border-blue-900/20 rounded-[28px] cursor-pointer">
                                      <input type="checkbox" checked={editHasWaterAccess} onChange={e => setEditHasWaterAccess(e.target.checked)} className="w-5 h-5 accent-blue-800" />
                                      <div>
                                          <span className="block text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-400">Rio ou Mar</span>
                                          <span className="block text-[10px] font-serif italic text-blue-700/70 dark:text-blue-300/70">+1 ao Nível Máximo do Domínio</span>
                                      </div>
                                  </label>
                                  <label className="flex items-center gap-3 p-4 bg-fuchsia-900/10 dark:bg-fuchsia-900/20 border-2 border-fuchsia-900/20 rounded-[28px] cursor-pointer">
                                      <input type="checkbox" checked={editHasMysticElement} onChange={e => setEditHasMysticElement(e.target.checked)} className="w-5 h-5 accent-fuchsia-800" />
                                      <div>
                                          <span className="block text-xs font-black uppercase tracking-widest text-fuchsia-900 dark:text-fuchsia-400">Elemento Místico</span>
                                          <span className="block text-[10px] font-serif italic text-fuchsia-700/70 dark:text-fuchsia-300/70">+1 ao Potencial Mágico</span>
                                      </div>
                                  </label>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <label className="flex items-center gap-3 p-4 bg-emerald-900/10 dark:bg-emerald-900/20 border-2 border-emerald-900/20 rounded-[28px] cursor-pointer">
                                      <input type="checkbox" checked={editIsNatureBoundRace} onChange={e => setEditIsNatureBoundRace(e.target.checked)} className="w-5 h-5 accent-emerald-800" />
                                      <div>
                                          <span className="block text-xs font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-400">Regente Feérico/Natural</span>
                                          <span className="block text-[10px] font-serif italic text-emerald-700/70 dark:text-emerald-300/70">Nível máx 6 em Florestas</span>
                                      </div>
                                  </label>
                                  <label className="flex items-center gap-3 p-4 bg-amber-900/10 dark:bg-amber-900/20 border-2 border-amber-900/20 rounded-[28px] cursor-pointer">
                                      <input type="checkbox" checked={editIsSubterraneanBoundRace} onChange={e => setEditIsSubterraneanBoundRace(e.target.checked)} className="w-5 h-5 accent-amber-800" />
                                      <div>
                                          <span className="block text-xs font-black uppercase tracking-widest text-amber-900 dark:text-amber-400">Regente Subterrâneo</span>
                                          <span className="block text-[10px] font-serif italic text-amber-700/70 dark:text-amber-300/70">Nível máx 6 em Subterrâneos</span>
                                      </div>
                                  </label>
                              </div>

                              {editIsMystic && (
                                  <div className="space-y-2 p-4 bg-purple-900/5 dark:bg-purple-900/10 border-2 border-purple-900/10 rounded-[28px] animate-fade-in">
                                      <label className="text-[10px] font-black text-purple-900 dark:text-purple-400 uppercase tracking-widest ml-4">Domínio Civil Coexistente</label>
                                      <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-6 py-3 font-medieval text-lg appearance-none cursor-pointer" value={editCoexistingDomainId} onChange={e => setEditCoexistingDomainId(e.target.value)}>
                                          <option value="" className="dark:bg-black">Nenhum (Independente)</option>
                                          {domains.filter(d => !d.isMystic && d.id !== activeDomainId).map(d => (
                                              <option key={d.id} value={d.id} className="dark:bg-black">{d.name} ({d.terrain})</option>
                                          ))}
                                      </select>
                                  </div>
                              )}

                              <div className="p-4 bg-black/5 dark:bg-black/20 rounded-3xl text-xs font-mono text-fantasy-wood/50 dark:text-fantasy-parchment/50">
                                  Fortificação das construções: {activeDomain.buildings.reduce((s, b) => s + ((b as any).fortificationBonus || 0), 0)}. O campo Fortificação acima é o valor total registrado no domínio.
                              </div>

                              <button type="submit" className="w-full bg-emerald-800 text-white py-6 rounded-[40px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-emerald-950 active:translate-y-1 active:border-b-0 transition-all">Salvar Estatutos</button>
                          </form>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default DomainsPage;
