import React from 'react';
import {
  LayoutGrid,
  FileText,
  Columns,
  Building2,
  BarChart2,
  Settings,
  LogOut,
  User
} from 'lucide-react';

export default function Sidebar({
  activePage,
  setActivePage,
  onLogout,
  usuario,
  onOpenPerfil
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'chamados', label: 'Chamados', icon: FileText },
    { id: 'kanban', label: 'Fluxo Kanban', icon: Columns },
    { id: 'secretarias', label: 'Secretarias', icon: Building2 },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const irParaPerfil = () => {
    if (onOpenPerfil) {
      onOpenPerfil();
    } else if (setActivePage) {
      setActivePage('configuracoes');
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-[#16161b] text-slate-300 flex flex-col h-screen sticky top-0 left-0 z-40 select-none shadow-xl border-r border-slate-800">

      {/* Logótipo Comunica Sertão + Acesso ao Perfil */}
      <div className="p-6 pb-4 shrink-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f8e000] flex items-center justify-center text-slate-900 font-bold text-sm shadow-sm">
            CS
          </div>
          <div>
            <div className="text-base font-bold tracking-tight leading-none">
              <span className="text-white">Comunica</span>
              <span className="text-[#2563eb]">Sertão</span>
            </div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
              Painel Gestor
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={irParaPerfil}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-800 transition-colors cursor-pointer text-left"
          title="Abrir Perfil"
        >
          {usuario?.foto ? (
            <img
              src={usuario.foto}
              alt={usuario.nome || 'Perfil'}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#2563eb]/20 text-[#60a5fa] flex items-center justify-center shrink-0">
              <User size={15} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {usuario?.nome || 'Meu Perfil'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              Ver perfil
            </p>
          </div>
        </button>
      </div>

      {/* Navegação com botão ativo em Azul */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage && setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Rodapé - Encerrar Sessão */}
      <div className="p-4 border-t border-slate-800 shrink-0 bg-[#16161b]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <LogOut className="group-hover:text-red-400 transition-colors" size={18} />
          <span className="group-hover:text-red-400 transition-colors">Encerrar Sessão</span>
        </button>
      </div>

    </aside>
  );
}