import React, { useState } from 'react';
import {
  AlertCircle, Bot, CheckCircle, Info,
  Check, Trash, Filter, Settings, Inbox
} from 'lucide-react';

const NOTIFICACOES_INICIAIS = [
  {
    id: 1,
    tipo: 'chamado',
    chamadoId: 'CH-2847',
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
    tipo: 'ia',
    chamadoId: 'CH-2847',
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
    tipo: 'concluido',
    chamadoId: 'CH-2845',
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
    tipo: 'cadastro',
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
    tipo: 'sistema',
    titulo: 'Backup do Sistema',
    msg: 'Cópia de segurança da base de dados PostgreSQL realizada com sucesso na Google Cloud.',
    data: '23 de Setembro, 2026 às 02:00',
    icone: CheckCircle,
    cor: 'text-green-600',
    bg: 'bg-green-100',
    lida: true
  }
];

const NOTIFICACOES_ANTIGAS = [
  {
    id: 6,
    tipo: 'chamado',
    chamadoId: 'CH-2844',
    titulo: 'Novo Chamado Recebido',
    msg: 'Roberto F. registou um problema de Água e Esgoto no bairro São João.',
    data: '22 de Setembro, 2026 às 16:20',
    icone: AlertCircle,
    cor: 'text-yellow-600',
    bg: 'bg-yellow-100',
    lida: true
  },
  {
    id: 7,
    tipo: 'ia',
    chamadoId: 'CH-2844',
    titulo: 'Classificação Automática (IA)',
    msg: 'O ChatGPT classificou o chamado CH-2844 como "Média" prioridade.',
    data: '22 de Setembro, 2026 às 16:15',
    icone: Bot,
    cor: 'text-purple-600',
    bg: 'bg-purple-100',
    lida: true
  },
  {
    id: 8,
    tipo: 'sistema',
    titulo: 'Backup do Sistema',
    msg: 'Cópia de segurança da base de dados PostgreSQL realizada com sucesso na Google Cloud.',
    data: '22 de Setembro, 2026 às 02:00',
    icone: CheckCircle,
    cor: 'text-green-600',
    bg: 'bg-green-100',
    lida: true
  }
];

const TIPOS_CONFIG = [
  { chave: 'chamado', rotulo: 'Novos chamados' },
  { chave: 'ia', rotulo: 'Classificação automática (IA)' },
  { chave: 'concluido', rotulo: 'Chamados concluídos' },
  { chave: 'cadastro', rotulo: 'Registos de cidadãos' },
  { chave: 'sistema', rotulo: 'Avisos do sistema' }
];

