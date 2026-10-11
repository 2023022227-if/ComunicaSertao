from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import uuid
import shutil

from app.schemas import (
    OcorrenciaCreate,
    OcorrenciaResponse,
    OcorrenciaUpdateStatus,
    OcorrenciaUpdatePrioridade,
    StatusOcorrencia,
    CategoriaProblema,
    MensagemSimulador,
    LoginRequest,
    FuncionarioCreate
)
from app.database import engine, Base, get_db, SessionLocal
from app.models import OcorrenciaModel, FuncionarioModel
from app.bot_service import processar_mensagem
from app.chat_page import HTML_CHAT

# Criação automática das tabelas no SQLite ao iniciar a aplicação
Base.metadata.create_all(bind=engine)

# Inserção de dados iniciais de exemplo e dos 3 funcionários caso o banco esteja vazio
def popular_banco_se_vazio():
    db = SessionLocal()
    try:
        if db.query(FuncionarioModel).count() == 0:
            funcionarios_iniciais = [
                FuncionarioModel(
                    nome="Fabricio de Abreu",
                    matricula="202302",
                    email="fabricio@sertao.rs.gov.br",
                    senha="Sertao2026",
                    cargo="Administrador do Sistema"
                ),
                FuncionarioModel(
                    nome="Patrick Telo Irschlinger",
                    matricula="202303",
                    email="patrick@sertao.rs.gov.br",
                    senha="Sertao2026",
                    cargo="Coordenação de Atendimento"
                ),
                FuncionarioModel(
                    nome="Servidor Secretaria de Obras",
                    matricula="10045",
                    email="obras@sertao.rs.gov.br",
                    senha="Sertao2026",
                    cargo="Secretaria de Obras e Viação"
                ),
            ]
            db.add_all(funcionarios_iniciais)
            db.commit()

        if db.query(OcorrenciaModel).count() == 0:
            exemplos = [
                OcorrenciaModel(
                    protocolo="CMS-2026-0001",
                    cidadao_nome="Maria Oliveira",
                    cidadao_telefone="(54) 99123-4567",
                    categoria=CategoriaProblema.ILUMINACAO.value,
                    descricao="Três postes seguidos com lâmpadas queimadas na rua principal do bairro, deixando o trecho muito escuro à noite.",
                    localizacao="Av. Getúlio Vargas, Centro - Sertão/RS",
                    fotos="",
                    status=StatusOcorrencia.PENDENTE.value,
                    prioridade="ALTA",
                    criado_em=datetime.now()
                ),
                OcorrenciaModel(
                    protocolo="CMS-2026-0002",
                    cidadao_nome="João Silva",
                    cidadao_telefone="(54) 99876-5432",
                    categoria=CategoriaProblema.PAVIMENTACAO.value,
                    descricao="Buraco grande na pista próximo à esquina da praça central, dificultando a passagem dos carros.",
                    localizacao="Rua Flores da Cunha, Centro - Sertão/RS",
                    fotos="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500",
                    status=StatusOcorrencia.EM_ANDAMENTO.value,
                    prioridade="ALTA",
                    criado_em=datetime.now()
                ),
                OcorrenciaModel(
                    protocolo="CMS-2026-0003",
                    cidadao_nome="Carlos Ferreira",
                    cidadao_telefone="(54) 99345-6789",
                    categoria=CategoriaProblema.LIMPEZA.value,
                    descricao="Acúmulo de galhos e entulhos na calçada após a chuva da última semana.",
                    localizacao="Rua Sete de Setembro, Bairro São José - Sertão/RS",
                    fotos="",
                    status=StatusOcorrencia.CONCLUIDO.value,
                    prioridade="BAIXA",
                    criado_em=datetime.now()
                ),
            ]
            db.add_all(exemplos)
            db.commit()
    finally:
        db.close()

popular_banco_se_vazio()

app = FastAPI(
    title="ComunicaSertão - API de Ocorrências",
    description="Back-end para recebimento de chamados via WhatsApp e integração com o Dashboard da Prefeitura de Sertão - RS.",
    version="1.0.0"
)

# Configuração de CORS para permitir que o Front-end em React consuma a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Garantir existência e montar pasta de arquivos de uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


