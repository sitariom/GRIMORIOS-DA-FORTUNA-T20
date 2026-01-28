import React, { useState, useMemo } from 'react';
import { useGuild } from '../context/GuildContext';
import { Item, ItemType, ItemRarity } from '../types';
import { ITEM_TYPES, RARITY_CONFIG } from '../constants';
import { PackagePlus, Trash2, Edit, X, Shield, Sword, Sparkles, ShoppingBag, ArrowRightLeft, Search, Filter, Ban, Coins, CheckSquare, Square, ChevronUp, ChevronDown } from 'lucide-react';

const InventoryPage: React.FC = () => {
  const { items, members, addItem, updateItem, sellItem, sellBatchItems, withdrawItem, deleteItem, deleteBatchItems } = useGuild();
  
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'sell' | 'withdraw' | 'delete' | 'bulkSell' | 'bulkDelete' | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [tempItemData, setTempItemData] = useState<Partial<Item>>({
      type: 'Tesouro', rarity: 'Comum', quantity: 1, value: 0, isQuestItem: false, isNonNegotiable: false, name: '', origin: '', encounter: ''
  });
  
  const [opQty, setOpQty] = useState(1);
  const [opMemberId, setOpMemberId] = useState('');
  const [opReason, setOpReason] = useState('');
  const [sellPercent, setSellPercent] = useState(50);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ItemType | 'Todos'>('Todos');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sorting State
  type SortField = 'name' | 'type' | 'quantity' | 'value';
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const openAdd = () => {
      setTempItemData({ type: 'Tesouro', rarity: 'Comum', quantity: 1, value: 0, isQuestItem: false, isNonNegotiable: false, name: '', origin: '', encounter: '' });
      setModalMode('add');
  };

  const closeModal = () => {
    setModalMode(null); setActiveItem(null); setOpQty(1); setOpMemberId(''); setOpReason(''); setSellPercent(50);
  };

  const handleSaveItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (modalMode === 'add') addItem(tempItemData as Omit<Item, 'id'>);
      else if (modalMode === 'edit' && activeItem) updateItem(activeItem.id, tempItemData);
      closeModal();
  };
  
  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === sortedItems.length) setSelectedIds(new Set());
      else setSelectedIds(new Set(sortedItems.map(i => i.id)));
  };
  
  const handleBulkSell = (e: React.FormEvent) => {
      e.preventDefault();
      sellBatchItems(Array.from(selectedIds), opMemberId, sellPercent);
      setSelectedIds(new Set());
      closeModal();
  };

  const handleBulkDelete = () => {
      deleteBatchItems(Array.from(selectedIds));
      setSelectedIds(new Set());
      closeModal();
  };

  const filteredItems = useMemo(() => {
      return items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'Todos' || item.type === filterType;
        return matchesSearch && matchesType;
      });
  }, [items, searchTerm, filterType]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
        let valA: string | number = a[sortField];
        let valB: string | number = b[sortField];

        // Ensure case-insensitive string comparison
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
  }, [filteredItems, sortField, sortDirection]);
  
  const totalAssetsValue = items.reduce((acc, item) => acc + (item.value * item.quantity), 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortField(field);
        setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
      if (sortField !== field) return null;
      return sortDirection === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />;
  };

  return (
    <div className="space-y-10 pb-20 font-serif relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Arsenal e Bens</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Relíquias e espólios catalogados no Grimório.</p>
        </div>
        <div className="flex gap-4">
             <div className="bg-black/20 p-4 rounded-2xl border border-fantasy-gold/20 flex flex-col items-end justify-center min-w-[150px]">
                 <span className="text-[9px] font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/50 tracking-widest">Patrimônio em Bens</span>
                 <span className="text-2xl font-medieval text-fantasy-gold">T$ {totalAssetsValue.toLocaleString()}</span>
             </div>
             <button onClick={openAdd} className="bg-fantasy-blood hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-medieval uppercase tracking-widest shadow-2xl border-b-4 border-red-950 transition-all active:translate-y-1">
                <PackagePlus size={24} /> Novo Registro
             </button>
        </div>
      </header>
      
      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-[#1a0f08] border-2 border-fantasy-gold text-fantasy-parchment px-8 py-4 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-6 animate-slide-up">
              <span className="font-black uppercase tracking-widest text-xs">{selectedIds.size} Selecionados</span>
              <div className="h-6 w-px bg-fantasy-gold/30"></div>
              <button onClick={() => setModalMode('bulkSell')} className="flex items-center gap-2 hover:text-emerald-400 transition-colors uppercase font-medieval tracking-widest text-sm"><ShoppingBag size={18}/> Vender Lote</button>
              <button onClick={() => setModalMode('bulkDelete')} className="flex items-center gap-2 hover:text-red-500 transition-colors uppercase font-medieval tracking-widest text-sm"><Trash2 size={18}/> Queimar</button>
              <div className="h-6 w-px bg-fantasy-gold/30"></div>
              <button onClick={() => setSelectedIds(new Set())} className="hover:text-white transition-colors"><X size={20}/></button>
          </div>
      )}

      <div className="parchment-card p-6 rounded-[32px] border-2 border-fantasy-wood/10 dark:border-white/10 flex flex-col md:flex-row gap-6 shadow-xl">
          <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-fantasy-wood/30 dark:text-fantasy-parchment/20" size={24} />
              <input type="text" placeholder="Buscar por nome..." className="w-full bg-white/20 dark:bg-black/30 border-2 border-fantasy-wood/10 dark:border-white/5 rounded-2xl pl-16 pr-6 py-4 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-lg focus:outline-none focus:border-fantasy-gold transition-all shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
              <button onClick={() => setFilterType('Todos')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'Todos' ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-black/5 dark:bg-white/5 text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>Todos</button>
              {ITEM_TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t as ItemType)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === t ? 'bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black shadow-lg' : 'bg-black/5 dark:bg-white/5 text-fantasy-wood/50 dark:text-fantasy-parchment/50'}`}>{t}</button>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredItems.length === 0 ? (
          <div className="parchment-card p-36 rounded-[60px] border-4 border-dashed border-fantasy-wood/10 dark:border-fantasy-parchment/10 text-center opacity-60">
             <Shield size={100} className="mx-auto mb-10 text-fantasy-wood/20 dark:text-fantasy-parchment/10"/>
             <p className="font-medieval text-4xl uppercase italic text-fantasy-wood dark:text-fantasy-parchment">O arsenal está vazio ou nenhum item encontrado...</p>
          </div>
        ) : (
          <div className="parchment-card rounded-[60px] overflow-hidden shadow-5xl border-4 border-fantasy-gold/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-serif">
                <thead className="bg-fantasy-wood/5 dark:bg-black/20 border-b-2 border-fantasy-wood/20 dark:border-white/10">
                  <tr className="text-[10px] font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/40 tracking-[0.3em]">
                    <th className="px-6 py-8 text-center w-16">
                        <button onClick={toggleSelectAll} className="opacity-50 hover:opacity-100 transition-opacity">
                            {selectedIds.size === sortedItems.length && sortedItems.length > 0 ? <CheckSquare size={20}/> : <Square size={20}/>}
                        </button>
                    </th>
                    <th className="px-6 py-8 cursor-pointer hover:text-fantasy-gold transition-colors select-none" onClick={() => handleSort('name')}>
                        Relíquia / Bem <SortIcon field="name"/>
                    </th>
                    <th className="px-6 py-8 cursor-pointer hover:text-fantasy-gold transition-colors select-none" onClick={() => handleSort('type')}>
                        Essência <SortIcon field="type"/>
                    </th>
                    <th className="px-6 py-8 text-center cursor-pointer hover:text-fantasy-gold transition-colors select-none" onClick={() => handleSort('quantity')}>
                        Qtd <SortIcon field="quantity"/>
                    </th>
                    <th className="px-6 py-8 cursor-pointer hover:text-fantasy-gold transition-colors select-none" onClick={() => handleSort('value')}>
                        Valor Estimado <SortIcon field="value"/>
                    </th>
                    <th className="px-6 py-8 text-right">Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fantasy-wood/10 dark:divide-white/5">
                  {sortedItems.map(item => {
                    const rarityStyle = RARITY_CONFIG[item.rarity || 'Comum'];
                    const isSelected = selectedIds.has(item.id);
                    
                    return (
                    <tr key={item.id} className={`transition-colors group ${rarityStyle.bg} ${isSelected ? 'bg-fantasy-gold/20' : 'hover:bg-fantasy-gold/5'}`}>
                      <td className="px-6 py-8 text-center">
                          <button onClick={() => toggleSelection(item.id)} className={`transition-all ${isSelected ? 'text-fantasy-gold scale-110' : 'text-fantasy-wood/20 dark:text-fantasy-parchment/20 hover:text-fantasy-gold'}`}>
                              {isSelected ? <CheckSquare size={20}/> : <Square size={20}/>}
                          </button>
                      </td>
                      <td className="px-6 py-8">
                        <div className={`font-medieval text-2xl leading-none mb-3 ${rarityStyle.color}`}>{item.name}</div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${rarityStyle.border} ${rarityStyle.color}`}>
                              {rarityStyle.label}
                          </span>
                          {item.isQuestItem && <span className="text-[8px] bg-purple-700 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Item de Missão</span>}
                          {item.isNonNegotiable && <span className="text-[8px] bg-red-800 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Inalienável</span>}
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <span className="text-[10px] font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 flex items-center gap-3 tracking-widest border border-fantasy-wood/10 dark:border-white/10 px-4 py-2 rounded-full w-max">
                          {item.type === 'Arma' ? <Sword size={16}/> : item.type === 'Equipamento' ? <Shield size={16}/> : <Sparkles size={16}/>}
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-8 text-center font-medieval text-3xl text-fantasy-wood/80 dark:text-fantasy-parchment/80">{item.quantity}</td>
                      <td className="px-6 py-8">
                         <div className="font-medieval text-2xl text-emerald-800 dark:text-emerald-400">T$ {item.value.toLocaleString()}</div>
                         <div className="text-[9px] text-fantasy-wood/40 dark:text-fantasy-parchment/40 font-black uppercase tracking-widest mt-1">Total: T$ {(item.value * item.quantity).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          {item.isNonNegotiable ? (
                             <div className="p-4 opacity-50 cursor-not-allowed" title="Item Inalienável"><Ban size={20} className="text-red-900 dark:text-red-500"/></div>
                          ) : (
                             <button onClick={() => { setActiveItem(item); setModalMode('sell'); }} title="Vender" className="p-4 bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 dark:text-emerald-400 rounded-2xl transition-all">
                                <ShoppingBag size={20} />
                             </button>
                          )}
                          <button onClick={() => { setActiveItem(item); setModalMode('withdraw'); }} title="Retirar" className="p-4 bg-blue-700/10 hover:bg-blue-700/20 text-blue-800 dark:text-blue-400 rounded-2xl transition-all">
                            <ArrowRightLeft size={20} />
                          </button>
                          <button onClick={() => { setActiveItem(item); setTempItemData({...item}); setModalMode('edit'); }} title="Editar" className="p-4 bg-fantasy-wood/5 dark:bg-white/5 hover:bg-fantasy-wood/10 dark:hover:bg-white/10 rounded-2xl text-fantasy-wood dark:text-fantasy-parchment transition-all">
                            <Edit size={20} />
                          </button>
                          <button onClick={() => { setActiveItem(item); setOpQty(1); setModalMode('delete'); }} title="Remover" className="p-4 bg-red-700/10 hover:bg-red-700/20 text-red-800 dark:text-red-400 rounded-2xl transition-all">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[150] p-4 backdrop-blur-xl animate-fade-in">
          <div className="parchment-card p-14 rounded-[80px] w-full max-w-2xl border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={closeModal} className="absolute top-10 right-10 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-4 bg-white/20 dark:bg-black/20 rounded-full transition-colors"><X size={32}/></button>

            {(modalMode === 'add' || modalMode === 'edit') && (
                <form onSubmit={handleSaveItem} className="space-y-10">
                    <div className="flex flex-col items-center text-center">
                       <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white shadow-2xl animate-float"><PackagePlus size={48}/></div>
                       <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">{modalMode === 'add' ? 'Registrar Nova Relíquia' : 'Alterar Registro do Arsenal'}</h3>
                    </div>
                    
                    <div className="space-y-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Nomenclatura da Peça</label>
                           <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl focus:outline-none focus:border-fantasy-gold shadow-inner" required 
                             value={tempItemData.name} onChange={e => setTempItemData({...tempItemData, name: e.target.value})} placeholder="Ex: Machado de Valkaria" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Essência / Categoria</label>
                                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl appearance-none cursor-pointer"
                                    value={tempItemData.type} onChange={e => setTempItemData({...tempItemData, type: e.target.value as ItemType})}>
                                    {ITEM_TYPES.map(t => <option key={t} value={t} className="dark:bg-black">{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Raridade</label>
                                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl appearance-none cursor-pointer"
                                    value={tempItemData.rarity} onChange={e => setTempItemData({...tempItemData, rarity: e.target.value as ItemRarity})}>
                                    {Object.keys(RARITY_CONFIG).map(r => <option key={r} value={r} className="dark:bg-black">{r}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Quantidade no Cofre</label>
                                <input 
                                  type="number" 
                                  min="1" 
                                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl shadow-inner"
                                  value={tempItemData.quantity} 
                                  onChange={e => setTempItemData({...tempItemData, quantity: Number(e.target.value)})}
                                  onFocus={(e) => e.target.select()}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Valor Unitário (T$)</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl shadow-inner"
                                  value={tempItemData.value} 
                                  onChange={e => setTempItemData({...tempItemData, value: Number(e.target.value)})}
                                  onFocus={(e) => e.target.select()}
                                />
                            </div>
                        </div>
                        <div className="space-y-4 pt-4">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input type="checkbox" checked={tempItemData.isQuestItem} onChange={e => setTempItemData({...tempItemData, isQuestItem: e.target.checked})} className="w-6 h-6 accent-purple-800" />
                                <span className="text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors">Vínculo de Missão</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input type="checkbox" checked={tempItemData.isNonNegotiable} onChange={e => setTempItemData({...tempItemData, isNonNegotiable: e.target.checked})} className="w-6 h-6 accent-red-800" />
                                <span className="text-xs font-black uppercase text-fantasy-wood/60 dark:text-fantasy-parchment/60 group-hover:text-fantasy-wood transition-colors">Peça Inalienável</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-fantasy-blood text-white py-10 rounded-[56px] font-medieval text-3xl uppercase tracking-widest shadow-5xl border-b-8 border-red-950 transition-all active:translate-y-2 active:border-b-0">
                        {modalMode === 'add' ? 'Lacrar Arsenal' : 'Atualizar Registro'}
                    </button>
                </form>
            )}

            {(modalMode === 'sell' || modalMode === 'bulkSell') && (
                <form onSubmit={modalMode === 'bulkSell' ? handleBulkSell : (e) => { e.preventDefault(); if(activeItem) sellItem(activeItem.id, opQty, opMemberId, sellPercent); closeModal(); }} className="space-y-12">
                     <div className="flex flex-col items-center text-center">
                       <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white"><ShoppingBag size={48}/></div>
                       <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">{modalMode === 'bulkSell' ? 'Venda em Lote' : 'Negociar Relíquia'}</h3>
                       {modalMode === 'sell' && activeItem && <p className="text-2xl font-medieval text-fantasy-wood/60 dark:text-fantasy-parchment/60 mt-4">{activeItem.name}</p>}
                       {modalMode === 'bulkSell' && <p className="text-sm font-black text-fantasy-wood/50 dark:text-fantasy-parchment/50 uppercase tracking-widest mt-4">{selectedIds.size} Itens Selecionados</p>}
                    </div>

                    <div className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Vendedor Responsável</label>
                                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl appearance-none cursor-pointer" required value={opMemberId} onChange={e => setOpMemberId(e.target.value)}>
                                   <option value="" className="dark:bg-black">Escolha...</option>
                                   {members.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name}</option>)}
                                </select>
                            </div>
                            {modalMode === 'sell' && activeItem && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Quantidade (Máx: {activeItem.quantity})</label>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      max={activeItem.quantity} 
                                      className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl" 
                                      required 
                                      value={opQty} 
                                      onChange={e => setOpQty(Number(e.target.value))}
                                      onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            )}
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Percentual de Venda: {sellPercent}%</label>
                            <input type="range" min="10" max="150" step="5" className="w-full accent-fantasy-gold" value={sellPercent} onChange={e => setSellPercent(Number(e.target.value))} />
                         </div>
                         
                         {modalMode === 'sell' && activeItem && (
                             <div className="p-8 bg-emerald-900/10 dark:bg-emerald-400/5 rounded-[40px] border-4 border-emerald-900/20 dark:border-emerald-400/20 text-center">
                                <p className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest">Tibares de Prata a Receber</p>
                                <p className="text-5xl font-medieval text-emerald-900 dark:text-emerald-400 mt-2">T$ {Math.floor((activeItem.value * opQty) * (sellPercent / 100)).toLocaleString()}</p>
                             </div>
                         )}
                         {modalMode === 'bulkSell' && (
                             <div className="p-8 bg-emerald-900/10 dark:bg-emerald-400/5 rounded-[40px] border-4 border-emerald-900/20 dark:border-emerald-400/20 text-center">
                                <p className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest">Aviso de Lote</p>
                                <p className="text-lg font-serif italic text-emerald-900/80 dark:text-emerald-400/80 mt-2">Todo o estoque dos itens selecionados será vendido.</p>
                             </div>
                         )}
                    </div>

                    <button type="submit" className="w-full bg-emerald-800 text-white py-10 rounded-[56px] font-medieval text-3xl uppercase tracking-widest shadow-5xl border-b-8 border-emerald-950 transition-all active:translate-y-2 active:border-b-0">
                        Confirmar Transação
                    </button>
                </form>
            )}

            {modalMode === 'withdraw' && activeItem && (
                 <form onSubmit={(e) => { e.preventDefault(); withdrawItem(activeItem.id, opMemberId, opReason, opQty); closeModal(); }} className="space-y-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="wax-seal w-24 h-24 mb-6 flex items-center justify-center text-white"><ArrowRightLeft size={48}/></div>
                        <h3 className="text-4xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter">Retirar do Arsenal</h3>
                        <p className="text-2xl font-medieval text-fantasy-wood/60 dark:text-fantasy-parchment/60 mt-4">{activeItem.name}</p>
                    </div>

                    <div className="space-y-8">
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Portador Designado</label>
                                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl appearance-none cursor-pointer" required value={opMemberId} onChange={e => setOpMemberId(e.target.value)}>
                                   <option value="" className="dark:bg-black">Escolha...</option>
                                   {members.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Quantidade (Máx: {activeItem.quantity})</label>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max={activeItem.quantity} 
                                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl" 
                                  required 
                                  value={opQty} 
                                  onChange={e => setOpQty(Number(e.target.value))}
                                  onFocus={(e) => e.target.select()}
                                />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase ml-6 tracking-widest">Justificativa da Retirada</label>
                            <input className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-2xl" required value={opReason} onChange={e => setOpReason(e.target.value)} placeholder="Ex: Preparação para masmorra" />
                         </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-800 text-white py-10 rounded-[56px] font-medieval text-3xl uppercase tracking-widest shadow-5xl border-b-8 border-blue-950 transition-all active:translate-y-2 active:border-b-0">
                        Autorizar Entrega
                    </button>
                 </form>
            )}

            {(modalMode === 'delete' || modalMode === 'bulkDelete') && (
                <div className="space-y-12 text-center">
                    <div className="wax-seal w-28 h-28 mx-auto flex items-center justify-center text-white"><Trash2 size={56}/></div>
                    <div className="space-y-4">
                        <h3 className="text-4xl font-medieval text-fantasy-blood uppercase">Destruir Registro?</h3>
                        <p className="text-lg text-fantasy-wood/60 dark:text-fantasy-parchment/60 font-serif italic">Esta ação é irreversível.</p>
                        {modalMode === 'delete' && activeItem && <p className="text-2xl font-medieval text-fantasy-wood dark:text-fantasy-parchment">{activeItem.name}</p>}
                        {modalMode === 'bulkDelete' && <p className="text-xl font-medieval text-fantasy-wood dark:text-fantasy-parchment">{selectedIds.size} Itens Selecionados</p>}
                    </div>
                    
                    {modalMode === 'delete' && activeItem && (
                        <div className="space-y-3 max-w-xs mx-auto">
                            <label className="text-[10px] font-black text-fantasy-wood/50 dark:text-fantasy-parchment/40 uppercase tracking-widest">Quantidade a Remover</label>
                            <input 
                              type="number" 
                              min="1" 
                              max={activeItem.quantity} 
                              className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[32px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-3xl text-center" 
                              value={opQty} 
                              onChange={e => setOpQty(Number(e.target.value))}
                              onFocus={(e) => e.target.select()}
                            />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6">
                        <button onClick={closeModal} className="flex-1 py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest bg-black/5 dark:bg-white/5 text-fantasy-wood dark:text-fantasy-parchment transition-all hover:bg-black/10">Manter Relíquia</button>
                        <button onClick={() => { if(modalMode === 'bulkDelete') handleBulkDelete(); else if (activeItem) deleteItem(activeItem.id, opQty); closeModal(); }} className="flex-1 py-8 rounded-[40px] font-medieval text-2xl uppercase tracking-widest bg-fantasy-blood text-white shadow-2xl transition-all hover:scale-105">Queimar Registro</button>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;