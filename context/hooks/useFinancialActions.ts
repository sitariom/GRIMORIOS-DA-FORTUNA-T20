import { GuildState, CurrencyType, LogCategory, LogEntry } from '../../types';
import { RATES } from '../../constants';

interface FinancialDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  internalAddLog: (guild: GuildState, category: LogCategory, details: string, value: number, memberId: string) => LogEntry[];
}

export const useFinancialActions = ({ activeGuild, triggerSave, notify, internalAddLog }: FinancialDeps) => {
  const deposit = (memberId: string, amount: number, currency: CurrencyType, reason: string) => {
    const newWallet = { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] + amount };
    const valueInTS = amount * RATES[currency];
    triggerSave({
      ...activeGuild,
      wallet: newWallet,
      logs: internalAddLog(activeGuild, 'Deposito', `${reason} (${amount} ${currency})`, valueInTS, memberId)
    });
    notify("Depósito realizado.");
  };

  const withdraw = (memberId: string, amount: number, currency: CurrencyType, reason: string) => {
    if (activeGuild.wallet[currency] < amount) return notify("Fundos insuficientes.", "error");
    const newWallet = { ...activeGuild.wallet, [currency]: activeGuild.wallet[currency] - amount };
    const valueInTS = amount * RATES[currency];
    triggerSave({
      ...activeGuild,
      wallet: newWallet,
      logs: internalAddLog(activeGuild, 'Saque', `${reason} (${amount} ${currency})`, -valueInTS, memberId)
    });
    notify("Saque realizado.");
  };

  const convertWallet = (amount: number, from: CurrencyType, to: CurrencyType) => {
    if (activeGuild.wallet[from] < amount) return notify("Saldo insuficiente para conversão.", "error");
    
    const rate = RATES[from] / RATES[to];
    const converted = Math.floor(amount * rate);
    if (converted <= 0) return notify("Valor convertido é zero.", "error");

    const actualConverted = Math.floor((amount * RATES[from]) / RATES[to]);
    const actualCost = (actualConverted * RATES[to]) / RATES[from];

    if (actualConverted === 0) return notify("Quantidade insuficiente para gerar 1 unidade da moeda destino.", "error");

    const newWallet = { 
      ...activeGuild.wallet, 
      [from]: activeGuild.wallet[from] - actualCost,
      [to]: activeGuild.wallet[to] + actualConverted
    };

    triggerSave({
      ...activeGuild,
      wallet: newWallet,
      logs: internalAddLog(activeGuild, 'Conversao', `Cambio: ${actualCost} ${from} -> ${actualConverted} ${to}`, 0, 'system')
    });
    notify("Câmbio realizado com sucesso.");
  };

  return { deposit, withdraw, convertWallet };
};
