"""
Natural Language Processing Module for Nola Analytics
VERSÃO CORRIGIDA - Baseada na estrutura real do banco
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta, date
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class NaturalLanguageProcessor:
    """
    Processador NLP ajustado para a estrutura real do banco NOLA
    """
    
    def __init__(self, db: Session):
        self.db = db
        
        # Mapeamentos
        self.weekdays = {
            'segunda': 0, 'segunda-feira': 0,
            'terça': 1, 'terça-feira': 1, 'terca': 1,
            'quarta': 2, 'quarta-feira': 2,
            'quinta': 3, 'quinta-feira': 3,
            'sexta': 4, 'sexta-feira': 4,
            'sábado': 5, 'sabado': 5,
            'domingo': 6
        }
        
        self.day_periods = {
            'manhã': (6, 12), 'manha': (6, 12),
            'tarde': (12, 18),
            'noite': (18, 23),
            'madrugada': (0, 6)
        }
        
        self.channels = {
            'ifood': 'iFood',
            'rappi': 'Rappi',
            'uber': 'Uber Eats',
            'presencial': 'Presencial',
            'whatsapp': 'WhatsApp',
            'próprio': 'App Próprio', 'proprio': 'App Próprio'
        }
    
    def safe_execute(self, query: str, params: Dict = None):
        """
        Executa query com rollback automático em caso de erro
        """
        try:
            # Sempre fazer rollback antes para limpar transações com erro
            self.db.rollback()
            
            # Executar a query
            result = self.db.execute(text(query), params or {})
            return result
            
        except Exception as e:
            # Rollback em caso de erro
            self.db.rollback()
            logger.error(f"Erro na query: {str(e)}")
            raise e
    
    def extract_time_context(self, query: str) -> Dict[str, Any]:
        """
        Extrai contexto temporal da query
        """
        context = {
            'date_range': None,
            'weekday': None,
            'period': None,
            'specific_date': None
        }
        
        query_lower = query.lower()
        today = date.today()
        
        if 'ontem' in query_lower:
            context['specific_date'] = today - timedelta(days=1)
        elif 'hoje' in query_lower:
            context['specific_date'] = today
        elif 'semana passada' in query_lower or 'última semana' in query_lower:
            context['date_range'] = (today - timedelta(days=7), today)
        elif 'últimos 30 dias' in query_lower:
            context['date_range'] = (today - timedelta(days=30), today)
        elif 'últimos 7 dias' in query_lower:
            context['date_range'] = (today - timedelta(days=7), today)
        
        return context
    
    def extract_channel_context(self, query: str) -> Optional[str]:
        """
        Extrai canal mencionado na query
        """
        query_lower = query.lower()
        for channel_key, channel_name in self.channels.items():
            if channel_key in query_lower:
                return channel_name
        return None
    
    def extract_metric_context(self, query: str) -> str:
        """
        Detecta qual métrica está sendo perguntada
        """
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['vendi', 'vendeu', 'vendas', 'faturamento', 'receita']):
            return 'revenue'
        elif any(word in query_lower for word in ['ticket médio', 'ticket medio', 'valor médio']):
            return 'avg_ticket'
        elif any(word in query_lower for word in ['pedidos', 'orders', 'quantos pedidos']):
            return 'orders'
        elif any(word in query_lower for word in ['produto', 'item', 'prato', 'lanche']):
            return 'products'
        elif any(word in query_lower for word in ['cliente', 'consumidor', 'comprador']):
            return 'customers'
        elif any(word in query_lower for word in ['canal', 'melhor canal']):
            return 'channel'
        
        return 'general'
    
    def process_simple_ticket_query(self, query: str) -> str:
        """
        Calcula ticket médio baseado na estrutura real:
        - Tabela sales (vendas principais)
        - Tabela product_sales (itens vendidos com preços)
        """
        try:
            # Calcular ticket médio somando todos os product_sales por venda
            ticket_query = """
                SELECT 
                    COALESCE(AVG(sale_total.total), 0) as current_avg,
                    COUNT(DISTINCT sale_total.sale_id) as total_sales,
                    COALESCE(MIN(sale_total.total), 0) as min_ticket,
                    COALESCE(MAX(sale_total.total), 0) as max_ticket
                FROM (
                    SELECT 
                        s.id as sale_id,
                        SUM(ps.total_price) as total
                    FROM sales s
                    JOIN product_sales ps ON s.id = ps.sale_id
                    WHERE s.created_at >= :start_date
                    GROUP BY s.id
                ) as sale_total
            """
            
            start_date = date.today() - timedelta(days=30)
            result = self.safe_execute(ticket_query, {'start_date': start_date})
            data = result.fetchone()
            
            if not data or data[0] == 0:
                return "Não há dados suficientes para calcular o ticket médio."
            
            # Comparar com período anterior
            prev_query = """
                SELECT COALESCE(AVG(sale_total.total), 0) as prev_avg
                FROM (
                    SELECT 
                        s.id as sale_id,
                        SUM(ps.total_price) as total
                    FROM sales s
                    JOIN product_sales ps ON s.id = ps.sale_id
                    WHERE s.created_at BETWEEN :start_date AND :end_date
                    GROUP BY s.id
                ) as sale_total
            """
            
            prev_start = start_date - timedelta(days=30)
            prev_end = start_date - timedelta(days=1)
            
            result = self.safe_execute(prev_query, {
                'start_date': prev_start,
                'end_date': prev_end
            })
            prev_data = result.fetchone()
            
            # Calcular variação
            variation = 0
            if prev_data and prev_data[0] > 0:
                variation = ((data[0] - prev_data[0]) / prev_data[0]) * 100
            
            # Formatar resposta
            answer = f"💳 **Ticket Médio: R$ {data[0]:.2f}**\n\n"
            
            if variation > 0:
                answer += f"📈 Aumento de {variation:.1f}% vs período anterior\n"
            elif variation < 0:
                answer += f"📉 Redução de {abs(variation):.1f}% vs período anterior\n"
            else:
                answer += "➡️ Estável em relação ao período anterior\n"
            
            answer += f"\n📊 **Estatísticas (últimos 30 dias):**\n"
            answer += f"• Total de vendas: {data[1]}\n"
            answer += f"• Menor ticket: R$ {data[2]:.2f}\n"
            answer += f"• Maior ticket: R$ {data[3]:.2f}"
            
            return answer
            
        except Exception as e:
            logger.error(f"Erro em ticket query: {str(e)}")
            return f"Erro ao calcular ticket médio: {str(e)[:100]}"
    
    def process_revenue_query(self, query: str, time_context: Dict, channel: Optional[str]) -> str:
        """
        Processa queries sobre faturamento
        Usa a estrutura real: sales + product_sales + channels
        """
        try:
            sql_conditions = []
            params = {}
            
            # Query ajustada para estrutura real
            base_query = """
                SELECT 
                    COUNT(DISTINCT s.id) as total_sales,
                    COALESCE(SUM(ps.total_price), 0) as total_revenue,
                    COALESCE(AVG(sale_totals.sale_total), 0) as avg_ticket
                FROM sales s
                JOIN product_sales ps ON s.id = ps.sale_id
                LEFT JOIN channels ch ON s.channel_id = ch.id
                LEFT JOIN (
                    SELECT sale_id, SUM(total_price) as sale_total
                    FROM product_sales
                    GROUP BY sale_id
                ) sale_totals ON s.id = sale_totals.sale_id
                WHERE 1=1
            """
            
            # Adicionar filtro de canal
            if channel:
                sql_conditions.append("AND ch.name ILIKE :channel")
                params['channel'] = f'%{channel}%'
            
            # Adicionar filtro de tempo
            if time_context.get('specific_date'):
                sql_conditions.append("AND DATE(s.created_at) = :specific_date")
                params['specific_date'] = time_context['specific_date']
            elif time_context.get('date_range'):
                start_date, end_date = time_context['date_range']
                sql_conditions.append("AND DATE(s.created_at) BETWEEN :start_date AND :end_date")
                params['start_date'] = start_date
                params['end_date'] = end_date
            else:
                # Default: últimos 30 dias
                sql_conditions.append("AND s.created_at >= :start_date")
                params['start_date'] = date.today() - timedelta(days=30)
            
            # Executar query
            full_query = base_query + " ".join(sql_conditions)
            result = self.safe_execute(full_query, params)
            data = result.fetchone()
            
            if not data or data[0] == 0:
                msg = "Não encontrei vendas"
                if channel:
                    msg += f" para o {channel}"
                if time_context.get('specific_date'):
                    if time_context['specific_date'] == date.today() - timedelta(days=1):
                        msg += " ontem"
                    elif time_context['specific_date'] == date.today():
                        msg += " hoje"
                return msg + "."
            
            # Formatar resposta
            answer = f"💰 **Faturamento: R$ {data[1]:,.2f}**\n\n"
            
            answer += "📅 "
            if time_context.get('specific_date'):
                if time_context['specific_date'] == date.today():
                    answer += "Hoje"
                elif time_context['specific_date'] == date.today() - timedelta(days=1):
                    answer += "Ontem"
                else:
                    answer += time_context['specific_date'].strftime('%d/%m/%Y')
            elif time_context.get('date_range'):
                start, end = time_context['date_range']
                answer += f"{start.strftime('%d/%m')} até {end.strftime('%d/%m')}"
            else:
                answer += "Últimos 30 dias"
            
            if channel:
                answer += f" | 🏪 {channel}"
            
            answer += f"\n\n📊 **Detalhes:**\n"
            answer += f"• Total de vendas: {data[0]}\n"
            answer += f"• Ticket médio: R$ {data[2]:.2f}"
            
            return answer
            
        except Exception as e:
            logger.error(f"Erro em revenue query: {str(e)}")
            return f"Erro ao processar consulta de faturamento: {str(e)[:100]}"
    
    def process_products_query(self, query: str) -> str:
        """
        Processa queries sobre produtos mais vendidos
        Usa: products + product_sales
        """
        try:
            products_query = """
                SELECT 
                    p.name as product_name,
                    COUNT(DISTINCT ps.sale_id) as times_sold,
                    SUM(ps.quantity) as total_quantity,
                    SUM(ps.total_price) as revenue
                FROM product_sales ps
                JOIN products p ON ps.product_id = p.id
                JOIN sales s ON ps.sale_id = s.id
                WHERE s.created_at >= :start_date
                GROUP BY p.name
                ORDER BY times_sold DESC
                LIMIT 5
            """
            
            start_date = date.today() - timedelta(days=30)
            result = self.safe_execute(products_query, {'start_date': start_date})
            products = result.fetchall()
            
            if not products:
                return "Não encontrei produtos vendidos no período."
            
            answer = "📊 **Produtos Mais Vendidos (últimos 30 dias):**\n\n"
            for i, prod in enumerate(products, 1):
                answer += f"{i}. **{prod[0]}**\n"
                answer += f"   • {prod[1]} vendas\n"
                answer += f"   • Quantidade: {prod[2]:.0f} unidades\n"
                answer += f"   • Receita: R$ {prod[3]:,.2f}\n\n"
            
            return answer
            
        except Exception as e:
            logger.error(f"Erro em products query: {str(e)}")
            return f"Erro ao buscar produtos: {str(e)[:100]}"
    
    def process_best_channel_query(self, query: str) -> str:
        """
        Processa query sobre melhor canal
        Usa: channels + sales + product_sales
        """
        try:
            channel_query = """
                SELECT 
                    ch.name as channel_name,
                    COUNT(DISTINCT s.id) as total_sales,
                    COALESCE(SUM(ps.total_price), 0) as revenue,
                    COALESCE(AVG(sale_totals.sale_total), 0) as avg_ticket
                FROM sales s
                JOIN channels ch ON s.channel_id = ch.id
                JOIN product_sales ps ON s.id = ps.sale_id
                LEFT JOIN (
                    SELECT sale_id, SUM(total_price) as sale_total
                    FROM product_sales
                    GROUP BY sale_id
                ) sale_totals ON s.id = sale_totals.sale_id
                WHERE s.created_at >= :start_date
                GROUP BY ch.name
                ORDER BY revenue DESC
            """
            
            start_date = date.today() - timedelta(days=30)
            result = self.safe_execute(channel_query, {'start_date': start_date})
            channels = result.fetchall()
            
            if not channels:
                return "Não há dados de canais disponíveis."
            
            best = channels[0]
            answer = f"🏆 **Melhor Canal: {best[0]}**\n\n"
            answer += f"📊 **Performance (últimos 30 dias):**\n"
            answer += f"• Faturamento: R$ {best[2]:,.2f}\n"
            answer += f"• Total de vendas: {best[1]}\n"
            answer += f"• Ticket médio: R$ {best[3]:.2f}\n\n"
            
            if len(channels) > 1:
                answer += "**Outros canais:**\n"
                for ch in channels[1:3]:
                    answer += f"• {ch[0]}: R$ {ch[2]:,.2f} ({ch[1]} vendas)\n"
            
            return answer
            
        except Exception as e:
            logger.error(f"Erro em channel query: {str(e)}")
            return f"Erro ao analisar canais: {str(e)[:100]}"
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """
        Processa a query principal e retorna resposta estruturada
        """
        try:
            # Sempre limpar transações com erro antes de começar
            self.db.rollback()
            
            # Extrair contextos
            time_context = self.extract_time_context(query)
            channel = self.extract_channel_context(query)
            metric = self.extract_metric_context(query)
            
            query_lower = query.lower()
            
            # Determinar tipo de query e processar
            if ('ticket médio' in query_lower or 'ticket medio' in query_lower):
                answer = self.process_simple_ticket_query(query)
                interpretation = 'ticket_simple'
            
            elif metric == 'revenue' or any(word in query_lower for word in ['vendi', 'vendeu', 'faturamento']):
                answer = self.process_revenue_query(query, time_context, channel)
                interpretation = 'revenue_query'
            
            elif metric == 'products' or 'produto mais vendido' in query_lower:
                answer = self.process_products_query(query)
                interpretation = 'product_query'
            
            elif 'melhor canal' in query_lower or metric == 'channel':
                answer = self.process_best_channel_query(query)
                interpretation = 'channel_query'
            
            else:
                answer = (
                    "Desculpe, não entendi completamente sua pergunta. Posso ajudar com:\n\n"
                    "• **Vendas**: 'Quanto vendi ontem?'\n"
                    "• **Produtos**: 'Qual o produto mais vendido?'\n"
                    "• **Ticket médio**: 'Mostre o ticket médio'\n"
                    "• **Canais**: 'Qual o melhor canal de vendas?'\n"
                )
                interpretation = 'help'
            
            # Determinar confiança
            confidence = 0.9 if interpretation != 'help' else 0.3
            
            return {
                'answer': answer,
                'interpretation': interpretation,
                'confidence': confidence,
                'context': {
                    'time': time_context,
                    'channel': channel,
                    'metric': metric
                }
            }
            
        except Exception as e:
            # Sempre fazer rollback em caso de erro
            self.db.rollback()
            logger.error(f"Erro geral no NLP: {str(e)}")
            
            return {
                'answer': f"Erro ao processar pergunta. Tente novamente.",
                'interpretation': 'error',
                'confidence': 0.0,
                'context': {}
            }