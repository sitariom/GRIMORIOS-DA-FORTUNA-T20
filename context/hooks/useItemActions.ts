import { GuildState, Item, LogCategory, LogEntry } from '../../types';
import { calcTotalCarryLimit, calcTotalMaxCarry } from '../../constants';

interface ItemDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

export const useItemActions = ({ activeGuild, triggerSave, notify, internalAddLog }: ItemDeps) => {
  const addItem = (item: Omit<Item, 'id'>) => {
    const existing = activeGuild.items.find(i => i.name === item.name && i.type === item.type && i.rarity === item.rarity);
    let newItems = [];
    if (existing) {
      newItems = activeGuild.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i);
    } else {
      newItems = [...activeGuild.items, { ...item, id: crypto.randomUUID() }];
    }
    triggerSave({
      ...activeGuild,
      items: newItems,
      logs: internalAddLog(activeGuild, 'Estoque', `Item Registrado: ${item.quantity}x ${item.name}`, item.value * item.quantity, 'system')
    });
    notify("Item registrado no arsenal.");
  };

  const updateItem = (id: string, data: Partial<Item>) => {
    triggerSave({
      ...activeGuild,
      items: activeGuild.items.map(i => i.id === id ? { ...i, ...data } : i)
    });
    notify("Item atualizado.");
  };

  const sellItem = (id: string, qty: number, memberId: string, percent: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    if (!item || item.quantity < qty) return notify("Quantidade inválida.", "error");

    const value = Math.floor((item.value * qty) * (percent / 100));
    
    triggerSave({
      ...activeGuild,
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + value },
      logs: internalAddLog(activeGuild, 'Venda', `Venda ${qty}x ${item.name} (${percent}%)`, value, memberId)
    });
    notify(`Venda realizada: +T$ ${value}`);
  };

  const sellBatchItems = (ids: string[], memberId: string, percent: number) => {
    let totalValue = 0;
    let newItems = [...activeGuild.items];
    const logDetails: string[] = [];

    ids.forEach(id => {
      const item = newItems.find(i => i.id === id);
      if (item) {
        const val = Math.floor((item.value * item.quantity) * (percent / 100));
        totalValue += val;
        logDetails.push(`${item.quantity}x ${item.name}`);
        newItems = newItems.filter(i => i.id !== id);
      }
    });

    triggerSave({
      ...activeGuild,
      items: newItems,
      wallet: { ...activeGuild.wallet, TS: activeGuild.wallet.TS + totalValue },
      logs: internalAddLog(activeGuild, 'Venda', `Venda em Lote: ${logDetails.length} itens`, totalValue, memberId)
    });
    notify(`Lote vendido: +T$ ${totalValue}`);
  };

  const calcMemberLoad = (member: { inventory: Item[] }) =>
    member.inventory.reduce((total, i) => total + i.space * i.quantity, 0);

  const withdrawItem = (id: string, memberId: string, reason: string, qty: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    if (!item || item.quantity < qty) return notify("Quantidade inválida.", "error");

    const member = activeGuild.members.find(m => m.id === memberId);
    if (member) {
      const baseLimit = calcTotalCarryLimit(member.strength, member.inventory);
      const currentLoad = calcMemberLoad(member);
      const addSpace = item.space * qty;
      const newBonus = (item.carryBonus || 0) * qty;
      const newLimit = baseLimit + newBonus;
      const maxLoad = newLimit * 2;
      if (currentLoad + addSpace > maxLoad) {
        return notify(`${member.name} não pode carregar tanto peso (limite ${baseLimit} esp, máximo ${maxLoad} esp).`, "error");
      }
    }
    let updatedMembers = activeGuild.members;
    if (member) {
      updatedMembers = activeGuild.members.map(m => {
        if (m.id === memberId) {
          const existingItem = m.inventory.find(i => i.name === item.name && i.type === item.type);
          let newInv = [];
          if (existingItem) {
            newInv = m.inventory.map(i => i.id === existingItem.id ? { ...i, quantity: i.quantity + qty } : i);
          } else {
            const { id, ...props } = item;
            newInv = [...m.inventory, { ...props, id: crypto.randomUUID(), quantity: qty }];
          }
          return { ...m, inventory: newInv };
        }
        return m;
      });
    }

    triggerSave({
      ...activeGuild,
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
      members: updatedMembers,
      logs: internalAddLog(activeGuild, 'Estoque', `Retirada: ${qty}x ${item.name} -> ${member ? member.name : 'Desconhecido'} (${reason})`, 0, memberId)
    });
    notify("Item retirado do arsenal.");
  };

  const deleteItem = (id: string, qty: number) => {
    const item = activeGuild.items.find(i => i.id === id);
    if (!item) return;
    triggerSave({
      ...activeGuild,
      items: activeGuild.items.map(i => i.id === id ? { ...i, quantity: i.quantity - qty } : i).filter(i => i.quantity > 0),
      logs: internalAddLog(activeGuild, 'Estoque', `Descarte: ${qty}x ${item.name}`, 0, 'system')
    });
    notify("Item descartado.");
  };

  const deleteBatchItems = (ids: string[]) => {
    triggerSave({
      ...activeGuild,
      items: activeGuild.items.filter(i => !ids.includes(i.id)),
      logs: internalAddLog(activeGuild, 'Estoque', `Descarte em Lote: ${ids.length} itens`, 0, 'system')
    });
    notify("Itens descartados.");
  };

  return { addItem, updateItem, sellItem, sellBatchItems, withdrawItem, deleteItem, deleteBatchItems };
};
