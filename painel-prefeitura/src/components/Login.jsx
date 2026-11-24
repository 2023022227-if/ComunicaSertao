import React, { useState, useEffect } from 'react';
import { EyeOff, Eye, AlertCircle, ShieldCheck } from 'lucide-react';
import brasaoSertao from '../assets/brasao-sertao.jpg';
import { autenticarFuncionario } from '../api';

const STORAGE_USUARIOS_KEY = 'comunica_sertao_usuarios';
const REGEX_EMAIL_COMPLETO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const carregarUsuariosDoStorage = () => {
  try {
    const salvo = localStorage.getItem(STORAGE_USUARIOS_KEY);
    const parsed = salvo ? JSON.parse(salvo) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Login({
  onLogin,
  onGoToCadastro,
  onGoToEsqueceuSenha,
  usuariosCadastrados = [],
  emailInicial = ''
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState(emailInicial || '');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (emailInicial) {
      setEmail(emailInicial);
    }
  }, [emailInicial]);

  const handleEntrar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha) {
      setErro("Por favor, preencha o e-mail e a senha para entrar.");
      return;
    }

    if (!REGEX_EMAIL_COMPLETO.test(email.trim())) {
      setErro("Informe um e-mail válido no formato completo (exemplo: nome@dominio.com).");
      return;
    }

    // Tentar autenticar primeiro no Backend FastAPI / SQLite
    try {
      const respApi = await autenticarFuncionario(email.trim(), senha);
      if (respApi) {
        onLogin({
          nome: respApi.nome || 'Servidor Municipal',
          email: respApi.email || email.trim(),
          cargo: respApi.cargo || 'Administrador',
          departamento: respApi.secretaria || 'Prefeitura de Sertão'
        });
        return;
      }
    } catch (errApi) {
      // Se a API retornar erro de credenciais ou não conectar, continua para validação local
    }

    const emailNormalizado = email.trim().toLowerCase();
    const listaCombinada = [...carregarUsuariosDoStorage(), ...usuariosCadastrados];
    const cadastrado = [...listaCombinada]
      .reverse()
      .find((u) => String(u.email || '').trim().toLowerCase() === emailNormalizado);

    if (cadastrado) {
      onLogin(cadastrado);
      return;
    }

    onLogin({
      email: email.trim(),
      naoCadastrado: true
    });
  };

  const emailInvalido = Boolean(
    erro && (!email.trim() || !REGEX_EMAIL_COMPLETO.test(email.trim()))
  );
  const senhaInvalida = Boolean(
    erro && (!senha || !REGEX_SENHA_FORTE.test(senha))
  );

  return (
    <div className="flex min-h-screen bg-white font-sans">

      {/* ========================================================= */}
      {/* LADO ESQUERDO - FORMULÁRIO EM AZUL (#2563eb / #1d4ed8)    */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-8 sm:px-16 lg:px-24 xl:px-32 z-10 bg-white">
        <div className="flex-1 flex flex-col justify-center py-12">

          <div className="max-w-md w-full mx-auto">

            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <ShieldCheck size={18} className="text-[#2563eb]" />
              <p className="text-sm font-medium">Painel do Servidor</p>
            </div>

            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-10">Acesse sua conta</h1>

            <form onSubmit={handleEntrar} noValidate className="space-y-6">

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <div className={`relative w-full bg-white border ${emailInvalido ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-300 focus-within:ring-[#2563eb]'} rounded-lg focus-within:ring-2 focus-within:border-transparent transition-all overflow-hidden`}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value.replace(/\s/g, '')); if (erro) setErro(''); }}
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-transparent text-sm focus:outline-none relative z-10 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); if (erro) setErro(''); }}
                    placeholder="Digite sua senha"
                    className={`w-full px-4 py-3 bg-white border ${senhaInvalida ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#2563eb]'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-500 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
                  >
                    {mostrarSenha ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 ml-1 font-medium">Mínimo de 8 caracteres (maiúsculas, minúsculas e números).</p>
              </div>

              {/* Mensagem de Erro */}
              {erro && (
                <p className="text-sm text-red-500 font-medium flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle size={18} className="shrink-0" /> <span>{erro}</span>
                </p>
              )}

              {/* Checkbox e Esqueceu a Senha */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] accent-[#2563eb] cursor-pointer" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Manter conectado</span>
                </label>

                <button
                  type="button"
                  onClick={onGoToEsqueceuSenha}
                  className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition-colors cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão Entrar no Painel */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] mt-4 cursor-pointer"
              >
                Entrar no Painel
              </button>

              {/* Solicitar Acesso */}
              <div className="text-center mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 font-medium">
                  É um novo servidor? <button type="button" onClick={onGoToCadastro} className="text-[#2563eb] font-semibold hover:text-[#1d4ed8] hover:underline cursor-pointer">Solicitar Acesso</button>
                </p>
              </div>

            </form>
          </div>
        </div>

        <div className="pb-8">
          <p className="text-xs text-slate-500 font-medium text-center lg:text-left">© 2026. Todos os direitos reservados. Patrick Teló Irschlinger.</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LADO DIREITO - FUNDO AZUL SÓLIDO (#2563eb)                */}
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