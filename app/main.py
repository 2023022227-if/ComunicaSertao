from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
from app.schemas import (
    OcorrenciaCreate,
    OcorrenciaResponse,
    OcorrenciaUpdateStatus,
    StatusOcorrencia,
    CategoriaProblema
)

app = FastAPI(
    title="ComunicaSertão - API de Ocorrências",
    description="Back-end para recebimento de chamados via WhatsApp e integração com o Dashboard da Prefeitura de Sertão - RS.",
    version="1.0.0"
)

# Configuração de CORS para permitir que o Front-end do seu colega consuma a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, pode restringir para o domínio do front-end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Banco de dados temporário em memória (para desenvolvimento e testes rápidos)
db_ocorrencias: List[dict] = [
    {
        "id": 1,
        "protocolo": "CMS-2026-0001",
        "cidadao_nome": "João da Silva",
        "cidadao_telefone": "54999998888",
        "categoria": CategoriaProblema.BURACO_VIA,
        "descricao": "Buraco grande na via pública próximo à esquina da praça central.",
        "localizacao": "Rua Getúlio Vargas, Centro - Sertão/RS",
        "fotos": ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500"],
        "status": StatusOcorrencia.ABERTO,
        "criado_em": datetime.now()
    }
]

@app.get("/", tags=["Status"])
def root():
    return {
        "sistema": "ComunicaSertão API",
        "status": "online",
        "documentacao": "/docs"
    }

@app.get("/ocorrencias", response_model=List[OcorrenciaResponse], tags=["Ocorrências"])
def listar_ocorrencias():
    """Retorna todas as ocorrências cadastradas para o dashboard da prefeitura."""
    return db_ocorrencias

@app.get("/ocorrencias/{ocorrencia_id}", response_model=OcorrenciaResponse, tags=["Ocorrências"])
def obter_ocorrencia(ocorrencia_id: int):
    """Busca uma ocorrência específica pelo ID."""
    for ocorrencia in db_ocorrencias:
        if ocorrencia["id"] == ocorrencia_id:
            return ocorrencia
    raise HTTPException(status_code=404, detail="Ocorrência não encontrada")

@app.post("/ocorrencias", response_model=OcorrenciaResponse, status_code=201, tags=["Ocorrências"])
def criar_ocorrencia(dados: OcorrenciaCreate):
    """Cria uma nova ocorrência (acionado quando o fluxo do WhatsApp é finalizado)."""
    novo_id = len(db_ocorrencias) + 1
    protocolo = f"CMS-2026-{novo_id:04d}"
    
    nova = {
        "id": novo_id,
        "protocolo": protocolo,
        "cidadao_nome": dados.cidadao_nome,
        "cidadao_telefone": dados.cidadao_telefone,
        "categoria": dados.categoria,
        "descricao": dados.descricao,
        "localizacao": dados.localizacao,
        "fotos": dados.fotos,
        "status": StatusOcorrencia.ABERTO,
        "criado_em": datetime.now()
    }
    db_ocorrencias.append(nova)
    return nova

@app.patch("/ocorrencias/{ocorrencia_id}/status", response_model=OcorrenciaResponse, tags=["Ocorrências"])
def atualizar_status(ocorrencia_id: int, payload: OcorrenciaUpdateStatus):
    """Permite que os servidores da prefeitura alterem o status no Dashboard."""
    for ocorrencia in db_ocorrencias:
        if ocorrencia["id"] == ocorrencia_id:
            ocorrencia["status"] = payload.status
            return ocorrencia
    raise HTTPException(status_code=404, detail="Ocorrência não encontrada")

@app.post("/webhook/whatsapp", tags=["WhatsApp"])
def webhook_whatsapp(payload: dict):
    """
    Ponto de entrada para receber mensagens enviadas pelo WhatsApp.
    Aqui será conectado o webhook da API de WhatsApp.
    """
    print(f"Mensagem recebida do WhatsApp: {payload}")
    return {"status": "recebido"}
