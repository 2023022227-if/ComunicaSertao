# ComunicaSertão - Back-end & WhatsApp Bot

Projeto de Trabalho de Conclusão de Curso (TCC) voltado à melhoria da zeladoria urbana e comunicação cidadã no município de **Sertão - RS**.

O **ComunicaSertão** é uma plataforma que integra o atendimento à população via WhatsApp ao painel de gestão da Prefeitura Municipal.

Este repositório contém o **Back-end** da solução, responsável por gerenciar as ocorrências relatadas pela população via WhatsApp e disponibilizar uma API REST para o painel de controle (Dashboard) da Prefeitura.

---

## 🏛️ Arquitetura do Projeto

1. **Cidadão**: Envia mensagem para o WhatsApp do município (dados pessoais, descrição do problema e fotos).
2. **Back-end (FastAPI)**: Processa as mensagens, armazena a ocorrência e emite um número de protocolo.
3. **Dashboard Web (Front-end)**: Utilizado pelos servidores da prefeitura para acompanhar, filtrar e atualizar o status dos chamados.

---

## 🚀 Tecnologias Utilizadas

- **Linguagem**: Python 3
- **Framework Web**: [FastAPI](https://fastapi.tiangolo.com/)
- **Servidor ASGI**: Uvicorn
- **Validação de Dados**: Pydantic v2
- **Documentação de API**: Swagger / OpenAPI (automático)
- **Controle de Versão**: Git & GitHub

---

## ⚙️ Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/sertao-cidadao-backend.git
cd sertao-cidadao-backend
```

### 2. Ativar o Ambiente Virtual
No Windows (PowerShell):
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Instalar as Dependências
```bash
pip install -r requirements.txt
```

### 4. Iniciar o Servidor
```bash
uvicorn app.main:app --reload
```

O servidor iniciará em `http://127.0.0.1:8000`.

---

## 📖 Documentação Interativa da API (Swagger)

Com o servidor rodando, acesse no navegador:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

Nesta tela, você e o responsável pelo front-end podem visualizar todos os endpoints, testar envios de dados e ver as respostas em tempo real.

---

## 🛣️ Endpoints Disponíveis

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/` | Verificação de status da API |
| `GET` | `/ocorrencias` | Lista todas as ocorrências para o Dashboard |
| `GET` | `/ocorrencias/{id}` | Detalhes de uma ocorrência específica |
| `POST` | `/ocorrencias` | Cadastro de nova ocorrência |
| `PATCH` | `/ocorrencias/{id}/status` | Atualização do status (Aberto, Em Análise, Resolvido) |
| `POST` | `/webhook/whatsapp` | Ponto de integração com mensagens do WhatsApp |
