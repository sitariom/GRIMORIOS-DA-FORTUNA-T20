import React, { useState } from 'react';
import { useGuild } from '../context/GuildContext';
import { Shield, Sparkles, Minus, Plus, RefreshCw, Info } from 'lucide-react';

const DivinePointsPage: React.FC = () => {
  const { members, updateMember, bulkUpdateMembers, guildName } = useGuild();
  const [showRules, setShowRules] = useState(false);

  // Filter only active members based on requirements
  const activeMembers = members.filter(m => {
    const s = String(m.status || 'Ativo').trim().toLowerCase();
    return s !== 'inativo' && s !== 'morto';
  });

  const isMemberActive = (m: (typeof members)[number]) => {
    const s = String(m.status || 'Ativo').trim().toLowerCase();
    return s !== 'inativo' && s !== 'morto';
  };

  const handleUpdate = (id: string, currentAmount: number, change: number) => {
    const newVal = Math.max(0, currentAmount + change);
    updateMember(id, { divinePoints: newVal });
  };

  const handleResetAll = () => {
    if (confirm('Tem certeza de que deseja zerar os Pontos Divinos de TODOS os aventureiros ativos? Use isso apenas se o Agrado ao Deus da masmorra não for atingido por ninguém.')) {
      bulkUpdateMembers(ms =>
        ms.map(m => (isMemberActive(m) ? { ...m, divinePoints: 0 } : m))
      );
    }
  };

  const handleAddAll = (amount: number) => {
    if (confirm(`Tem certeza de que deseja adicionar ${amount} Ponto(s) Divino(s) a TODOS os aventureiros ativos?`)) {
      bulkUpdateMembers(ms =>
        ms.map(m =>
          isMemberActive(m) ? { ...m, divinePoints: (m.divinePoints || 0) + amount } : m
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-6 border-b-2 border-fantasy-gold/30 pb-4">
        <div>
          <h1 className="text-4xl font-medieval text-fantasy-gold">Pontos Divinos</h1>
          <p className="text-fantasy-wood/80 dark:text-fantasy-parchment/80 mt-2 max-w-2xl">
            Gerencie o favor dos Deuses. Conceda pontos com base no comportamento em masmorras e gaste-os para obter milagres heroicos na exploração.
          </p>
        </div>
        <button 
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a1b14] hover:bg-[#3d2b1f] border border-fantasy-gold/30 rounded-lg text-fantasy-gold transition-colors text-sm font-bold shadow"
        >
          <Info size={16} /> Ver Regras e Usos
        </button>
      </header>

      {showRules && (
        <div className="parchment-card p-6 rounded-2xl shadow-xl border-2 border-fantasy-gold/50 text-sm mb-8 space-y-4 text-fantasy-wood dark:text-fantasy-gold">
          <h2 className="font-medieval text-xl border-b border-fantasy-gold/30 pb-2">Agrado aos Deuses</h2>
          <p>
            Cada masmorra foi criada por um deus. A recompensa é maior caso sejam respeitados os costumes de seu criador (suas Obrigações e Restrições). 
            Quando um personagem vence uma masmorra e agrada a divindade, recebe <strong>1 Ponto Divino</strong>.
            Se todos agradarem o deus, recebem <strong>2 Pontos Divinos</strong> cada. Porém, se o grupo vencer mas <em>nenhum</em> personagem conseguir agradar, <strong>todos perdem todos os Pontos Divinos</strong>.
          </p>
          <h2 className="font-medieval text-xl border-b border-fantasy-gold/30 pb-2 mt-6 mt-4">Usos dos Pontos Divinos (Apenas no Labirinto)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Gastar <strong>1 PD</strong> para somar Sabedoria (mín. 1) num teste de perícia.</li>
            <li>Gastar <strong>1 PD</strong> para rolar novamente um teste de resistência.</li>
            <li>Gastar <strong>1 PD</strong> para recuperar PV igual ao triplo do seu nível.</li>
            <li>Gastar <strong>1 PD</strong> para recuperar PM igual à metade do seu nível.</li>
            <li>Gastar <strong>1 PD</strong> no seu turno para realizar uma ação padrão ou de movimento adicional.</li>
            <li>Gastar <strong>1 PD</strong> para usar um poder concedido por uma cena (de qualquer divindade de masmorra já visitada).</li>
          </ul>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button onClick={() => handleAddAll(1)} className="px-4 py-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-500 border border-blue-900/30 rounded-lg flex items-center gap-2 font-bold shadow transition-colors">
          <Plus size={18} /> Todos: +1 PD
        </button>
        <button onClick={() => handleAddAll(2)} className="px-4 py-2 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 border border-purple-900/30 rounded-lg flex items-center gap-2 font-bold shadow transition-colors">
          <Plus size={18} /> Todos: +2 PD
        </button>
        <button onClick={handleResetAll} className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/30 rounded-lg flex items-center gap-2 font-bold shadow transition-colors ml-auto">
          <RefreshCw size={18} /> Zerar Todos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeMembers.length === 0 && (
          <div className="col-span-full p-8 text-center text-fantasy-wood/50 dark:text-fantasy-parchment/50 border-2 border-dashed border-[#3d2b1f] rounded-2xl">
            <Shield className="mx-auto mb-2 opacity-50" size={32} />
            <p>Nenhum aventureiro ativo na guilda para receber Pontos Divinos.</p>
          </div>
        )}
        {activeMembers.map(member => {
          const pd = member.divinePoints || 0;
          return (
            <div key={member.id} className="parchment-card p-6 rounded-2xl shadow-xl border-2 border-[#3d2b1f] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fantasy-gold/5 rounded-bl-full -z-10 group-hover:bg-fantasy-gold/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-gold truncate pr-4">{member.name}</h3>
                <div className="bg-black/10 dark:bg-black/50 px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <Sparkles size={14} className="text-fantasy-gold" />
                  <span className="font-bold text-fantasy-gold">{pd} PD</span>
                </div>
              </div>

              <div className="flex justify-center items-center gap-6 mt-6">
                <button 
                  onClick={() => handleUpdate(member.id, pd, -1)}
                  disabled={pd <= 0}
                  className="p-3 bg-red-900/10 hover:bg-red-900/30 text-red-600 disabled:opacity-30 disabled:hover:bg-red-900/10 rounded-full transition-colors"
                >
                  <Minus size={24} />
                </button>
                <div className="font-medieval text-5xl text-fantasy-wood dark:text-fantasy-parchment w-16 text-center tabular-nums">
                  {pd}
                </div>
                <button 
                  onClick={() => handleUpdate(member.id, pd, 1)}
                  className="p-3 bg-green-900/10 hover:bg-green-900/30 text-green-600 rounded-full transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DivinePointsPage;
