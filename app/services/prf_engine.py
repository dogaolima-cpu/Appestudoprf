from typing import List, Dict, Any
from app.models import QuestionLog, QuestionResult, CebraspeBlock, Subject

def calculate_cebraspe_metrics(logs: List[QuestionLog], subjects: List[Subject]) -> Dict[str, Any]:
    """
    Regra Oficial CEBRASPE para a PRF:
    - 1 Questão Errada ANULA 1 Questão Certa (Líquido = Certo - Errado)
    - Questão em Branco não soma nem subtrai
    - Mínimos eliminatórios do Edital:
        * Bloco I >= 10 pontos líquidos
        * Bloco II >= 10 pontos líquidos (Trânsito - Peso Máximo)
        * Bloco III >= 10 pontos líquidos
        * Total Geral da Prova Objetiva >= 48 pontos líquidos
    """
    subject_map = {s.id: s for s in subjects}

    total_certo = 0
    total_errado = 0
    total_branco = 0

    block_data: Dict[str, Dict[str, int]] = {
        CebraspeBlock.BLOCO_1.value: {"certo": 0, "errado": 0, "branco": 0, "min": 10},
        CebraspeBlock.BLOCO_2.value: {"certo": 0, "errado": 0, "branco": 0, "min": 10},
        CebraspeBlock.BLOCO_3.value: {"certo": 0, "errado": 0, "branco": 0, "min": 10},
    }

    # Contagem por disciplina
    subject_stats = {}
    for s in subjects:
        subject_stats[s.id] = {
            "id": s.id,
            "name": s.name,
            "block": s.block.value,
            "weight": s.weight,
            "expected_questions": s.expected_questions,
            "certo": 0,
            "errado": 0,
            "branco": 0,
            "total": 0,
            "liquid": 0,
            "accuracy": 0.0,
            "error_rate": 0.0,
        }

    for log in logs:
        s = subject_map.get(log.subject_id)
        if not s:
            continue
        blk = s.block.value

        if log.result == QuestionResult.CERTO:
            total_certo += 1
            block_data[blk]["certo"] += 1
            subject_stats[s.id]["certo"] += 1
        elif log.result == QuestionResult.ERRADO:
            total_errado += 1
            block_data[blk]["errado"] += 1
            subject_stats[s.id]["errado"] += 1
        elif log.result == QuestionResult.BRANCO:
            total_branco += 1
            block_data[blk]["branco"] += 1
            subject_stats[s.id]["branco"] += 1

        subject_stats[s.id]["total"] += 1

    total_questions = total_certo + total_errado + total_branco
    liquid_total = total_certo - total_errado
    marked = total_certo + total_errado
    efficiency = round((liquid_total / marked * 100), 1) if marked > 0 else 0.0
    accuracy = round((total_certo / marked * 100), 1) if marked > 0 else 0.0

    # Diagnóstico por Bloco
    blocks_report = {}
    any_block_failed = False
    for blk_name, counts in block_data.items():
        blk_liquid = counts["certo"] - counts["errado"]
        passed = blk_liquid >= counts["min"]
        if not passed:
            any_block_failed = True
        
        blk_marked = counts["certo"] + counts["errado"]
        blk_eff = round((blk_liquid / blk_marked * 100), 1) if blk_marked > 0 else 0.0
        blocks_report[blk_name] = {
            "certo": counts["certo"],
            "errado": counts["errado"],
            "branco": counts["branco"],
            "liquid": blk_liquid,
            "min_required": counts["min"],
            "passed": passed,
            "efficiency": blk_eff
        }

    for s_id, s_data in subject_stats.items():
        s_marked = s_data["certo"] + s_data["errado"]
        s_data["liquid"] = s_data["certo"] - s_data["errado"]
        s_data["accuracy"] = round((s_data["certo"] / s_marked * 100), 1) if s_marked > 0 else 0.0
        s_data["error_rate"] = round((s_data["errado"] / s_marked * 100), 1) if s_marked > 0 else 0.0

    general_passed = liquid_total >= 48 and not any_block_failed

    return {
        "total_questions": total_questions,
        "certo": total_certo,
        "errado": total_errado,
        "branco": total_branco,
        "liquid_total": liquid_total,
        "accuracy": accuracy,
        "efficiency": efficiency,
        "eliminated_by_minima": any_block_failed,
        "general_passed": general_passed,
        "blocks": blocks_report,
        "subjects": list(subject_stats.values())
    }
