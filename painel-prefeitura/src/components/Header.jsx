import React, { useState, useRef, useEffect } from 'react';
import { Bell, Plus, CheckCircle, AlertCircle, Bot } from 'lucide-react';

export default function Header({ title, subtitle, onNew, onViewAllNotifs }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Transformamos as notificações num estado do React para as podermos manipular
  const [notificacoes, setNotificacoes] = useState([
    { 
      id: 1, 
      titulo: 'Novo Chamado Recebido', 
      msg: 'Maria Aparecida registou um problema de Iluminação via WhatsApp.', 
      tempo: 'Há 5 min', 
      icone: AlertCircle, 
      cor: 'text-yellow-600', 
      bg: 'bg-yellow-100',
      lida: false
    },
    { 
      id: 2, 
      titulo: 'Classificação Automática (IA)', 
      msg: 'O ChatGPT classificou o chamado CH-2847 como "Urgente".', 
      tempo: 'Há 12 min', 
      icone: Bot, 
      cor: 'text-purple-600', 
      bg: 'bg-purple-100',
      lida: false
    },
    { 
      id: 3, 
      titulo: 'Chamado Concluído', 
      msg: 'A equipa finalizou o serviço no CH-2845 (Limpeza Urbana).', 
      tempo: 'Há 2 horas', 
      icone: CheckCircle, 
      cor: 'text-green-600', 
      bg: 'bg-green-100',
      lida: false
    },
  ]);

  // Verifica automaticamente se ainda existe alguma notificação por ler (para mostrar o ponto vermelho no sino)
  const temNaoLidas = notificacoes.some(notif => !notif.lida);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleVerHistorico = () => {
    setIsOpen(false);
    if (onViewAllNotifs) {
      onViewAllNotifs();
    }
  };

  // Função disparada ao clicar em "Marcar todas como lidas"
  const handleMarcarTodasLidas = () => {
    const atualizadas = notificacoes.map(n => ({ ...n, lida: true }));
    setNotificacoes(atualizadas);
  };

  // Função para marcar apenas UMA notificação como lida ao clicar nela
  const handleLerNotificacao = (id) => {
    const atualizadas = notificacoes.map(n => 
      n.id === id ? { ...n, lida: true } : n
    );
    setNotificacoes(atualizadas);
  };

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200 relative z-40">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-4">
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleToggleMenu}
            className={`p-2 rounded-lg transition-colors relative ${
              isOpen ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bell size={20} />
            {temNaoLidas && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Notificações</h3>
                {/* O botão só aparece se houver notificações não lidas */}
                {temNaoLidas && (
                  <span 
                    onClick={handleMarcarTodasLidas}
                    className="text-xs font-medium text-blue-600 cursor-pointer hover:underline"
                  >
                    Marcar todas como lidas
                  </span>
                )}
              </div>
              
              <div className="max-h-[320px] overflow-y-auto">
                {notificacoes.map((notif) => {
                  const Icone = notif.icone;
                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => handleLerNotificacao(notif.id)}
                      className={`p-4 border-b border-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex gap-3 ${!notif.lida ? 'bg-blue-50/20' : 'bg-white'}`}
                    >
                      <div className={`p-2 rounded-full h-fit flex-shrink-0 ${notif.bg} ${notif.cor}`}>
                        <Icone size={16} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-tight mb-1 ${!notif.lida ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                          {notif.titulo}
                        </p>
                        <p className={`text-xs ${!notif.lida ? 'text-slate-600' : 'text-slate-400'}`}>
                          {notif.msg}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.tempo}</p>
                      </div>
                      
                      {/* Ponto azul lateral para as notificações não lidas */}
                      {!notif.lida && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={handleVerHistorico}
                  className="w-full py-2 text-sm font-medium text-blue-600 bg-transparent rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  Ver histórico completo
                </button>
              </div>

            </div>
          )}
        </div>

        <button 
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} /> Novo Chamado
        </button>

      </div>
    </header>
  );
}