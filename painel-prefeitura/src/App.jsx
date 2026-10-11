import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Chamados from './components/Chamados';
import NovoChamado from './components/NovoChamado';
import Relatorios from './components/Relatorios';
import Cidadaos from './components/Cidadaos';
import Kanban from './components/Kanban';
import Secretarias from './components/Secretarias';
import Configuracoes from './components/Configuracoes';
import HistoricoNotificacoes from './components/HistoricoNotificacoes';
import Login from './components/Login';
import Cadastro from './components/Cadastro'; 
import EsqueceuSenha from './components/EsqueceuSenha'; // IMPORTAÇÃO DO NOVO ECRÃ
import ChamadoDetalhes from './components/ChamadoDetalhes';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Agora pode ser: 'login', 'cadastro' ou 'esqueceu'
  const [authView, setAuthView] = useState('login'); 
  
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedChamado, setSelectedChamado] = useState(null);

  // ==========================================
  // GESTÃO DAS TELAS DE AUTENTICAÇÃO
  // ==========================================
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login 
          onLogin={() => setIsAuthenticated(true)} 
          onGoToCadastro={() => setAuthView('cadastro')} 
          onGoToEsqueceuSenha={() => setAuthView('esqueceu')} 
        />
      );
    } else if (authView === 'cadastro') {
      return (
        <Cadastro 
          onLogin={() => setIsAuthenticated(true)} 
          onGoToLogin={() => setAuthView('login')} 
        />
      );
    } else if (authView === 'esqueceu') {
      return (
        <EsqueceuSenha 
          onGoToLogin={() => setAuthView('login')} 
        />
      );
    }
  }

  // ==========================================
  // GESTÃO DO SISTEMA INTERNO
  // ==========================================
  const getHeaderInfo = () => {
    switch(activePage) {
      case 'dashboard': return { title: 'Dashboard Administrativo', subtitle: '28 de julho de 2026 — Prefeitura Municipal' };
      case 'chamados': return { title: 'Gestão de Chamados', subtitle: 'Lista de todas as solicitações registadas no sistema' };
      case 'novo': return { title: 'Novo Chamado', subtitle: 'Abertura de nova solicitação manual' };
      case 'kanban': return { title: 'Fluxo Kanban', subtitle: 'Acompanhamento visual e ágil das solicitações' };
      case 'relatorios': return { title: 'Relatórios e Estatísticas', subtitle: 'Geração e exportação de dados consolidados' };
      case 'cidadaos': return { title: 'Gestão de Cidadãos', subtitle: 'Base de munícipes registados na plataforma' };
      case 'secretarias': return { title: 'Secretarias e Departamentos', subtitle: 'Gestão das entidades responsáveis pelo atendimento' };
      case 'configuracoes': return { title: 'Configurações do Sistema', subtitle: 'Parâmetros globais, APIs e integrações externas' };
      case 'historico_notificacoes': return { title: 'Central de Notificações', subtitle: 'Registo completo de todos os eventos e alertas do sistema' };
      case 'detalhes_chamado': return { title: 'Detalhes da Ocorrência', subtitle: 'Análise aprofundada da solicitação do cidadão' };
      default: return { title: 'Prefeitura Municipal', subtitle: 'Sertão Integrado' };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        <Header 
          title={title} 
          subtitle={subtitle} 
          onNew={() => setActivePage('novo')} 
          onViewAllNotifs={() => setActivePage('historico_notificacoes')}
        />

        {activePage === 'dashboard' && <Dashboard setActivePage={setActivePage} setSelectedChamado={setSelectedChamado} />}
        {activePage === 'chamados' && <Chamados setActivePage={setActivePage} setSelectedChamado={setSelectedChamado} />}
        {activePage === 'novo' && <NovoChamado setActivePage={setActivePage} />}
        {activePage === 'kanban' && <Kanban setActivePage={setActivePage} setSelectedChamado={setSelectedChamado} />}
        {activePage === 'detalhes_chamado' && <ChamadoDetalhes chamado={selectedChamado} setActivePage={setActivePage} />}
        {activePage === 'relatorios' && <Relatorios />}
        {activePage === 'cidadaos' && <Cidadaos />}
        {activePage === 'secretarias' && <Secretarias />}
        {activePage === 'configuracoes' && <Configuracoes />}
        {activePage === 'historico_notificacoes' && <HistoricoNotificacoes />}
        
      </main>
    </div>
  );
}