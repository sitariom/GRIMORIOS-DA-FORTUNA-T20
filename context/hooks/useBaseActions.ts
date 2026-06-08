import { GuildState, Base, BasePorte, BaseType, LogCategory, LogEntry, Room } from '../../types';
import { PORTE_DATA, BUSINESS_LEVELS, BUSINESS_ASSETS, MAX_BUSINESS_LEVEL } from '../../constants';

interface BaseDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

const PORTES: BasePorte[] = ['Minima', 'Modesta', 'Basica', 'Formidavel', 'Grandiosa', 'Suprema'];

const isNextPorte = (current: BasePorte, next: BasePorte): boolean => {
  const currentIndex = PORTES.indexOf(current);
  const nextIndex = PORTES.indexOf(next);
  return nextIndex === currentIndex + 1;
};

export const useBaseActions = ({ activeGuild, triggerSave, notify, internalAddLog }: BaseDeps) => {
  const addBase = (
    name: string,
    porte: BasePorte,
    type: BaseType,
    method: 'construct' | 'buy' | 'reward',
    rollResult?: number
  ) => {
    let cost = 0;
    if (method === 'construct') {
      if (porte !== 'Minima') {
        return notify("Apenas bases Mínimas podem ser construídas do zero.", "error");
      }
      cost = 1000;
    } else if (method === 'buy') {
      cost = PORTE_DATA[porte].cost * 3;
    }

    if (cost > 0 && activeGuild.wallet.TS < cost) {
      return notify(`Fundos insuficientes. Necessário T$ ${cost}.`, "error");
    }

    const newWallet = cost > 0 ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;

    if (method === 'construct') {
      const roll = rollResult !== undefined ? rollResult : 20;
      if (roll < 20) {
        // Failure: Lose TS 1000 and do not create base
        triggerSave({
          ...activeGuild,
          wallet: newWallet,
          logs: internalAddLog(
            activeGuild,
            'Investimento',
            `Construção da base ${name} falhou no teste de Nobreza (Rolou: ${roll}, necessário CD 20)`,
            -cost,
            'system'
          )
        });
        return notify(`Falhou no teste de fundação (Rolou ${roll}/20). T$ ${cost} em materiais foram desperdiçados.`, "error");
      }
    }

    // Success or buy/reward: Create the base
    const startingSecurity = type === 'Fortificacao' ? 5 : 0;
    const newBase: Base = {
      id: crypto.randomUUID(),
      name,
      porte,
      type,
      rooms: [],
      history: [
        `Base fundada em Arton como ${type} (${porte}) por ${
          method === 'buy' ? 'compra pronta' : method === 'construct' ? 'construção' : 'recompensa'
        }.`
      ],
      security: startingSecurity
    };

    triggerSave({
      ...activeGuild,
      bases: [...activeGuild.bases, newBase],
      wallet: newWallet,
      logs: internalAddLog(
        activeGuild,
        'Investimento',
        `Fundação Base: ${name} (${porte}) via ${
          method === 'buy' ? 'compra' : method === 'construct' ? 'construção' : 'recompensa'
        }`,
        -cost,
        'system'
      )
    });
    notify("Nova base estabelecida com sucesso!");
  };

  const upgradeBase = (id: string, newPorte: BasePorte, method: 'roll' | 'reward', rollResult?: number) => {
    const base = activeGuild.bases.find(b => b.id === id);
    if (!base) return notify("Base não encontrada.", "error");

    if (method === 'roll' && !isNextPorte(base.porte, newPorte)) {
      return notify("A expansão de porte deve ser realizada de um em um nível.", "error");
    }

    const currentCost = PORTE_DATA[base.porte].cost;
    const newCost = PORTE_DATA[newPorte].cost;
    const diff = method === 'reward' ? 0 : (newCost - currentCost);

    if (diff > 0 && activeGuild.wallet.TS < diff) {
      return notify(`Fundos insuficientes para expansão. Necessário T$ ${diff}.`, "error");
    }

    const newWallet = diff > 0 ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - diff } : activeGuild.wallet;
    const newSlots = PORTE_DATA[newPorte].slots;
    const cd = 20 + newSlots;

    if (method === 'roll') {
      const roll = rollResult !== undefined ? rollResult : cd;
      if (roll < cd) {
        // Failure: Spend diff but do not upgrade
        triggerSave({
          ...activeGuild,
          wallet: newWallet,
          logs: internalAddLog(
            activeGuild,
            'Investimento',
            `Expansão da base ${base.name} para ${newPorte} falhou no teste (Rolou: ${roll}, CD: ${cd})`,
            -diff,
            'system'
          )
        });
        return notify(`Falhou no teste de expansão (Rolou ${roll}/${cd}). T$ ${diff} em materiais foram perdidos.`, "error");
      }
    }

    // Success! Update porte
    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === id
          ? {
              ...b,
              porte: newPorte,
              history: [...b.history, `Expandida para porte ${newPorte} (Cômodos suportados: ${newSlots}).`]
            }
          : b
      ),
      wallet: newWallet,
      logs: internalAddLog(activeGuild, 'Investimento', `Upgrade Base: ${base.name} (${newPorte})`, -diff, 'system')
    });
    notify("Porte da base expandido com sucesso!");
  };

  const reformBase = (id: string, newType: BaseType, method: 'roll' | 'reward', rollResult?: number) => {
    const base = activeGuild.bases.find(b => b.id === id);
    if (!base) return notify("Base não encontrada.", "error");

    const cost = method === 'reward' ? 0 : PORTE_DATA[base.porte].cost / 2;
    if (cost > 0 && activeGuild.wallet.TS < cost) {
      return notify(`Fundos insuficientes para reforma. Necessário T$ ${cost}.`, "error");
    }

    const newWallet = cost > 0 ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;
    const cd = 20 + base.rooms.length;

    if (method === 'roll') {
      const roll = rollResult !== undefined ? rollResult : cd;
      if (roll < cd) {
        // Failure: Spend cost but do not reform
        triggerSave({
          ...activeGuild,
          wallet: newWallet,
          logs: internalAddLog(
            activeGuild,
            'Investimento',
            `Reforma da base ${base.name} para ${newType} falhou no teste (Rolou: ${roll}, CD: ${cd})`,
            -cost,
            'system'
          )
        });
        return notify(`Falhou no teste de reforma (Rolou ${roll}/${cd}). T$ ${cost} em materiais perdidos.`, "error");
      }
    }

    // Success! Change type and reset base security appropriately
    const oldType = base.type;
    const baseSecurity = newType === 'Fortificacao' ? 5 : 0;

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === id
          ? {
              ...b,
              type: newType,
              security: baseSecurity,
              history: [...b.history, `Reformada de ${oldType} para ${newType}. Cômodos incompatíveis com a nova sede devem ser removidos.`]
            }
          : b
      ),
      wallet: newWallet,
      logs: internalAddLog(activeGuild, 'Investimento', `Reforma Base: ${base.name} para ${newType}`, -cost, 'system')
    });
    notify("Base reformada com sucesso!");
  };

  const payBaseMaintenance = (id: string, type: string, cost: number, skip?: boolean) => {
    const base = activeGuild.bases.find(b => b.id === id);
    if (!base) return notify("Base não encontrada.", "error");

    if (skip || activeGuild.wallet.TS < cost) {
      // Neglect: damage a random undamaged room
      damageRandomRoom(id);
      return notify(`Manutenção de T$ ${cost} não foi paga. Um dos cômodos da base foi danificado!`, "error");
    }

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost },
      logs: internalAddLog(activeGuild, 'Manutencao', `Manutenção Base: ${base.name}`, -cost, 'system')
    });
    notify("Manutenção paga com sucesso.");
  };

  const damageRandomRoom = (baseId: string) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return;

    const undamagedRooms = base.rooms.filter(r => !r.isDamaged);
    if (undamagedRooms.length === 0) {
      notify(`Todos os cômodos de ${base.name} já estão danificados!`, "info");
      return;
    }

    const randomIndex = Math.floor(Math.random() * undamagedRooms.length);
    const roomToDamage = undamagedRooms[randomIndex];

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              rooms: b.rooms.map(r => (r.id === roomToDamage.id ? { ...r, isDamaged: true } : r)),
              history: [...b.history, `Manutenção negligenciada: Cômodo danificado: ${roomToDamage.name}.`]
            }
          : b
      ),
      logs: internalAddLog(activeGuild, 'Manutencao', `Negligência: Cômodo danificado em ${base.name} (${roomToDamage.name})`, 0, 'system')
    });
  };

  const collectBaseIncome = (id: string, amount: number) => {
    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TO: activeGuild.wallet.TO + amount },
      logs: internalAddLog(activeGuild, 'Base', `Renda Empreendimento`, amount * 10, 'system')
    });
    notify("Lucros coletados.");
  };

  const demolishBase = (id: string) => {
    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.filter(b => b.id !== id),
      logs: internalAddLog(activeGuild, 'Base', `Base demolida/abandonada`, 0, 'system')
    });
    notify("Base removida.");
  };

  const addRoom = (
    baseId: string,
    name: string,
    method: 'roll' | 'reward',
    rollResult?: number
  ) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return notify("Base não encontrada.", "error");

    const maxSlots = PORTE_DATA[base.porte].slots;
    if (base.rooms.length >= maxSlots) {
      return notify("Número máximo de cômodos atingido para este porte.", "error");
    }

    // Check prerequisites
    const normalizedRoomName = name.toLowerCase();

    // 1. Base porte requirements
    if (normalizedRoomName.includes("ala dos criados") || 
        normalizedRoomName.includes("chapelaria") || 
        normalizedRoomName.includes("sauna") || 
        normalizedRoomName.includes("casa da guarda")) {
      if (!['Formidavel', 'Grandiosa', 'Suprema'].includes(base.porte)) {
        return notify("Este cômodo exige base de porte Formidável ou maior.", "error");
      }
    }
    if (normalizedRoomName.includes("suíte") || normalizedRoomName.includes("suite")) {
      if (!['Basica', 'Formidavel', 'Grandiosa', 'Suprema'].includes(base.porte)) {
        return notify("Este cômodo exige base de porte Básica ou maior.", "error");
      }
    }

    // 2. Required rooms
    if (normalizedRoomName.includes("casa da guarda")) {
      const hasGuarita = base.rooms.some(r => r.name.toLowerCase().includes("guarita") && !r.isDamaged);
      if (!hasGuarita) return notify("Exige que a base possua uma Guarita saudável.", "error");
    }
    if (normalizedRoomName.includes("domo protetor") || normalizedRoomName.includes("cúpula protetora") || normalizedRoomName.includes("cupula protetora")) {
      const hasGabinete = base.rooms.some(r => (r.name.toLowerCase().includes("gabinete místico") || r.name.toLowerCase().includes("gabinete mistico")) && !r.isDamaged);
      if (!hasGabinete) return notify("Exige que a base possua um Gabinete Místico saudável.", "error");
    }
    if (normalizedRoomName.includes("forjaria") || normalizedRoomName.includes("forja")) {
      const hasOficina = base.rooms.some(r => (r.name.toLowerCase().includes("oficina de trabalho") || r.name.toLowerCase().includes("oficina")) && !r.isDamaged);
      if (!hasOficina) return notify("Exige que a base possua uma Oficina de Trabalho saudável.", "error");
    }
    if (normalizedRoomName.includes("quarto do capitão") || normalizedRoomName.includes("quarto do capitao")) {
      const hasCasaGuarda = base.rooms.some(r => r.name.toLowerCase().includes("casa da guarda") && !r.isDamaged);
      if (!hasCasaGuarda) return notify("Exige que a base possua uma Casa da Guarda saudável.", "error");
    }
    if (normalizedRoomName.includes("tabernáculo") || normalizedRoomName.includes("tabernaculo")) {
      const hasOratorio = base.rooms.some(r => (r.name.toLowerCase().includes("oratório") || r.name.toLowerCase().includes("oratorio")) && !r.isDamaged);
      if (!hasOratorio) return notify("Exige que a base possua um Oratório saudável.", "error");
    }
    if (normalizedRoomName.includes("sala de perigo")) {
      const hasSeguranca = base.rooms.some(r => (r.name.toLowerCase().includes("sistema de segurança") || r.name.toLowerCase().includes("sistema de seguranca")) && !r.isDamaged);
      if (!hasSeguranca) return notify("Exige que a base possua um Sistema de Segurança saudável.", "error");
    }

    const cost = method === 'reward' ? 0 : 1000;
    if (cost > 0 && activeGuild.wallet.TS < cost) {
      return notify(`Fundos insuficientes. Necessário T$ ${cost}.`, "error");
    }

    const newWallet = cost > 0 ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;
    const cd = 20 + maxSlots;

    if (method === 'roll') {
      const roll = rollResult !== undefined ? rollResult : cd;
      if (roll < cd) {
        // Failure: spend T$ 1000 but do not build room
        triggerSave({
          ...activeGuild,
          wallet: newWallet,
          logs: internalAddLog(
            activeGuild,
            'Investimento',
            `Construção do cômodo ${name} falhou no teste em ${base.name} (Rolou: ${roll}, CD: ${cd})`,
            -cost,
            'system'
          )
        });
        return notify(`Falhou no teste de construção (Rolou ${roll}/${cd}). T$ ${cost} em materiais desperdiçados.`, "error");
      }
    }

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              rooms: [...b.rooms, { id: crypto.randomUUID(), name, cost: 1000, furnitures: [], isDamaged: false }]
            }
          : b
      ),
      wallet: newWallet,
      logs: internalAddLog(
        activeGuild,
        'Investimento',
        `Construção Cômodo: ${name} em ${base.name}`,
        -cost,
        'system'
      )
    });
    notify("Cômodo construído com sucesso.");
  };

  const removeRoom = (baseId: string, roomId: string) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return notify("Base não encontrada.", "error");
    const room = base.rooms.find(r => r.id === roomId);
    if (!room) return notify("Cômodo não encontrado.", "error");

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              rooms: b.rooms.filter(r => r.id !== roomId),
              history: [...b.history, `Cômodo demolido: ${room.name}${room.furnitures.length > 0 ? ` (${room.furnitures.length} mobília(s) perdida(s))` : ''}.`]
            }
          : b
      )
    });
    notify(`Cômodo "${room.name}" demolido.`);
  };

  const repairRoom = (baseId: string, roomId: string, pay: boolean) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return notify("Base não encontrada.", "error");

    const room = base.rooms.find(r => r.id === roomId);
    if (!room) return notify("Cômodo não encontrado.", "error");

    const cost = Math.floor((room.cost || 0) / 2);
    if (pay && activeGuild.wallet.TS < cost) return notify(`Fundos insuficientes. Necessário T$ ${cost}.`, "error");

    const newWallet = pay ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              rooms: b.rooms.map(r => (r.id === roomId ? { ...r, isDamaged: false } : r)),
              history: [...b.history, `Reparado Cômodo: ${room.name}.`]
            }
          : b
      ),
      wallet: newWallet,
      logs: pay ? internalAddLog(activeGuild, 'Investimento', `Reparado Cômodo: ${room.name}`, -cost, 'system') : activeGuild.logs
    });
    notify("Cômodo reparado com sucesso!");
  };

  const addFurniture = (baseId: string, roomId: string, name: string, cost: number, pay: boolean) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return notify("Base não encontrada.", "error");

    const room = base.rooms.find(r => r.id === roomId);
    if (!room) return notify("Cômodo não encontrado.", "error");

    // Check quantity limit: 1 furniture per room (3 for "Sala de Estar")
    const maxFurnitures = room.name.toLowerCase().includes("sala de estar") ? 3 : 1;
    if (room.furnitures.length >= maxFurnitures) {
      return notify(`Este cômodo já atingiu o limite de mobílias (${maxFurnitures}).`, "error");
    }

    // Check room compatibility/prerequisite
    const reqs = getFurniturePrerequisites(name);
    if (!isRoomCompatible(room.name, reqs)) {
      const allowedText = reqs.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(" ou ");
      return notify(`Esta mobília deve ser instalada em: ${allowedText}.`, "error");
    }

    if (pay && activeGuild.wallet.TS < cost) return notify("Fundos insuficientes.", "error");

    const newWallet = pay ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              rooms: b.rooms.map(r =>
                r.id === roomId ? { ...r, furnitures: [...r.furnitures, { id: crypto.randomUUID(), name, cost }] } : r
              )
            }
          : b
      ),
      wallet: newWallet,
      logs: pay ? internalAddLog(activeGuild, 'Investimento', `Mobília: ${name}`, -cost, 'system') : activeGuild.logs
    });
    notify("Mobília adicionada.");
  };

  const removeFurniture = (baseId: string, roomId: string, furnId: string) => {
    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              rooms: b.rooms.map(r =>
                r.id === roomId ? { ...r, furnitures: r.furnitures.filter(f => f.id !== furnId) } : r
              )
            }
          : b
      )
    });
    notify("Mobília removida.");
  };

  const moveFurniture = (baseId: string, fromRoomId: string, toRoomId: string, furnitureId: string) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return notify("Base não encontrada.", "error");

    const fromRoom = base.rooms.find(r => r.id === fromRoomId);
    if (!fromRoom) return notify("Cômodo de origem não encontrado.", "error");

    const toRoom = base.rooms.find(r => r.id === toRoomId);
    if (!toRoom) return notify("Cômodo de destino não encontrado.", "error");

    const furniture = fromRoom.furnitures.find(f => f.id === furnitureId);
    if (!furniture) return notify("Mobília não encontrada.", "error");

    // Check quantity limit in destination: 1 furniture per room (3 for "Sala de Estar")
    const maxFurnitures = toRoom.name.toLowerCase().includes("sala de estar") ? 3 : 1;
    if (toRoom.furnitures.length >= maxFurnitures) {
      return notify(`O cômodo de destino já atingiu o limite de mobílias (${maxFurnitures}).`, "error");
    }

    // Check room compatibility in destination
    const reqs = getFurniturePrerequisites(furniture.name);
    if (!isRoomCompatible(toRoom.name, reqs)) {
      const allowedText = reqs.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(" ou ");
      return notify(`Esta mobília deve ser instalada em: ${allowedText}.`, "error");
    }

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              rooms: b.rooms.map(r => {
                if (r.id === fromRoomId) {
                  return { ...r, furnitures: r.furnitures.filter(f => f.id !== furnitureId) };
                }
                if (r.id === toRoomId) {
                  return { ...r, furnitures: [...r.furnitures, furniture] };
                }
                return r;
              })
            }
          : b
      )
    });
    notify(`Mobília ${furniture.name} movida com sucesso.`);
  };

  const addGargula = (baseId: string, pay: boolean) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return notify("Base não encontrada.", "error");

    const currentGargoyles = base.gargulas || 0;
    const maxGargoyles = base.porte === 'Formidavel' ? 1 : base.porte === 'Grandiosa' ? 2 : base.porte === 'Suprema' ? 3 : 0;
    
    if (maxGargoyles === 0) {
      return notify("Apenas bases de porte Formidável ou maior podem possuir Gárgulas Animadas.", "error");
    }
    
    if (currentGargoyles >= maxGargoyles) {
      return notify(`Limite de Gárgulas Animadas atingido para o porte ${base.porte} (máximo ${maxGargoyles}).`, "error");
    }

    const cost = 10000;
    if (pay && activeGuild.wallet.TS < cost) return notify("Fundos insuficientes.", "error");

    const newWallet = pay ? { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost } : activeGuild.wallet;

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              gargulas: (b.gargulas || 0) + 1
            }
          : b
      ),
      wallet: newWallet,
      logs: pay ? internalAddLog(activeGuild, 'Investimento', `Gárgula Animada em ${base.name}`, -cost, 'system') : activeGuild.logs
    });
    notify("Gárgula Animada adicionada com sucesso!");
  };

  const removeGargula = (baseId: string) => {
    const base = activeGuild.bases.find(b => b.id === baseId);
    if (!base) return notify("Base não encontrada.", "error");

    const currentGargoyles = base.gargulas || 0;
    if (currentGargoyles === 0) return notify("Esta base não possui gárgulas.", "error");

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              gargulas: Math.max(0, (b.gargulas || 0) - 1)
            }
          : b
      )
    });
    notify("Gárgula Animada removida.");
  };

  // ─── Negócio (Business) Functions ────────────────────────────────────────

  const createBusiness = (name: string) => {
    const cost = 1000;
    if (activeGuild.wallet.TS < cost) {
      return notify(`Fundos insuficientes. Necessário T$ ${cost}.`, "error");
    }

    const newBusiness: Base = {
      id: crypto.randomUUID(),
      name,
      porte: 'Minima',
      type: 'Negocio',
      rooms: [],
      history: [`Negócio fundado em Arton como nível 1.`],
      businessLevel: 1,
      businessAssetNames: [],
      lastIncomeDay: activeGuild.calendar.day
    };

    triggerSave({
      ...activeGuild,
      bases: [...activeGuild.bases, newBusiness],
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost },
      logs: internalAddLog(activeGuild, 'Investimento', `Negócio fundado: ${name} (Nv. 1)`, -cost, 'system')
    });
    notify(`Negócio "${name}" fundado com sucesso!`);
  };

  const levelUpBusiness = (baseId: string) => {
    const business = activeGuild.bases.find(b => b.id === baseId && b.type === 'Negocio');
    if (!business) return notify("Negócio não encontrado.", "error");

    const currentLevel = business.businessLevel || 1;
    if (currentLevel >= MAX_BUSINESS_LEVEL) {
      return notify(`Negócio já está no nível máximo (${MAX_BUSINESS_LEVEL}).`, "error");
    }

    const nextLevel = currentLevel + 1;
    const levelData = BUSINESS_LEVELS[nextLevel];
    const cost = levelData.cost;

    if (activeGuild.wallet.TS < cost) {
      return notify(`Fundos insuficientes. Necessário T$ ${cost}.`, "error");
    }

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              businessLevel: nextLevel,
              history: [...b.history, `Evoluído para nível ${nextLevel}.`]
            }
          : b
      ),
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - cost },
      logs: internalAddLog(activeGuild, 'Investimento', `Negócio: ${business.name} nível ${nextLevel}`, -cost, 'system')
    });
    notify(`Negócio evoluído para nível ${nextLevel}!`);
  };

  const addBusinessAsset = (baseId: string, assetName: string) => {
    const business = activeGuild.bases.find(b => b.id === baseId && b.type === 'Negocio');
    if (!business) return notify("Negócio não encontrado.", "error");

    const level = business.businessLevel || 1;
    const currentAssets = business.businessAssetNames || [];
    if (currentAssets.length >= level) {
      return notify(`Limite de ativos atingido para o nível ${level}.`, "error");
    }

    const asset = BUSINESS_ASSETS.find(a => a.name === assetName);
    if (!asset) return notify("Ativo não encontrado.", "error");

    if (asset.levelReq && level < asset.levelReq) {
      return notify(`Este ativo exige nível ${asset.levelReq}.`, "error");
    }

    if (currentAssets.includes(assetName)) {
      return notify("Este ativo já foi adquirido.", "error");
    }

    if (asset.requires && asset.requires.length > 0) {
      const hasReqs = asset.requires.every(req => currentAssets.includes(req));
      if (!hasReqs) return notify(`Pré-requisitos não atendidos: ${asset.requires.join(', ')}.`, "error");
    }

    if (activeGuild.wallet.TS < asset.cost) {
      return notify(`Fundos insuficientes. Necessário T$ ${asset.cost}.`, "error");
    }

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              businessAssetNames: [...(b.businessAssetNames || []), assetName]
            }
          : b
      ),
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS - asset.cost },
      logs: internalAddLog(activeGuild, 'Investimento', `Ativo adquirido: ${assetName} em ${business.name}`, -asset.cost, 'system')
    });
    notify(`Ativo "${assetName}" adquirido com sucesso!`);
  };

  const removeBusinessAsset = (baseId: string, assetName: string) => {
    const business = activeGuild.bases.find(b => b.id === baseId && b.type === 'Negocio');
    if (!business) return notify("Negócio não encontrado.", "error");

    const currentAssets = business.businessAssetNames || [];
    if (!currentAssets.includes(assetName)) return notify("Ativo não encontrado.", "error");

    triggerSave({
      ...activeGuild,
      bases: activeGuild.bases.map(b =>
        b.id === baseId
          ? {
              ...b,
              businessAssetNames: (b.businessAssetNames || []).filter(a => a !== assetName)
            }
          : b
      )
    });
    notify(`Ativo "${assetName}" removido.`);
  };

  const collectBusinessIncome = (baseId: string, rollResult?: number) => {
    const business = activeGuild.bases.find(b => b.id === baseId && b.type === 'Negocio');
    if (!business) return notify("Negócio não encontrado.", "error");

    const level = business.businessLevel || 1;
    const baseIncome = level * 100;
    const rollIncome = rollResult !== undefined ? rollResult * 10 * level : 0;
    const income = Math.max(baseIncome, rollIncome);

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + income },
      logs: internalAddLog(activeGuild, 'Base', `Renda Negócio: ${business.name} (Nv.${level}) — T$ ${income}${rollIncome > baseIncome ? ` (teste ${rollResult}×10×${level})` : ` (base ${baseIncome})`}`, income, 'system')
    });
    notify(`Renda de T$ ${income} coletada do negócio "${business.name}".`);
  };

  return {
    addBase,
    upgradeBase,
    reformBase,
    repairRoom,
    payBaseMaintenance,
    collectBaseIncome,
    demolishBase,
    addRoom,
    removeRoom,
    addFurniture,
    removeFurniture,
    moveFurniture,
    addGargula,
    removeGargula,
    createBusiness,
    levelUpBusiness,
    addBusinessAsset,
    removeBusinessAsset,
    collectBusinessIncome
  };
};

