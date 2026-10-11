import React, { useState, useEffect } from 'react';
import {
  User, Link as LinkIcon, Bell, ShieldCheck, Monitor, Smartphone, LogOut,
  Clock, MapPin, Check, Camera, MessageSquare, Key, CheckCircle2, Eye, EyeOff,
  Users, UserCheck, UserX, Trash2, UserPlus
} from 'lucide-react';
import {
  buscarFuncionarios,
  atualizarStatusFuncionario,
  removerFuncionario,
  cadastrarFuncionario
} from '../api';

export default function Configuracoes({ usuarioLogado }) {
  const [abaAtiva, setAbaAtiva] = useState('Aprovacoes');

  // ==========================================
  // ESTADOS: GESTÃO E APROVAÇÃO DE SERVIDORES
  // ==========================================
  const [funcionarios, setFuncionarios] = useState([]);
  const [modalNovoServidor, setModalNovoServidor] = useState(false);
  const [novoServidor, setNovoServidor] = useState({
    nome: '',
    matricula: '',
    email: '',
    senha: '',
    cargo: 'Servidor Municipal'
  });

  const carregarFuncionarios = async () => {
    try {
      const lista = await buscarFuncionarios();
      setFuncionarios(lista);
    } catch (erro) {
      console.error('Erro ao buscar funcionários:', erro);
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const qtdPendentes = funcionarios.filter(f => (f.status || '').toLowerCase() === 'pendente').length;

  const handleAprovar = async (id) => {
    try {
      await atualizarStatusFuncionario(id, 'Aprovado');
      carregarFuncionarios();
    } catch (erro) {
      console.error('Erro ao aprovar servidor:', erro);
    }
  };

  const handleBloquear = async (id) => {
    try {
      await atualizarStatusFuncionario(id, 'Bloqueado');
      carregarFuncionarios();
    } catch (erro) {
      console.error('Erro ao bloquear servidor:', erro);
    }
  };

  const handleAlterarCargo = async (id, statusAtual, novoCargo) => {
    try {
      await atualizarStatusFuncionario(id, statusAtual, novoCargo);
      carregarFuncionarios();
    } catch (erro) {
      console.error('Erro ao alterar cargo:', erro);
    }
  };

  const handleRemover = async (id, nome) => {
    if (!window.confirm(`Deseja realmente remover o cadastro de ${nome}?`)) return;
    try {
      await removerFuncionario(id);
      carregarFuncionarios();
    } catch (erro) {
      console.error('Erro ao remover servidor:', erro);
    }
  };

  const handleCriarServidorDireto = async (e) => {
    e.preventDefault();
    try {
      const emailFormatado = novoServidor.email.includes('@')
        ? novoServidor.email
        : `${novoServidor.email}@sertao.rs.gov.br`;

      await cadastrarFuncionario({
        ...novoServidor,
        email: emailFormatado,
        status: 'Aprovado'
      });
      setNovoServidor({ nome: '', matricula: '', email: '', senha: '', cargo: 'Servidor Municipal' });
      setModalNovoServidor(false);
      carregarFuncionarios();
    } catch (erro) {
      alert(erro.message || 'Erro ao cadastrar servidor');
    }
  };

  // ==========================================
  // ESTADOS: SALVAR ALTERAÇÕES
  // ==========================================
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSalvarAlteracoes = () => {
    setSalvando(true);
    setSucesso(false);
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    }, 600);
  };

  // ==========================================
  // ESTADOS: PERFIL DO ADMINISTRADOR & SENHA
  // ==========================================
  const [perfil, setPerfil] = useState({
    nome: usuarioLogado?.nome || 'Fabricio de Abreu',
    email: usuarioLogado?.email || 'fabricio@sertao.rs.gov.br',
    cargo: usuarioLogado?.cargo || 'Administrador',
    departamento: 'Administração Geral — Prefeitura de Sertão'
  });

  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmacao: '' });
  const [mostrarSenhas, setMostrarSenhas] = useState({ atual: false, nova: false, confirmacao: false });

  // ==========================================
  // ESTADOS: INTEGRAÇÕES, NOTIFICAÇÕES E SEGURANÇA
  // ==========================================
  const [whatsappConectado, setWhatsappConectado] = useState(true);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [apiToken, setApiToken] = useState('sk_live_sertao_9876543210abcdef');

  const gerarNovoToken = () => {
    if (window.confirm('Deseja gerar uma nova chave de integração?')) {
      const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let novoHash = '';
      for (let i = 0; i < 16; i++) {
        novoHash += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      setApiToken(`sk_live_sertao_${novoHash}`);
      setMostrarToken(true);
    }
  };

  const [notifs, setNotifs] = useState({
    novosChamados: true,
    atualizacoesSistema: true,
    relatoriosSemanais: false,
    alertasWhatsapp: true
  });

  const [doisFatores, setDoisFatores] = useState(false);
  const [alertasNovos, setAlertasNovos] = useState(true);

  const [sessoes, setSessoes] = useState([
    { id: 1, dispositivo: 'Windows 11 • Navegador Local', local: 'Sertão, RS', ip: '127.0.0.1', atual: true, tipo: 'desktop' }
  ]);

  const ToggleSwitch = ({ checked, onChange }) => (
    <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#4b5e28]' : 'bg-slate-200'}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen relative pb-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

        {/* ======================================================= */}
        {/* MENU LATERAL ESQUERDO */}
        {/* ======================================================= */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setAbaAtiva('Aprovacoes')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Aprovacoes' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <span className="flex items-center gap-3">
                <Users size={18} className="text-[#4b5e28]" /> Aprovação de Acessos
              </span>
              {qtdPendentes > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full">
                  {qtdPendentes}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('Perfil')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Perfil' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <User size={18} /> Perfil do Administrador
            </button>

            <button
              onClick={() => setAbaAtiva('Integrações')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Integrações' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <LinkIcon size={18} /> Integrações e API
            </button>

            <button
              onClick={() => setAbaAtiva('Notificações')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Notificações' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <Bell size={18} /> Notificações
            </button>

            <button
              onClick={() => setAbaAtiva('Segurança')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Segurança' ? 'bg-white border border-[#4b5e28]/20 text-[#4b5e28] shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <ShieldCheck size={18} /> Segurança
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ======================================================= */}
        <div className="flex-1 space-y-6 relative z-10">

          {/* ===================================================== */}
          {/* ABA 0: APROVAÇÃO E GESTÃO DE ACESSOS DE FUNCIONÁRIOS */}
          {/* ===================================================== */}
          {abaAtiva === 'Aprovacoes' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <ShieldCheck size={20} className="text-[#4b5e28]" /> Controle de Acessos ao Dashboard
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Aprove novas solicitações de servidores ou adicione funcionários diretamente no banco SQLite.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalNovoServidor(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4b5e28] hover:bg-[#3a4920] text-white rounded-lg text-sm font-bold shadow-sm transition-colors shrink-0 cursor-pointer"
                  >
                    <UserPlus size={16} /> Novo Servidor
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-200">
                        <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Servidor / Matrícula</th>
                        <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">E-mail Institucional</th>
                        <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nível de Permissão</th>
                        <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Ações do Administrador</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {funcionarios.map((func) => {
                        const st = (func.status || 'Aprovado').toLowerCase();
                        return (
                          <tr key={func.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6">
                              <p className="font-bold text-slate-800">{func.nome}</p>
                              <p className="text-xs text-slate-400">Matrícula: {func.matricula}</p>
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-medium">{func.email}</td>
                            <td className="py-4 px-6">
                              <select
                                value={func.cargo}
                                onChange={(e) => handleAlterarCargo(func.id, func.status, e.target.value)}
                                className="px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4b5e28]"
                              >
                                <option value="Administrador">Administrador</option>
                                <option value="Servidor Municipal">Servidor Municipal</option>
                              </select>
                            </td>
                            <td className="py-4 px-6">
                              {st === 'aprovado' && (
                                <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-md">
                                  Aprovado
                                </span>
                              )}
                              {st === 'pendente' && (
                                <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">
                                  Aguardando Aprovação
                                </span>
                              )}
                              {st === 'bloqueado' && (
                                <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-md">
                                  Bloqueado
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {st !== 'aprovado' && (
                                  <button
                                    onClick={() => handleAprovar(func.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                                    title="Aprovar acesso deste servidor"
                                  >
                                    <UserCheck size={14} /> Aprovar
                                  </button>
                                )}
                                {st === 'aprovado' && (
                                  <button
                                    onClick={() => handleBloquear(func.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                    title="Bloquear temporariamente"
                                  >
                                    <UserX size={14} /> Bloquear
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemover(func.id, func.nome)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir cadastro"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* ABA 1: PERFIL DO ADMINISTRADOR */}
          {/* ===================================================== */}
          {abaAtiva === 'Perfil' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-6 bg-slate-50/50">
                  <div className="relative">
                    <div className="w-24 h-24 bg-[#4b5e28]/10 text-[#4b5e28] rounded-full flex items-center justify-center text-3xl font-bold border border-[#4b5e28]/20">
                      {perfil.nome.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-sm transition-colors cursor-pointer">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{perfil.nome}</h3>
                    <p className="text-[#4b5e28] font-bold text-sm">{perfil.cargo}</p>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome Completo</label>
                    <input type="text" value={perfil.nome} onChange={e => setPerfil({ ...perfil, nome: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">E-mail Institucional</label>
                    <input type="email" value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nível de Acesso</label>
                    <input type="text" value={perfil.cargo} onChange={e => setPerfil({ ...perfil, cargo: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Departamento / Secretaria</label>
                    <input type="text" value={perfil.departamento} onChange={e => setPerfil({ ...perfil, departamento: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                  <Key size={18} className="text-slate-600" />
                  <h3 className="font-bold text-slate-800">Alterar Senha</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={mostrarSenhas.atual ? "text" : "password"}
                        value={senhas.atual}
                        onChange={e => setSenhas({ ...senhas, atual: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none pr-10"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setMostrarSenhas({ ...mostrarSenhas, atual: !mostrarSenhas.atual })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {mostrarSenhas.atual ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={mostrarSenhas.nova ? "text" : "password"}
                        value={senhas.nova}
                        onChange={e => setSenhas({ ...senhas, nova: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none pr-10"
                        placeholder="Nova senha forte"
                      />
                      <button type="button" onClick={() => setMostrarSenhas({ ...mostrarSenhas, nova: !mostrarSenhas.nova })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {mostrarSenhas.nova ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input
                        type={mostrarSenhas.confirmacao ? "text" : "password"}
                        value={senhas.confirmacao}
                        onChange={e => setSenhas({ ...senhas, confirmacao: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none pr-10"
                        placeholder="Repita a nova senha"
                      />
                      <button type="button" onClick={() => setMostrarSenhas({ ...mostrarSenhas, confirmacao: !mostrarSenhas.confirmacao })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {mostrarSenhas.confirmacao ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* ABA 2: INTEGRAÇÕES E API */}
          {/* ===================================================== */}
          {abaAtiva === 'Integrações' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><MessageSquare size={24} /></div>
                    <div>
                      <h3 className="font-bold text-slate-800">WhatsApp Bot ComunicaSertão</h3>
                      <p className="text-sm text-slate-500">Canal interativo para abertura e consulta de protocolos pelos cidadãos de Sertão - RS.</p>
                    </div>
                  </div>
                  <button onClick={() => setWhatsappConectado(!whatsappConectado)} className={`px-5 py-2.5 rounded-lg text-sm font-bold shrink-0 transition-colors ${whatsappConectado ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-[#00a884] hover:bg-[#008f6f] text-white'}`}>
                    {whatsappConectado ? 'Desconectar Bot' : 'Conectar ao WhatsApp'}
                  </button>
                </div>
                {whatsappConectado && (
                  <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-sm font-medium text-green-800">
                    <Check size={18} className="text-green-600 shrink-0" /> O Bot do WhatsApp e o Banco SQLite estão ativos e sincronizados em tempo real.
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#4b5e28]/10 text-[#4b5e28] rounded-xl flex items-center justify-center shrink-0"><Key size={24} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">Chave de API (REST Token)</h3>
                    <p className="text-sm text-slate-500">Token de segurança para comunicação entre sistemas internos da Prefeitura.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input type="text" readOnly value={mostrarToken ? apiToken : "••••••••••••••••••••••••••••••••"} className="flex-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-700 focus:outline-none" />
                  <button onClick={() => setMostrarToken(!mostrarToken)} className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                    {mostrarToken ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button onClick={gerarNovoToken} className="w-full sm:w-auto px-5 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors shadow-md">
                    Gerar Novo Token
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* ABA 3: NOTIFICAÇÕES */}
          {/* ===================================================== */}
          {abaAtiva === 'Notificações' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 mb-1">Preferências de Alertas</h3>
                <p className="text-sm text-slate-500">Controle os eventos que disparam notificações no painel.</p>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="pr-8">
                    <p className="font-bold text-slate-800 text-sm">Novos Chamados Registrados</p>
                    <p className="text-sm text-slate-500 mt-1">Notificar quando um cidadão abrir um novo chamado no WhatsApp.</p>
                  </div>
                  <ToggleSwitch checked={notifs.novosChamados} onChange={() => setNotifs({ ...notifs, novosChamados: !notifs.novosChamados })} />
                </div>
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="pr-8">
                    <p className="font-bold text-slate-800 text-sm">Alertas do Sistema</p>
                    <p className="text-sm text-slate-500 mt-1">Avisos sobre novas solicitações de acesso de servidores.</p>
                  </div>
                  <ToggleSwitch checked={notifs.atualizacoesSistema} onChange={() => setNotifs({ ...notifs, atualizacoesSistema: !notifs.atualizacoesSistema })} />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* ABA 4: SEGURANÇA */}
          {/* ===================================================== */}
          {abaAtiva === 'Segurança' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-start justify-between hover:bg-slate-50 transition-colors">
                  <div className="pr-8">
                    <h3 className="font-bold text-slate-800 mb-1">Autenticação de Dois Fatores (2FA)</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Aumente a segurança da conta exigindo confirmação adicional no login.
                    </p>
                  </div>
                  <ToggleSwitch checked={doisFatores} onChange={() => setDoisFatores(!doisFatores)} />
                </div>
                <div className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                  <div className="pr-8">
                    <h3 className="font-bold text-slate-800 mb-1">Alertas de Novo Dispositivo</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Receber aviso se a conta for acessada em um novo computador.</p>
                  </div>
                  <ToggleSwitch checked={alertasNovos} onChange={() => setAlertasNovos(!alertasNovos)} />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Monitor size={18} className="text-slate-600" />
                    <h3 className="font-bold text-slate-800">Sessões Ativas</h3>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {sessoes.map((sessao) => (
                    <div key={sessao.id} className="p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <Monitor size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-800">{sessao.dispositivo}</h4>
                            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-green-700 bg-green-100 rounded-full uppercase">Sessão Atual</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {sessao.local}</span>
                            <span>&bull; IP: {sessao.ip}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL PARA ADICIONAR NOVO SERVIDOR DIRETO PELO PAINEL */}
      {modalNovoServidor && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Cadastrar Novo Servidor</h3>
            <p className="text-xs text-slate-500 mb-4">O servidor criado por aqui já entra com status Aprovado.</p>
            <form onSubmit={handleCriarServidorDireto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={novoServidor.nome}
                  onChange={e => setNovoServidor({ ...novoServidor, nome: e.target.value })}
                  placeholder="Ex: Marcos Oliveira"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Matrícula</label>
                  <input
                    type="text"
                    required
                    value={novoServidor.matricula}
                    onChange={e => setNovoServidor({ ...novoServidor, matricula: e.target.value })}
                    placeholder="Ex: 202655"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Permissão</label>
                  <select
                    value={novoServidor.cargo}
                    onChange={e => setNovoServidor({ ...novoServidor, cargo: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="Servidor Municipal">Servidor Municipal</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail Institucional</label>
                <input
                  type="text"
                  required
                  value={novoServidor.email}
                  onChange={e => setNovoServidor({ ...novoServidor, email: e.target.value })}
                  placeholder="marcos@sertao.rs.gov.br"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Senha de Acesso</label>
                <input
                  type="text"
                  required
                  value={novoServidor.senha}
                  onChange={e => setNovoServidor({ ...novoServidor, senha: e.target.value })}
                  placeholder="Ex: Sertao2026"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoServidor(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4b5e28] hover:bg-[#3a4920] text-white rounded-lg text-sm font-bold"
                >
                  Salvar e Aprovar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE DE GUARDAR */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-between items-center px-12 z-20">
        <div>
          {sucesso && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 text-green-700 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 size={18} />
              As suas configurações foram salvas com sucesso!
            </div>
          )}
        </div>

        <button
          onClick={handleSalvarAlteracoes}
          disabled={salvando}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_4px_12px_rgba(75,94,40,0.2)] ${
            salvando
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-[#4b5e28] hover:bg-[#3a4920] text-white hover:shadow-lg'
          }`}
        >
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

    </div>
  );
}