def buscar_por_id_ou_protocolo(identificador: str, db: Session) -> OcorrenciaModel:
    """Permite buscar um chamado tanto pelo ID numérico quanto pelo protocolo (ex: CMS-2026-0001)."""
    identificador_limpo = identificador.strip().lstrip("#")
    ocorrencia = db.query(OcorrenciaModel).filter(OcorrenciaModel.protocolo == identificador_limpo).first()
    if not ocorrencia and identificador_limpo.isdigit():
        ocorrencia = db.query(OcorrenciaModel).filter(OcorrenciaModel.id == int(identificador_limpo)).first()
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    return ocorrencia


@app.get("/", tags=["Status"])
def root():
    return {
        "sistema": "ComunicaSertão API",
        "status": "online",
        "banco_de_dados": "SQLite (comunicasertao.db)",
        "simulador_chat": "/chat",
        "documentacao": "/docs"
    }

@app.post("/auth/login", tags=["Funcionários (Login)"])
def login_funcionario(credenciais: LoginRequest, db: Session = Depends(get_db)):
    """Autentica um funcionário da prefeitura no painel administrativo."""
    email_limpo = credenciais.email.strip().lower()
    funcionario = db.query(FuncionarioModel).filter(
        func.lower(FuncionarioModel.email) == email_limpo
    ).first()

    if not funcionario or funcionario.senha != credenciais.senha:
        raise HTTPException(status_code=401, detail="E-mail institucional ou senha incorretos.")

    return {
        "mensagem": "Login realizado com sucesso",
        "funcionario": funcionario.to_dict()
    }

@app.get("/funcionarios", tags=["Funcionários (Login)"])
def listar_funcionarios(db: Session = Depends(get_db)):
    """Lista os funcionários com acesso cadastrado no painel da prefeitura."""
    funcionarios = db.query(FuncionarioModel).order_by(FuncionarioModel.id.asc()).all()
    return [f.to_dict() for f in funcionarios]

