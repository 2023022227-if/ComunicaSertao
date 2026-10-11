import React, { useState } from 'react';
import { EyeOff, Eye, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Login({ onLogin, onGoToCadastro, onGoToEsqueceuSenha }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(''); 

  // =======================================================================
  // LÓGICA DE AUTOCOMPLETAR E-MAIL INSTITUCIONAL
  // =======================================================================
  const dominioOficial = "@sertao.rs.gov.br";
  let sugestaoEmail = "";

  if (email.length > 0 && !email.endsWith(dominioOficial)) {
    if (!email.includes("@")) {
      sugestaoEmail = dominioOficial;
    } else {
      const partes = email.split("@");
      const dominioDigitado = partes[1];
      const dominioEsperado = "sertao.rs.gov.br";
      if (dominioEsperado.startsWith(dominioDigitado)) {
        sugestaoEmail = dominioEsperado.substring(dominioDigitado.length);
      }
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && sugestaoEmail) {
      e.preventDefault();
      setEmail(email + sugestaoEmail);
      if (erro) setErro('');
    }
  };

  // =======================================================================
  // VALIDAÇÕES DE SEGURANÇA NO LOGIN
  // =======================================================================
  const handleEntrar = (e) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro("Por favor, preencha o e-mail e a senha para entrar.");
      return;
    }

    if (!email.toLowerCase().endsWith(dominioOficial)) {
      setErro(`Acesso restrito a servidores. Utilize o seu e-mail corporativo (${dominioOficial}).`);
      return;
    }

    // Verificação de Senha Forte no Login
    const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexSenhaForte.test(senha)) {
      setErro("Credenciais inválidas. A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números.");
      return;
    }

    onLogin();
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-8 sm:px-16 lg:px-24 xl:px-32 z-10 bg-white">
        <div className="flex-1 flex flex-col justify-center py-12">
          
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <ShieldCheck size={18} className="text-[#4b5e28]" />
              <p className="text-sm font-medium">Painel do Servidor</p>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-10">Acesse sua conta</h1>

            <form onSubmit={handleEntrar} className="space-y-6">
              
              {/* CAMPO DE E-MAIL COM AUTOCOMPLETAR */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-mail Institucional</label>
                <div className={`relative w-full bg-white border ${erro && (!email || !email.includes(dominioOficial)) ? 'border-red-500' : 'border-slate-300'} rounded-lg focus-within:ring-2 focus-within:ring-[#4b5e28] focus-within:border-transparent transition-all overflow-hidden`}>
                  <div className="absolute inset-0 px-4 py-3 text-sm pointer-events-none flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-transparent">{email}</span>
                    {sugestaoEmail && (
                      <span className="text-slate-400 flex items-center">
                        {sugestaoEmail}
                        <span className="ml-2 text-[9px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded shadow-sm">Tab</span>
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value.replace(/\s/g, '')); if (erro) setErro(''); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    placeholder="servidor@sertao.rs.gov.br" 
                    className="w-full px-4 py-3 bg-transparent text-sm focus:outline-none relative z-10 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* CAMPO DE SENHA COM VALIDAÇÃO FORTE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
                <div className="relative">
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); if (erro) setErro(''); }}
                    placeholder="Digite sua senha" 
                    className={`w-full px-4 py-3 bg-white border ${erro && senha.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#4b5e28]'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-400 pr-12`}
                  />
                  <button 
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {mostrarSenha ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {/* Dica de Senha Segura (Idêntica à do Cadastro) */}
                <p className="text-[11px] text-slate-500 mt-1.5 ml-1 font-medium">Mínimo de 8 caracteres (maiúsculas, minúsculas e números).</p>
              </div>

              {/* MENSAGEM DE ERRO GERAL */}
              {erro && (
                 <p className="text-sm text-red-500 font-medium flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertCircle size={18} className="shrink-0" /> <span>{erro}</span>
                 </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4b5e28] focus:ring-[#4b5e28] accent-[#4b5e28] cursor-pointer" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Manter conectado</span>
                </label>
                
                <button 
                  type="button" 
                  onClick={onGoToEsqueceuSenha}
                  className="text-sm font-semibold text-[#4b5e28] hover:text-[#3a4920] hover:underline transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 px-4 bg-[#4b5e28] hover:bg-[#3a4920] text-white font-medium rounded-lg transition-all shadow-[0_8px_20px_rgba(75,94,40,0.25)] hover:shadow-[0_4px_12px_rgba(75,94,40,0.2)] mt-4"
              >
                Entrar no Painel
              </button>

              <div className="text-center mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 font-medium">
                  É um novo servidor? <button type="button" onClick={onGoToCadastro} className="text-[#4b5e28] font-semibold hover:underline cursor-pointer">Solicitar Acesso</button>
                </p>
              </div>

            </form>
          </div>
        </div>

        <div className="pb-8">
          <p className="text-xs text-slate-400 font-medium">© 2026. Todos os direitos reservados. Prefeitura de Sertão.</p>
        </div>
      </div>

      {/* Lado Direito - Ilustração */}
      <div className="hidden lg:flex w-1/2 bg-[#16161b] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-[350px] -right-[350px] w-[800px] h-[800px] rounded-full border border-white/[0.03] pointer-events-none"></div>
        <div className="absolute -top-[450px] -right-[450px] w-[1100px] h-[1100px] rounded-full border border-white/[0.03] pointer-events-none"></div>
        <div className="absolute -top-[550px] -right-[550px] w-[1400px] h-[1400px] rounded-full border border-white/[0.03] pointer-events-none"></div>
        <div className="absolute -top-[650px] -right-[650px] w-[1700px] h-[1700px] rounded-full border border-white/[0.03] pointer-events-none"></div>

        <div className="absolute bottom-[20%] -left-[150px] w-[500px] h-[500px] bg-[#dcfce7] rounded-full blur-[150px] opacity-[0.08] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#4b5e28] rounded-full blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 max-w-lg w-full">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#6a8738]"></div>
              <span className="text-[#6a8738] text-xs font-bold tracking-widest uppercase">Comunica Sertão</span>
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Canal interativo e direto com a prefeitura de <br/>
              <span className="text-[#6a8738]">Sertão - RS</span>
            </h2>
          </div>

          <div className="w-full bg-[#f8fafc] rounded-2xl shadow-2xl p-5 flex gap-5 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500 border border-slate-200/50">
            <div className="w-14 flex flex-col items-center gap-4 py-2">
              <div className="w-8 h-8 bg-[#4b5e28] rounded-lg mb-4"></div>
              <div className="w-10 h-6 bg-[#dcfce7] rounded-md"></div>
              <div className="w-10 h-2 bg-slate-200 rounded-full"></div>
              <div className="w-10 h-2 bg-slate-200 rounded-full"></div>
              <div className="w-10 h-2 bg-slate-200 rounded-full"></div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div className="flex flex-col gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full"></div>
                  <div className="w-32 h-3 bg-slate-800 rounded-full"></div>
                </div>
                <div className="w-8 h-8 bg-[#dcfce7] rounded-full border border-white shadow-sm"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3"></div>
                  <div className="text-lg font-bold text-slate-800 leading-none mb-2">156</div>
                  <div className="w-16 h-1.5 bg-[#4b5e28] rounded-full opacity-60"></div>
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3"></div>
                  <div className="text-lg font-bold text-slate-800 leading-none mb-2">98</div>
                  <div className="w-14 h-1.5 bg-[#4b5e28] rounded-full opacity-60"></div>
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-3"></div>
                  <div className="text-lg font-bold text-slate-800 leading-none mb-2">5 dias</div>
                  <div className="w-12 h-1.5 bg-[#4b5e28] rounded-full opacity-60"></div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-sm flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-16 h-2 bg-slate-800 rounded-full"></div>
                  <div className="w-24 h-3 bg-slate-100 rounded-full"></div>
                </div>
                
                <div className="flex items-end justify-between gap-1 h-24">
                  <div className="w-full bg-[#cbd5e1] rounded-t-sm h-[20%] transition-all hover:h-[25%]"></div>
                  <div className="w-full bg-[#cbd5e1] rounded-t-sm h-[35%] transition-all hover:h-[40%]"></div>
                  <div className="w-full bg-[#cbd5e1] rounded-t-sm h-[25%] transition-all hover:h-[30%]"></div>
                  <div className="w-full bg-[#a3b18a] rounded-t-sm h-[45%] transition-all hover:h-[50%]"></div>
                  <div className="w-full bg-[#a3b18a] rounded-t-sm h-[30%] transition-all hover:h-[35%]"></div>
                  <div className="w-full bg-[#a3b18a] rounded-t-sm h-[60%] transition-all hover:h-[65%]"></div>
                  <div className="w-full bg-[#a3b18a] rounded-t-sm h-[50%] transition-all hover:h-[55%]"></div>
                  <div className="w-full bg-[#4b5e28] rounded-t-sm h-[70%] transition-all hover:h-[75%]"></div>
                  <div className="w-full bg-[#4b5e28] rounded-t-sm h-[85%] transition-all hover:h-[90%]"></div>
                  <div className="w-full bg-[#4b5e28] rounded-t-sm h-[65%] transition-all hover:h-[70%]"></div>
                  <div className="w-full bg-[#2d3a17] rounded-t-sm h-[100%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button title="Ajuda e Suporte" className="absolute bottom-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300 text-xs font-semibold z-20 cursor-pointer">?</button>
      </div>
    </div>
  );
}