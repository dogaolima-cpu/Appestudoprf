from app.database import engine, Base, SessionLocal
from app.models import Subject, CebraspeBlock

def seed():
    # Cria todas as tabelas no banco de dados ativo (SQLite local ou PostgreSQL na nuvem)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Verifica se as disciplinas já foram inseridas
        if db.query(Subject).count() > 0:
            print("Disciplinas da PRF já cadastradas.")
            return

        materias = [
            # Bloco I - 55 itens esperados (Peso intermediário)
            {"name": "Língua Portuguesa", "block": CebraspeBlock.BLOCO_1, "weight": 5, "expected": 20},
            {"name": "Raciocínio Lógico-Matemático", "block": CebraspeBlock.BLOCO_1, "weight": 3, "expected": 8},
            {"name": "Informática", "block": CebraspeBlock.BLOCO_1, "weight": 3, "expected": 6},
            {"name": "Noções de Física", "block": CebraspeBlock.BLOCO_1, "weight": 2, "expected": 5},
            {"name": "Ética e Cidadania", "block": CebraspeBlock.BLOCO_1, "weight": 1, "expected": 4},
            {"name": "Geopolítica Brasileira", "block": CebraspeBlock.BLOCO_1, "weight": 1, "expected": 4},
            {"name": "Língua Estrangeira (Inglês/Espanhol)", "block": CebraspeBlock.BLOCO_1, "weight": 2, "expected": 8},

            # Bloco II - 30 itens (Peso vital: 25% da prova, Peso 10)
            {"name": "Legislação de Trânsito (CTB e Resoluções)", "block": CebraspeBlock.BLOCO_2, "weight": 10, "expected": 30},

            # Bloco III - 35 itens (Conhecimentos Jurídicos)
            {"name": "Direito Administrativo", "block": CebraspeBlock.BLOCO_3, "weight": 4, "expected": 7},
            {"name": "Direito Constitucional", "block": CebraspeBlock.BLOCO_3, "weight": 4, "expected": 7},
            {"name": "Direito Penal", "block": CebraspeBlock.BLOCO_3, "weight": 3, "expected": 6},
            {"name": "Direito Processual Penal", "block": CebraspeBlock.BLOCO_3, "weight": 3, "expected": 6},
            {"name": "Legislação Especial", "block": CebraspeBlock.BLOCO_3, "weight": 3, "expected": 5},
            {"name": "Direitos Humanos", "block": CebraspeBlock.BLOCO_3, "weight": 2, "expected": 4},
        ]

        for m in materias:
            subject = Subject(
                name=m["name"],
                block=m["block"],
                weight=m["weight"],
                expected_questions=m["expected"]
            )
            db.add(subject)
        
        db.commit()
        print(f"Sucesso: {len(materias)} disciplinas da PRF inseridas.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
