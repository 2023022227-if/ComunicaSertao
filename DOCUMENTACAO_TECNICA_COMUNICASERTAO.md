# Documentação Técnica do Projeto de Software — ComunicaSertão

**Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul (IFRS) — Campus Sertão**  
**Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)**  
**Componente Curricular:** Projeto Integrador Extensionista I e II  
**Autor:** Fabricio Cardoso de Abreu (`2023022227@aluno.sertao.ifrs.edu.br`)  
**Orientadora:** Prof.ª Me. Caroline Guterres Silva  
**Repositório Oficial:** [https://github.com/2023022227-if/ComunicaSertao](https://github.com/2023022227-if/ComunicaSertao)  

---

## Sumário
1. [Visão Geral do Produto de Software](#1-visão-geral-do-produto-de-software)
2. [Regras de Negócio e Restrições do Sistema (Tópico 2)](#2-regras-de-negócio-e-restrições-do-sistema)
3. [Descrição do Produto, Tecnologias Selecionadas e Processo de Desenvolvimento com Base no Backlog (Tópico 3)](#3-descrição-do-produto-tecnologias-selecionadas-e-processo-de-desenvolvimento-com-base-no-backlog)
4. [Modelagem de Dados e Diagrama Entidade-Relacionamento (Tópico 4)](#4-modelagem-de-dados-e-diagrama-entidade-relacionamento)
5. [Arquitetura Técnica, Tecnologias e Infraestrutura (Tópico 5)](#5-arquitetura-técnica-tecnologias-e-infraestrutura)

---

## 1. Visão Geral do Produto de Software

O **ComunicaSertão** é uma plataforma integrada de gestão pública e zeladoria urbana/rural concebida sob medida para a Prefeitura Municipal de Sertão - RS. O sistema visa aproximar a administração pública dos cidadãos através de um canal conversacional acessível via WhatsApp integrado a um barramento de retaguarda (API RESTful) e a um painel de controle operacional.

A camada de **Back-End** atua como o núcleo transacional da solução, sendo responsável por processar os webhooks da Meta WhatsApp Cloud API, conduzir a máquina de estados do atendimento automatizado, emitir números de protocolos oficiais auditáveis, persistir ocorrências e evidências fotográficas em banco relacional estruturado e fornecer endpoints seguros consumidos pelo painel gestor.

---

## 2. Regras de Negócio e Restrições do Sistema

As regras de negócio (RNs) e restrições estabelecem as diretrizes operacionais, restrições lógicas e conformidades que delimitam o comportamento do software.

### 2.1 Regras de Negócio (RNs)

* **RN01 — Estrutura e Unicidade do Número de Protocolo:**
  Toda ocorrência registrada no sistema (seja via WhatsApp ou abertura manual pelo painel) deve receber obrigatoriamente um identificador alfanumérico único no padrão:
  $$\text{CMS-AAAA-NNNN}$$
  Onde `CMS` representa a sigla do sistema (ComunicaSertão), `AAAA` indica o ano corrente da solicitação (ex.: 2026) e `NNNN` representa um sequencial numérico indexado formatado em quatro dígitos (ex.: `CMS-2026-0001`, `CMS-2026-0002`). Uma vez gerado, o protocolo torna-se imutável e atua como chave pública de consulta do cidadão.

* **RN02 — Ciclo de Vida e Transições de Status das Ocorrências:**
  O ciclo de vida de uma demanda obedece a uma máquina de estados estrita:
  1. **`Pendente`:** Estado inicial atribuído automaticamente no momento da criação do chamado.
  2. **`Em Andamento`:** Transição efetuada quando um servidor municipal assume a triagem, agenda vistoria ou despacha a ordem de serviço ao setor de obras/iluminação.
  3. **`Concluído`:** Transição executada quando o serviço foi finalizado e homologado pela secretaria responsável.
  4. **`Cancelado`:** Atribuído quando a demanda for considerada improcedente, duplicada ou apresentar dados inverídicos. Toda mutação de status deve registrar atomicamente o identificador do servidor, data/hora e justificativa na tabela de histórico.

* **RN03 — Classificação de Prioridades e Triagem por Categoria:**
  Cada ocorrência deve ser vinculada a uma categoria oficial pré-cadastrada (ex.: Iluminação Pública, Pavimentação/Vias, Limpeza Urbana, Saneamento/Esgoto, Poda de Árvores). O sistema calcula a prioridade operacional (`BAIXA`, `MEDIA`, `ALTA`) com base no risco público e impacto logístico relatado.

* **RN04 — Restrição de Domínio de E-mail Institucional:**
  O acesso ao painel administrativo e às rotas de gerenciamento é estritamente restrito a funcionários da prefeitura. O back-end valida obrigatoriamente se o e-mail submetido possui o sufixo oficial `@sertao.rs.gov.br`. Cadastros com domínios públicos genéricos (como `@gmail.com`, `@hotmail.com`) são rejeitados com código HTTP 400.

* **RN05 — Homologação Hierárquica de Novos Servidores:**
  Para garantir a segurança da informação e a proteção de dados dos cidadãos, qualquer solicitação de acesso submetida na tela de cadastro entra no banco de dados com status **`Pendente`**. 
  - Enquanto estiver pendente, tentativas de login resultam no bloqueio com código **HTTP 403 (Forbidden)**.
  - O acesso só é liberado após a aprovação expressa por um usuário com privilégio de **`Administrador`** (perfis homologados: Fabricio de Abreu, Patrick Telo e Gestão Central da Prefeitura).
  - Administradores possuem autoridade exclusiva para alterar cargos, aprovar ou bloquear temporariamente credenciais.

* **RN06 — Política de Mídias e Evidências Fotográficas:**
  O envio de fotos pelo cidadão via WhatsApp ou painel passa por validação estrita de MIME type. São aceitos apenas arquivos nos formatos `.jpg`, `.jpeg`, `.png` e `.webp`. O back-end renomeia o arquivo utilizando padrão seguro com hash UUID (`foto_xxxxxxxxxx.ext`), prevenindo ataques de sobrescrita (*path traversal*) e servindo a imagem através de diretório protegido (`/uploads`).

---

### 2.2 Restrições do Sistema

* **RES01 — Restrição Tecnológica de Retaguarda:** O back-end deve ser integralmente desenvolvido em **Python 3.10+**, utilizando o framework assíncrono **FastAPI** e executado sobre o servidor ASGI **Uvicorn**, aproveitando concorrência nativa por meio de rotinas não bloqueantes (`async/await`).
* **RES02 — Restrição de Banco de Dados Local (Soberania de Dados):** Os dados devem ser persistidos localmente no banco relacional embutido **SQLite** (`comunicasertao.db`), gerenciado via **SQLAlchemy ORM**. Não é permitida a dependência de serviços externos pagos de SGBD em nuvem, garantindo soberania e facilidade de backup institucional.
* **RES03 — Conformidade com a LGPD (Lei nº 13.709/2018):** Dados de contato dos munícipes (número de telefone e nome) devem ser utilizados exclusivamente para o tratamento da demanda e emissão de avisos de status, ficando restritos a servidores autenticados.
* **RES04 — Restrição de Licenciamento e Custo Zero:** O software deve ser baseado 100% em tecnologias de código aberto (Open Source), sem impor mensalidades ou dependência de plataformas proprietárias SaaS (como Octadesk ou Zendesk).

---

## 3. Descrição do Produto, Tecnologias Selecionadas e Processo de Desenvolvimento com Base no Backlog

### 3.1 Descrição Geral do Produto de Software

O **ComunicaSertão** é uma solução de software completa voltada à modernização do atendimento de zeladoria urbana e infraestrutura no município de Sertão/RS. O produto foi concebido para resolver a histórica assimetria de comunicação entre os cidadãos — em especial os residentes da extensa área rural e distritos do interior — e a administração municipal.

Diferente de sistemas corporativos genéricos de *Helpdesk* ou aplicativos convencionais que exigem downloads nas lojas virtuais, o ComunicaSertão fundamenta sua proposta de valor em três princípios norteadores:
1. **Acessibilidade Universal Sem Barreiras:** O munícipe utiliza o próprio WhatsApp que já possui instalado em seu aparelho móvel, interagindo por meio de diálogos estruturados com um bot oficial da Prefeitura Municipal.
2. **Centralização e Transacionalidade de Retaguarda:** Todas as interações conversacionais são convertidas em registros estruturados de banco de dados no back-end, eliminando memorandos físicos, registros em papel e contatos desarticulados.
3. **Gestão Visual e Tomada de Decisão:** Os servidores municipais contam com um painel web dinâmico com quadro Kanban, filtragem avançada por secretarias/bairros e consolidação automática de métricas para orientar as ordens de serviço.

---

### 3.2 Tecnologias Selecionadas e Justificativas Técnicas

A seleção do ecossistema computacional foi orientada por critérios rigorosos de desempenho, baixo consumo de recursos, segurança transacional e viabilidade econômica para o setor público municipal:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PILHA DE BACK-END                                 │
├──────────────────────────────┬──────────────────────────────────────────────┤
│ Linguagem de Programação     │ Python 3.10+ (Tipagem estática e async)      │
│ Framework Web RESTful        │ FastAPI 0.100+ (Padrão ASGI, OpenAPI nativo) │
│ Servidor de Aplicação        │ Uvicorn (ASGI Server com uvloop)             │
│ Validação e Sanitização      │ Pydantic v2 (Schemas tipados e contratos)    │
│ Camada de Mapeamento ORM     │ SQLAlchemy 2.0 (Controle de transações ACID) │
│ Banco de Dados Relacional    │ SQLite (comunicasertao.db embutido local)    │
│ Documentação Interativa      │ Swagger UI & ReDoc (Rota /docs e /redoc)     │
│ Protocolo de Integração      │ Webhooks HTTPS & Meta WhatsApp Cloud API     │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

#### Justificativas Técnicas:
* **Python 3 & FastAPI:** A escolha da combinação Python + FastAPI justifica-se pela capacidade de lidar com requisições I/O assíncronas concorrentes (`async/await`) com latência inferior a 50 milissegundos. O FastAPI baseia-se no padrão aberto OpenAPI e gera a documentação do sistema de forma automática e síncrona com o código-fonte.
* **Uvicorn ASGI:** Servidor web assíncrono de alto rendimento construído sobre `uvloop` e `httptools`, proporcionando velocidade de processamento próxima a soluções em Go ou Node.js, mantendo a simplicidade de manutenção do Python.
* **Pydantic Schemas:** Garante a integridade de dados na entrada e na saída dos endpoints. Cada payload submetido é validado e sanitizado em tempo de execução; dados incompatíveis ou maliciosos são imediatamente bloqueados com status HTTP 422, prevenindo falhas de segurança e injeções.
* **SQLAlchemy ORM & SQLite:** A persistência em SQLite embutido (`comunicasertao.db`) confere total autonomia à Prefeitura de Sertão, sem depender de processos de servidores pesados de banco de dados em segundo plano. O SQLAlchemy abstrai o dialeto relacional, garante atomicidade em operações de escrita e assegura que, caso a prefeitura necessite expandir sua infraestrutura para um cluster em nuvem (ex.: PostgreSQL), nenhuma linha de regra de negócio precisará ser reescrita.

---

### 3.3 Processo de Desenvolvimento de Software Adotado

O projeto foi conduzido sob uma metodologia ágil adaptada, fundamentada nos princípios do **Scrum** e do **Kanban**, compatibilizada com o ciclo de curricularização da extensão das disciplinas de Projeto Integrador Extensionista I e II:

```mermaid
flowchart LR
    A["1. Levantamento Extensionista\n(Demandas de Sertão/RS)"] --> B["2. Engenharia de Requisitos\n(Backlog & Regras)"]
    B --> C["3. Modelagem de Dados\n(DER & Arquitetura)"]
    C --> D["4. Sprints de Desenvolvimento\n(FastAPI / Bot / SQLite)"]
    D --> E["5. Testes de Integração\n(Simulador & Swagger UI)"]
    E --> F["6. Homologação & Entrega\n(GitHub & Deploy Local)"]
```

1. **Sprint 0 — Diagnóstico Comunitário e Engenharia de Requisitos:** Análise das dificuldades logísticas dos moradores da zona rural de Sertão/RS, mapeamento dos canais informais existentes e definição dos requisitos funcionais e não funcionais.
2. **Sprint 1 — Arquitetura de Dados e Núcleo do Back-End:** Modelagem do diagrama entidade-relacionamento (DER), configuração do SQLAlchemy e criação das tabelas no SQLite (`funcionarios`, `ocorrencias`, `cidadaos`, `historico_status`).
3. **Sprint 2 — Motor Conversacional e Webhooks:** Implementação da máquina de estados do bot (`bot_service.py`), algoritmo de cálculo do protocolo sequencial (`CMS-2026-XXXX`) e simulação interativa via rota `/chat`.
4. **Sprint 3 — Barramento RESTful e Segurança de Acessos:** Implementação dos endpoints de CRUD de ocorrências, autenticação com e-mail corporativo `@sertao.rs.gov.br` e fluxo de homologação de servidores por administradores.
5. **Sprint 4 — Integração, Testes e Documentação:** Homologação integrada com o painel front-end (React), testes com Swagger UI, validação de uploads de mídia e elaboração da documentação técnica.

---

### 3.4 Backlog do Produto e Priorização (Product Backlog)

A lista de itens de backlog (PBIs) foi organizada em 4 épicos centrais e priorizada através do método **MoSCoW** (*Must Have*, *Should Have*, *Could Have*, *Won't Have*):

| ID | Épico | Item de Backlog (PBI) | Descrição e Critérios de Aceite | MoSCoW | Sprint |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **US01** | Atendimento Cidadão | Receptor de Webhooks | Endpoint HTTPS para receber eventos da Meta Cloud API com tempo de resposta < 200ms. | **Must** | Sprint 2 |
| **US02** | Atendimento Cidadão | Máquina de Estados do Bot | Conduzir munícipe por menu numérico: identificação, categoria, descrição, endereço e foto. | **Must** | Sprint 2 |
| **US03** | Atendimento Cidadão | Gerador de Protocolo | Calcular e retornar código sequencial imutável `CMS-2026-XXXX` na conclusão da solicitação. | **Must** | Sprint 2 |
| **US04** | Atendimento Cidadão | Consulta de Andamento | Permitir que o cidadão consulte o status atual do seu chamado digitando o número de protocolo. | **Must** | Sprint 2 |
| **US05** | Atendimento Cidadão | Upload de Fotos | Endpoint `/upload/foto` com validação de extensão (.jpg, .png, .webp) e renomeação com UUID. | **Should** | Sprint 3 |
| **US06** | Gestão Operacional | Listagem e Filtros REST | Rotas para recuperar ocorrências com filtros combinados de status, categoria e bairro. | **Must** | Sprint 3 |
| **US07** | Gestão Operacional | Mutação de Status | Endpoint PATCH para transição atômica de status (`Pendente` $\rightarrow$ `Em Andamento` $\rightarrow$ `Concluído`). | **Must** | Sprint 3 |
| **US08** | Gestão Operacional | Prioridade Operacional | Atribuição de urgência (`BAIXA`, `MEDIA`, `ALTA`) baseada na criticidade do serviço público. | **Should** | Sprint 3 |
| **US09** | Gestão Operacional | Histórico Auditável | Gravar no SQLite cada alteração de status com ID do funcionário e timestamp para auditoria. | **Must** | Sprint 1 |
| **US10** | Segurança e Acesso | Login Institucional | Autenticação restrita a e-mails corporativos com sufixo oficial `@sertao.rs.gov.br`. | **Must** | Sprint 3 |
| **US11** | Segurança e Acesso | Fila de Homologação | Novos cadastros registrados como `Pendente`, com bloqueio HTTP 403 até deliberação de admin. | **Must** | Sprint 3 |
| **US12** | Segurança e Acesso | Gestão de Servidores | Endpoint exclusivo para Administradores aprovarem, bloquearem ou alterarem cargos de servidores. | **Must** | Sprint 3 |
| **US13** | Indicadores & Métricas | Métricas Estatísticas | Consolidação de volumetria mensal e chamados por categoria para alimentar o dashboard. | **Should** | Sprint 4 |
| **US14** | Mensageria Ativa | Notificação Ativa no WhatsApp | Disparo automático de aviso no WhatsApp do cidadão quando o chamado for concluído. | **Could** | Futuro |

---

### 3.5 Matriz de Rastreabilidade Técnica

A matriz a seguir correlaciona os itens do Backlog de maior criticidade (*Must Have*) com as classes, rotas e módulos de código implementados no repositório de back-end:

| Item do Backlog | Módulo Implementado | Componente / Classe / Rota | Requisito Atendido |
| :--- | :--- | :--- | :---: |
| **US01, US02** | `app/bot_service.py` | Função `processar_mensagem()` e dicionário de sessão | RF01, RF02 |
| **US03, US04** | `app/main.py` | `buscar_por_id_ou_protocolo()` e `CMS-2026-XXXX` | RF03, RF04 |
| **US05** | `app/main.py` | Rota `POST /upload/foto` com biblioteca `shutil` e `uuid` | RF08 |
| **US06, US07** | `app/main.py` | Rotas `GET /ocorrencias` e `PATCH /ocorrencias/{id}/status` | RF05 |
| **US09** | `app/models.py` | Classe `OcorrenciaModel` e tabela `comunicasertao.db` | RNF02 |
| **US10, US11, US12**| `app/main.py` | Rotas `POST /auth/login` e `PATCH /funcionarios/{id}/status` | RF06, RF07 |
| **Padronização OpenAPI**| `app/schemas.py` | Classes Pydantic (`OcorrenciaCreate`, `LoginRequest`) | RNF03, RNF04 |

---

## 4. Modelagem de Dados e Diagrama Entidade-Relacionamento

A persistência do ComunicaSertão foi estruturada através de modelagem relacional normalizada, implementada em arquivo SQLite local (`comunicasertao.db`) por meio de classes de modelo do **SQLAlchemy**.

### 4.1 Diagrama Entidade-Relacionamento (DER Lógico)

```mermaid
erDiagram
    CIDADAO ||--o{ OCORRENCIA : "registra (1,N)"
    SECRETARIA ||--o{ CATEGORIA : "gerencia (1,N)"
    CATEGORIA ||--o{ OCORRENCIA : "classifica (1,N)"
    FUNCIONARIO ||--o{ HISTORICO_STATUS : "modifica (1,N)"
    OCORRENCIA ||--o{ HISTORICO_STATUS : "possui (1,N)"
    OCORRENCIA ||--o{ ANEXO : "contem (1,N)"

    CIDADAO {
        int id PK "Chave primária autoincrement"
        string nome "Nome completo do munícipe"
        string telefone "Telefone com DDD / WhatsApp"
        datetime data_cadastro "Data e hora do registro inicial"
    }

    SECRETARIA {
        int id PK "Chave primária"
        string nome_secretaria "Nome do órgão (Obras, Saúde, etc.)"
        string responsavel "Nome do titular da pasta"
    }

    CATEGORIA {
        int id PK "Chave primária"
        string nome_categoria "Iluminação, Pavimentação, Limpeza, etc."
        int secretaria_id FK "Chave estrangeira -> SECRETARIA"
    }

    FUNCIONARIO {
        int id PK "Chave primária autoincrement"
        string nome "Nome completo do servidor"
        string matricula "Matrícula funcional municipal"
        string email "E-mail oficial @sertao.rs.gov.br"
        string senha "Hash seguro de senha"
        string cargo "Administrador ou Servidor Municipal"
        string status "Aprovado, Pendente ou Bloqueado"
    }

    OCORRENCIA {
        int id PK "Chave primária autoincrement"
        string protocolo UK "CMS-AAAA-NNNN (Identificador único)"
        int cidadao_id FK "Chave estrangeira -> CIDADAO"
        string categoria "Categoria de serviço público"
        string descricao "Detalhamento da demanda relatada"
        string localizacao "Bairro, rua e referências"
        string fotos "Caminhos das imagens locais (/uploads)"
        string status "Pendente, Em Andamento, Concluído"
        string prioridade "BAIXA, MEDIA, ALTA"
        datetime criado_em "Timestamp de abertura"
        datetime atualizado_em "Timestamp da última mutação"
    }

    HISTORICO_STATUS {
        int id PK "Chave primária autoincrement"
        int ocorrencia_id FK "Chave estrangeira -> OCORRENCIA"
        int funcionario_id FK "Chave estrangeira -> FUNCIONARIO"
        string status_anterior "Estado anterior do chamado"
        string status_novo "Novo estado atribuído"
        datetime data_alteracao "Timestamp da mutação"
    }

    ANEXO {
        int id PK "Chave primária"
        int ocorrencia_id FK "Chave estrangeira -> OCORRENCIA"
        string url_arquivo "Caminho relativo do arquivo"
        string tipo_arquivo "MIME Type (image/jpeg, etc.)"
        datetime data_upload "Data do armazenamento"
    }
```

---

### 4.2 Dicionário de Dados Detalhado

#### Tabela 1: `funcionarios` (Controle de Acessos e Governança)
Armazena os servidores públicos municipais habilitados ou solicitantes de acesso ao painel de gestão.

| Atributo | Tipo de Dado | Restrições | Descrição Técnica |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Autoincrement | Identificador primário numérico do servidor. |
| `nome` | VARCHAR(120) | NOT NULL | Nome civil completo do funcionário municipal. |
| `matricula` | VARCHAR(30) | NULL | Número de matrícula institucional no município. |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | E-mail oficial terminado em `@sertao.rs.gov.br`. |
| `senha` | VARCHAR(255) | NOT NULL | Senha de autenticação com critérios de complexidade. |
| `cargo` | VARCHAR(50) | NOT NULL | Perfil de atuação: `Administrador` ou `Servidor Municipal`. |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'Pendente' | Estado do acesso: `Aprovado`, `Pendente` ou `Bloqueado`. |

#### Tabela 2: `ocorrencias` (Núcleo Transacional de Chamados)
Contém os registros de demandas de zeladoria abertas pelos cidadãos via WhatsApp ou painel.

| Atributo | Tipo de Dado | Restrições | Descrição Técnica |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Autoincrement | Identificador interno sequencial. |
| `protocolo` | VARCHAR(30) | UNIQUE, NOT NULL, INDEX | Código público anual formatado (`CMS-2026-XXXX`). |
| `cidadao_nome`| VARCHAR(120) | NOT NULL | Nome do munícipe informante. |
| `cidadao_telefone`| VARCHAR(30) | NOT NULL | Número de WhatsApp com DDD. |
| `categoria` | VARCHAR(60) | NOT NULL | Categoria do chamado (Iluminação, Vias, Limpeza, etc.). |
| `descricao` | TEXT | NOT NULL | Relato detalhado do problema no município. |
| `localizacao` | VARCHAR(255) | NOT NULL | Endereço, bairro, estrada vicinal ou ponto de referência. |
| `fotos` | TEXT | NULL | Lista de caminhos locais de imagens no formato CSV. |
| `status` | VARCHAR(30) | NOT NULL, DEFAULT 'Pendente'| Situação: `Pendente`, `Em Andamento`, `Concluído`, `Cancelado`. |
| `prioridade` | VARCHAR(20) | NOT NULL, DEFAULT 'MEDIA' | Grau de urgência: `BAIXA`, `MEDIA` ou `ALTA`. |
| `criado_em` | DATETIME | NOT NULL, DEFAULT NOW | Data e hora exata da abertura do registro. |
| `atualizado_em`| DATETIME | NULL | Data e hora da última alteração de status. |

---

## 5. Arquitetura Técnica, Tecnologias e Infraestrutura

### 5.1 Arquitetura em Camadas (Layered Architecture)

A infraestrutura foi concebida seguindo o padrão arquitetural em camadas desacopladas:

```
[ Usuários: Cidadãos (WhatsApp) & Servidores (Painel Web) ]
                           │
                           ▼ Requisições HTTPS (JSON / Form-Data)
┌────────────────────────────────────────────────────────────────────────┐
│                   1. Camada de Exposição & Gateway                     │
│   • Servidor ASGI Uvicorn     • Roteamento FastAPI (app.main)          │
│   • Middleware CORS           • Documentação OpenAPI / Swagger UI      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Validação de Schemas
┌────────────────────────────────────────────────────────────────────────┐
│                   2. Camada de Validação & Contratos                   │
│   • Pydantic Schemas (app.schemas)                                     │
│   • Higienização de Payloads, Tipagem Estática e Serialização          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Invocação de Serviços
┌────────────────────────────────────────────────────────────────────────┐
│                   3. Camada de Lógica de Negócio                       │
│   • Bot Service & Máquina de Estados (app.bot_service)                 │
│   • Geração de Protocolos Sequenciais (CMS-2026-XXXX)                   │
│   • Módulo de Autenticação e Homologação de Acessos                    │
│   • Processador de Uploads e Armazenamento Estático de Mídias          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Operações Mapeadas
┌────────────────────────────────────────────────────────────────────────┐
│                   4. Camada de Mapeamento Objeto-Relacional            │
│   • SQLAlchemy ORM (app.models & app.database)                         │
│   • Sessões Transacionais ACID (SessionLocal & Dependency Injection)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Leitura / Escrita
┌────────────────────────────────────────────────────────────────────────┐
│                   5. Camada de Persistência Relacional                 │
│   • Banco SQLite Local: comunicasertao.db                              │
│   • Diretório de Arquivos Estáticos: uploads/                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Catálogo de Endpoints RESTful Implementados

| Método | Rota / Endpoint | Função no Sistema | Permissão / Acesso |
| :---: | :--- | :--- | :--- |
| `GET` | `/` | Retorna status de saúde da API e rotas disponíveis. | Público |
| `GET` | `/docs` | Interface gráfica Swagger UI para testes da API. | Público |
| `POST` | `/auth/login` | Autentica servidor público e valida status de acesso. | Público (Servidores) |
| `GET` | `/funcionarios` | Retorna lista de servidores aprovados e pendentes. | Autenticado |
| `POST` | `/funcionarios` | Registra solicitação de novo acesso (entra como Pendente). | Público |
| `PATCH` | `/funcionarios/{id}/status` | Aprova, altera cargo ou bloqueia acesso de servidor. | **Administrador** |
| `DELETE` | `/funcionarios/{id}` | Remove solicitação ou credencial de servidor. | **Administrador** |
| `GET` | `/ocorrencias` | Lista ocorrências cadastradas com filtros de status. | Autenticado |
| `GET` | `/ocorrencias/{id_ou_protocolo}` | Retorna detalhes de um chamado por ID ou protocolo. | Público / Autenticado |
| `POST` | `/ocorrencias` | Abertura manual de demanda pelo painel da prefeitura. | Autenticado |
| `PATCH` | `/ocorrencias/{id}/status` | Altera status de atendimento do chamado (Kanban). | Autenticado |
| `PATCH` | `/ocorrencias/{id}/prioridade`| Altera o nível de prioridade (Baixa, Média, Alta). | Autenticado |
| `GET` | `/cidadaos` | Agrupa munícipes e histórico de chamados vinculados. | Autenticado |
| `GET` | `/estatisticas` | Consolida métricas, evolução mensal e distribuição. | Autenticado |
| `POST` | `/simulador/chat` | Ponto de teste conversacional do bot de WhatsApp. | Público |
| `POST` | `/webhook/whatsapp` | Ponto de entrada de webhooks da Meta Cloud API. | Meta API |
| `POST` | `/upload/foto` | Recebe arquivo de imagem, valida e retorna URL estática. | Público |

---

### 5.3 Estratégia de Implantação e Manutenção

1. **Execução Contínua em Segundo Plano:** O servidor pode ser inicializado através de daemons ASGI (`uvicorn app.main:app --host 0.0.0.0 --port 8000`) gerenciados por utilitários de processo como *Systemd* ou *PM2* em ambientes Linux, ou serviços nativos em ambiente Windows Server.
2. **Backups Automatizados do Banco de Dados:** A adoção do SQLite permite que rotinas diárias de backup sejam executadas sem necessidade de paralisar a aplicação: um simples script de cópia fria do arquivo `comunicasertao.db` e do diretório `uploads/` garante cópias íntegras e restauração imediata em caso de contingência.
3. **Escalabilidade Transparente:** Como o sistema utiliza SQLAlchemy ORM para isolar o dialeto SQL, caso o município venha a expandir substancialmente sua demanda e exija um cluster de banco em nuvem (ex.: PostgreSQL), basta reconfigurar a variável de ambiente `DATABASE_URL` sem demandar reescrita das regras de negócio.
