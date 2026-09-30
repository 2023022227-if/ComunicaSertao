from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
import os
import uuid
import shutil


from app.schemas import (
    OcorrenciaCreate,
    OcorrenciaResponse,
    OcorrenciaUpdateStatus,
    StatusOcorrencia,
    CategoriaProblema,
    MensagemSimulador
)
from app.database import engine, Base, get_db, SessionLocal
from app.models import OcorrenciaModel
from app.bot_service import processar_mensagem
from app.chat_page import HTML_CHAT

# Criação automática das tabelas no SQLite ao iniciar a aplicação
Base.metadata.create_all(bind=engine)

# Inserção de dados iniciais de exemplo caso o banco esteja vazio
def popular_banco_se_vazio():
    db = SessionLocal()
    try:
        if db.query(OcorrenciaModel).count() == 0:
            exemplo = OcorrenciaModel(
                protocolo="CMS-2026-0001",
                cidadao_nome="João da Silva",
                cidadao_telefone="54999998888",
                categoria=CategoriaProblema.BURACO_VIA.value,
                descricao="Buraco grande na via pública próximo à esquina da praça central.",
                localizacao="Rua Getúlio Vargas, Centro - Sertão/RS",
                fotos="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500",
                status=StatusOcorrencia.ABERTO.value,
                criado_em=datetime.now()
            )
            db.add(exemplo)
            db.commit()
    finally:
        db.close()

popular_banco_se_vazio()

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

# Garantir existência e montar pasta de arquivos de uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/", tags=["Status"])
def root():
    return {
        "sistema": "ComunicaSertão API",
        "status": "online",
        "banco_de_dados": "SQLite (comunicasertao.db)",
        "simulador_chat": "/chat",
        "documentacao": "/docs"
    }

@app.get("/chat", response_class=HTMLResponse, tags=["Simulador WhatsApp"])
def chat_visual():
    """
    Interface web visual estilo WhatsApp para demonstrar o fluxo conversacional ao orientador e banca.
    """
    return HTMLResponse(content=HTML_CHAT)

@app.get("/ocorrencias", response_model=List[OcorrenciaResponse], tags=["Ocorrências"])
def listar_ocorrencias(db: Session = Depends(get_db)):
    """Retorna todas as ocorrências cadastradas para o dashboard da prefeitura."""
    ocorrencias = db.query(OcorrenciaModel).order_by(OcorrenciaModel.id.desc()).all()
    return [o.to_dict() for o in ocorrencias]

@app.get("/ocorrencias/{ocorrencia_id}", response_model=OcorrenciaResponse, tags=["Ocorrências"])
def obter_ocorrencia(ocorrencia_id: int, db: Session = Depends(get_db)):
    """Busca uma ocorrência específica pelo ID."""
    ocorrencia = db.query(OcorrenciaModel).filter(OcorrenciaModel.id == ocorrencia_id).first()
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    return ocorrencia.to_dict()

@app.post("/ocorrencias", response_model=OcorrenciaResponse, status_code=201, tags=["Ocorrências"])
def criar_ocorrencia(dados: OcorrenciaCreate, db: Session = Depends(get_db)):
    """Cria uma nova ocorrência manualmente pela API."""
    total = db.query(OcorrenciaModel).count() + 1
    protocolo = f"CMS-2026-{total:04d}"
    fotos_str = ",".join(dados.fotos) if dados.fotos else ""

    nova = OcorrenciaModel(
        protocolo=protocolo,
        cidadao_nome=dados.cidadao_nome,
        cidadao_telefone=dados.cidadao_telefone,
        categoria=dados.categoria.value if hasattr(dados.categoria, "value") else str(dados.categoria),
        descricao=dados.descricao,
        localizacao=dados.localizacao,
        fotos=fotos_str,
        status=StatusOcorrencia.ABERTO.value
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova.to_dict()

@app.patch("/ocorrencias/{ocorrencia_id}/status", response_model=OcorrenciaResponse, tags=["Ocorrências"])
def atualizar_status(ocorrencia_id: int, payload: OcorrenciaUpdateStatus, db: Session = Depends(get_db)):
    """Permite que os servidores da prefeitura alterem o status no Dashboard (Aberto -> Em Análise -> Resolvido)."""
    ocorrencia = db.query(OcorrenciaModel).filter(OcorrenciaModel.id == ocorrencia_id).first()
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    
    ocorrencia.status = payload.status.value
    db.commit()
    db.refresh(ocorrencia)
    return ocorrencia.to_dict()

@app.post("/webhook/whatsapp", tags=["WhatsApp"])
def webhook_whatsapp(payload: dict):
    """
    Ponto de entrada para receber webhooks oficiais da API do WhatsApp (ex: Meta Cloud API ou Evolution API).
    """
    print(f"Payload recebido do WhatsApp: {payload}")
    return {"status": "recebido"}

@app.post("/simulador/chat", tags=["Simulador WhatsApp"])
def simular_chat(dados: MensagemSimulador, db: Session = Depends(get_db)):
    """
    Simulador interativo para testar o bot de WhatsApp.
    As mensagens enviadas pelo cidadão gravam as ocorrências diretamente no banco de dados.
    """
    resposta = processar_mensagem(
        telefone=dados.telefone,
        texto=dados.mensagem,
        url_foto=dados.url_foto,
        db_session=db
    )
    return {
        "telefone": dados.telefone,
        "mensagem_enviada": dados.mensagem,
        "resposta_bot": resposta
    }

@app.post("/upload/foto", tags=["Uploads"])
async def upload_foto(arquivo: UploadFile = File(...)):
    """
    Recebe uma foto enviada pelo cidadão (via WhatsApp ou tela de chat)
    e armazena localmente gerando a URL para exibição no Dashboard.
    """
    ext = os.path.splitext(arquivo.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=400, 
            detail="Formato de imagem inválido. Formatos aceitos: JPG, JPEG, PNG, WEBP."
        )

    nome_arquivo = f"foto_{uuid.uuid4().hex[:10]}{ext}"
    caminho = os.path.join("uploads", nome_arquivo)

    with open(caminho, "wb") as buffer:
        shutil.copyfileobj(arquivo.file, buffer)

    return {
        "mensagem": "Foto salva com sucesso!",
        "url": f"/uploads/{nome_arquivo}",
        "filename": nome_arquivo
    }

