import React from 'react';
import { 
  LayoutDashboard, FileText, Kanban, 
  Building, Users, BarChart, Settings, LogOut 
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chamados', label: 'Chamados', icon: FileText },
    { id: 'kanban', label: 'Fluxo Kanban', icon: Kanban }, 
    { id: 'secretarias', label: 'Secretarias', icon: Building }, 
    { id: 'cidadaos', label: 'Cidadãos', icon: Users },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart }, 
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-[#16161b] text-slate-300 flex flex-col h-full border-r border-[#2a2a35] shadow-xl z-50 relative">
      
      <div className="p-6 border-b border-[#2a2a35]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4b5e28] rounded-lg shadow-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-wide">Comunica<span className="text-[#6a8738]">Sertão</span></h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Painel Gestor</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[#4b5e28] text-white shadow-md' 
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon 
                size={18} 
                className={isActive ? 'text-white' : 'text-slate-500'} 
              />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#2a2a35] bg-[#16161b]">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
          Encerrar Sessão
        </button>
      </div>
      
    </aside>
  );
}