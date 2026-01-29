
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GuildProvider, useGuild } from './context/GuildContext';
import Sidebar from './components/Sidebar';
import FinancialPage from './pages/FinancialPage';
import CashFlowPage from './pages/CashFlowPage';
import InventoryPage from './pages/InventoryPage';
import ItemHistoryPage from './pages/ItemHistoryPage';
import BasesPage from './pages/BasesPage';
import DomainsPage from './pages/DomainsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import MembersPage from './pages/MembersPage';
import DashboardPage from './pages/DashboardPage';
import GuildManagerPage from './pages/GuildManagerPage';
import NPCsPage from './pages/NPCsPage';
import ChroniclesPage from './pages/ChroniclesPage';
import QuestBoardPage from './pages/QuestBoardPage';
import CalendarPage from './pages/CalendarPage';
import Logo from './components/Logo';
import { Menu, AlertTriangle, Scroll, Loader } from 'lucide-react';

const Toast: React.FC = () => {
  const { feedback } = useGuild();
  if (!feedback) return null;

  const themes = {
    success: 'border-emerald-600/50 text-emerald-950 dark:text-emerald-400 dark:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    error: 'border-red-600/50 text-red-950 dark:text-red-400 dark:shadow-[0_0_20px_rgba(248,113,113,0.15)]',
    info: 'border-blue-600/50 text-blue-950 dark:text-blue-400 dark:shadow-[0_0_20px_rgba(96,165,250,0.15)]'
  };

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] animate-bounce-in w-max px-4">
       <div className={`parchment-card flex items-center gap-4 px-6 py-4 md:px-10 md:py-5 rounded-[24px] shadow-5xl border-2 transition-all ${themes[feedback.type]}`}>
          <div className="wax-seal w-10 h-10 flex items-center justify-center text-white shrink-0 shadow-lg">
             {feedback.type === 'error' ? <AlertTriangle size={18}/> : <Scroll size={18}/>}
          </div>
          <span className="font-medieval text-base md:text-lg uppercase tracking-tight text-fantasy-wood dark:text-fantasy-parchment leading-none">{feedback.text}</span>
       </div>
    </div>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-6 text-fantasy-gold animate-pulse">
    <Logo size="lg" />
    <div className="flex items-center gap-3 text-xl font-medieval">
      <Loader className="animate-spin" /> Acessando os Arquivos...
    </div>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoading, isAuthenticated } = useGuild();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('guild_theme') as 'light' | 'dark') || 'light';
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Reset scroll on route change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('guild_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="flex h-screen overflow-hidden selection:bg-fantasy-gold selection:text-fantasy-wood transition-colors duration-500 bg-[#0d0d0d] dark:bg-black">
      <Toast />
      
      {/* Sidebar visível apenas se autenticado */}
      {isAuthenticated && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header - Apenas se autenticado */}
        {isAuthenticated && (
          <div className="md:hidden bg-[#1e140d] dark:bg-black p-4 flex items-center justify-between z-30 border-b-4 border-[#3d2b1f] shadow-2xl relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 pointer-events-none"></div>
             
             <button onClick={() => setIsSidebarOpen(true)} className="relative z-10 text-fantasy-gold p-2 hover:bg-white/5 rounded-lg transition-colors">
               <Menu size={28}/>
             </button>
             
             <div className="flex items-center gap-3 relative z-10">
                <Logo size="xs" />
             </div>
             
             <div className="w-10"></div> 
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-16 custom-scrollbar bg-[#0d0d0d] dark:bg-black bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] transition-colors duration-500 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {isLoading ? <LoadingScreen /> : children}
          </div>
        </div>
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useGuild();

  return (
    <Layout>
      <Routes>
        <Route path="/guilds" element={<GuildManagerPage />} />
        
        {/* Rotas Protegidas */}
        <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/quests" element={isAuthenticated ? <QuestBoardPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/calendar" element={isAuthenticated ? <CalendarPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/members" element={isAuthenticated ? <MembersPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/finance" element={isAuthenticated ? <FinancialPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/inventory" element={isAuthenticated ? <InventoryPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/itemhistory" element={isAuthenticated ? <ItemHistoryPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/bases" element={isAuthenticated ? <BasesPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/domains" element={isAuthenticated ? <DomainsPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/npcs" element={isAuthenticated ? <NPCsPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/investments" element={isAuthenticated ? <InvestmentsPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/cashflow" element={isAuthenticated ? <CashFlowPage /> : <Navigate to="/guilds" replace />} />
        <Route path="/chronicles" element={isAuthenticated ? <ChroniclesPage /> : <Navigate to="/guilds" replace />} />
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/guilds"} replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GuildProvider>
        <AppRoutes />
      </GuildProvider>
    </BrowserRouter>
  );
};

export default App;
