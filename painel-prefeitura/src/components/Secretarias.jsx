import React, { useState } from 'react';
import { Search, Plus, Building2, Mail, Phone, Users, MoreHorizontal, Edit, Trash2, UserPlus, UserMinus, X, AlertTriangle, ShieldCheck, UserX, User } from 'lucide-react';

export default function Secretarias() {
  // ==========================================
  // ESTADOS DA LISTA DE SECRETARIAS
  // ==========================================
  const [secretarias, setSecretarias] = useState([
    {
      id: 1,
      nome: 'Secretaria de Obras e Viação',
      responsavel: 'Carlos Eduardo Oliveira',
      email: 'obras@sertao.rs.gov.br',
      telefone: '(54) 3345-1234',
      status: 'Ativo',
      equipe: [
        { nome: 'José Santos (Engenheiro)', telefone: '(54) 99912-3456' },
        { nome: 'Mariana Costa (Arquiteta)', telefone: '(54) 99876-5432' }
      ]
    },
    {
      id: 2,
      nome: 'Secretaria de Saúde',
      responsavel: 'Dra. Ana Maria Pereira',
      email: 'saude@sertao.rs.gov.br',
      telefone: '(54) 3345-5678',
      status: 'Ativo',
      equipe: [
        { nome: 'Maria Santos (Técnica)', telefone: '(54) 99811-2233' }
      ]
    },
    {
      id: 3,
      nome: 'Secretaria de Água e Saneamento',
      responsavel: 'Roberto Carlos Silva',
      email: 'agua@sertao.rs.gov.br',
      telefone: '(54) 3345-9012',
      status: 'Ativo',
      equipe: []
    }
  ]);

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [menuAtivo, setMenuAtivo] = useState(null);

  // ==========================================
  // ESTADOS DOS MODAIS (CRUD COMPLETO)
  // ==========================================
  const [modalNova, setModalNova] = useState(false);
  const [novaSec, setNovaSec] = useState({ nome: '', responsavel: '', email: '', telefone: '', status: 'Ativo' });

  const [modalEditar, setModalEditar] = useState(false);
  const [secEditando, setSecEditando] = useState(null);

  const [modalExcluir, setModalExcluir] = useState(false);
  const [secExcluindo, setSecExcluindo] = useState(null);

  // Equipe: guardamos só o ID; a secretaria sempre vem da lista (fonte única de verdade)
  const [modalEquipe, setModalEquipe] = useState(false);
  const [secEquipeId, setSecEquipeId] = useState(null);
  const secEquipe = secretarias.find(s => s.id === secEquipeId) || null;
  const [novoMembro, setNovoMembro] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [erroTelefone, setErroTelefone] = useState('');

  // Máscara de celular: (99) 99999-9999
  const formatarCelular = (valor) => {
    const d = valor.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  // ==========================================
  // FUNÇÕES DE AÇÃO (CRUD)
  // ==========================================
  const handleCriarSecretaria = (e) => {
    e.preventDefault();
    const nova = {
      id: Date.now(),
      ...novaSec,
      equipe: []
    };
    setSecretarias([...secretarias, nova]);
    setNovaSec({ nome: '', responsavel: '', email: '', telefone: '', status: 'Ativo' });
    setModalNova(false);
  };

  const handleSalvarEdicao = (e) => {
    e.preventDefault();
    setSecretarias(prev => prev.map(s => s.id === secEditando.id ? { ...s, ...secEditando, equipe: s.equipe } : s));
    setModalEditar(false);
  };

  const confirmarExclusao = () => {
    setSecretarias(prev => prev.filter(s => s.id !== secExcluindo.id));
    setModalExcluir(false);
  };

  const alterarStatusDireto = (id, novoStatus) => {
    setSecretarias(prev => prev.map(s => s.id === id ? { ...s, status: novoStatus } : s));
    setMenuAtivo(null);
  };

  // ==========================================
  // FUNÇÕES DE EQUIPE
  // ==========================================
  const abrirModalEquipe = (secretaria) => {
    setSecEquipeId(secretaria.id);
    setNovoMembro('');
    setNovoTelefone('');
    setErroTelefone('');
    setModalEquipe(true);
    setMenuAtivo(null);
  };

  const adicionarMembro = () => {
    const nome = novoMembro.trim();
    const telefone = novoTelefone.trim();
    if (!nome || !secEquipeId) return;

    // Celular é opcional, mas se for preenchido precisa estar completo (DDD + 9 dígitos)
    if (telefone && telefone.replace(/\D/g, '').length !== 11) {
      setErroTelefone('Celular incompleto. Complete o número ou deixe o campo vazio.');
      return;
    }

    setSecretarias(prev =>
      prev.map(s => s.id === secEquipeId ? { ...s, equipe: [...s.equipe, { nome, telefone }] } : s)
    );
    setNovoMembro('');
    setNovoTelefone('');
    setErroTelefone('');
  };

  const removerMembro = (indexParaRemover) => {
    setSecretarias(prev =>
      prev.map(s => s.id === secEquipeId
        ? { ...s, equipe: s.equipe.filter((_, i) => i !== indexParaRemover) }
        : s
      )
    );
  };

  // ==========================================
  // FILTRAGEM DE PESQUISA
  // ==========================================
  const secretariasFiltradas = secretarias.filter(sec =>
    sec.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    sec.responsavel.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-24 relative overflow-hidden">

      {/* Overlay para fechar os menus pop-up */}
      {menuAtivo && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuAtivo(null)}></div>
      )}

      {/* CABEÇALHO DA PÁGINA (TÍTULO E PESQUISA) */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Secretarias e Departamentos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão de entidades responsáveis pelo atendimento</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 relative z-20 mb-6">
        <div className="relative flex-1 max-w-2xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            placeholder="Pesquisar secretaria ou responsável..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28]"
          />
        </div>
        <button onClick={() => setModalNova(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4b5e28] hover:bg-[#3a4920] text-white rounded-lg text-sm font-bold shadow-md transition-all">
          <Plus size={18} /> Nova Secretaria
        </button>
      </div>

      {/* ======================================================= */}
      {/* GRID DE SECRETARIAS (CARDS) */}
      {/* CORREÇÃO: removido o z-10 do grid, que prendia o menu abaixo do overlay */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">

        {secretariasFiltradas.map((sec) => (
          <div
            key={sec.id}
            className={`bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col ${menuAtivo === sec.id ? 'relative z-40' : ''}`}
          >

            {/* Topo do Card */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sec.status === 'Ativo' ? 'bg-[#4b5e28]/10 text-[#4b5e28]' : 'bg-slate-100 text-slate-400'}`}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{sec.nome}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${sec.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {sec.status}
                  </span>
                </div>
              </div>

              {/* Menu de 3 Pontos */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuAtivo(menuAtivo === sec.id ? null : sec.id); }}
                  className={`p-1.5 rounded-md transition-colors ${menuAtivo === sec.id ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                >
                  <MoreHorizontal size={18} />
                </button>
                {menuAtivo === sec.id && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                      <button
                        onClick={() => { setSecEditando({ ...sec }); setModalEditar(true); setMenuAtivo(null); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 text-left transition-colors"
                      >
                        <Edit size={14} /> Editar Dados
                      </button>

                      {sec.status === 'Ativo' ? (
                        <button onClick={() => alterarStatusDireto(sec.id, 'Inativo')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50 text-left transition-colors">
                          <UserX size={14} /> Desativar
                        </button>
                      ) : (
                        <button onClick={() => alterarStatusDireto(sec.id, 'Ativo')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 text-left transition-colors">
                          <ShieldCheck size={14} /> Ativar
                        </button>
                      )}

                      <div className="h-px bg-slate-100 my-1 mx-2"></div>

                      <button
                        onClick={() => { setSecExcluindo(sec); setModalExcluir(true); setMenuAtivo(null); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Corpo do Card (Infos) */}
            <div className={`p-5 flex-1 flex flex-col gap-3 ${sec.status === 'Inativo' ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User size={16} className="text-slate-400 shrink-0" />
                <span className="truncate" title={sec.responsavel}><b>Resp:</b> {sec.responsavel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <span className="truncate" title={sec.email}>{sec.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <span>{sec.telefone}</span>
              </div>
            </div>

            {/* Rodapé do Card (Membros da Equipe) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <Users size={14} /> Membros da Equipe ({sec.equipe.length})
              </div>
              <button
                onClick={() => abrirModalEquipe(sec)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-[#4b5e28] hover:text-white transition-colors"
                title="Gerenciar equipe"
              >
                <Plus size={14} />
              </button>
            </div>

          </div>
        ))}

        {secretariasFiltradas.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
            Nenhuma secretaria encontrada para esta pesquisa.
          </div>
        )}

      </div>

      {/* ======================================================= */}
      {/* MODAL 1: NOVA SECRETARIA */}
      {/* ======================================================= */}
      {modalNova && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Nova Secretaria</h3>
              <button onClick={() => setModalNova(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-md transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCriarSecretaria} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Secretaria</label>
                <input type="text" required value={novaSec.nome} onChange={e => setNovaSec({ ...novaSec, nome: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" placeholder="Ex: Secretaria de Saúde" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsável</label>
                <input type="text" required value={novaSec.responsavel} onChange={e => setNovaSec({ ...novaSec, responsavel: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" placeholder="Nome do secretário(a)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Institucional</label>
                  <input type="email" required value={novaSec.email} onChange={e => setNovaSec({ ...novaSec, email: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" placeholder="@sertao.rs.gov.br" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Principal</label>
                  <input type="text" required value={novaSec.telefone} onChange={e => setNovaSec({ ...novaSec, telefone: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" placeholder="(00) 0000-0000" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setModalNova(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-[#4b5e28] hover:bg-[#3a4920] text-white rounded-lg text-sm font-bold shadow-md transition-colors">Criar Secretaria</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: EDITAR SECRETARIA */}
      {/* ======================================================= */}
      {modalEditar && secEditando && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Editar Secretaria</h3>
              <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-md transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Secretaria</label>
                <input type="text" required value={secEditando.nome} onChange={e => setSecEditando({ ...secEditando, nome: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsável</label>
                <input type="text" required value={secEditando.responsavel} onChange={e => setSecEditando({ ...secEditando, responsavel: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Institucional</label>
                  <input type="email" required value={secEditando.email} onChange={e => setSecEditando({ ...secEditando, email: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Principal</label>
                  <input type="text" required value={secEditando.telefone} onChange={e => setSecEditando({ ...secEditando, telefone: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-[#4b5e28] focus:border-[#4b5e28] focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setModalEditar(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 3: EXCLUIR SECRETARIA */}
      {/* ======================================================= */}
      {modalExcluir && secExcluindo && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Secretaria?</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Tem certeza que deseja apagar a <b>{secExcluindo.nome}</b>? Esta ação também removerá todos os membros da equipe associados.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setModalExcluir(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={confirmarExclusao} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 4: GERENCIAR EQUIPE */}
      {/* ======================================================= */}
      {modalEquipe && secEquipe && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Gerenciar Equipe</h3>
                <p className="text-sm text-slate-500 font-medium">{secEquipe.nome}</p>
              </div>
              <button onClick={() => setModalEquipe(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-md transition-colors"><X size={20} /></button>
            </div>

            {/* Adicionar membro (sem <form>, para não ser interceptado por nenhum form pai) */}
            <div className="mb-6 space-y-3">
              <input
                type="text"
                value={novoMembro}
                onChange={(e) => setNovoMembro(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarMembro(); } }}
                placeholder="Nome do novo funcionário..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e28] focus:border-transparent transition-all"
              />
              <div className="flex gap-3">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={novoTelefone}
                  onChange={(e) => { setNovoTelefone(formatarCelular(e.target.value)); setErroTelefone(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarMembro(); } }}
                  placeholder="Celular (opcional): (00) 00000-0000"
                  className={`flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${erroTelefone ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-[#4b5e28]'}`}
                />
                <button
                  type="button"
                  onClick={adicionarMembro}
                  className="px-5 py-2.5 bg-[#4b5e28] hover:bg-[#3a4920] text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <UserPlus size={16} /> Adicionar
                </button>
              </div>
              {erroTelefone && (
                <p className="text-xs text-red-600 font-medium">{erroTelefone}</p>
              )}
            </div>

            {/* Lista de Membros */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  MEMBROS DA EQUIPE ({secEquipe.equipe.length})
                </p>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {secEquipe.equipe.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500">
                    Nenhum membro registrado nesta secretaria.
                  </div>
                ) : (
                  secEquipe.equipe.map((membro, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 border border-slate-200 rounded-lg hover:border-[#4b5e28]/30 hover:bg-[#4b5e28]/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{membro.nome}</p>
                          {membro.telefone ? (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone size={11} className="shrink-0" /> {membro.telefone}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic mt-0.5">Celular não informado</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removerMembro(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-60 group-hover:opacity-100"
                        title="Remover funcionário"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}