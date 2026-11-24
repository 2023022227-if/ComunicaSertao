import React, { useState } from 'react';
import { EyeOff, Eye, AlertCircle, CheckCircle2, UserPlus, ArrowLeft } from 'lucide-react';
import brasaoSertao from '../assets/brasao-sertao.jpg';

const STORAGE_USUARIOS_KEY = 'comunica_sertao_usuarios';

const formatarTelefone = (valor) => {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
};

const salvarUsuarioNoStorage = (novoUsuario) => {
  try {
    const salvo = localStorage.getItem(STORAGE_USUARIOS_KEY);
    const lista = salvo ? JSON.parse(salvo) : [];
    const base = Array.isArray(lista) ? lista : [];
    const emailNorm = String(novoUsuario.email || '').trim().toLowerCase();
    const filtrados = base.filter(
      (u) => String(u.email || '').trim().toLowerCase() !== emailNorm
    );
    localStorage.setItem(
      STORAGE_USUARIOS_KEY,
      JSON.stringify([...filtrados, novoUsuario])
    );
  } catch {
    // Ignora erro de armazenamento local indisponível
  }
};

export default function Cadastro({
  onVoltarLogin,
  onGoToLogin,
  onRegistrarUsuario,
  secretarias = []
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const voltarParaLogin = onVoltarLogin || onGoToLogin;

  const opcoesSecretarias =
    secretarias.length > 0
      ? secretarias.map((s) => s.nome)
      : [
          'Secretaria de Obras e Viação',
          'Secretaria de Saúde',
          'Secretaria de Água e Saneamento',
          'Secretaria de Administração',
          'Secretaria de Meio Ambiente',
          'Secretaria de Educação'
        ];

  const handleCadastrar = (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !email.trim() || !telefone.trim() || !cargo.trim() || !departamento || !senha) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const regexEmailCompleto = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regexEmailCompleto.test(email.trim())) {
      setErro("Informe um e-mail válido no formato completo (exemplo: nome@dominio.com).");
      return;
    }

    const digitosTelefone = telefone.replace(/\D/g, '');
    if (digitosTelefone.length < 10 || digitosTelefone.length > 11) {
      setErro("Informe um telefone válido com DDD (10 ou 11 dígitos).");
      return;
    }

    const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexSenhaForte.test(senha)) {
      setErro("A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números.");
      return;
    }

    const novoUsuario = {
      nome: nome.trim(),
      email: email.trim(),
      telefone,
      cargo: cargo.trim(),
      departamento,
      foto: null
    };

    salvarUsuarioNoStorage(novoUsuario);

    if (typeof onRegistrarUsuario === 'function') {
      onRegistrarUsuario(novoUsuario);
    }

    setSucesso(true);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">

      {/* ========================================================= */}
      {/* LADO ESQUERDO - FORMULÁRIO EM AZUL (#2563eb / #1d4ed8)    */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-8 sm:px-16 lg:px-24 xl:px-32 z-10 bg-white">
        <div className="flex-1 flex flex-col justify-center py-10">

          <div className="max-w-md w-full mx-auto">

            <button
              type="button"
              onClick={voltarParaLogin}
              className="flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] mb-6 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Voltar para o Login</span>
            </button>

            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <UserPlus size={18} className="text-[#2563eb]" />
              <p className="text-sm font-medium">Novo Servidor</p>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Solicitar Acesso</h1>

            {sucesso ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4">
                <CheckCircle2 size={40} className="text-[#2563eb] mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Solicitação Enviada!</h3>
                <p className="text-sm text-slate-600">
                  O seu pedido de acesso foi encaminhado para aprovação da administração municipal.
                </p>
                <button
                  type="button"
                  onClick={voltarParaLogin}
                  className="w-full py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-all cursor-pointer"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleCadastrar} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => { setNome(e.target.value); if (erro) setErro(''); }}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value.replace(/\s/g, '')); if (erro) setErro(''); }}
                    autoComplete="off"
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={telefone}
                    onChange={(e) => { setTelefone(formatarTelefone(e.target.value)); if (erro) setErro(''); }}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Cargo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => { setCargo(e.target.value); if (erro) setErro(''); }}
                      placeholder="Ex: Fiscal, Atendente"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Secretaria / Setor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={departamento}
                      onChange={(e) => { setDepartamento(e.target.value); if (erro) setErro(''); }}
                      className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${departamento ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                      <option value="">Selecione...</option>
                      {opcoesSecretarias.map((sec) => (
                        <option key={sec} value={sec} className="text-slate-900">
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => { setSenha(e.target.value); if (erro) setErro(''); }}
                      placeholder="Crie uma senha forte"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb] pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 p-1"
                    >
                      {mostrarSenha ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 ml-1 font-medium">Mínimo de 8 caracteres (maiúsculas, minúsculas e números).</p>
                </div>

                {erro && (
                  <p className="text-sm text-red-500 font-medium flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertCircle size={18} className="shrink-0" /> <span>{erro}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] mt-2 cursor-pointer"
                >
                  Enviar Solicitação
                </button>

                <div className="text-center mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 font-medium">
                    Já possui acesso? <button type="button" onClick={voltarParaLogin} className="text-[#2563eb] font-semibold hover:text-[#1d4ed8] hover:underline cursor-pointer">Fazer Login</button>
                  </p>
                </div>

              </form>
            )}
          </div>
        </div>

        <div className="pb-8">
          <p className="text-xs text-slate-500 font-medium text-center lg:text-left">© 2026. Todos os direitos reservados. Patrick Teló Irschlinger.</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LADO DIREITO - FUNDO AZUL SÓLIDO (#2563eb) IGUAL AO LOGIN */}
      {/* ========================================================= */}
      <div className="hidden lg:flex w-1/2 flex-col bg-[#2563eb] relative overflow-hidden px-12">
        <div className="absolute -top-[350px] -right-[350px] w-[800px] h-[800px] rounded-full border border-white/10 pointer-events-none"></div>
        <div className="absolute -top-[450px] -right-[450px] w-[1100px] h-[1100px] rounded-full border border-white/10 pointer-events-none"></div>
        <div className="absolute -top-[550px] -right-[550px] w-[1400px] h-[1400px] rounded-full border border-white/10 pointer-events-none"></div>
        <div className="absolute -top-[650px] -right-[650px] w-[1700px] h-[1700px] rounded-full border border-white/10 pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-center justify-center py-12 -mt-36 relative">
          <div className="max-w-lg w-full flex flex-col items-center justify-center text-center">

            {/* BRASÃO DE SERTÃO */}
            <div className="mb-6 w-full flex justify-center">
              <div className="w-40 h-40 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center">
                <img
                  src={brasaoSertao}
                  alt="Brasão do Município de Sertão"
                  className="h-24 w-auto max-w-[75%] object-contain mix-blend-multiply"
                />
              </div>
            </div>

            {/* COMUNICA SERTÃO CENTRALIZADO */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-0.5 bg-[#eab308] shrink-0"></div>
                <span className="text-[#f8e000] text-lg font-black tracking-[0.18em] pl-[0.18em] uppercase leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  Comunica Sertão
                </span>
                <div className="w-8 h-0.5 bg-[#eab308] shrink-0"></div>
              </div>

              <h2 className="text-5xl font-bold text-white leading-[1.18] tracking-tight">
                Canal interativo e <br />
                direto com a <br />
                prefeitura de <br />
                <span className="inline-block mt-1 text-[#f8e000] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  Sertão - RS
                </span>
              </h2>
            </div>

          </div>
        </div>

        <div className="pb-8 invisible select-none" aria-hidden="true">
          <p className="text-xs">© 2026</p>
        </div>
      </div>
    </div>
  );
}