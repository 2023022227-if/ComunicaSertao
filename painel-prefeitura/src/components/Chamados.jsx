import React, { useState } from 'react';
import {
  Search,
  Filter,
  AlertCircle,
  Clock,
  Check,
  X,
  Eye
} from 'lucide-react';

export default function Chamados({
  chamados = [],
  setChamados,
  onAlterarStatus,
  onSelectChamado
}) {
  const chamadosIniciaisPadrao = [
    {
      id: 'CH-2847',
      solicitante: 'Maria Aparecida S.',
      categoria: 'Iluminação Pública',
      bairro: 'Centro',
      departamento: 'Secretaria de Obras e Viação',
      prioridade: 'ALTA',
      status: 'Cancelado',
      dataAbertura: '28/07/2026',
      ultimaModificacao: '28/07/2026 às 16:40'
    },
    {
      id: 'CH-2846',
      solicitante: 'João Carlos M.',
      categoria: 'Pavimentação',
      bairro: 'Jardim América',
      departamento: 'Secretaria de Obras e Viação',
      prioridade: 'ALTA',
      status: 'Em andamento',
      dataAbertura: '28/07/2026',
      ultimaModificacao: '28/07/2026 às 14:15'
    },
    {
      id: 'CH-2845',
      solicitante: 'Ana Paula R.',
      categoria: 'Limpeza Urbana',
      bairro: 'Vila Nova',
      departamento: 'Secretaria de Obras e Viação',
      prioridade: 'BAIXA',
      status: 'Concluído',
      dataAbertura: '27/07/2026',
      ultimaModificacao: '28/07/2026 às 11:20'
    },
    {
      id: 'CH-2844',
      solicitante: 'Roberto F.',
      categoria: 'Água e Esgoto',
      bairro: 'São João',
      departamento: 'Secretaria de Água e Saneamento',
      prioridade: 'MÉDIA',
      status: 'Pendente',
      dataAbertura: '27/07/2026',
      ultimaModificacao: '27/07/2026 às 09:05'
    },
    {
      id: 'CH-2843',
      solicitante: 'Claudia B.',
      categoria: 'Poda de Árvores',
      bairro: 'Centro',
      departamento: 'Secretaria de Obras e Viação',
      prioridade: 'MÉDIA',
      status: 'Em andamento',
      dataAbertura: '26/07/2026',
      ultimaModificacao: '27/07/2026 às 17:30'
    }
  ];

  const [listaLocal, setListaLocal] = useState(chamadosIniciaisPadrao);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  const listaBase = Array.isArray(chamados) && chamados.length > 0 ? chamados : listaLocal;

  const alterarStatusChamado = (idAlvo, novoStatus) => {
    if (typeof onAlterarStatus === 'function' && Array.isArray(chamados) && chamados.length > 0) {
      onAlterarStatus(idAlvo, novoStatus);
      setMenuAbertoId(null);
      return;
    }

    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novaModificacao = `${dataFormatada} às ${horaFormatada}`;

    const atualizar = (lista) =>
      lista.map((item) =>
        item.id === idAlvo
          ? { ...item, status: novoStatus, ultimaModificacao: novaModificacao }
          : item
      );

    setListaLocal((prev) => atualizar(prev));
    if (typeof setChamados === 'function') {
      setChamados((prev) => (Array.isArray(prev) && prev.length > 0 ? atualizar(prev) : prev));
    }
    setMenuAbertoId(null);
  };

  const chamadosFiltrados = listaBase.filter((item) => {
    if (!item) return false;
    const termo = String(pesquisa || '').toLowerCase();
    const id = String(item.id || '').toLowerCase();
    const solicitante = String(item.solicitante || item.cidadao || item.nome || '').toLowerCase();
    const categoria = String(item.categoria || item.assunto || '').toLowerCase();
    const bairro = String(item.bairro || item.local || '').toLowerCase();
    const secretaria = String(item.departamento || '').toLowerCase();
    const statusItem = String(item.status || 'Pendente').toLowerCase();

    const batePesquisa =
      id.includes(termo) ||
      solicitante.includes(termo) ||
      categoria.includes(termo) ||
      bairro.includes(termo) ||
      secretaria.includes(termo);

    const bateStatus =
      filtroStatus === 'Todos' || statusItem === filtroStatus.toLowerCase();

    return batePesquisa && bateStatus;
  });

  const renderBadgeStatus = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('conclu')) {
      return (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
          Concluído
        </span>
      );
    }
    if (s.includes('andamento')) {
      return (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-[#dbeafe] text-[#2563eb]">
          Em andamento
        </span>
      );
    }
    if (s.includes('cancel')) {
      return (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
          Cancelado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
        Pendente
      </span>
    );
  };

  const renderBadgePrioridade = (prioridade) => {
    const p = String(prioridade || 'BAIXA').toUpperCase();
    if (p === 'ALTA') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
          ALTA
        </span>
      );
    }
    if (p === 'MÉDIA' || p === 'MEDIA') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-yellow-100 text-yellow-700">
          MÉDIA
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700">
        BAIXA
      </span>
    );
  };

  const abrirDetalhes = (item) => {
    setMenuAbertoId(null);
    if (onSelectChamado) onSelectChamado({ ...item, origem: 'chamados' });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-6 relative">

      {menuAbertoId !== null && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setMenuAbertoId(null)}
        ></div>
      )}

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative z-30">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por ID, Cidadão ou Local..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900 placeholder:text-slate-500"
          />
        </div>

        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Filter size={16} />
            <span>Filtros {filtroStatus !== 'Todos' ? `(${filtroStatus})` : ''}</span>
          </button>

          {mostrarFiltros && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              {['Todos', 'Pendente', 'Em andamento', 'Concluído', 'Cancelado'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setFiltroStatus(st);
                    setMostrarFiltros(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                    filtroStatus === st
                      ? 'bg-[#2563eb]/10 text-[#2563eb]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabela Centralizada */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1080px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5 text-center align-middle">ID</th>
                <th className="py-4 px-5 text-center align-middle">Solicitante</th>
                <th className="py-4 px-5 text-center align-middle">Categoria / Local</th>
                <th className="py-4 px-5 text-center align-middle">Secretaria</th>
                <th className="py-4 px-5 text-center align-middle">Prioridade</th>
                <th className="py-4 px-5 text-center align-middle">Status</th>
                <th className="py-4 px-5 text-center align-middle">Data de Abertura / Última Modificação</th>
                <th className="py-4 px-5 text-center align-middle">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {chamadosFiltrados.map((item, index) => {
                const idRow = item.id || `CH-284${7 - index}`;
                const solicitanteRow = item.solicitante || item.cidadao || item.nome || 'Cidadão';
                const categoriaRow = item.categoria || item.assunto || 'Solicitação';
                const localRow = item.bairro || item.local || 'Centro';
                const secretariaRow = item.departamento || 'Não encaminhado';
                const prioridadeRow = item.prioridade || 'BAIXA';
                const aberturaRow = item.dataAbertura || item.data || '28/07/2026';
                const modificacaoRow = item.ultimaModificacao || `${aberturaRow} às 10:00`;

                return (
                  <tr
                    key={String(idRow)}
                    onClick={() => abrirDetalhes(item)}
                    onKeyDown={(e) => {
                      if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        abrirDetalhes(item);
                      }
                    }}
                    tabIndex={0}
                    title="Clique para ver os detalhes"
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer focus:outline-none focus-visible:bg-slate-50"
                  >

                    <td className="py-4 px-5 text-center align-middle font-bold text-slate-800 whitespace-nowrap">
                      {idRow}
                    </td>

                    <td className="py-4 px-5 text-center align-middle font-medium text-slate-700 whitespace-nowrap">
                      {solicitanteRow}
                    </td>

                    <td className="py-4 px-5 text-center align-middle">
                      <p className="font-bold text-slate-800 leading-tight">{categoriaRow}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{localRow}</p>
                    </td>

                    <td className="py-4 px-5 text-center align-middle text-xs font-medium text-slate-700">
                      {secretariaRow}
                    </td>

                    <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                      {renderBadgePrioridade(prioridadeRow)}
                    </td>

                    <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                      {renderBadgeStatus(item.status)}
                    </td>

                    <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs font-semibold text-slate-700">
                          Abertura: <span className="font-normal text-slate-600">{aberturaRow}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          Última mod.: {modificacaoRow}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-center align-middle whitespace-nowrap relative">
                      <div className="flex items-center justify-center gap-2.5">

                        {/* Botão de visualizar (ícone de olho) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirDetalhes(item);
                          }}
                          className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:text-[#2563eb] hover:border-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer self-end"
                          title="Visualizar detalhes do chamado"
                          aria-label={`Visualizar detalhes do chamado ${idRow}`}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Seletor de status: não deve abrir os detalhes da linha */}
                        <div
                          className="flex flex-col items-center justify-center relative cursor-default"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Alterar status
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAbertoId(menuAbertoId === idRow ? null : idRow);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              menuAbertoId === idRow
                                ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#2563eb] hover:text-[#2563eb]'
                            }`}
                          >
                            Selecionar ▾
                          </button>

                          {menuAbertoId === idRow && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-left">
                              <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Alterar status para:
                              </p>

                              <button
                                type="button"
                                onClick={() => alterarStatusChamado(idRow, 'Pendente')}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <AlertCircle size={14} />
                                <span>Pendente</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => alterarStatusChamado(idRow, 'Em andamento')}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <Clock size={14} />
                                <span>Em Andamento</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => alterarStatusChamado(idRow, 'Concluído')}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
                              >
                                <Check size={14} />
                                <span>Concluído</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1 mx-2"></div>

                              <button
                                type="button"
                                onClick={() => alterarStatusChamado(idRow, 'Cancelado')}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <X size={14} />
                                <span>Cancelado</span>
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            A mostrar 1 a {chamadosFiltrados.length} de {chamadosFiltrados.length} chamados
          </span>

          <div className="flex items-center gap-1.5">
            <button type="button" className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              Anterior
            </button>
            <button type="button" className="w-8 h-8 rounded-lg bg-[#2563eb] text-white font-bold flex items-center justify-center">
              1
            </button>
            <button type="button" className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center">
              2
            </button>
            <button type="button" className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center">
              3
            </button>
            <span className="px-1">...</span>
            <button type="button" className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
              Seguinte
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}