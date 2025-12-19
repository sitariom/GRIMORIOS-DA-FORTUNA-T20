import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { CurrencyType } from '../types';
import { RATES } from '../constants';
import { ArrowLeftRight, Scroll, Coins, AlertCircle, TrendingUp } from 'lucide-react';

const FinancialPage: React.FC = () => {
  const { wallet, members, deposit, withdraw, convertWallet, notify } = useGuild();
  
  const [opType, setOpType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<CurrencyType>('TS');
  const [memberId, setMemberId] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const [convAmount, setConvAmount] = useState<number>(0);
  const [convFrom, setConvFrom] = useState<CurrencyType>('TS');
  const [convTo, setConvTo] = useState<CurrencyType>('TO');

  const handleOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) {
        notify("Selecione um Aventureiro Responsável.", "error");
        return;
    }
    if (amount <= 0) {
        notify("O valor deve ser maior que zero.", "error");
        return;
    }
    if (opType === 'deposit') deposit(memberId, amount, currency, reason);
    else withdraw(memberId, amount, currency, reason);
    setAmount(0); setReason(''); setMemberId('');
  };

  const handleConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (convAmount <= 0) return;
    convertWallet(convAmount, convFrom, convTo);
    setConvAmount(0);
  };

  // Cálculo de prévia de conversão e troco estimado
  const previewResult = Math.floor((convAmount * RATES[convFrom]) / RATES[convTo]);
  const cost = (previewResult * RATES[convTo]) / RATES[convFrom];
  const remainder = convAmount - cost;

  const handleCoinClick = (type: CurrencyType) => {
      setCurrency(type);
      setConvFrom(type);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const setMaxConversion = () => {
      setConvAmount(wallet[convFrom]);
  };

  return (
    <div className="space-y-12 pb-20 font-serif">
      <header>
        <h2 className="text-4xl md:text-6xl font-medieval text-white tracking-tighter uppercase leading-none mb-3">Finanças do grupo</h2>
        <p className="text-xs md:text-lg text-fantasy-gold font-bold uppercase tracking-[0.3em]">Gestão central de Tibares e Riquezas.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Tibares de Cobre (TC)', code: 'TC', val: wallet.TC, color: 'text-orange-900 dark:text-orange-500', bg: 'bg-orange-900/10', border: 'border-orange-900/30' },
          { label: 'Tibares de Prata (T$)', code: 'TS', val: wallet.TS, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-600/10', border: 'border-slate-600/30' },
          { label: 'Tibares de Ouro (TO)', code: 'TO', val: wallet.TO, color: 'text-fantasy-gold', bg: 'bg-fantasy-gold/20', border: 'border-fantasy-gold/40' },
          { label: 'Lingotes de Ouro (LO)', code: 'LO', val: wallet.LO, color: 'text-indigo-900 dark:text-indigo-400', bg: 'bg-indigo-900/10', border: 'border-indigo-900/30' },
        ].map((coin, i) => (
          <button key={i} onClick={() => handleCoinClick(coin.code as CurrencyType)} className={`parchment-card p-10 rounded-[40px] border-b-[8px] ${coin.border} shadow-2xl animate-scroll-unroll text-left hover:scale-105 transition-transform group`} style={{ animationDelay: `${i*100}ms` }}>
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 ${coin.bg} rounded-3xl ${coin.color} group-hover:shadow-lg transition-shadow`}><Coins size={40}/></div>
              <div className="wax-seal w-10 h-10 group-hover:scale-110 transition-transform"></div>
            </div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-fantasy-wood dark:text-fantasy-parchment/40 mb-2">{coin.label}</div>
            <div className={`text-4xl font-medieval ${coin.color}`}>{coin.val.toLocaleString()}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Transaction Form */}
        <div className="parchment-card p-8 md:p-12 rounded-[60px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10">
          <h3 className="font-medieval text-3xl md:text-4xl text-fantasy-wood dark:text-fantasy-parchment mb-12 border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-8 flex items-center gap-6">
            <Scroll size={40} className="text-fantasy-gold"/> Escrituração do Livro
          </h3>
          
          <div className="flex gap-4 md:gap-6 mb-12 bg-black/10 p-2.5 rounded-[32px] border border-fantasy-wood/10 dark:border-white/10">
            <button onClick={() => setOpType('deposit')} className={`flex-1 py-4 md:py-5 rounded-[24px] font-medieval uppercase tracking-widest text-base md:text-lg transition-all ${opType === 'deposit' ? 'bg-emerald-800 text-white shadow-2xl scale-105' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood'}`}>Entrada</button>
            <button onClick={() => setOpType('withdraw')} className={`flex-1 py-4 md:py-5 rounded-[24px] font-medieval uppercase tracking-widest text-base md:text-lg transition-all ${opType === 'withdraw' ? 'bg-red-800 text-white shadow-2xl scale-105' : 'text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood'}`}>Saída</button>
          </div>

          <form onSubmit={handleOperation} className="space-y-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase ml-4 tracking-widest">Aventureiro Responsável</label>
              <select 
                className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl focus:outline-none appearance-none cursor-pointer hover:bg-white/60 dark:hover:bg-black/60 transition-colors" 
                value={memberId} 
                onChange={e => setMemberId(e.target.value)} 
                required
              >
                <option value="" className="dark:bg-black">Selecione do Grupo...</option>
                {members.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase ml-4 tracking-widest">Montante</label>
                <input 
                  type="number" 
                  min="0" 
                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl shadow-inner focus:outline-none focus:border-fantasy-gold/50 transition-colors" 
                  value={amount} 
                  onChange={e => setAmount(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  required 
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase ml-4 tracking-widest">Tipo de Moeda</label>
                <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none cursor-pointer hover:bg-white/60 dark:hover:bg-black/60 transition-colors" value={currency} onChange={e => setCurrency(e.target.value as CurrencyType)}>
                  <option value="TC" className="dark:bg-black">T. de Cobre</option>
                  <option value="TS" className="dark:bg-black">T. de Prata</option>
                  <option value="TO" className="dark:bg-black">T. de Ouro</option>
                  <option value="LO" className="dark:bg-black">Lingote Ouro</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase ml-4 tracking-widest">Justificativa da Transação</label>
              <input type="text" placeholder="Ex: Espólios de masmorra..." className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl italic shadow-inner focus:outline-none focus:border-fantasy-gold/50 transition-colors" value={reason} onChange={e => setReason(e.target.value)} required />
            </div>

            <button type="submit" className={`w-full py-8 md:py-10 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-2xl transition-all border-b-8 active:border-b-0 active:translate-y-2 ${opType === 'deposit' ? 'bg-emerald-800 border-emerald-950 text-white shadow-[0_10px_40px_rgba(6,78,59,0.3)] hover:bg-emerald-700' : 'bg-red-800 border-red-950 text-white shadow-[0_10px_40px_rgba(153,27,27,0.3)] hover:bg-red-700'}`}>
              Lacrar Transação no Livro
            </button>
          </form>
        </div>

        {/* Exchange Form */}
        <div className="parchment-card p-8 md:p-12 rounded-[60px] shadow-2xl border-4 border-fantasy-wood/10 dark:border-white/10">
           <h3 className="font-medieval text-3xl md:text-4xl text-fantasy-wood dark:text-fantasy-parchment mb-8 border-b-4 border-fantasy-wood/10 dark:border-white/10 pb-8 flex items-center gap-6">
            <ArrowLeftRight size={40} className="text-fantasy-gold"/> Casa de Câmbio
          </h3>

          <div className="mb-10 bg-fantasy-gold/10 dark:bg-fantasy-gold/5 rounded-[32px] p-6 border border-fantasy-gold/20 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={18} className="text-fantasy-gold"/>
                  <span className="text-[10px] font-black uppercase tracking-widest text-fantasy-wood/60 dark:text-fantasy-parchment/60">Taxas do Mercado</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/20 dark:bg-black/20 p-2 rounded-xl border border-fantasy-wood/5 dark:border-white/5">
                      <div className="text-xs font-bold text-fantasy-wood dark:text-fantasy-parchment">10 TC = 1 TS</div>
                  </div>
                  <div className="bg-white/20 dark:bg-black/20 p-2 rounded-xl border border-fantasy-wood/5 dark:border-white/5">
                      <div className="text-xs font-bold text-fantasy-wood dark:text-fantasy-parchment">10 TS = 1 TO</div>
                  </div>
                  <div className="bg-white/20 dark:bg-black/20 p-2 rounded-xl border border-fantasy-wood/5 dark:border-white/5">
                      <div className="text-xs font-bold text-fantasy-wood dark:text-fantasy-parchment">100 TO = 1 LO</div>
                  </div>
                  <div className="bg-white/20 dark:bg-black/20 p-2 rounded-xl border border-fantasy-wood/5 dark:border-white/5">
                      <div className="text-xs font-bold text-fantasy-wood dark:text-fantasy-parchment">1 LO = 1k TS</div>
                  </div>
              </div>
          </div>
          
          <form onSubmit={handleConversion} className="space-y-10">
             <div className="space-y-3">
                <div className="flex justify-between items-end ml-4 mr-2">
                    <label className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase tracking-widest">Quantidade a Trocar</label>
                    <button type="button" onClick={setMaxConversion} className="text-[10px] font-black uppercase bg-fantasy-wood/10 dark:bg-white/10 hover:bg-fantasy-wood/20 px-3 py-1 rounded-lg text-fantasy-wood dark:text-fantasy-parchment transition-colors">
                        Máx: {wallet[convFrom]}
                    </button>
                </div>
                <input 
                  type="number" 
                  min="0" 
                  className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-10 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-4xl md:text-6xl text-center focus:outline-none shadow-inner focus:border-fantasy-gold/50 transition-colors" 
                  value={convAmount} 
                  onChange={e => setConvAmount(Number(e.target.value))} 
                  onFocus={(e) => e.target.select()}
                  required 
                />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1 w-full space-y-3">
                 <label className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase ml-4 tracking-widest">Oferta</label>
                 <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none hover:bg-white/60 dark:hover:bg-black/60 transition-colors cursor-pointer" value={convFrom} onChange={e => setConvFrom(e.target.value as CurrencyType)}>
                    <option value="TC" className="dark:bg-black">TC</option>
                    <option value="TS" className="dark:bg-black">T$</option>
                    <option value="TO" className="dark:bg-black">TO</option>
                    <option value="LO" className="dark:bg-black">LO</option>
                 </select>
               </div>
               <div className="text-fantasy-wood/20 dark:text-fantasy-gold/20 pt-0 md:pt-10 shrink-0 transform rotate-90 md:rotate-0"><ArrowLeftRight size={32}/></div>
               <div className="flex-1 w-full space-y-3">
                 <label className="text-xs font-black text-fantasy-wood/60 dark:text-fantasy-parchment/60 uppercase ml-4 tracking-widest">Destino</label>
                 <select className="w-full bg-white/40 dark:bg-black/40 border-2 border-fantasy-wood/10 dark:border-white/10 rounded-[28px] px-8 py-6 text-fantasy-wood dark:text-fantasy-parchment font-medieval text-xl md:text-2xl appearance-none hover:bg-white/60 dark:hover:bg-black/60 transition-colors cursor-pointer" value={convTo} onChange={e => setConvTo(e.target.value as CurrencyType)}>
                    <option value="TC" className="dark:bg-black">TC</option>
                    <option value="TS" className="dark:bg-black">T$</option>
                    <option value="TO" className="dark:bg-black">TO</option>
                    <option value="LO" className="dark:bg-black">LO</option>
                 </select>
               </div>
            </div>

            <div className="p-10 bg-black/5 dark:bg-black/20 rounded-[48px] border-4 border-fantasy-gold/20 flex flex-col items-center justify-center text-center shadow-inner transition-colors relative overflow-hidden">
               {previewResult === 0 && convAmount > 0 && (
                   <div className="absolute top-4 flex items-center gap-2 text-red-600 dark:text-red-400 animate-pulse">
                       <AlertCircle size={14}/>
                       <span className="text-[10px] font-black uppercase tracking-widest">Quantidade Insuficiente</span>
                   </div>
               )}
               <span className="text-xs font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/40 tracking-[0.4em] mb-3">Valor Estimado</span>
               <span className={`text-4xl md:text-6xl font-medieval ${previewResult === 0 && convAmount > 0 ? 'text-red-600/50 dark:text-red-400/50' : 'text-fantasy-wood dark:text-fantasy-gold'}`}>
                 {previewResult.toLocaleString()} <span className="text-2xl md:text-3xl text-fantasy-gold">{convTo}</span>
               </span>
               {remainder > 0 && (
                   <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-fantasy-wood/40 dark:text-fantasy-parchment/40 border-t border-fantasy-wood/10 dark:border-white/5 pt-2">
                       Troco Preservado: {remainder.toLocaleString()} {convFrom}
                   </div>
               )}
            </div>

            <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold dark:text-black text-fantasy-gold py-8 md:py-10 rounded-[40px] font-medieval text-2xl uppercase tracking-[0.2em] shadow-2xl border-b-8 border-black dark:border-red-950 active:border-b-0 active:translate-y-2 transition-all hover:bg-[#2d1b12] dark:hover:bg-[#d4af37]/90 disabled:opacity-50 disabled:cursor-not-allowed" disabled={previewResult === 0}>
              Autorizar Troca Régia
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;