# app/services/nlp_utils.py
import re
from datetime import date, timedelta
from typing import Optional, Tuple, Dict, Any

def infer_timerange_from_text(q: str, today: Optional[date] = None) -> Tuple[date, date]:
    today = today or date.today()
    text = q.lower().strip()

    # Portuguese keywords
    if "ontem" in text:
        d = today - timedelta(days=1)
        return d, d
    if "anteontem" in text:
        d = today - timedelta(days=2)
        return d, d
    if "hoje" in text or "agora" in text:
        return today, today
    if "semana passada" in text:
        end = today - timedelta(days=today.weekday() + 1)
        start = end - timedelta(days=6)
        return start, end
    if "última semana" in text:
        end = today - timedelta(days=today.weekday() + 1)
        start = end - timedelta(days=6)
        return start, end
    if "mês passado" in text:
        first_this_month = today.replace(day=1)
        last_month_end = first_this_month - timedelta(days=1)
        start = last_month_end.replace(day=1)
        return start, last_month_end
    if "esta semana" in text or "semana atual" in text:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        return start, end
    if "mês atual" in text or "este mês" in text:
        start = today.replace(day=1)
        return start, today

    # English fallback
    if "yesterday" in text:
        d = today - timedelta(days=1)
        return d, d
    if "today" in text:
        return today, today
    if "last week" in text:
        end = today - timedelta(days=today.weekday() + 1)
        start = end - timedelta(days=6)
        return start, end
    if "this week" in text:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        return start, end
    if "last month" in text:
        first_this_month = today.replace(day=1)
        last_month_end = first_this_month - timedelta(days=1)
        start = last_month_end.replace(day=1)
        return start, last_month_end
    if "this month" in text:
        start = today.replace(day=1)
        return start, today

    # Default = today
    return today, today

def pick_timerange(query: str, context: Optional[Dict[str, Any]] = None, today: Optional[date] = None) -> Tuple[date, date]:
    """
    Decide which date range to use for NLP queries.
    Priority:
      1. context.start_date/end_date if provided
      2. inferred from natural language text
      3. fallback = today
    """
    today = today or date.today()
    context = context or {}
    if context.get("start_date") and context.get("end_date"):
        return date.fromisoformat(context["start_date"]), date.fromisoformat(context["end_date"])
    return infer_timerange_from_text(query, today)