export default function HistoricoNotificacoes({
  chamados = [],
  onSelectChamado,
  setActivePage
}) {
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);
  const [filtro, setFiltro] = useState('todas'); // 'todas' | 'naoLidas'
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);
  const [carregouAntigas, setCarregouAntigas] = useState(false);
  const [tiposAtivos, setTiposAtivos] = useState({
    chamado: true,
    ia: true,
    concluido: true,
    cadastro: true,
    sistema: true
  });

  const visiveis = notificacoes.filter((n) => tiposAtivos[n.tipo] !== false);
  const lista = filtro === 'naoLidas' ? visiveis.filter((n) => !n.lida) : visiveis;
  const totalNaoLidas = visiveis.filter((n) => !n.lida).length;

  const marcarComoLida = (id) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const limparHistorico = () => {
    setNotificacoes([]);
    setConfirmarLimpar(false);
    setCarregouAntigas(true);
  };

  const carregarAntigas = () => {
    setNotificacoes((prev) => [...prev, ...NOTIFICACOES_ANTIGAS]);
    setCarregouAntigas(true);
  };

  const alternarTipo = (chave) => {
    setTiposAtivos((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  const verDetalhes = (notif) => {
    marcarComoLida(notif.id);
    const chamado = chamados.find((c) => c.id === notif.chamadoId);
    if (chamado && onSelectChamado) {
      onSelectChamado({ ...chamado, origem: 'chamados' });
    } else if (setActivePage) {
      setActivePage('chamados');
    }
  };

  const btnFiltro = (ativo) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 border cursor-pointer ${
      ativo
        ? 'bg-[#2563eb] border-[#2563eb] text-white'
        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Barra de ações */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFiltro('todas')}
                className={btnFiltro(filtro === 'todas')}
              >
                <Filter size={16} /> Todas
              </button>
              <button
                type="button"
                onClick={() => setFiltro('naoLidas')}
                className={btnFiltro(filtro === 'naoLidas')}
              >
                Não Lidas
                {totalNaoLidas > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      filtro === 'naoLidas' ? 'bg-white/25 text-white' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {totalNaoLidas}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={marcarTodasComoLidas}
                disabled={totalNaoLidas === 0}
                className="p-2 text-slate-500 hover:text-[#2563eb] hover:bg-[#2563eb]/10 rounded-lg transition-colors border border-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500"
                title="Marcar todas como lidas"
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarConfig(false);
                  setConfirmarLimpar(true);
                }}
                disabled={notificacoes.length === 0}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500"
                title="Limpar histórico"
              >
                <Trash size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmarLimpar(false);
                  setMostrarConfig(!mostrarConfig);
                }}
                className={`p-2 rounded-lg transition-colors border cursor-pointer ${
                  mostrarConfig
                    ? 'bg-slate-200 text-slate-700 border-slate-300'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200 border-transparent'
                }`}
                title="Definições de Notificação"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Confirmação de limpar histórico */}
          {confirmarLimpar && (
            <div className="px-5 py-4 bg-red-50 border-b border-red-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-red-700 font-medium">
                Tem certeza que deseja apagar todas as notificações? Essa ação não pode ser desfeita.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmarLimpar(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={limparHistorico}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                >
                  Apagar tudo
                </button>
              </div>
            </div>
          )}

          {/* Painel de definições */}
          {mostrarConfig && (
            <div className="px-5 py-4 bg-white border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Tipos de notificação exibidos
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TIPOS_CONFIG.map((t) => (
                  <button
                    key={t.chave}
                    type="button"
                    onClick={() => alternarTipo(t.chave)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-slate-700 font-medium">{t.rotulo}</span>
                    <span
                      className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                        tiposAtivos[t.chave] ? 'bg-[#2563eb]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          tiposAtivos[t.chave] ? 'translate-x-4' : ''
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lista */}
          <div className="divide-y divide-slate-100">
            {lista.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Inbox size={36} className="mb-3" />
                <p className="text-sm font-medium">
                  {filtro === 'naoLidas'
                    ? 'Nenhuma notificação não lida.'
                    : 'Nenhuma notificação para mostrar.'}
                </p>
              </div>
            )}

            {lista.map((notif) => {
              const Icone = notif.icone;
              return (
                <div
                  key={notif.id}
                  className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 ${
                    !notif.lida ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="mt-1">
                    <div className={`p-2.5 rounded-full ${notif.bg} ${notif.cor}`}>
                      <Icone size={20} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <h4
                        className={`text-sm font-bold flex items-center gap-2 ${
                          !notif.lida ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {!notif.lida && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>}
                        {notif.titulo}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {notif.data}
                      </span>
                    </div>
                    <p className={`text-sm ${!notif.lida ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notif.msg}
                    </p>

                    {(notif.chamadoId || !notif.lida) && (
                      <div className="mt-3 flex gap-3">
                        {notif.chamadoId && (
                          <button
                            type="button"
                            onClick={() => verDetalhes(notif)}
                            className="text-xs font-semibold text-[#2563eb] hover:underline cursor-pointer"
                          >
                            Ver detalhes
                          </button>
                        )}
                        {!notif.lida && (
                          <button
                            type="button"
                            onClick={() => marcarComoLida(notif.id)}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-center text-sm text-slate-500 bg-slate-50">
            {carregouAntigas ? (
              <span className="text-xs text-slate-400">Não há mais notificações antigas.</span>
            ) : (
              <button
                type="button"
                onClick={carregarAntigas}
                className="px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm cursor-pointer"
              >
                Carregar mais antigas
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}