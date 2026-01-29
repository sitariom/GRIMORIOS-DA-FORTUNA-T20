
import React, { useState, useRef, useEffect } from 'react';
import { useGuild } from '../context/GuildContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Download, Upload, Trash2, Check, X, ShieldCheck, Lock, Key, LogOut, Settings, RotateCcw } from 'lucide-react';

const GuildManagerPage: React.FC = () => {
  const { 
    guildList, activeGuildId, createNewGuild, isAuthenticated, isAdmin, logout, loginToGuild, loginAsAdmin,
    deleteGuildById, importGuild, exportGuildData, guildName, changeAdminPassword, resetGuildPassword
  } = useGuild();
  
  const navigate = useNavigate();
  
  // Modals State
  const [showCreate, setShowCreate] = useState(false);
  const [showLogin, setShowLogin] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showResetGuild, setShowResetGuild] = useState<string | null>(null);

  // Form Inputs
  const [inputName, setInputName] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const fileInput = useRef<HTMLInputElement>(null);

  // Reset inputs
  useEffect(() => {
      if(!showCreate && !showLogin && !showImport && !showAdminLogin && !showAdminPanel && !showResetGuild) {
          setInputName('');
          setInputPassword('');
          setNewPassword('');
      }
  }, [showCreate, showLogin, showImport, showAdminLogin, showAdminPanel, showResetGuild]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim() && inputPassword.trim()) {
      createNewGuild(inputName, inputPassword).then(() => {
          setShowCreate(false);
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (showLogin && inputPassword) {
          loginToGuild(showLogin, inputPassword).then((success) => {
              if (success) {
                  setShowLogin(null);
                  navigate('/');
              }
          });
      }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      loginAsAdmin(inputPassword).then((success) => {
          if(success) setShowAdminLogin(false);
      });
  };

  const handleChangeAdminPass = (e: React.FormEvent) => {
      e.preventDefault();
      if(inputPassword && newPassword) {
          changeAdminPassword(inputPassword, newPassword).then(() => {
              setShowAdminPanel(false);
          });
      }
  };

  const handleResetGuildPass = (e: React.FormEvent) => {
      e.preventDefault();
      if(showResetGuild && newPassword) {
          resetGuildPassword(showResetGuild, newPassword).then(() => {
              setShowResetGuild(null);
          });
      }
  };

  const handleImport = (e: React.FormEvent) => {
      e.preventDefault();
      const file = fileInput.current?.files?.[0];
      if (!file || !inputPassword) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          importGuild(event.target?.result as string, inputPassword).then(() => {
              setShowImport(false);
          });
      };
      reader.readAsText(file);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-serif pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-medieval text-white tracking-tighter uppercase leading-none mb-2">Salão das Guildas</h2>
          <p className="text-sm text-fantasy-gold font-bold uppercase tracking-[0.3em]">Selecione seu estandarte ou funde uma nova ordem.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto items-center">
            {isAdmin ? (
                <>
                    <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 text-fantasy-gold hover:text-white px-4 py-2 border border-fantasy-gold/20 rounded-xl transition-all text-xs font-black uppercase tracking-widest">
                        <Settings size={16}/> Admin
                    </button>
                    <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-[#3d2b1f] dark:bg-black hover:bg-[#4d3b2f] text-fantasy-parchment px-6 py-4 rounded-2xl border-2 border-fantasy-gold/20 flex items-center justify-center gap-3 font-medieval uppercase text-xs tracking-widest transition-all">
                        <Upload size={18} /> Importar
                    </button>
                    <button onClick={() => setShowCreate(true)} className="flex-1 md:flex-none bg-fantasy-blood hover:bg-red-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-medieval uppercase tracking-widest shadow-2xl transition-all border-b-4 border-red-950">
                        <Plus size={20} /> Nova Guilda
                    </button>
                </>
            ) : (
                <button onClick={() => setShowAdminLogin(true)} className="text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-gold transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <Lock size={14}/> Acesso Admin
                </button>
            )}
        </div>
      </header>

      {/* Active Session Card */}
      {isAuthenticated && (
          <div className="parchment-card p-8 rounded-[40px] border-4 border-emerald-600/30 bg-emerald-900/5 shadow-2xl mb-10 animate-slide-up">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                      <div className="wax-seal w-16 h-16 flex items-center justify-center animate-pulse"><Check size={32} className="text-white"/></div>
                      <div>
                          <p className="text-xs font-black uppercase text-fantasy-wood/50 dark:text-fantasy-parchment/50 tracking-widest">Sessão Ativa</p>
                          <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-parchment">{guildName}</h3>
                      </div>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => navigate('/')} className="bg-fantasy-wood dark:bg-fantasy-gold text-fantasy-parchment dark:text-black px-6 py-3 rounded-xl font-medieval uppercase tracking-widest hover:scale-105 transition-transform">
                          Acessar Painel
                      </button>
                      <button onClick={logout} className="bg-red-900/10 text-red-800 dark:text-red-400 p-3 rounded-xl hover:bg-red-900/20 transition-colors" title="Sair (Logout)">
                          <LogOut size={24}/>
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {guildList.map(g => (
            <div key={g.id} className="parchment-card p-8 rounded-[40px] border-4 border-fantasy-wood/10 dark:border-white/5 hover:border-fantasy-gold/50 transition-all duration-300 hover:-translate-y-1 relative group">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
                        <ShieldCheck size={28} className="text-fantasy-wood/40 dark:text-fantasy-parchment/40"/>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => exportGuildData(g.id)} className="p-2 bg-blue-900/10 text-blue-500 rounded-lg hover:bg-blue-900/20" title="Backup JSON">
                                <Download size={16}/>
                            </button>
                            <button onClick={() => setShowResetGuild(g.id)} className="p-2 bg-amber-900/10 text-amber-500 rounded-lg hover:bg-amber-900/20" title="Resetar Senha">
                                <RotateCcw size={16}/>
                            </button>
                            <button onClick={() => { if(confirm("Tem certeza absoluta?")) deleteGuildById(g.id); }} className="p-2 bg-red-900/10 text-red-500 rounded-lg hover:bg-red-900/20" title="Excluir Definitivamente">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    )}
                </div>
                
                <h3 className="font-medieval text-2xl text-fantasy-wood dark:text-fantasy-parchment leading-tight mb-2 truncate">{g.guild_name}</h3>
                <p className="text-[10px] font-black uppercase text-fantasy-wood/30 dark:text-fantasy-parchment/30 mb-8">
                    Atualizado em: {new Date(g.updated_at).toLocaleDateString()}
                </p>
                
                {activeGuildId === g.id && isAuthenticated ? (
                    <div className="p-4 bg-emerald-900/10 rounded-2xl text-center border border-emerald-900/20">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Ativo Agora</p>
                    </div>
                ) : (
                    <button onClick={() => setShowLogin(g.id)} className="w-full bg-black/10 dark:bg-white/10 hover:bg-fantasy-wood dark:hover:bg-fantasy-gold text-fantasy-wood dark:text-fantasy-parchment dark:hover:text-black py-4 rounded-2xl font-medieval uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Lock size={16}/> Autenticar
                    </button>
                )}
            </div>
        ))}
      </div>

      {/* MODALS */}

      {/* Guild Login */}
      {showLogin && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-10 rounded-[48px] w-full max-w-md border-4 border-fantasy-gold/30 shadow-5xl relative animate-bounce-in">
                  <button onClick={() => setShowLogin(null)} className="absolute top-6 right-6 text-fantasy-wood/40 hover:text-fantasy-wood"><X size={24}/></button>
                  <div className="text-center mb-8">
                      <div className="wax-seal w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white"><Key size={32}/></div>
                      <h3 className="text-3xl font-medieval">Acesso Restrito</h3>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Senha da Guilda</label>
                          <input type="password" autoFocus className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[20px] px-6 py-4 text-center text-xl font-medieval focus:border-fantasy-gold outline-none" value={inputPassword} onChange={e => setInputPassword(e.target.value)}/>
                      </div>
                      <button type="submit" className="w-full bg-fantasy-gold text-black py-4 rounded-[24px] font-medieval text-xl uppercase tracking-widest hover:brightness-110 shadow-lg">Entrar</button>
                  </form>
              </div>
          </div>
      )}

      {/* Admin Login */}
      {showAdminLogin && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-10 rounded-[48px] w-full max-w-md border-4 border-red-900/30 shadow-5xl relative animate-bounce-in">
                  <button onClick={() => setShowAdminLogin(false)} className="absolute top-6 right-6 text-fantasy-wood/40 hover:text-fantasy-wood"><X size={24}/></button>
                  <div className="text-center mb-8">
                      <div className="wax-seal w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white bg-red-900 border-red-950"><Settings size={32}/></div>
                      <h3 className="text-3xl font-medieval text-red-900 dark:text-red-500">Mestre do Sistema</h3>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Senha de Administrador</label>
                          <input type="password" autoFocus className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[20px] px-6 py-4 text-center text-xl font-medieval focus:border-fantasy-gold outline-none" value={inputPassword} onChange={e => setInputPassword(e.target.value)}/>
                      </div>
                      <button type="submit" className="w-full bg-red-900 text-white py-4 rounded-[24px] font-medieval text-xl uppercase tracking-widest hover:brightness-110 shadow-lg">Autenticar</button>
                  </form>
              </div>
          </div>
      )}

      {/* Admin Settings Panel */}
      {showAdminPanel && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-10 rounded-[48px] w-full max-w-md border-4 border-fantasy-gold/30 shadow-5xl relative animate-bounce-in">
                  <button onClick={() => setShowAdminPanel(false)} className="absolute top-6 right-6 text-fantasy-wood/40 hover:text-fantasy-wood"><X size={24}/></button>
                  <h3 className="text-3xl font-medieval text-center mb-8">Configuração Admin</h3>
                  <form onSubmit={handleChangeAdminPass} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Senha Atual</label>
                          <input type="password" className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[20px] px-6 py-4 text-xl font-medieval outline-none" value={inputPassword} onChange={e => setInputPassword(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Nova Senha</label>
                          <input type="password" className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[20px] px-6 py-4 text-xl font-medieval outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
                      </div>
                      <button type="submit" className="w-full bg-fantasy-wood dark:bg-fantasy-gold text-white dark:text-black py-4 rounded-[24px] font-medieval text-xl uppercase tracking-widest hover:brightness-110 shadow-lg">Alterar Senha</button>
                  </form>
              </div>
          </div>
      )}

      {/* Reset Guild Password Modal */}
      {showResetGuild && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-10 rounded-[48px] w-full max-w-md border-4 border-amber-500/30 shadow-5xl relative animate-bounce-in">
                  <button onClick={() => setShowResetGuild(null)} className="absolute top-6 right-6 text-fantasy-wood/40 hover:text-fantasy-wood"><X size={24}/></button>
                  <h3 className="text-3xl font-medieval text-center mb-8">Redefinir Acesso</h3>
                  <form onSubmit={handleResetGuildPass} className="space-y-6">
                      <p className="text-center text-xs font-serif italic opacity-70">Define uma nova senha para a guilda selecionada.</p>
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Nova Senha da Guilda</label>
                          <input type="password" autoFocus className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[20px] px-6 py-4 text-xl font-medieval outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
                      </div>
                      <button type="submit" className="w-full bg-amber-700 text-white py-4 rounded-[24px] font-medieval text-xl uppercase tracking-widest hover:brightness-110 shadow-lg">Redefinir</button>
                  </form>
              </div>
          </div>
      )}

      {/* Create Modal */}
      {showCreate && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-12 rounded-[56px] w-full max-w-lg border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in">
                  <button onClick={() => setShowCreate(false)} className="absolute top-10 right-10 text-fantasy-wood/40 hover:text-fantasy-wood"><X size={28}/></button>
                  <h3 className="text-4xl font-medieval text-center mb-10 text-fantasy-wood dark:text-fantasy-gold">Fundar Nova Ordem</h3>
                  <form onSubmit={handleCreate} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Nome da Guilda</label>
                          <input className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[24px] px-6 py-4 text-xl font-medieval outline-none focus:border-fantasy-gold" value={inputName} onChange={e => setInputName(e.target.value)} placeholder="Ex: Cavaleiros de Tanna-Toh"/>
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Senha Mestra (Não esqueça!)</label>
                          <input type="password" className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[24px] px-6 py-4 text-xl font-medieval outline-none focus:border-fantasy-gold" value={inputPassword} onChange={e => setInputPassword(e.target.value)} placeholder="******"/>
                      </div>
                      <button type="submit" className="w-full bg-fantasy-blood text-white py-6 rounded-[32px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-red-950 hover:translate-y-1 active:border-b-0">Criar Registro</button>
                  </form>
              </div>
          </div>
      )}

      {/* Import Modal */}
      {showImport && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
              <div className="parchment-card p-12 rounded-[56px] w-full max-w-lg border-8 border-[#3d2b1f] shadow-5xl relative animate-bounce-in">
                  <button onClick={() => setShowImport(false)} className="absolute top-10 right-10 text-fantasy-wood/40 hover:text-fantasy-wood"><X size={28}/></button>
                  <h3 className="text-4xl font-medieval text-center mb-10 text-fantasy-wood dark:text-fantasy-gold">Importar Registro</h3>
                  <form onSubmit={handleImport} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Arquivo JSON</label>
                          <input type="file" ref={fileInput} accept=".json" className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[24px] px-6 py-4 text-sm font-bold outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-fantasy-wood file:text-white hover:file:bg-fantasy-wood/80"/>
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 opacity-50">Definir Senha de Acesso</label>
                          <input type="password" className="w-full bg-black/10 dark:bg-black/40 border-2 border-fantasy-wood/10 rounded-[24px] px-6 py-4 text-xl font-medieval outline-none focus:border-fantasy-gold" value={inputPassword} onChange={e => setInputPassword(e.target.value)} placeholder="******"/>
                      </div>
                      <button type="submit" className="w-full bg-indigo-900 text-white py-6 rounded-[32px] font-medieval text-2xl uppercase tracking-widest shadow-xl border-b-4 border-indigo-950 hover:translate-y-1 active:border-b-0">Restaurar</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default GuildManagerPage;
