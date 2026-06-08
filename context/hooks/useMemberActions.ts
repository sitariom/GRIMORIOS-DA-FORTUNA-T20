import { GuildState, Member, CurrencyType, Item, LogCategory, LogEntry } from '../../types';
import { RATES, calcCarryLimit } from '../../constants';

interface MemberDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

export const useMemberActions = ({ activeGuild, triggerSave, notify, internalAddLog }: MemberDeps) => {
  const addMember = (name: string) => {
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      status: 'Ativo',
      wallet: { TC: 0, TS: 0, TO: 0, LO: 0 },
      inventory: []
    };
    triggerSave({
      ...activeGuild,
      members: [...activeGuild.members, newMember],
      logs: internalAddLog(activeGuild, 'Membro', `Novo aventureiro: ${name}`, 0, 'system')
    });
    notify("Aventureiro alistado!");
  };

  const removeMember = (id: string) => {
    const m = activeGuild.members.find(x => x.id === id);
    if(!m) return;
    triggerSave({
      ...activeGuild,
      members: activeGuild.members.filter(x => x.id !== id),
      logs: internalAddLog(activeGuild, 'Membro', `Aventureiro removido: ${m.name}`, 0, 'system')
    });
    notify("Aventureiro removido.");
  };

  const updateMember = (id: string, data: Partial<Member>) => {
    triggerSave({
      ...activeGuild,
      members: activeGuild.members.map(m => m.id === id ? { ...m, ...data } : m)
    });
  };

  const bulkUpdateMembers = (updater: (members: Member[]) => Member[]) => {
    triggerSave({
      ...activeGuild,
      members: updater(activeGuild.members)
    });
  };

  const transferGoldToMember = (memberId: string, amount: number, currency: CurrencyType) => {
    if (activeGuild.wallet[currency] < amount) return notify("Fundos insuficientes no cofre.", "error");
    
    const updatedMembers = activeGuild.members.map(m => {
      if (m.id === memberId) {
        return { ...m, wallet: { ...m.wallet, [currency]: m.wallet[currency] + amount } };
      }
      return m;
    });

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] - amount },
      members: updatedMembers,
      logs: internalAddLog(activeGuild, 'Saque', `Transferência para membro (${amount} ${currency})`, -(amount * RATES[currency]), memberId)
    });
    notify("Transferência realizada.");
  };

  const transferGoldFromMember = (memberId: string, amount: number, currency: CurrencyType) => {
    const member = activeGuild.members.find(m => m.id === memberId);
    if (!member || member.wallet[currency] < amount) return notify("Membro não possui fundos suficientes.", "error");

    const updatedMembers = activeGuild.members.map(m => {
      if (m.id === memberId) {
        return { ...m, wallet: { ...m.wallet, [currency]: m.wallet[currency] - amount } };
      }
      return m;
    });

    triggerSave({
      ...activeGuild,
      wallet: { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] + amount },
      members: updatedMembers,
      logs: internalAddLog(activeGuild, 'Deposito', `Transferência de membro (${amount} ${currency})`, (amount * RATES[currency]), memberId)
    });
    notify("Transferência recebida.");
  };

  const updateMemberWallet = (memberId: string, amount: number, currency: CurrencyType, type: 'add' | 'remove') => {
    const updatedMembers = activeGuild.members.map(m => {
      if (m.id === memberId) {
        const current = m.wallet[currency];
        const newVal = type === 'add' ? current + amount : Math.max(0, current - amount);
        return { ...m, wallet: { ...m.wallet, [currency]: newVal } };
      }
      return m;
    });
    triggerSave({ ...activeGuild, members: updatedMembers });
    notify("Carteira do membro atualizada.");
  };

  const transferItemFromMember = (itemId: string, memberId: string, qty: number) => {
    const member = activeGuild.members.find(m => m.id === memberId);
    if(!member) return;
    const item = member.inventory.find(i => i.id === itemId);
    if(!item || item.quantity < qty) return notify("Item não encontrado no inventário do membro", "error");

    const newInventory = member.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0);

    const guildItem = activeGuild.items.find(i => i.name === item.name && i.rarity === item.rarity && i.type === item.type);
    let newGuildItems = [...activeGuild.items];
    if(guildItem) {
      newGuildItems = newGuildItems.map(i => i.id === guildItem.id ? { ...i, quantity: i.quantity + qty } : i);
    } else {
      const { id, ...itemProps } = item;
      newGuildItems.push({ ...itemProps, id: crypto.randomUUID(), quantity: qty });
    }

    triggerSave({
      ...activeGuild,
      members: activeGuild.members.map(m => m.id === memberId ? { ...m, inventory: newInventory } : m),
      items: newGuildItems,
      logs: internalAddLog(activeGuild, 'Estoque', `Retorno: ${qty}x ${item.name} de ${member.name}`, 0, memberId)
    });
    notify("Item devolvido ao cofre.");
  };

  const deleteItemFromMember = (memberId: string, itemId: string, qty: number) => {
    const updatedMembers = activeGuild.members.map(m => {
      if (m.id === memberId) {
        const newInv = m.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0);
        return { ...m, inventory: newInv };
      }
      return m;
    });
    triggerSave({ ...activeGuild, members: updatedMembers });
    notify("Item removido do inventário do membro.");
  };

  const calcMemberLoad = (member: { inventory: Item[] }) =>
    member.inventory.reduce((total, i) => total + i.space * i.quantity, 0);

  const createItemForMember = (memberId: string, itemData: Omit<Item, 'id'>) => {
    const member = activeGuild.members.find(m => m.id === memberId);
    if (member) {
      const limit = calcCarryLimit(member.strength);
      const currentLoad = calcMemberLoad(member);
      const addSpace = (itemData.space || 1) * (itemData.quantity || 1);
      if (currentLoad + addSpace > limit * 2) {
        return notify(`${member.name} não pode carregar tanto peso (limite ${limit} espaços, máximo ${limit * 2}).`, "error");
      }
    }
    const newItem = { ...itemData, id: crypto.randomUUID() };
    const updatedMembers = activeGuild.members.map(m => {
      if (m.id === memberId) {
        return { ...m, inventory: [...m.inventory, newItem] };
      }
      return m;
    });
    triggerSave({ ...activeGuild, members: updatedMembers });
    notify("Item adicionado ao inventário do membro.");
  };

  return {
    addMember, removeMember, updateMember, bulkUpdateMembers,
    transferGoldToMember, transferGoldFromMember, updateMemberWallet,
    transferItemFromMember, deleteItemFromMember, createItemForMember
  };
};
