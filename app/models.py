"""
Definição das Tabelas do Banco de Dados Relacional (SQLAlchemy Models).
Estes modelos representam a estrutura de dados persistida em disco.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class OcorrenciaModel(Base):
    __tablename__ = "ocorrencias"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    protocolo = Column(String(30), unique=True, index=True, nullable=False)
    cidadao_nome = Column(String(120), nullable=False)
    cidadao_telefone = Column(String(25), index=True, nullable=False)
    categoria = Column(String(60), nullable=False)
    descricao = Column(Text, nullable=False)
    localizacao = Column(String(255), nullable=False)
    fotos = Column(Text, default="", nullable=True)  # URLs separadas por vírgula ou JSON
    status = Column(String(30), default="Aberto", nullable=False)
    criado_em = Column(DateTime, default=datetime.now, nullable=False)

    def to_dict(self):
        """Converte o objeto do banco para dicionário compatível com o schema da API."""
        lista_fotos = [f.strip() for f in self.fotos.split(",") if f.strip()] if self.fotos else []
        return {
            "id": self.id,
            "protocolo": self.protocolo,
            "cidadao_nome": self.cidadao_nome,
            "cidadao_telefone": self.cidadao_telefone,
            "categoria": self.categoria,
            "descricao": self.descricao,
            "localizacao": self.localizacao,
            "fotos": lista_fotos,
            "status": self.status,
            "criado_em": self.criado_em
        }