@app.post("/funcionarios", status_code=201, tags=["Funcionários (Login)"])
def cadastrar_funcionario(dados: FuncionarioCreate, db: Session = Depends(get_db)):
    """Cria um novo acesso de funcionário para o painel da prefeitura."""
    email_limpo = dados.email.strip().lower()
    existente = db.query(FuncionarioModel).filter(
        func.lower(FuncionarioModel.email) == email_limpo
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Este e-mail institucional já possui acesso cadastrado.")

    novo = FuncionarioModel(
        nome=dados.nome.strip(),
        matricula=dados.matricula.strip(),
        email=email_limpo,
        senha=dados.senha,
        cargo=dados.cargo or "Servidor Municipal"
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo.to_dict()

@app.get("/chat", response_class=HTMLResponse, tags=["Simulador WhatsApp"])
def chat_visual():
    """Interface web visual estilo WhatsApp para demonstrar o fluxo conversacional."""
    return HTMLResponse(content=HTML_CHAT)

@app.get("/ocorrencias", response_model=List[OcorrenciaResponse], tags=["Ocorrências"])
def listar_ocorrencias(db: Session = Depends(get_db)):
    """Retorna todas as ocorrências cadastradas para o dashboard da prefeitura."""
    ocorrencias = db.query(OcorrenciaModel).order_by(OcorrenciaModel.id.desc()).all()
    return [o.to_dict() for o in ocorrencias]

@app.get("/ocorrencias/{identificador}", response_model=OcorrenciaResponse, tags=["Ocorrências"])
def obter_ocorrencia(identificador: str, db: Session = Depends(get_db)):
    """Busca uma ocorrência específica pelo ID numérico ou código de protocolo."""
    ocorrencia = buscar_por_id_ou_protocolo(identificador, db)
    return ocorrencia.to_dict()

@app.post("/ocorrencias", response_model=OcorrenciaResponse, status_code=201, tags=["Ocorrências"])
def criar_ocorrencia(dados: OcorrenciaCreate, db: Session = Depends(get_db)):
    """Cria uma nova ocorrência manualmente pelo painel da prefeitura ou API."""
    total = db.query(OcorrenciaModel).count() + 1
    protocolo = f"CMS-2026-{total:04d}"
    fotos_str = ",".join(dados.fotos) if dados.fotos else ""

    nova = OcorrenciaModel(
        protocolo=protocolo,
        cidadao_nome=dados.cidadao_nome,
        cidadao_telefone=dados.cidadao_telefone,
        categoria=dados.categoria,
        descricao=dados.descricao,
        localizacao=dados.localizacao,
        fotos=fotos_str,
        status=StatusOcorrencia.PENDENTE.value,
        prioridade=dados.prioridade or "MÉDIA"
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova.to_dict()

@app.patch("/ocorrencias/{identificador}/status", response_model=OcorrenciaResponse, tags=["Ocorrências"])
def atualizar_status(identificador: str, payload: OcorrenciaUpdateStatus, db: Session = Depends(get_db)):
    """Permite alterar o status no Dashboard (Pendente, Em Andamento, Concluído, Cancelado)."""
    ocorrencia = buscar_por_id_ou_protocolo(identificador, db)
    ocorrencia.status = payload.status
    db.commit()
    db.refresh(ocorrencia)
    return ocorrencia.to_dict()

@app.patch("/ocorrencias/{identificador}/prioridade", response_model=OcorrenciaResponse, tags=["Ocorrências"])
def atualizar_prioridade(identificador: str, payload: OcorrenciaUpdatePrioridade, db: Session = Depends(get_db)):
    """Permite alterar a prioridade do chamado no Dashboard (BAIXA, MÉDIA, ALTA)."""
    ocorrencia = buscar_por_id_ou_protocolo(identificador, db)
    ocorrencia.prioridade = payload.prioridade
    db.commit()
    db.refresh(ocorrencia)
    return ocorrencia.to_dict()

@app.get("/estatisticas", tags=["Dashboard"])
def obter_estatisticas(db: Session = Depends(get_db)):
    """Retorna os indicadores consolidados para a tela inicial do Dashboard."""
    ocorrencias = db.query(OcorrenciaModel).order_by(OcorrenciaModel.id.desc()).all()
    lista = [o.to_dict() for o in ocorrencias]

    total = len(lista)
    pendentes = sum(1 for o in lista if o["status"].lower() == "pendente")
    em_andamento = sum(1 for o in lista if o["status"].lower() == "em andamento")
    concluidos = sum(1 for o in lista if o["status"].lower() == "concluído")
    cancelados = sum(1 for o in lista if o["status"].lower() == "cancelado")

    categorias_padrao = [
        "Iluminação Pública",
        "Pavimentação",
        "Limpeza Urbana",
        "Água e Esgoto",
        "Poda de Árvores",
        "Outros"
    ]
    contagem_categorias = {cat: 0 for cat in categorias_padrao}
    for o in lista:
        cat = o["categoria"]
        contagem_categorias[cat] = contagem_categorias.get(cat, 0) + 1

    return {
        "total": total,
        "pendentes": pendentes,
        "em_andamento": em_andamento,
        "concluidos": concluidos,
        "cancelados": cancelados,
        "por_categoria": [
            {"nome": nome, "total": qtd} for nome, qtd in contagem_categorias.items()
        ],
        "recentes": lista[:5]
    }

@app.get("/cidadaos", tags=["Dashboard"])
def listar_cidadaos(db: Session = Depends(get_db)):
    """Agrupa os cidadãos que já abriram chamados no sistema para a aba Cidadãos do painel."""
    ocorrencias = db.query(OcorrenciaModel).order_by(OcorrenciaModel.id.desc()).all()
    mapa_cidadaos = {}

    for o in ocorrencias:
        chave = o.cidadao_telefone.strip() or o.cidadao_nome.strip()
        if chave not in mapa_cidadaos:
            iniciais = "".join([parte[0].upper() for parte in o.cidadao_nome.split()[:2] if parte]) or "CS"
            email_base = o.cidadao_nome.lower().split()[0] if o.cidadao_nome.split() else "cidadao"
            mapa_cidadaos[chave] = {
                "id": len(mapa_cidadaos) + 1,
                "iniciais": iniciais,
                "nome": o.cidadao_nome,
                "status": "Ativo",
                "telefone": o.cidadao_telefone,
                "email": f"{email_base}@email.com",
                "endereco": o.localizacao,
                "chamados": 1,
                "cadastro": o.criado_em.strftime("%d/%m/%Y") if o.criado_em else "Recente"
            }
        else:
            mapa_cidadaos[chave]["chamados"] += 1

    return list(mapa_cidadaos.values())

@app.post("/webhook/whatsapp", tags=["WhatsApp"])
def webhook_whatsapp(payload: dict):
    """Ponto de entrada para receber webhooks oficiais da API do WhatsApp."""
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
