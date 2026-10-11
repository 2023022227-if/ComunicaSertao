import React, { useState } from 'react';
import { User, Link as LinkIcon, Bell, ShieldCheck, Monitor, Smartphone, LogOut, Clock, MapPin, Check, Camera, MessageSquare, Key, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState('Perfil'); // Inicia no Perfil para testar a nova função

  // ==========================================
  // ESTADOS: SALVAR ALTERAÇÕES
  // ==========================================
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSalvarAlteracoes = () => {
    setSalvando(true);
    setSucesso(false);
    
    // Simula o tempo de envio para o Backend (1 segundo)
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      
      // A mensagem de sucesso desaparece após 3 segundos
      setTimeout(() => {
        setSucesso(false);
      }, 3000);
    }, 1000);
  };

  // ==========================================
  // ESTADOS: PERFIL DO ADMINISTRADOR & SENHA
  // ==========================================
  const [perfil, setPerfil] = useState({
    nome: 'Administrador do Sistema',
    email: 'admin@sertao.rs.gov.br',
    cargo: 'Gestor de Atendimento',
    departamento: 'Secretaria de Administração'
  });

  const [senhas, setSenhas] = useState({
    atual: '',
    nova: '',
    confirmacao: ''
  });

  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmacao: false
  });

  // ==========================================
  // ESTADOS: INTEGRAÇÕES E API
  // ==========================================
  const [whatsappConectado, setWhatsappConectado] = useState(true);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [apiToken, setApiToken] = useState('sk_live_sertao_9876543210abcdef');

  const gerarNovoToken = () => {
    if(window.confirm("Atenção: Ao gerar um novo token, todas as integrações atuais que usam a chave antiga pararão de funcionar imediatamente. Deseja continuar?")) {
      const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let novoHash = '';
      for (let i = 0; i < 16; i++) {
        novoHash += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      setApiToken(`sk_live_sertao_${novoHash}`);
      setMostrarToken(true);
    }
  };

  // ==========================================
  // ESTADOS: NOTIFICAÇÕES
  // ==========================================
  const [notifs, setNotifs] = useState({
    novosChamados: true,
    atualizacoesSistema: true,
    relatoriosSemanais: false,
    alertasWhatsapp: true
  });

  // ==========================================
  // ESTADOS E FUNÇÕES: SEGURANÇA
  // ==========================================
  const [doisFatores, setDoisFatores] = useState(false);
  const [alertasNovos, setAlertasNovos] = useState(true);

  const [sessoes, setSessoes] = useState([
    { id: 1, dispositivo: 'Windows 11 • Chrome', local: 'Getúlio Vargas, RS', ip: '177.100.200.55', atual: true, tipo: 'desktop' },
    { id: 2, dispositivo: 'Apple iPhone 14 • Safari', local: 'Passo Fundo, RS', tempo: 'Último acesso há 3 dias', atual: false, tipo: 'mobile' }
  ]);

  const revogarSessao = (id) => setSessoes(prev => prev.filter(s => s.id !== id));
  const encerrarOutrasSessoes = () => {
    if(window.confirm("Tem certeza que deseja encerrar a sua sessão em todos os outros dispositivos?")) {
      setSessoes(prev => prev.filter(s => s.atual === true));
    }
  };

  const historicoAcesso = [
    { id: 1, data: '24 Set 2026, 08:30', acao: 'Login com Sucesso', status: 'sucesso', ip: '177.100.200.55', local: 'Getúlio Vargas, RS' },
    { id: 2, data: '23 Set 2026, 17:45', acao: 'Sessão Terminada', status: 'normal', ip: '177.100.200.55', local: 'Getúlio Vargas, RS' },
    { id: 3, data: '23 Set 2026, 08:15', acao: 'Login com Sucesso', status: 'sucesso', ip: '177.100.200.55', local: 'Getúlio Vargas, RS' },
    { id: 4, data: '21 Set 2026, 20:10', acao: 'Tentativa Falhada', status: 'erro', ip: '189.50.33.10', local: 'Desconhecido' },
  ];

  // Componente de Botão Liga/Desliga reutilizável
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
            <button onClick={() => setAbaAtiva('Perfil')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Perfil' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              <User size={18} /> Perfil do Administrador
            </button>
            <button onClick={() => setAbaAtiva('Integrações')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Integrações' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              <LinkIcon size={18} /> Integrações e API
            </button>
            <button onClick={() => setAbaAtiva('Notificações')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Notificações' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              <Bell size={18} /> Notificações
            </button>
            <button onClick={() => setAbaAtiva('Segurança')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'Segurança' ? 'bg-white border border-[#4b5e28]/20 text-[#4b5e28] shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              <ShieldCheck size={18} /> Segurança
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ======================================================= */}
        <div className="flex-1 space-y-6 relative z-10">
          
          {/* ===================================================== */}
          {/* ABA 1: PERFIL DO ADMINISTRADOR */}
          {/* ===================================================== */}
          {abaAtiva === 'Perfil' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Informações Pessoais */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-6 bg-slate-50/50">
                   <div className="relative">
                      <div className="w-24 h-24 bg-[#4b5e28]/10 text-[#4b5e28] rounded-full flex items-center justify-center text-3xl font-bold border border-[#4b5e28]/20">
                         {perfil.nome.charAt(0)}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-sm transition-colors cursor-pointer">
                        <Camera size={14}/>
                      </button>
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-slate-800">{perfil.nome}</h3>
                      <p className="text-slate-500 font-medium">{perfil.cargo}</p>
                   </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Nome Completo</label>
                     <input type="text" value={perfil.nome} onChange={e=>setPerfil({...perfil, nome: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">E-mail Institucional</label>
                     <input type="email" value={perfil.email} onChange={e=>setPerfil({...perfil, email: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Cargo</label>
                     <input type="text" value={perfil.cargo} onChange={e=>setPerfil({...perfil, cargo: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Departamento / Secretaria</label>
                     <input type="text" value={perfil.departamento} onChange={e=>setPerfil({...perfil, departamento: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none" />
                   </div>
                </div>
              </div>

              {/* Alterar Senha */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                  <Key size={18} className="text-slate-600" />
                  <h3 className="font-bold text-slate-800">Alterar Senha</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Senha Atual */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Senha Atual</label>
                    <div className="relative">
                      <input 
                        type={mostrarSenhas.atual ? "text" : "password"} 
                        value={senhas.atual} 
                        onChange={e=>setSenhas({...senhas, atual: e.target.value})} 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none pr-10" 
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setMostrarSenhas({...mostrarSenhas, atual: !mostrarSenhas.atual})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {mostrarSenhas.atual ? <Eye size={18}/> : <EyeOff size={18}/>}
                      </button>
                    </div>
                  </div>

                  {/* Nova Senha */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nova Senha</label>
                    <div className="relative">
                      <input 
                        type={mostrarSenhas.nova ? "text" : "password"} 
                        value={senhas.nova} 
                        onChange={e=>setSenhas({...senhas, nova: e.target.value})} 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4b5e28] focus:outline-none pr-10" 
                        placeholder="Nova senha forte"
                      />
                      <button type="button" onClick={() => setMostrarSenhas({...mostrarSenhas, nova: !mostrarSenhas.nova})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {mostrarSenhas.nova ? <Eye size={18}/> : <EyeOff size={18}/>}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input 
                        type={mostrarSenhas.confirmacao ? "text" : "password"} 
                        value={senhas.confirmacao} 
                        onChange={e=>setSenhas({...senhas, confirmacao: e.target.value})} 
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none pr-10 ${senhas.confirmacao && senhas.nova !== senhas.confirmacao ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#4b5e28]'}`} 
                        placeholder="Repita a nova senha"
                      />
                      <button type="button" onClick={() => setMostrarSenhas({...mostrarSenhas, confirmacao: !mostrarSenhas.confirmacao})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {mostrarSenhas.confirmacao ? <Eye size={18}/> : <EyeOff size={18}/>}
                      </button>
                    </div>
                    {senhas.confirmacao && senhas.nova !== senhas.confirmacao && (
                      <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-bold">As senhas não coincidem.</p>
                    )}
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
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><MessageSquare size={24}/></div>
                      <div>
                         <h3 className="font-bold text-slate-800">WhatsApp Business API</h3>
                         <p className="text-sm text-slate-500">Canal interativo Comunica Sertão para envio de atualizações de chamados aos cidadãos.</p>
                      </div>
                   </div>
                   <button onClick={()=>setWhatsappConectado(!whatsappConectado)} className={`px-5 py-2.5 rounded-lg text-sm font-bold shrink-0 transition-colors ${whatsappConectado ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-[#00a884] hover:bg-[#008f6f] text-white'}`}>
                      {whatsappConectado ? 'Desconectar API' : 'Conectar ao WhatsApp'}
                   </button>
                </div>
                {whatsappConectado && (
                  <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-sm font-medium text-green-800">
                     <Check size={18} className="text-green-600 shrink-0"/> A API do WhatsApp está ativa e a processar mensagens em tempo real.
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#4b5e28]/10 text-[#4b5e28] rounded-xl flex items-center justify-center shrink-0"><Key size={24}/></div>
                    <div>
                       <h3 className="font-bold text-slate-800">Chave de API (REST Token)</h3>
                       <p className="text-sm text-slate-500">Token de segurança para integrações de sistemas externos da Prefeitura.</p>
                    </div>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input type="text" readOnly value={mostrarToken ? apiToken : "••••••••••••••••••••••••••••••••"} className="flex-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-700 focus:outline-none" />
                    <button onClick={()=>setMostrarToken(!mostrarToken)} className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
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
                 <p className="text-sm text-slate-500">Controle exatamente os eventos que disparam notificações para a sua conta.</p>
              </div>
              <div className="divide-y divide-slate-100">
                 <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="pr-8">
                     <p className="font-bold text-slate-800 text-sm">Novos Chamados Registrados</p>
                     <p className="text-sm text-slate-500 mt-1">Notificar-me quando um cidadão abrir um novo chamado no sistema.</p>
                   </div>
                   <ToggleSwitch checked={notifs.novosChamados} onChange={() => setNotifs({...notifs, novosChamados: !notifs.novosChamados})} />
                 </div>
                 <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="pr-8">
                     <p className="font-bold text-slate-800 text-sm">Alertas do Sistema</p>
                     <p className="text-sm text-slate-500 mt-1">Avisos sobre manutenções, erros de servidor e novas funcionalidades.</p>
                   </div>
                   <ToggleSwitch checked={notifs.atualizacoesSistema} onChange={() => setNotifs({...notifs, atualizacoesSistema: !notifs.atualizacoesSistema})} />
                 </div>
                 <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="pr-8">
                     <p className="font-bold text-slate-800 text-sm">Relatórios Semanais</p>
                     <p className="text-sm text-slate-500 mt-1">Receber um resumo de produtividade e chamados resolvidos toda segunda-feira.</p>
                   </div>
                   <ToggleSwitch checked={notifs.relatoriosSemanais} onChange={() => setNotifs({...notifs, relatoriosSemanais: !notifs.relatoriosSemanais})} />
                 </div>
                 <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="pr-8">
                     <p className="font-bold text-slate-800 text-sm">Alertas Urgentes via WhatsApp</p>
                     <p className="text-sm text-slate-500 mt-1">Receber notificações prioritárias diretamente no telemóvel.</p>
                   </div>
                   <ToggleSwitch checked={notifs.alertasWhatsapp} onChange={() => setNotifs({...notifs, alertasWhatsapp: !notifs.alertasWhatsapp})} />
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
                    <p className="text-sm text-slate-500 leading-relaxed mb-3">
                      Aumente a segurança da sua conta exigindo um código gerado no seu telemóvel em cada início de sessão.
                    </p>
                    <button className="text-sm font-semibold text-[#4b5e28] hover:underline">Configurar aplicação de autenticação &rarr;</button>
                  </div>
                  <ToggleSwitch checked={doisFatores} onChange={() => setDoisFatores(!doisFatores)} />
                </div>
                <div className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                  <div className="pr-8">
                    <h3 className="font-bold text-slate-800 mb-1">Alertas de Novo Dispositivo</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Receba um e-mail se a sua conta for acedida a partir de um navegador não reconhecido.</p>
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
                  {sessoes.length > 1 && (
                    <button onClick={encerrarOutrasSessoes} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                      <LogOut size={16} /> Encerrar todas as outras sessões
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100">
                  {sessoes.map((sessao) => (
                    <div key={sessao.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          {sessao.tipo === 'desktop' ? <Monitor size={20} /> : <Smartphone size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-800">{sessao.dispositivo}</h4>
                            {sessao.atual && <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-green-700 bg-green-100 rounded-full uppercase">Sessão Atual</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><MapPin size={12}/> {sessao.local}</span>
                            {sessao.ip && <span>&bull; IP: {sessao.ip}</span>}
                            {sessao.tempo && <span className="flex items-center gap-1">&bull; <Clock size={12}/> {sessao.tempo}</span>}
                          </div>
                        </div>
                      </div>
                      {!sessao.atual && (
                        <button onClick={() => revogarSessao(sessao.id)} className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
                          Revogar
                        </button>
                      )}
                    </div>
                  ))}
                  {sessoes.length === 1 && (
                    <div className="p-6 text-center text-sm text-slate-500">Não existem outras sessões ativas neste momento.</div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                  <Clock size={18} className="text-slate-600" />
                  <h3 className="font-bold text-slate-800">Histórico de Acesso (Últimos 7 dias)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-white border-b border-slate-100">
                        <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data e Hora</th>
                        <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ação</th>
                        <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço IP</th>
                        <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Localização</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {historicoAcesso.map((item) => (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 text-slate-500 font-medium">{item.data}</td>
                          <td className="py-4 px-6 font-bold">
                            {item.status === 'sucesso' && <span className="text-green-600">{item.acao}</span>}
                            {item.status === 'erro' && <span className="text-red-600">{item.acao}</span>}
                            {item.status === 'normal' && <span className="text-slate-700">{item.acao}</span>}
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-mono text-xs">{item.ip}</td>
                          <td className="py-4 px-6">
                            {item.status === 'erro' ? <span className="text-red-600 font-medium">{item.local}</span> : <span className="text-slate-500">{item.local}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ======================================================= */}
      {/* BOTÃO FLUTUANTE DE GUARDAR E FEEDBACK VISUAL */}
      {/* ======================================================= */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-between items-center px-12 z-20">
        
        <div>
          {sucesso && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 text-green-700 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 size={18} />
              As suas configurações foram guardadas com sucesso!
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
          {salvando ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando as alterações...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </button>
      </div>

    </div>
  );
}