const getFurniturePrerequisites = (furnitureName: string): string[] => {
  const name = furnitureName.toLowerCase();
  if (name.includes("armário de remédios") || name.includes("armario de remedios")) return ["enfermaria", "estufa"];
  if (name.includes("banheira")) return ["suíte", "suite", "suítes", "suites"];
  if (name.includes("baú reforçado") || name.includes("bau reforcado")) return ["despensa"];
  if (name.includes("bigorna")) return ["oficina", "forjaria", "forja"];
  if (name.includes("colchão de penas") || name.includes("colchao de penas")) return ["suíte", "suite", "suítes", "suites"];
  if (name.includes("colmeia de pergaminhos")) return ["biblioteca", "gabinete místico", "gabinete mistico"];
  if (name.includes("engenho automatizado")) return ["oficina"];
  if (name.includes("espelho de corpo")) return ["chapelaria", "suíte", "suite", "suítes", "suites"];
  if (name.includes("lareira")) return ["sala de estar", "cozinha", "suíte", "suite", "suítes", "suites"];
  if (name.includes("lustre de cristal")) return ["sala de estar", "salão de baile", "salao de baile"];
  if (name.includes("mapa-múndi") || name.includes("mapa-mundi")) return ["sala de guerra", "sala de mapas"];
  if (name.includes("mesa de reuniões") || name.includes("mesa de reunioes")) return ["sala de guerra", "sala de estar"];
  if (name.includes("planetário") || name.includes("planetario")) return ["observatório", "observatorio"];
  if (name.includes("prataria")) return ["cozinha"];
  if (name.includes("prateleiras reforçadas") || name.includes("prateleiras reforçadas")) return ["biblioteca"];
  if (name.includes("quadro de diagramas")) return ["oficina"];
  if (name.includes("relíquia abençoada") || name.includes("reliquia abencoada")) return ["oratório", "oratorio", "sala de estar"];
  if (name.includes("roleta ahleniense")) return ["sala de jogos"];
  return [];
};

const isRoomCompatible = (roomName: string, requiredRooms: string[]): boolean => {
  if (requiredRooms.length === 0) return true;
  const name = roomName.toLowerCase();
  return requiredRooms.some(req => name.includes(req));
};

