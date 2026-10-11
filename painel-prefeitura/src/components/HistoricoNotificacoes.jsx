import React from 'react';
import { 
  AlertCircle, Bot, CheckCircle, Info, 
  Check, Trash, Filter, Settings
} from 'lucide-react';

export default function HistoricoNotificacoes() {
  const todasNotificacoes = [
    { 
      id: 1, 
      titulo: 'Novo Chamado Recebido', 
      msg: 'Maria Aparecida registou um problema de Iluminação via WhatsApp no bairro Centro.', 
      data: '24 de Setembro, 2026 às 14:52',
      icone: AlertCircle, 
      cor: 'text-yellow-600', 
      bg: 'bg-yellow-100',
      lida: false
    },
    { 
      id: 2, 
      titulo: 'Classificação Automática (IA)', 
      msg: 'O ChatGPT classificou o chamado CH-2847 como "Urgente" devido a risco elétrico.', 
      data: '24 de Setembro, 2026 às 14:45',
      icone: Bot, 
      cor: 'text-purple-600', 
      bg: 'bg-purple-100',
      lida: false
    },
    { 
      id: 3, 
      titulo: 'Chamado Concluído', 
      msg: 'A equipa finalizou o serviço no CH-2845 (Limpeza Urbana). O cidadão foi notificado via WhatsApp.', 
      data: '24 de Setembro, 2026 às 12:30',
      icone: CheckCircle, 
      cor: 'text-green-600', 
      bg: 'bg-green-100',
      lida: true
    },
    { 
      id: 4, 
      titulo: 'Novo Registo de Cidadão', 
      msg: 'Roberto Fernandes completou o cadastro na plataforma com sucesso.', 
      data: '23 de Setembro, 2026 às 09:15',
      icone: Info, 
      cor: 'text-blue-600', 
      bg: 'bg-blue-100',
      lida: true
    },
    { 
      id: 5, 
      titulo: 'Backup do Sistema', 
      msg: 'Cópia de segurança da base de dados PostgreSQL realizada com sucesso na Google Cloud.', 
      data: '23 de Setembro, 2026 às 02:00',
      icone: CheckCircle, 
      cor: 'text-green-600', 
      bg: 'bg-green-100',
      lida: true
    }
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <Filter size={16} /> Todas
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              Não Lidas
            </button>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Marcar todas como lidas">
              <Check size={18} />
            </button>
            <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Limpar histórico">
              <Trash size={18} />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors border border-transparent" title="Definições de Notificação">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {todasNotificacoes.map((notif) => {
            const Icone = notif.icone;
            return (
              <div key={notif.id} className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 ${!notif.lida ? 'bg-blue-50/30' : ''}`}>
                <div className="mt-1">
                  <div className={`p-2.5 rounded-full ${notif.bg} ${notif.cor}`}>
                    <Icone size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${!notif.lida ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.titulo}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">{notif.data}</span>
                  </div>
                  <p className={`text-sm ${!notif.lida ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notif.msg}
                  </p>
                  
                  {!notif.lida && (
                    <div className="mt-3 flex gap-3">
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Ver detalhes
                      </button>
                      <button className="text-xs font-medium text-slate-400 hover:text-slate-600">
                        Marcar como lida
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-center text-sm text-slate-500 bg-slate-50">
          <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm">
            Carregar mais antigas
          </button>
        </div>

      </div>
    </div>
  );
}