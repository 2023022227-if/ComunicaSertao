import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Chamados from './components/Chamados';
import ChamadoDetalhes from './components/ChamadoDetalhes';
import Kanban from './components/Kanban';
import Secretarias from './components/Secretarias';
import Relatorios from './components/Relatorios';
import Configuracoes from './components/Configuracoes';
import NovoChamado from './components/NovoChamado';
import HistoricoNotificacoes from './components/HistoricoNotificacoes';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import EsqueceuSenha from './components/EsqueceuSenha';
import { buscarChamados, atualizarStatusChamado, atualizarPrioridadeChamado } from './api';

const secretariasPadrao = [
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
];

const STORAGE_USUARIOS_KEY = 'comunica_sertao_usuarios';

const USUARIO_PADRAO = {
  nome: 'Patrick Telo Irschlinger',
  email: 'admin@sertao.rs.gov.br',
  telefone: '',
  cargo: 'Gestor de Atendimento',
  departamento: 'Secretaria de Obras e Viação',
  foto: null
};

const carregarUsuariosSalvos = () => {
  try {
    const salvo = localStorage.getItem(STORAGE_USUARIOS_KEY);
    const parsed = salvo ? JSON.parse(salvo) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function App() {
  const dadosPadrao = [
    {
      id: 'CH-2847',
      solicitante: 'Maria Aparecida S.',
      categoria: 'Iluminação Pública',
      bairro: 'Centro',
      status: 'Cancelado',
      prioridade: 'ALTA',
      departamento: 'Secretaria de Obras e Viação',
      data: '28/07/2026',
      dataAbertura: '28/07/2026',
      ultimaModificacao: '28/07/2026 às 16:40',
      tempo: 'Hoje',
      anexos: 1
    },
    {
      id: 'CH-2846',
      solicitante: 'João Carlos M.',
      categoria: 'Pavimentação',
      bairro: 'Jardim América',
      status: 'Em andamento',
      prioridade: 'ALTA',
      departamento: 'Secretaria de Obras e Viação',
      data: '28/07/2026',
      dataAbertura: '28/07/2026',
      ultimaModificacao: '28/07/2026 às 14:15',
      tempo: 'Há 3 dias',
      anexos: 2
    },
    {
      id: 'CH-2845',
      solicitante: 'Ana Paula R.',
      categoria: 'Limpeza Urbana',
      bairro: 'Vila Nova',
      status: 'Concluído',
      prioridade: 'BAIXA',
      departamento: 'Secretaria de Obras e Viação',
      data: '27/07/2026',
      dataAbertura: '27/07/2026',
      ultimaModificacao: '28/07/2026 às 11:20',
      tempo: 'Concluído ontem',
      anexos: 1
    },
    {
      id: 'CH-2844',
      solicitante: 'Roberto F.',
      categoria: 'Água e Esgoto',
      bairro: 'São João',
      status: 'Pendente',
      prioridade: 'MÉDIA',
      departamento: 'Secretaria de Água e Saneamento',
      data: '27/07/2026',
      dataAbertura: '27/07/2026',
      ultimaModificacao: '27/07/2026 às 09:05',
      tempo: 'Há 1 dia',
      anexos: 3
    },
    {
      id: 'CH-2843',
      solicitante: 'Claudia B.',
      categoria: 'Poda de Árvores',
      bairro: 'Centro',
      status: 'Em andamento',
      prioridade: 'MÉDIA',
      departamento: 'Secretaria de Obras e Viação',
      data: '26/07/2026',
      dataAbertura: '26/07/2026',
      ultimaModificacao: '27/07/2026 às 17:30',
      tempo: 'Há 4 dias',
      anexos: 1
    }
  ];

  const [autenticado, setAutenticado] = useState(false);
  const [telaAuth, setTelaAuth] = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [abaConfiguracoes, setAbaConfiguracoes] = useState('Perfil');
  const [chamados, setChamados] = useState(dadosPadrao);
  const [secretarias, setSecretarias] = useState(secretariasPadrao);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState(carregarUsuariosSalvos);
  const [ultimoCadastroSessao, setUltimoCadastroSessao] = useState(null);
  const [emailLoginInicial, setEmailLoginInicial] = useState('');
  const [usuario, setUsuario] = useState(USUARIO_PADRAO);

  const chamadosRef = useRef(chamados);
  chamadosRef.current = chamados;

  const sincronizarHistorico = (estado, substituir = false) => {
    const hash = estado.autenticado ? `#${estado.activePage}` : `#${estado.telaAuth}`;
    if (substituir) {
      window.history.replaceState(estado, '', hash);
    } else {
      window.history.pushState(estado, '', hash);
    }
  };

  useEffect(() => {
    sincronizarHistorico(
      {
        autenticado: false,
        telaAuth: 'login',
        activePage: 'dashboard',
        abaConfiguracoes: 'Perfil',
        chamadoId: null,
        chamadoOrigem: null
      },
      true
    );

    const handlePopState = (event) => {
      const estado = event.state;
      if (!estado) return;

      setAutenticado(Boolean(estado.autenticado));
      setTelaAuth(estado.telaAuth || 'login');
      setActivePage(estado.activePage || 'dashboard');
      setAbaConfiguracoes(estado.abaConfiguracoes || 'Perfil');

      if (estado.chamadoId) {
        const encontrado = chamadosRef.current.find((c) => c.id === estado.chamadoId);
        setChamadoSelecionado(
          encontrado ? { ...encontrado, origem: estado.chamadoOrigem || 'chamados' } : null
        );
      } else {
        setChamadoSelecionado(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const carregarChamadosApi = async () => {
    try {
      const listaApi = await buscarChamados();
      if (Array.isArray(listaApi) && listaApi.length > 0) {
        setChamados((prev) => {
          const mapeados = listaApi.map((item) => ({
            id: item.id || item.protocolo,
            solicitante: item.cidadao_nome || item.autor || 'Cidadão',
            categoria: item.categoria || 'Geral',
            bairro: item.localizacao || item.local || 'Sertão - RS',
            status: item.status || 'Pendente',
            prioridade: item.prioridade || 'MÉDIA',
            departamento: item.departamento || 'Secretaria de Obras e Viação',
            data: item.tempo || 'Hoje',
            dataAbertura: item.tempo || 'Hoje',
            ultimaModificacao: item.tempo || 'Hoje',
            tempo: item.tempo || 'Hoje',
            anexos: Array.isArray(item.fotos) ? item.fotos.length : (item.anexos || 0),
            descricao: item.descricao || '',
            fotos: Array.isArray(item.fotos) ? item.fotos : [],
            cidadao_telefone: item.cidadao_telefone || '',
            encaminhamentos: item.encaminhamentos || []
          }));
          return mapeados;
        });
      }
    } catch (e) {
      // API em segundo plano
    }
  };

  useEffect(() => {
    carregarChamadosApi();
    const timer = setInterval(carregarChamadosApi, 2500);
    return () => clearInterval(timer);
  }, []);

  const navegarAuth = (novaTela) => {
    setTelaAuth(novaTela);
    sincronizarHistorico({
      autenticado: false,
      telaAuth: novaTela,
      activePage: 'dashboard',
      abaConfiguracoes: 'Perfil',
      chamadoId: null,
      chamadoOrigem: null
    });
  };

  const navegarPagina = (novaPagina, opcoes = {}) => {
    const novaAba = opcoes.abaConfiguracoes || abaConfiguracoes;
    const novoChamado = opcoes.chamado !== undefined ? opcoes.chamado : null;

    if (opcoes.abaConfiguracoes) {
      setAbaConfiguracoes(opcoes.abaConfiguracoes);
    }
    if (novaPagina !== 'chamado-detalhes') {
      setChamadoSelecionado(null);
    }

    setActivePage(novaPagina);
    sincronizarHistorico({
      autenticado: true,
      telaAuth: 'login',
      activePage: novaPagina,
      abaConfiguracoes: novaAba,
      chamadoId: novoChamado ? novoChamado.id : null,
      chamadoOrigem: novoChamado ? novoChamado.origem || 'chamados' : null
    });
  };

  const handleRegistrarUsuario = (novoUsuario) => {
    const emailNormalizado = String(novoUsuario.email || '').trim().toLowerCase();
    const registroLimpo = {
      ...USUARIO_PADRAO,
      ...novoUsuario,
      nome: String(novoUsuario.nome || '').trim(),
      email: String(novoUsuario.email || '').trim()
    };

    setUltimoCadastroSessao(registroLimpo);
    setEmailLoginInicial(registroLimpo.email);

    setUsuariosCadastrados((prev) => {
      const base = prev.length > 0 ? prev : carregarUsuariosSalvos();
      const filtrados = base.filter(
        (u) => String(u.email || '').trim().toLowerCase() !== emailNormalizado
      );
      const atualizados = [...filtrados, registroLimpo];
      try {
        localStorage.setItem(STORAGE_USUARIOS_KEY, JSON.stringify(atualizados));
      } catch {
        // Ignora erro de armazenamento local indisponível
      }
      return atualizados;
    });
  };

  const handleAtualizarUsuario = (dadosAtualizados) => {
    setUsuario(dadosAtualizados);
    const emailNormalizado = String(dadosAtualizados.email || '').trim().toLowerCase();
    setUsuariosCadastrados((prev) => {
      const base = prev.length > 0 ? prev : carregarUsuariosSalvos();
      const existe = base.some(
        (u) => String(u.email || '').trim().toLowerCase() === emailNormalizado
      );
      const atualizados = existe
        ? base.map((u) =>
            String(u.email || '').trim().toLowerCase() === emailNormalizado
              ? { ...u, ...dadosAtualizados }
              : u
          )
        : [...base, dadosAtualizados];
      try {
        localStorage.setItem(STORAGE_USUARIOS_KEY, JSON.stringify(atualizados));
      } catch {
        // Ignora erro de armazenamento local indisponível
      }
      return atualizados;
    });
  };

  const handleLogin = (dadosUsuario) => {
    const emailLogin = String(dadosUsuario?.email || '').trim().toLowerCase();
    const listaStorage = carregarUsuariosSalvos();
    const listaCombinada = [...listaStorage, ...usuariosCadastrados];

    const cadastradoPorEmail = emailLogin
      ? [...listaCombinada]
          .reverse()
          .find((u) => String(u.email || '').trim().toLowerCase() === emailLogin)
      : null;

    if (cadastradoPorEmail) {
      setUsuario({
        ...USUARIO_PADRAO,
        ...cadastradoPorEmail
      });
    } else if (dadosUsuario && !dadosUsuario.naoCadastrado && dadosUsuario.nome) {
      setUsuario({
        ...USUARIO_PADRAO,
        ...dadosUsuario
      });
    } else if (ultimoCadastroSessao) {
      setUsuario({
        ...USUARIO_PADRAO,
        ...ultimoCadastroSessao
      });
    } else {
      setUsuario({
        ...USUARIO_PADRAO,
        email: String(dadosUsuario?.email || '').trim() || USUARIO_PADRAO.email
      });
    }

    setAutenticado(true);
    setActivePage('dashboard');
    sincronizarHistorico({
      autenticado: true,
      telaAuth: 'login',
      activePage: 'dashboard',
      abaConfiguracoes: 'Perfil',
      chamadoId: null,
      chamadoOrigem: null
    });
  };

  const handleLogout = () => {
    setAutenticado(false);
    setTelaAuth('login');
    setChamadoSelecionado(null);
    setUltimoCadastroSessao(null);
    setEmailLoginInicial('');
    sincronizarHistorico({
      autenticado: false,
      telaAuth: 'login',
      activePage: 'dashboard',
      abaConfiguracoes: 'Perfil',
      chamadoId: null,
      chamadoOrigem: null
    });
  };

  const handleAbrirPerfil = () => {
    navegarPagina('configuracoes', { abaConfiguracoes: 'Perfil' });
  };

  const handleSelectChamado = (chamado) => {
    setChamadoSelecionado(chamado);
    navegarPagina('chamado-detalhes', { chamado });
  };

  const alterarStatusChamado = async (id, novoStatus) => {
    const agora = new Date();
    const ultimaModificacao =
      `${agora.toLocaleDateString('pt-BR')} às ` +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setChamados((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: novoStatus, ultimaModificacao } : c
      )
    );

    try {
      await atualizarStatusChamado(id, novoStatus);
    } catch (e) {
      console.warn("Erro ao atualizar status na API:", e);
    }
  };

  const alterarPrioridadeChamado = async (id, novaPrioridade) => {
    const agora = new Date();
    const ultimaModificacao =
      `${agora.toLocaleDateString('pt-BR')} às ` +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setChamados((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, prioridade: novaPrioridade, ultimaModificacao } : c
      )
    );

    try {
      await atualizarPrioridadeChamado(id, novaPrioridade);
    } catch (e) {
      console.warn("Erro ao atualizar prioridade na API:", e);
    }
  };

  const encaminharChamado = (id, secretaria) => {
    const agora = new Date();
    const dataHora =
      `${agora.toLocaleDateString('pt-BR')} às ` +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setChamados((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const registro = {
          de: c.departamento || null,
          para: secretaria.nome,
          por: usuario.nome,
          dataHora
        };
        return {
          ...c,
          departamento: secretaria.nome,
          ultimaModificacao: dataHora,
          encaminhamentos: [...(c.encaminhamentos || []), registro]
        };
      })
    );
  };

  const chamadoAtual = chamadoSelecionado
    ? {
        ...chamadoSelecionado,
        ...(chamados.find((c) => c.id === chamadoSelecionado.id) || {})
      }
    : null;

  if (!autenticado) {
    if (telaAuth === 'cadastro') {
      return (
        <Cadastro
          onLogin={handleLogin}
          onGoToLogin={() => navegarAuth('login')}
          onRegistrarUsuario={handleRegistrarUsuario}
          secretarias={secretarias}
        />
      );
    }
    if (telaAuth === 'esqueceu-senha') {
      return (
        <EsqueceuSenha
          onGoToLogin={() => navegarAuth('login')}
          onBackToLogin={() => navegarAuth('login')}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onGoToCadastro={() => navegarAuth('cadastro')}
        onGoToEsqueceuSenha={() => navegarAuth('esqueceu-senha')}
        usuariosCadastrados={usuariosCadastrados}
        emailInicial={emailLoginInicial}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar
        activePage={activePage}
        setActivePage={navegarPagina}
        onLogout={handleLogout}
        usuario={usuario}
        onOpenPerfil={handleAbrirPerfil}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Header
          activePage={activePage}
          setActivePage={navegarPagina}
          usuario={usuario}
        />

        <main className="flex-1 min-w-0">
          {activePage === 'dashboard' && (
            <Dashboard
              chamados={chamados}
              onSelectChamado={handleSelectChamado}
              setActivePage={navegarPagina}
            />
          )}

          {activePage === 'chamados' && (
            <Chamados
              chamados={chamados}
              setChamados={setChamados}
              onAlterarStatus={alterarStatusChamado}
              onSelectChamado={handleSelectChamado}
              setActivePage={navegarPagina}
            />
          )}

          {activePage === 'chamado-detalhes' && (
            <ChamadoDetalhes
              chamado={chamadoAtual}
              onAlterarStatus={alterarStatusChamado}
              onAlterarPrioridade={alterarPrioridadeChamado}
              secretarias={secretarias}
              onEncaminhar={encaminharChamado}
              onBack={() => navegarPagina('chamados')}
              setActivePage={navegarPagina}
            />
          )}

          {activePage === 'kanban' && (
            <Kanban
              chamados={chamados}
              setChamados={setChamados}
              onAlterarStatus={alterarStatusChamado}
              onSelectChamado={handleSelectChamado}
            />
          )}

          {activePage === 'secretarias' && (
            <Secretarias secretarias={secretarias} setSecretarias={setSecretarias} />
          )}

          {activePage === 'relatorios' && <Relatorios chamados={chamados} />}

          {activePage === 'configuracoes' && (
            <Configuracoes
              usuario={usuario}
              setUsuario={handleAtualizarUsuario}
              secretarias={secretarias}
              abaInicial={abaConfiguracoes}
              onChangeAba={setAbaConfiguracoes}
            />
          )}

          {activePage === 'novo-chamado' && (
            <NovoChamado setActivePage={navegarPagina} />
          )}

          {activePage === 'notificacoes' && (
            <HistoricoNotificacoes
              setActivePage={navegarPagina}
              onBack={() => navegarPagina('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
}