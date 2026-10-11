# ComunicaSertão - Sistema de Zeladoria Urbana (Back-end, Bot WhatsApp e Painel da Prefeitura)

Projeto de Trabalho de Conclusão de Curso (TCC) voltado à melhoria da zeladoria urbana e comunicação cidadã no município de **Sertão - RS**.

O **ComunicaSertão** é uma plataforma que integra o atendimento à população via WhatsApp ao painel de gestão da Prefeitura Municipal.

---

## 🏛️ Estrutura do Repositório

- **`app/`**: Back-end em Python (FastAPI + SQLAlchemy + SQLite), máquina de estados conversacional do bot de WhatsApp e simulador web (`/chat`).
- **`painel-prefeitura/`**: Front-end em React + Vite + Tailwind CSS para gestão de chamados, quadro Kanban, cadastro de cidadãos e métricas da Prefeitura.

---

## 🚀 Tecnologias Utilizadas

- **Back-end**: Python 3, FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic
- **Front-end**: React, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Documentação de API**: Swagger / OpenAPI (`/docs`)

---

## ⚙️ Como Executar o Projeto Completo

### 1. Iniciar o Back-end (API e Bot WhatsApp)
No terminal, na raiz do projeto:
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- **API**: `http://127.0.0.1:8000`
- **Simulador do WhatsApp**: `http://127.0.0.1:8000/chat`
- **Documentação Swagger**: `http://127.0.0.1:8000/docs`

### 2. Iniciar o Painel da Prefeitura (Front-end)
Em outro terminal, entre na pasta `painel-prefeitura`:
```powershell
cd painel-prefeitura
npm install
npm run dev
```
- **Dashboard da Prefeitura**: `http://127.0.0.1:5173`

---

## 🛣️ Principais Rotas da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/` | Verificação de status da API |
| `GET` | `/chat` | Simulador Web estilo WhatsApp (abertura e consulta de protocolo) |
| `POST` | `/simulador/chat` | Processamento das mensagens enviadas ao bot |
| `POST` | `/upload/foto` | Recebimento e armazenamento de fotos das ocorrências |
| `GET` | `/ocorrencias` | Lista todas as ocorrências para o Painel da Prefeitura |
| `GET` | `/ocorrencias/{id}` | Detalhes de uma ocorrência por ID ou código de protocolo |
| `POST` | `/ocorrencias` | Registro manual de chamado pelo painel |
| `PATCH` | `/ocorrencias/{id}/status` | Atualização do status (Pendente, Em Andamento, Concluído, Cancelado) |
| `PATCH` | `/ocorrencias/{id}/prioridade` | Atualização da prioridade (BAIXA, MÉDIA, ALTA) |
| `GET` | `/cidadaos` | Lista os cidadãos atendidos pelo sistema |
