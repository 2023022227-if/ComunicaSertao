import React, { useState } from 'react';
import { Search, Filter, UserPlus, MoreHorizontal, Mail, Phone, Users, UserCheck, UserPlus as UserPlusIcon, X, Edit, UserX, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';

export default function Cidadaos() {
  // ==========================================
  // ESTADOS PRINCIPAIS
  // ==========================================
  const [cidadaos, setCidadaos] = useState([
    { id: 1, nome: 'Maria Aparecida da Silva', cpf: '***.456.789-**', email: 'maria.silva@email.com', telefone: '(54) 99988-7766', bairro: 'Centro', data: '12/01/2026', status: 'Ativo' },
    { id: 2, nome: 'João Carlos Martins', cpf: '***.123.456-**', email: 'joao.martins@email.com', telefone: '(54) 98877-6655', bairro: 'Jardim América', data: '05/03/2026', status: 'Ativo' },
    { id: 3, nome: 'Ana Paula Rodrigues', cpf: '***.987.654-**', email: 'ana.paula@email.com', telefone: '(54) 97766-5544', bairro: 'Vila Nova', data: '20/05/2026', status: 'Bloqueado' },
    { id: 4, nome: 'Roberto Fernandes', cpf: '***.321.987-**', email: 'roberto.f@email.com', telefone: '(54) 96655-4433', bairro: 'São João', data: '15/07/2026', status: 'Ativo' },
    { id: 5, nome: 'Claudia Barros', cpf: '***.654.321-**', email: 'claudia.barros@email.com', telefone: '(54) 95544-3322', bairro: 'Centro', data: '22/07/2026', status: 'Ativo' }
  ]);

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [mostrarMenuFiltro, setMostrarMenuFiltro] = useState(false);
  const [menuAtivo, setMenuAtivo] = useState(null);

  // ==========================================
  // ESTADOS DOS MODAIS
  // ==========================================
  const [modalNovo, setModalNovo] = useState(false);
  const [novoCidadao, setNovoCidadao] = useState({ nome: '', cpf: '', email: '', telefone: '', bairro: '' });

  const [modalEditar, setModalEditar] = useState(false);
  const [cidadaoEditando, setCidadaoEditando] = useState(null);

  const [modalExcluir, setModalExcluir] = useState(false);
  const [cidadaoSelecionado, setCidadaoSelecionado] = useState(null);

  // ==========================================
  // FILTRAGEM
  // ==========================================
  const cidadaosFiltrados = cidadaos.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) || 
                       c.email.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                       c.cpf.includes(termoPesquisa);
    const matchStatus = filtroStatus === 'Todos' ? true : c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const abrirOpcao = (e, acao, cidadao) => {
    e.preventDefault();
    e.stopPropagation();
    
    setMenuAtivo(null); // Fecha o menu flutuante instantaneamente

    if (acao === 'editar') {
      setCidadaoEditando({ ...cidadao }); // Cria uma cópia para não alterar a tabela antes de guardar
      setModalEditar(true);
    } else if (acao === 'excluir') {
      setCidadaoSelecionado(cidadao);
      setModalExcluir(true);
    } else if (acao === 'bloquear' || acao === 'ativar') {
      const novoStatus = acao === 'bloquear' ? 'Bloqueado' : 'Ativo';
      setCidadaos(prev => prev.map(c => c.id === cidadao.id ? { ...c, status: novoStatus } : c));
    }
  };

  // ==========================================
  // CONFIRMAÇÕES DOS MODAIS
  // ==========================================
  const confirmarEdicao = (e) => {
    e.preventDefault();
    setCidadaos(prev => prev.map(c => c.id === cidadaoEditando.id ? cidadaoEditando : c));
    setModalEditar(false);
    setCidadaoEditando(null);
  };

  const confirmarExclusao = () => {
    if (cidadaoSelecionado) {
      setCidadaos(prev => prev.filter(c => c.id !== cidadaoSelecionado.id));
      setModalExcluir(false);
      setCidadaoSelecionado(null);
    }
  };

  const handleSalvarNovo = (e) => {
    e.preventDefault();
    const hoje = new Date();
    const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;

    const cidadaoAdicionado = {
      id: Date.now(), 
      nome: novoCidadao.nome,
      cpf: novoCidadao.cpf || '***.000.000-**',
      email: novoCidadao.email,
      telefone: novoCidadao.telefone,
      bairro: novoCidadao.bairro,
      data: dataFormatada,
      status: 'Ativo'
    };

    setCidadaos([cidadaoAdicionado, ...cidadaos]);
    setNovoCidadao({ nome: '', cpf: '', email: '', telefone: '', bairro: '' });
    setModalNovo(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'Ativo') return <span className="px-2.5 py-1 text-[11px] font-bold text-green-700 bg-green-100 rounded-md">Ativo</span>;
    return <span className="px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-100 rounded-md">Bloqueado</span>;
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen relative overflow-hidden">
      
      {/* Overlay para fechar menus ao clicar fora (z-30) */}
      {(mostrarMenuFiltro || menuAtivo) && (
        <div 
          className="fixed inset-0 z-30 cursor-default" 
          onClick={() => { setMostrarMenuFiltro(false); setMenuAtivo(null); }}
        ></div>
      )}

      {/* ======================================================= */}
      {/* 1. CARDS DE RESUMO (KPIs) */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">Total de Cidadãos</p>
            <h3 className="text-2xl font-bold text-slate-800">{(12445 + cidadaos.length).toLocaleString('pt-PT')}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">Cadastros Ativos</p>
            <h3 className="text-2xl font-bold text-slate-800">{(11885 + cidadaos.filter(c => c.status === 'Ativo').length).toLocaleString('pt-PT')}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <UserPlusIcon size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">Novos este mês</p>
            <h3 className="text-2xl font-bold text-slate-800">+{137 + (cidadaos.length - 5)}</h3>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 2. BARRA DE PESQUISA E FILTROS */}
      {/* CORREÇÃO: sobe para z-40 (acima do overlay) quando o menu de filtro está aberto */}
      {/* ======================================================= */}
      <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between gap-4 relative ${mostrarMenuFiltro ? 'z-40' : 'z-20'}`}>
        <div className="relative flex-1 max-w-2xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            placeholder="Pesquisar por Nome, CPF ou Email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28]"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setMostrarMenuFiltro(!mostrarMenuFiltro)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold transition-colors h-full ${mostrarMenuFiltro || filtroStatus !== 'Todos' ? 'border-[#4b5e28] text-[#4b5e28] bg-[#4b5e28]/5' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
            >
              <Filter size={16} /> Filtros {filtroStatus !== 'Todos' && <span className="w-2 h-2 rounded-full bg-[#4b5e28]"></span>}
            </button>

            {mostrarMenuFiltro && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[999] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtrar por Status:</span>
                </div>
                <div className="flex flex-col py-1.5">
                  {['Todos', 'Ativo', 'Bloqueado'].map(status => (
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
          <button onClick={() => setModalNovo(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-md">
            <UserPlus size={16} /> Novo Cadastro
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 3. TABELA DE CIDADÃOS */}
      {/* CORREÇÃO: sobe para z-40 (acima do overlay) quando o menu de ações está aberto */}
      {/* ======================================================= */}
      <div
        className={`bg-white rounded-xl border border-slate-200 shadow-sm relative ${menuAtivo ? 'z-40' : 'z-10'}`}
        onClick={() => setMenuAtivo(null)} // Clicar em área vazia do card também fecha o menu
      >
        <div className="overflow-x-auto min-h-[400px] pb-48 rounded-t-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nome / CPF</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contatos</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bairro</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data Registo</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {cidadaosFiltrados.length === 0 && (
                <tr><td colSpan="6" className="py-12 text-center text-slate-500">Nenhum cidadão encontrado.</td></tr>
              )}

              {cidadaosFiltrados.map((cidadao) => (
                <tr key={cidadao.id} className={`border-b border-slate-100 transition-colors group relative ${menuAtivo === cidadao.id ? 'bg-slate-50 z-50' : 'hover:bg-slate-50 z-10'}`}>
                  <td className="py-4 px-6 relative">
                    <p className="font-semibold text-slate-800">{cidadao.nome}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">CPF: {cidadao.cpf}</p>
                  </td>
                  <td className="py-4 px-6 relative">
                    <p className="flex items-center gap-1.5 text-slate-500 mb-1"><Mail size={13} className="text-slate-400"/> {cidadao.email}</p>
                    <p className="flex items-center gap-1.5 text-slate-500"><Phone size={13} className="text-slate-400"/> {cidadao.telefone}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium relative">{cidadao.bairro}</td>
                  <td className="py-4 px-6 text-slate-500 relative">{cidadao.data}</td>
                  <td className="py-4 px-6 relative">{getStatusBadge(cidadao.status)}</td>
                  
                  <td className="py-4 px-6 text-right relative">
                    {/* Botão dos 3 pontos */}
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setMenuAtivo(menuAtivo === cidadao.id ? null : cidadao.id); }}
                        className={`p-1.5 rounded-md transition-colors ${menuAtivo === cidadao.id ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {/* Menu Suspenso */}
                      {menuAtivo === cidadao.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200 overflow-hidden z-[999]">
                          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-left">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ações da Conta:</span>
                          </div>
                          <div className="flex flex-col py-1 bg-white">
                            <button onClick={(e) => abrirOpcao(e, 'editar', cidadao)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 text-left transition-colors">
                              <Edit size={14} /> Editar Dados
                            </button>
                            
                            {cidadao.status === 'Ativo' ? (
                              <button onClick={(e) => abrirOpcao(e, 'bloquear', cidadao)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50 text-left transition-colors">
                                <UserX size={14} /> Bloquear Acesso
                              </button>
                            ) : (
                              <button onClick={(e) => abrirOpcao(e, 'ativar', cidadao)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 text-left transition-colors">
                                <ShieldCheck size={14} /> Ativar Acesso
                              </button>
                            )}

                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            
                            <button onClick={(e) => abrirOpcao(e, 'excluir', cidadao)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors">
                              <Trash2 size={14} /> Excluir Cidadão
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Rodapé Dinâmico */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white relative z-20 rounded-b-xl">
          <p className="text-xs text-slate-500">A mostrar {cidadaosFiltrados.length > 0 ? 1 : 0} a {cidadaosFiltrados.length} de {cidadaos.length} cidadãos</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-400 cursor-not-allowed">Anterior</button>
            <button className="px-3 py-1.5 border border-[#4b5e28] bg-[#4b5e28] text-white rounded-md text-xs font-bold">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">Seguinte</button>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODAIS (SOBREPOSIÇÃO GLOBAL)                            */}
      {/* ======================================================= */}
      
      {/* MODAL: EDITAR INFORMAÇÕES */}
      {modalEditar && cidadaoEditando && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Editar Dados do Cidadão</h3>
              <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
            </div>
            <form onSubmit={confirmarEdicao} className="space-y-4">
              <input type="text" value={cidadaoEditando.nome} onChange={e => setCidadaoEditando({...cidadaoEditando, nome: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Nome Completo" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={cidadaoEditando.cpf} onChange={e => setCidadaoEditando({...cidadaoEditando, cpf: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="CPF" required />
                <input type="text" value={cidadaoEditando.telefone} onChange={e => setCidadaoEditando({...cidadaoEditando, telefone: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Telefone" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="email" value={cidadaoEditando.email} onChange={e => setCidadaoEditando({...cidadaoEditando, email: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="E-mail" required />
                <input type="text" value={cidadaoEditando.bairro} onChange={e => setCidadaoEditando({...cidadaoEditando, bairro: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Bairro" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalEditar(false)} className="px-4 py-2 bg-slate-200 rounded-lg font-medium hover:bg-slate-300 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CADASTRO */}
      {modalNovo && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cadastrar Cidadão</h3>
              <button onClick={() => setModalNovo(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleSalvarNovo} className="space-y-4">
              <input type="text" value={novoCidadao.nome} onChange={e => setNovoCidadao({...novoCidadao, nome: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Nome Completo" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={novoCidadao.cpf} onChange={e => setNovoCidadao({...novoCidadao, cpf: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="CPF" required />
                <input type="text" value={novoCidadao.telefone} onChange={e => setNovoCidadao({...novoCidadao, telefone: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Telefone" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="email" value={novoCidadao.email} onChange={e => setNovoCidadao({...novoCidadao, email: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="E-mail" required />
                <input type="text" value={novoCidadao.bairro} onChange={e => setNovoCidadao({...novoCidadao, bairro: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Bairro" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalNovo(false)} className="px-4 py-2 bg-slate-200 rounded-lg font-medium hover:bg-slate-300 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">Cadastrar Cidadão</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCLUIR CIDADÃO */}
      {modalExcluir && cidadaoSelecionado && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center shadow-2xl">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Excluir Cidadão?</h3>
            <p className="text-slate-500 mb-6">Tem certeza que deseja apagar os dados de <b>{cidadaoSelecionado.nome}</b>?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setModalExcluir(false)} className="px-6 py-2 bg-slate-200 rounded-lg font-medium hover:bg-slate-300 transition-colors">Cancelar</button>
              <button onClick={confirmarExclusao} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}