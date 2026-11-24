import React from 'react';
import { Bell, Plus } from 'lucide-react';

export default function Header({ activePage, setActivePage }) {
  const titulosPaginas = {
    'dashboard': {
      titulo: 'Dashboard Administrativo',
      subtitulo: ''
    },
    'chamados': {
      titulo: 'Gestão de Chamados',
      subtitulo: 'Acompanhamento e triagem de solicitações municipais'
    },
    'chamado-detalhes': {
      titulo: 'Detalhes do Chamado',
      subtitulo: 'Informações completas e histórico da ocorrência'
    },
    'kanban': {
      titulo: 'Fluxo Kanban',
      subtitulo: 'Quadros visuais de progresso por etapa de atendimento'
    },
    'secretarias': {
      titulo: 'Secretarias e Departamentos',
      subtitulo: 'Gestão de entidades responsáveis pelo atendimento'
    },
    'relatorios': {
      titulo: 'Relatórios e Estatísticas',
      subtitulo: 'Indicadores de desempenho e exportação de dados'
    },
    'configuracoes': {
      titulo: 'Configurações do Sistema',
      subtitulo: 'Parâmetros globais, APIs e integrações externas'
    },
    'novo-chamado': {
      titulo: 'Novo Chamado',
      subtitulo: 'Abertura de nova solicitação manual'
    },
    'notificacoes': {
      titulo: 'Histórico de Notificações',
      subtitulo: 'Alertas recentes do sistema e atualizações de chamados'
    }
  };

  const paginaAtual = titulosPaginas[activePage] || titulosPaginas['dashboard'];

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {paginaAtual.titulo}
        </h1>
        {paginaAtual.subtitulo && (
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {paginaAtual.subtitulo}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Botão de Notificações */}
        <button
          onClick={() => setActivePage && setActivePage('notificacoes')}
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Notificações"
        >
          <Bell size={20} />
          <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5"></span>
        </button>

        {/* Botão Novo Chamado */}
        <button
          onClick={() => setActivePage && setActivePage('novo-chamado')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Novo Chamado</span>
        </button>
      </div>
    </header>
  );
}