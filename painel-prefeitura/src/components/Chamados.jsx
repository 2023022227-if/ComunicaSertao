import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MoreHorizontal, Check, Clock, AlertCircle, X } from 'lucide-react';
import { buscarChamados, atualizarStatusChamado } from '../api';

export default function Chamados({ setActivePage, setSelectedChamado }) {
  // ==========================================
  // ESTADOS DA TABELA E DADOS
  // ==========================================
  const [listaChamados, setListaChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    try {
      const dados = await buscarChamados();
      setListaChamados(dados);
    } catch (erro) {
      console.error('Erro ao carregar chamados do backend:', erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 4000);
    return () => clearInterval(intervalo);
  }, []);

  // ==========================================
  // ESTADOS DE PESQUISA E FILTROS
  // ==========================================
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [mostrarMenuFiltro, setMostrarMenuFiltro] = useState(false);
  const [menuAtivo, setMenuAtivo] = useState(null);

  // ==========================================
  // LÓGICA DE FILTRAGEM DINÂMICA
  // ==========================================
  const chamadosFiltrados = listaChamados.filter(chamado => {
    const busca = termoPesquisa.toLowerCase();
    const matchBusca =
      (chamado.id || '').toLowerCase().includes(busca) ||
      (chamado.autor || '').toLowerCase().includes(busca) ||
      (chamado.titulo || '').toLowerCase().includes(busca) ||
      (chamado.local || '').toLowerCase().includes(busca);

    const matchStatus =
      filtroStatus === 'Todos'
        ? true
        : (chamado.status || '').toLowerCase() === filtroStatus.toLowerCase();

    return matchBusca && matchStatus;
  });

  // ==========================================
  // AÇÕES
  // ==========================================
  const handleAbrirDetalhes = (chamado) => {
    setSelectedChamado({ ...chamado, origem: 'chamados' });
    setActivePage('detalhes_chamado');
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setMenuAtivo(menuAtivo === id ? null : id);
  };

  const alterarStatus = async (e, id, novoStatus) => {
    e.stopPropagation();
    setListaChamados(prevLista =>
      prevLista.map(chamado =>
        chamado.id === id ? { ...chamado, status: novoStatus } : chamado
      )
    );
    setMenuAtivo(null);

    try {
      await atualizarStatusChamado(id, novoStatus);
    } catch (erro) {
      console.error('Erro ao salvar status no servidor:', erro);
    }
  };

  const fecharMenus = (e) => {
    e.stopPropagation();
    setMenuAtivo(null);
    setMostrarMenuFiltro(false);
  };

  const getStatusBadge = (status = '') => {
    switch (status.toLowerCase()) {
      case 'pendente': return <span className="px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-md">Pendente</span>;
      case 'em andamento': return <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-md">Em andamento</span>;
      case 'concluído': return <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-md">Concluído</span>;
      case 'cancelado': return <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-md">Cancelado</span>;
      default: return <span className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-md">{status}</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full pb-16 relative">

      {/* Overlay invisível para fechar os menus ao clicar fora deles (z-40) */}
      {(menuAtivo || mostrarMenuFiltro) && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={fecharMenus}
        ></div>
      )}

      {/* ======================================================= */}
      {/* BARRA DE PESQUISA E FILTROS */}
      {/* ======================================================= */}
      <div
        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4 relative ${mostrarMenuFiltro ? 'z-50' : 'z-20'}`}
      >

        {/* Input de Pesquisa Dinâmica */}
        <div className="relative flex-1 max-w-2xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            placeholder="Pesquisar por ID, Cidadão ou Local..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28]/50 focus:border-[#4b5e28] transition-colors"
          />
        </div>

        {/* Menu de Filtros */}
        <div className="relative">
          <button
            onClick={() => setMostrarMenuFiltro(!mostrarMenuFiltro)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold transition-colors h-full ${mostrarMenuFiltro || filtroStatus !== 'Todos' ? 'border-[#4b5e28] text-[#4b5e28] bg-[#4b5e28]/5' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
          >
            <Filter size={16} /> Filtros {filtroStatus !== 'Todos' && <span className="w-2 h-2 rounded-full bg-[#4b5e28]"></span>}
          </button>

          {mostrarMenuFiltro && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200 overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtrar por Status:</span>
              </div>
              <div className="flex flex-col py-1.5 bg-white">
                {['Todos', 'Pendente', 'Em Andamento', 'Concluído', 'Cancelado'].map(status => (
                  <button
                    key={status}
                    onClick={() => { setFiltroStatus(status); setMostrarMenuFiltro(false); }}
                    className={`flex items-center w-full px-4 py-2.5 text-sm text-left transition-colors ${filtroStatus === status ? 'bg-slate-50 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* TABELA DE CHAMADOS */}
      {/* ======================================================= */}
      <div
        className={`bg-white rounded-xl border border-slate-200 shadow-sm relative ${menuAtivo ? 'z-50' : 'z-10'}`}
      >

        <div className="overflow-x-auto min-h-[400px] pb-48 rounded-t-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solicitante</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Categoria / Local</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data Abertura</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">

              {!carregando && chamadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    Nenhum chamado encontrado para a pesquisa ou filtro atual.
                  </td>
                </tr>
              )}

              {chamadosFiltrados.map((chamado) => (
                <tr
                  key={chamado.id}
                  onClick={() => handleAbrirDetalhes(chamado)}
                  className={`border-b border-slate-100 transition-colors cursor-pointer group relative ${menuAtivo === chamado.id ? 'bg-slate-50 z-50' : 'hover:bg-slate-50 z-10'}`}
                >
                  <td className="py-4 px-6 font-semibold text-slate-800 relative">{chamado.id}</td>
                  <td className="py-4 px-6 text-slate-600 relative">
                    <p className="font-medium text-slate-800">{chamado.autor}</p>
                    {chamado.cidadao_telefone && (
                      <p className="text-[11px] text-slate-400">{chamado.cidadao_telefone}</p>
                    )}
                  </td>
                  <td className="py-4 px-6 relative">
                    <p className="font-semibold text-slate-800">{chamado.titulo}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{chamado.local}</p>
                  </td>
                  <td className="py-4 px-6 relative">
                    {getStatusBadge(chamado.status)}
                  </td>
                  <td className="py-4 px-6 text-slate-500 relative">{chamado.tempo}</td>
                  <td className="py-4 px-6 text-right relative">
                    <div className={`flex items-center justify-end gap-3 transition-opacity ${menuAtivo === chamado.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleAbrirDetalhes(chamado); }}
                        className="p-1.5 text-slate-400 hover:text-[#4b5e28] hover:bg-[#4b5e28]/10 rounded-md transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(e, chamado.id)}
                          className={`p-1.5 rounded-md transition-colors ${menuAtivo === chamado.id ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                          title="Alterar Status"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Menu Dropdown de Ações */}
                        {menuAtivo === chamado.id && (
                          <div
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200 overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-left">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alterar status para:</span>
                            </div>
                            <div className="flex flex-col py-1 bg-white">
                              <button
                                onClick={(e) => alterarStatus(e, chamado.id, 'Pendente')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors text-left bg-white"
                              >
                                <AlertCircle size={14} /> Pendente
                              </button>
                              <button
                                onClick={(e) => alterarStatus(e, chamado.id, 'Em Andamento')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors text-left bg-white"
                              >
                                <Clock size={14} /> Em Andamento
                              </button>
                              <button
                                onClick={(e) => alterarStatus(e, chamado.id, 'Concluído')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors text-left bg-white"
                              >
                                <Check size={14} /> Concluído
                              </button>
                              <div className="h-px bg-slate-100 my-1 mx-2"></div>
                              <button
                                onClick={(e) => alterarStatus(e, chamado.id, 'Cancelado')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors text-left bg-white"
                              >
                                <X size={14} /> Cancelado
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white relative z-20 rounded-b-xl">
          <p className="text-xs text-slate-500">
            A mostrar {chamadosFiltrados.length > 0 ? 1 : 0} a {chamadosFiltrados.length} de {listaChamados.length} chamados
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-50 cursor-not-allowed">Anterior</button>
            <button className="px-3 py-1.5 border border-[#4b5e28] bg-[#4b5e28] text-white rounded-md text-xs font-bold">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Seguinte</button>
          </div>
        </div>
      </div>
    </div>
  );
}