import React, { useState } from 'react';
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import brasaoSertao from '../assets/brasao-sertao.jpg';

export default function EsqueceuSenha({ onVoltarLogin, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  const voltarParaLogin = onVoltarLogin || onGoToLogin;

  const handleRecuperar = (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim()) {
      setErro("Por favor, informe o seu e-mail.");
      return;
    }

    const regexEmailCompleto = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regexEmailCompleto.test(email.trim())) {
      setErro("Informe um e-mail válido no formato completo (exemplo: nome@dominio.com).");
      return;
    }

    setEnviado(true);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">

      {/* ========================================================= */}
      {/* LADO ESQUERDO - RECUPERAÇÃO EM AZUL (#2563eb / #1d4ed8)   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-8 sm:px-16 lg:px-24 xl:px-32 z-10 bg-white">
        <div className="flex-1 flex flex-col justify-center py-12">

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
              <KeyRound size={18} className="text-[#2563eb]" />
              <p className="text-sm font-medium">Recuperação de Acesso</p>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Esqueceu sua senha?</h1>
            <p className="text-sm text-slate-500 mb-8">
              Informe o seu e-mail abaixo para receber as instruções de redefinição de senha.
            </p>

            {enviado ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4">
                <CheckCircle2 size={40} className="text-[#2563eb] mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Instruções Enviadas!</h3>
                <p className="text-sm text-slate-600">
                  Enviamos um link de recuperação para <strong>{email}</strong>. Verifique a sua caixa de entrada.
                </p>
                <button
                  type="button"
                  onClick={voltarParaLogin}
                  className="w-full py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-all cursor-pointer"
                >
                  Retornar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecuperar} className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative w-full bg-white border ${erro ? 'border-red-500' : 'border-slate-300'} rounded-lg focus-within:ring-2 focus-within:ring-[#2563eb] focus-within:border-transparent transition-all overflow-hidden`}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value.replace(/\s/g, '')); if (erro) setErro(''); }}
                      autoComplete="off"
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 bg-transparent text-sm focus:outline-none relative z-10 text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {erro && (
                  <p className="text-sm text-red-500 font-medium flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertCircle size={18} className="shrink-0" /> <span>{erro}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] cursor-pointer"
                >
                  Enviar Link de Recuperação
                </button>

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