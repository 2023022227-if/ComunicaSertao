"""
Definição das Tabelas do Banco de Dados Relacional (SQLAlchemy Models).
Estes modelos representam a estrutura de dados persistida em disco.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

API_BASE_URL = "http://127.0.0.1:8000"


class FuncionarioModel(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(120), nullable=False)
    matricula = Column(String(30), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    senha = Column(String(120), nullable=False)
    cargo = Column(String(80), default="Servidor Municipal", nullable=False)
    criado_em = Column(DateTime, default=datetime.now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "matricula": self.matricula,
            "email": self.email,
            "cargo": self.cargo,
            "criado_em": self.criado_em.strftime("%d/%m/%Y") if self.criado_em else "Hoje"
        }


class OcorrenciaModel(Base):
    __tablename__ = "ocorrencias"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    protocolo = Column(String(30), unique=True, index=True, nullable=False)
    cidadao_nome = Column(String(120), nullable=False)
    cidadao_telefone = Column(String(25), index=True, nullable=False)
    categoria = Column(String(60), nullable=False)
    descricao = Column(Text, nullable=False)
    localizacao = Column(String(255), nullable=False)
    fotos = Column(Text, default="", nullable=True)  # URLs separadas por vírgula
    status = Column(String(30), default="Pendente", nullable=False)
    prioridade = Column(String(20), default="MÉDIA", nullable=False)
    criado_em = Column(DateTime, default=datetime.now, nullable=False)

    def to_dict(self):
        """Converte o objeto do banco para dicionário compatível com a API e o Painel da Prefeitura."""
        brutas = [f.strip() for f in self.fotos.split(",") if f.strip()] if self.fotos else []
        lista_fotos = [
            f"{API_BASE_URL}{f}" if f.startswith("/uploads/") else f
            for f in brutas
        ]
        data_formatada = self.criado_em.strftime("%d/%m/%Y %H:%M") if self.criado_em else "Hoje"

        return {
            "id": self.protocolo,
            "numeric_id": self.id,
            "protocolo": self.protocolo,
            "autor": self.cidadao_nome,
            "cidadao_nome": self.cidadao_nome,
            "cidadao_telefone": self.cidadao_telefone,
            "titulo": self.categoria,
            "categoria": self.categoria,
            "descricao": self.descricao,
            "local": self.localizacao,
            "localizacao": self.localizacao,
            "fotos": lista_fotos,
            "status": self.status,
            "prioridade": self.prioridade or "MÉDIA",
            "tempo": data_formatada,
            "mensagens": 1,
            "anexos": len(lista_fotos),
            "criado_em": self.criado_em
        }
