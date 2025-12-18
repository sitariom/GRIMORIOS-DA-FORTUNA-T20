
import React from 'react';
import { 
  LayoutDashboard, Coins, Package, Castle, LandPlot, Users, 
  X, History, Contact, ShieldCheck, Scroll, Hammer, BookOpen, 
  Sword, Map, Briefcase, FileText, NotebookPen, Sun, Moon
} from 'lucide-react';
import { useGuild } from '../context/GuildContext';
import { RATES } from '../constants';
import Logo from './Logo';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isOpen: boolean;
  toggle: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, toggle, theme, toggleTheme }) => {
  const { wallet, domains, guildName } = useGuild();
  
  const totalWealth = (wallet.TC * RATES.TC) + (wallet.TS * RATES.TS) + (wallet.TO * RATES.TO) + (wallet.LO * RATES.LO) + 
                     domains.reduce((acc, domain) => acc + (domain.treasury * RATES.LO), 0);

  const navItems = [
    { id: 'guilds', label: 'Minhas campanhas', icon: ShieldCheck },
    { id: 'dashboard', label: 'Resumo & analise', icon: LayoutDashboard },
    { id: 'finance', label: 'Finanças do grupo', icon: Coins },
    { id: 'cashflow', label: 'Registros tesouraria', icon: History },
    { id: 'inventory', label: 'Arsenal e bens', icon: Package },
    { id: 'itemhistory', label: 'Movimentação de itens', icon: BookOpen },
    { id: 'bases', label: 'Bases', icon: Castle },
    { id: 'domains', label: 'Dominios', icon: LandPlot },
    { id: 'npcs', label: 'Funcionarios e serviçoss', icon: Contact },
    { id: 'investments', label: 'Investimentos', icon: Hammer },
    { id: 'members', label: 'Aventureiros', icon: Users },
    { id: 'chronicles', label: 'Livro de Crônicas', icon: NotebookPen },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-md transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggle}
      />

      <aside className={`fixed md:static inset-y-0 left-0 w-80 bg-[#1e140d] dark:bg-black border-r-8 border-[#3d2b1f] z-50 transform transition-all duration-500 md:transform-none ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} flex flex-col`}>
        <div className="pt-12 pb-8 px-8 border-b-4 border-[#3d2b1f] relative bg-black/10">
          <button 
            onClick={toggleTheme}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-fantasy-gold transition-all active:scale-90 z-10"
            title={theme === 'light' ? 'Grimório de Sombras' : 'Pergaminho de Luz'}
          >
            {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
          </button>
          
          <Logo size="md" />
          
          <button onClick={toggle} className="md:hidden absolute top-6 right-6 text-fantasy-gold"><X size={32}/></button>
        </div>

        <div className="p-6">
           <div className="parchment-card p-4 rounded-xl border-2 border-fantasy-gold/40 shadow-inner">
              <span className="text-[10px] font-black uppercase text-[#1a0f08] dark:text-fantasy-parchment/60 block mb-1 tracking-widest">Patrimônio Líquido</span>
              <span className="font-medieval text-2xl text-[#1a0f08] dark:text-fantasy-gold">T$ {totalWealth.toLocaleString('pt-BR')}</span>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); if(window.innerWidth < 768) toggle(); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all relative group ${
                  isActive 
                    ? 'bg-fantasy-gold/15 text-fantasy-gold border border-fantasy-gold/30 shadow-lg' 
                    : 'text-fantasy-parchment/40 hover:text-fantasy-parchment hover:bg-white/5'
                }`}
              >
                {isActive && <div className="absolute left-0 w-1.5 h-8 bg-fantasy-gold rounded-full shadow-[0_0_10px_#d4af37]"></div>}
                <Icon size={20} className={isActive ? 'text-fantasy-gold' : 'opacity-40 group-hover:opacity-100 transition-opacity'} />
                <span className="font-medieval uppercase text-xs tracking-[0.15em] text-left leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-8 border-t-4 border-[#3d2b1f] bg-black/30">
          <div className="flex items-center justify-center gap-3 text-[9px] font-black text-fantasy-gold/40 uppercase tracking-[0.4em]">
             <Scroll size={14}/> Crônicas de Arton
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
