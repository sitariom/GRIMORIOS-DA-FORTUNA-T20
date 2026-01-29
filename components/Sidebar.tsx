
import React from 'react';
import { 
  LayoutDashboard, Coins, Package, Castle, LandPlot, Users, 
  X, History, Contact, ShieldCheck, Scroll, Hammer, BookOpen, 
  NotebookPen, Sun, Moon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useGuild } from '../context/GuildContext';
import { RATES } from '../constants';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, theme, toggleTheme }) => {
  const { wallet, domains, isLoading } = useGuild();
  const location = useLocation();
  
  const totalWealth = isLoading ? 0 : (wallet.TC * RATES.TC) + (wallet.TS * RATES.TS) + (wallet.TO * RATES.TO) + (wallet.LO * RATES.LO) + 
                     domains.reduce((acc, domain) => acc + (domain.treasury * RATES.LO), 0);

  const navItems = [
    { path: '/guilds', label: 'Minhas campanhas', icon: ShieldCheck },
    { path: '/', label: 'Resumo & analise', icon: LayoutDashboard },
    { path: '/finance', label: 'Finanças do grupo', icon: Coins },
    { path: '/cashflow', label: 'Registros tesouraria', icon: History },
    { path: '/inventory', label: 'Arsenal e bens', icon: Package },
    { path: '/itemhistory', label: 'Movimentação de itens', icon: BookOpen },
    { path: '/bases', label: 'Bases', icon: Castle },
    { path: '/domains', label: 'Dominios', icon: LandPlot },
    { path: '/npcs', label: 'Funcionarios e serviços', icon: Contact },
    { path: '/investments', label: 'Investimentos', icon: Hammer },
    { path: '/members', label: 'Aventureiros', icon: Users },
    { path: '/chronicles', label: 'Livro de Crônicas', icon: NotebookPen },
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
              <span className="font-medieval text-2xl text-[#1a0f08] dark:text-fantasy-gold">
                {isLoading ? 'Calculando...' : `T$ ${totalWealth.toLocaleString('pt-BR')}`}
              </span>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if(window.innerWidth < 768) toggle(); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all relative group ${
                  isActive 
                    ? 'bg-fantasy-gold/15 text-fantasy-gold border border-fantasy-gold/30 shadow-lg' 
                    : 'text-fantasy-parchment/40 hover:text-fantasy-parchment hover:bg-white/5'
                }`}
              >
                {isActive && <div className="absolute left-0 w-1.5 h-8 bg-fantasy-gold rounded-full shadow-[0_0_10px_#d4af37]"></div>}
                <Icon size={20} className={isActive ? 'text-fantasy-gold' : 'opacity-40 group-hover:opacity-100 transition-opacity'} />
                <span className="font-medieval uppercase text-xs tracking-[0.15em] text-left leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t-4 border-[#3d2b1f] bg-black/30">
          <div className="flex items-center justify-center gap-3 text-[9px] font-black text-fantasy-gold/40 uppercase tracking-[0.4em]">
             <Scroll size={14}/> Grimório da Fortuna
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
