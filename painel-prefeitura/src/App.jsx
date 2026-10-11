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
import EsqueceuSenha from './components/EsqueceuSenha';
import ChamadoDetalhes from './components/ChamadoDetalhes';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [authView, setAuthView] = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedChamado, setSelectedChamado] = useState(null);

  const handleLoginSucesso = (funcionario) => {
    setUsuarioLogado(funcionario || {
      nome: 'Administrador do Sistema',
      email: 'prefeitura@sertao.rs.gov.br',
      cargo: 'Administrador'
    });
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={handleLoginSucesso}
          onGoToCadastro={() => setAuthView('cadastro')}
          onGoToEsqueceuSenha={() => setAuthView('esqueceu')}
        />
      );
    } else if (authView === 'cadastro') {
      return (
        <Cadastro
          onLogin={handleLoginSucesso}
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

  const getHeaderInfo = () => {
    switch (activePage) {
      case 'dashboard': return { title: 'Dashboard Administrativo', subtitle: `Bem-vindo(a), ${usuarioLogado?.nome || 'Administrador'} — Prefeitura Municipal de Sertão` };
      case 'chamados': return { title: 'Gestão de Chamados', subtitle: 'Lista de todas as solicitações registradas no sistema' };
      case 'novo': return { title: 'Novo Chamado', subtitle: 'Abertura de nova solicitação manual' };
      case 'kanban': return { title: 'Fluxo Kanban', subtitle: 'Acompanhamento visual e ágil das solicitações' };
      case 'relatorios': return { title: 'Relatórios e Estatísticas', subtitle: 'Geração e exportação de dados consolidados' };
      case 'cidadaos': return { title: 'Gestão de Cidadãos', subtitle: 'Base de munícipes atendidos na plataforma' };
      case 'secretarias': return { title: 'Secretarias e Departamentos', subtitle: 'Gestão das entidades responsáveis pelo atendimento' };
      case 'configuracoes': return { title: 'Configurações e Acessos', subtitle: 'Aprovação de servidores, perfil do administrador e integrações' };
      case 'historico_notificacoes': return { title: 'Central de Notificações', subtitle: 'Registro completo de todos os eventos e alertas do sistema' };
      case 'detalhes_chamado': return { title: 'Detalhes da Ocorrência', subtitle: 'Análise aprofundada da solicitação do cidadão' };
      default: return { title: 'Prefeitura Municipal', subtitle: 'Sertão Integrado' };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} usuarioLogado={usuarioLogado} />
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
        {activePage === 'configuracoes' && <Configuracoes usuarioLogado={usuarioLogado} />}
        {activePage === 'historico_notificacoes' && <HistoricoNotificacoes />}

      </main>
    </div>
  );
}