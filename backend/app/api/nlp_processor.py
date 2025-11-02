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
    
    def process_query(self, query: str, context: Dict = None) -> Dict[str, Any]:
        """
        Processa a query principal - VERSÃO SIMPLIFICADA E FUNCIONAL
        """
        try:
            # Rollback de transações pendentes
            self.db.rollback()
            
            query_lower = query.lower()
            
            # 1. VENDAS/FATURAMENTO
            if any(word in query_lower for word in ['vendi', 'vendeu', 'faturamento', 'quanto']):
                # Verificar período
                if 'ontem' in query_lower:
                    yesterday = date.today() - timedelta(days=1)
                    result = self.db.execute(
                        text("""
                            SELECT 
                                COUNT(*) as count,
                                COALESCE(SUM(total_amount), 0) as revenue,
                                COALESCE(AVG(total_amount), 0) as avg_ticket
                            FROM sales
                            WHERE DATE(created_at) = :date
                        """),
                        {"date": yesterday}
                    ).fetchone()
                    
                    if result:
                        answer = f"📊 **Vendas de Ontem ({yesterday.strftime('%d/%m/%Y')})**\n\n"
                        answer += f"• Total de vendas: {result[0]}\n"
                        answer += f"• Faturamento: R$ {result[1]:,.2f}\n"
                        answer += f"• Ticket médio: R$ {result[2]:.2f}"
                    else:
                        answer = "Não houve vendas ontem."
                        
                elif 'hoje' in query_lower:
                    today = date.today()
                    result = self.db.execute(
                        text("""
                            SELECT 
                                COUNT(*) as count,
                                COALESCE(SUM(total_amount), 0) as revenue,
                                COALESCE(AVG(total_amount), 0) as avg_ticket
                            FROM sales
                            WHERE DATE(created_at) = :date
                        """),
                        {"date": today}
                    ).fetchone()
                    
                    if result:
                        answer = f"📊 **Vendas de Hoje ({today.strftime('%d/%m/%Y')})**\n\n"
                        answer += f"• Total de vendas: {result[0]}\n"
                        answer += f"• Faturamento: R$ {result[1]:,.2f}\n"
                        answer += f"• Ticket médio: R$ {result[2]:.2f}"
                    else:
                        answer = "Ainda não há vendas hoje."
                        
                else:
                    # Últimos 30 dias
                    result = self.db.execute(
                        text("""
                            SELECT 
                                COUNT(*) as count,
                                COALESCE(SUM(total_amount), 0) as revenue,
                                COALESCE(AVG(total_amount), 0) as avg_ticket
                            FROM sales
                            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                        """)
                    ).fetchone()
                    
                    if result:
                        answer = f"📊 **Vendas dos Últimos 30 Dias**\n\n"
                        answer += f"• Total de vendas: {result[0]}\n"
                        answer += f"• Faturamento: R$ {result[1]:,.2f}\n"
                        answer += f"• Ticket médio: R$ {result[2]:.2f}"
                    else:
                        answer = "Não há dados de vendas disponíveis."
                
                return {
                    'query': query,
                    'answer': answer,
                    'interpretation': 'revenue_query',
                    'confidence': 0.9,
                    'context': {}
                }
            
            # 2. PRODUTO MAIS VENDIDO
            elif 'produto' in query_lower and ('mais' in query_lower or 'vendido' in query_lower):
                result = self.db.execute(
                    text("""
                        SELECT 
                            p.name,
                            SUM(si.quantity) as total_qty,
                            COUNT(DISTINCT si.sale_id) as times_sold,
                            SUM(si.total_price) as revenue
                        FROM products p
                        JOIN sale_items si ON p.id = si.product_id
                        WHERE si.sale_id IN (
                            SELECT id FROM sales 
                            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                        )
                        GROUP BY p.id, p.name
                        ORDER BY total_qty DESC
                        LIMIT 5
                    """)
                ).fetchall()
                
                if result:
                    top = result[0]
                    answer = f"🏆 **Produto Mais Vendido: {top[0]}**\n\n"
                    answer += f"📊 **Performance (últimos 30 dias):**\n"
                    answer += f"• Quantidade vendida: {top[1]} unidades\n"
                    answer += f"• Vendido em: {top[2]} pedidos\n"
                    answer += f"• Faturamento: R$ {top[3]:,.2f}\n\n"
                    
                    if len(result) > 1:
                        answer += "**Outros produtos populares:**\n"
                        for prod in result[1:4]:
                            answer += f"• {prod[0]}: {prod[1]} unidades\n"
                else:
                    answer = "Não há dados de produtos vendidos."
                
                return {
                    'query': query,
                    'answer': answer,
                    'interpretation': 'product_query',
                    'confidence': 0.9,
                    'context': {}
                }
            
            # 3. TICKET MÉDIO
            elif 'ticket' in query_lower and ('médio' in query_lower or 'medio' in query_lower):
                result = self.db.execute(
                    text("""
                        SELECT 
                            AVG(total_amount) as avg_ticket,
                            COUNT(*) as total_sales,
                            MIN(total_amount) as min_ticket,
                            MAX(total_amount) as max_ticket
                        FROM sales
                        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    """)
                ).fetchone()
                
                if result and result[1] > 0:
                    answer = f"💰 **Ticket Médio (últimos 30 dias)**\n\n"
                    answer += f"• Valor médio: R$ {result[0]:.2f}\n"
                    answer += f"• Total de vendas: {result[1]}\n"
                    answer += f"• Menor ticket: R$ {result[2]:.2f}\n"
                    answer += f"• Maior ticket: R$ {result[3]:.2f}"
                else:
                    answer = "Não há dados para calcular o ticket médio."
                
                return {
                    'query': query,
                    'answer': answer,
                    'interpretation': 'ticket_query',
                    'confidence': 0.95,
                    'context': {}
                }
            
            # 4. MELHOR CANAL
            elif 'canal' in query_lower or ('melhor' in query_lower and 'venda' in query_lower):
                result = self.db.execute(
                    text("""
                        SELECT 
                            ch.name,
                            COUNT(*) as total_sales,
                            COALESCE(SUM(s.total_amount), 0) as revenue,
                            COALESCE(AVG(s.total_amount), 0) as avg_ticket
                        FROM channels ch
                        JOIN sales s ON ch.id = s.channel_id
                        WHERE s.created_at >= CURRENT_DATE - INTERVAL '30 days'
                        GROUP BY ch.id, ch.name
                        ORDER BY revenue DESC
                        LIMIT 5
                    """)
                ).fetchall()
                
                if result:
                    best = result[0]
                    answer = f"🏆 **Melhor Canal: {best[0]}**\n\n"
                    answer += f"📊 **Performance (últimos 30 dias):**\n"
                    answer += f"• Faturamento: R$ {best[2]:,.2f}\n"
                    answer += f"• Total de vendas: {best[1]}\n"
                    answer += f"• Ticket médio: R$ {best[3]:.2f}\n\n"
                    
                    if len(result) > 1:
                        answer += "**Outros canais:**\n"
                        for ch in result[1:3]:
                            answer += f"• {ch[0]}: R$ {ch[2]:,.2f}\n"
                else:
                    answer = "Não há dados de canais disponíveis."
                
                return {
                    'query': query,
                    'answer': answer,
                    'interpretation': 'channel_query',
                    'confidence': 0.9,
                    'context': {}
                }
            
            # 5. RESPOSTA PADRÃO
            else:
                answer = (
                    "Desculpe, não entendi completamente sua pergunta. Posso ajudar com:\n\n"
                    "• **Vendas**: 'Quanto vendi ontem?'\n"
                    "• **Produtos**: 'Qual o produto mais vendido?'\n"
                    "• **Ticket médio**: 'Mostre o ticket médio'\n"
                    "• **Canais**: 'Qual o melhor canal de vendas?'\n"
                )
                
                return {
                    'query': query,
                    'answer': answer,
                    'interpretation': 'help',
                    'confidence': 0.3,
                    'context': {}
                }
            
        except Exception as e:
            # Rollback em caso de erro
            self.db.rollback()
            logger.error(f"Erro no process_query: {str(e)}")
            
            return {
                'query': query,
                'answer': 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
                'interpretation': 'error',
                'confidence': 0.0,
                'context': {}
            }

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

def process_complex_product_query(self, query: str) -> Dict[str, Any]:
    """
    Processa queries complexas sobre produtos com múltiplos filtros
    Ex: "Qual produto vende mais na quinta à noite no iFood?"
    """
    try:
        query_lower = query.lower()
        
        # Extrair contextos
        day_of_week = None
        time_period = None
        channel = None
        
        # Detectar dia da semana
        for day, day_num in self.weekdays.items():
            if day in query_lower:
                day_of_week = day_num
                break
        
        # Detectar período do dia
        for period, (start_hour, end_hour) in self.day_periods.items():
            if period in query_lower:
                time_period = (start_hour, end_hour)
                break
        
        # Detectar canal
        for ch_key, ch_name in self.channels.items():
            if ch_key in query_lower:
                channel = ch_name
                break
        
        # Construir query SQL dinâmica
        query_parts = ["""
            SELECT 
                p.name as product_name,
                SUM(si.quantity) as total_quantity,
                COUNT(DISTINCT s.id) as total_orders,
                SUM(si.total_price) as revenue,
                AVG(si.unit_price) as avg_price
            FROM products p
            JOIN sale_items si ON p.id = si.product_id
            JOIN sales s ON si.sale_id = s.id
        """]
        
        conditions = ["s.created_at >= CURRENT_DATE - INTERVAL '30 days'"]
        
        # Adicionar JOIN de canal se necessário
        if channel:
            query_parts.append("JOIN channels ch ON s.channel_id = ch.id")
            conditions.append(f"ch.name = '{channel}'")
        
        # Filtro de dia da semana
        if day_of_week is not None:
            conditions.append(f"EXTRACT(DOW FROM s.created_at) = {day_of_week}")
        
        # Filtro de período do dia
        if time_period:
            conditions.append(f"EXTRACT(HOUR FROM s.created_at) >= {time_period[0]}")
            conditions.append(f"EXTRACT(HOUR FROM s.created_at) < {time_period[1]}")
        
        # Montar query completa
        if conditions:
            query_parts.append("WHERE " + " AND ".join(conditions))
        
        query_parts.append("""
            GROUP BY p.id, p.name
            ORDER BY total_quantity DESC
            LIMIT 5
        """)
        
        final_query = " ".join(query_parts)
        result = self.db.execute(text(final_query)).fetchall()
        
        if result:
            # Construir resposta
            filters_desc = []
            if day_of_week is not None:
                days = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
                filters_desc.append(f"às {days[day_of_week]}s")
            if time_period:
                for period, hours in self.day_periods.items():
                    if hours == time_period:
                        filters_desc.append(f"no período da {period}")
                        break
            if channel:
                filters_desc.append(f"no {channel}")
            
            filter_text = " ".join(filters_desc) if filters_desc else "geral"
            
            top = result[0]
            answer = f"📊 **Produto mais vendido {filter_text}:**\n\n"
            answer += f"🏆 **{top[0]}**\n"
            answer += f"• Quantidade: {top[1]} unidades\n"
            answer += f"• Pedidos: {top[2]}\n"
            answer += f"• Faturamento: R$ {top[3]:,.2f}\n"
            answer += f"• Preço médio: R$ {top[4]:.2f}\n\n"
            
            if len(result) > 1:
                answer += "**Outros produtos neste contexto:**\n"
                for prod in result[1:4]:
                    answer += f"• {prod[0]}: {prod[1]} unidades (R$ {prod[3]:,.2f})\n"
            
            return {
                'query': query,
                'answer': answer,
                'interpretation': 'complex_product_query',
                'confidence': 0.85,
                'context': {
                    'day_of_week': day_of_week,
                    'time_period': time_period,
                    'channel': channel
                }
            }
        else:
            return {
                'query': query,
                'answer': f"Não encontrei vendas com esses critérios específicos nos últimos 30 dias.",
                'interpretation': 'complex_product_query',
                'confidence': 0.7,
                'context': {}
            }
            
    except Exception as e:
        logger.error(f"Erro em complex product query: {str(e)}")
        return {
            'query': query,
            'answer': 'Erro ao processar consulta complexa de produtos.',
            'interpretation': 'error',
            'confidence': 0.0,
            'context': {}
        }

def analyze_ticket_trend(self, query: str) -> Dict[str, Any]:
    """
    Analisa tendências do ticket médio por canal e loja
    Ex: "Meu ticket médio está caindo. É por canal ou por loja?"
    """
    try:
        # Análise por canal
        channel_query = """
            WITH current_period AS (
                SELECT 
                    ch.name as channel,
                    AVG(s.total_amount) as current_avg,
                    COUNT(*) as current_count
                FROM sales s
                JOIN channels ch ON s.channel_id = ch.id
                WHERE s.created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY ch.name
            ),
            previous_period AS (
                SELECT 
                    ch.name as channel,
                    AVG(s.total_amount) as previous_avg,
                    COUNT(*) as previous_count
                FROM sales s
                JOIN channels ch ON s.channel_id = ch.id
                WHERE s.created_at >= CURRENT_DATE - INTERVAL '14 days'
                AND s.created_at < CURRENT_DATE - INTERVAL '7 days'
                GROUP BY ch.name
            )
            SELECT 
                COALESCE(c.channel, p.channel) as channel_name,
                COALESCE(c.current_avg, 0) as current_ticket,
                COALESCE(p.previous_avg, 0) as previous_ticket,
                CASE 
                    WHEN p.previous_avg > 0 THEN 
                        ((c.current_avg - p.previous_avg) / p.previous_avg * 100)
                    ELSE 0 
                END as change_percent
            FROM current_period c
            FULL OUTER JOIN previous_period p ON c.channel = p.channel
            ORDER BY change_percent ASC
        """
        
        channel_results = self.db.execute(text(channel_query)).fetchall()
        
        answer = "📊 **Análise de Ticket Médio (últimos 7 dias vs 7 dias anteriores)**\n\n"
        
        # Análise por canal
        answer += "**Por Canal:**\n"
        declining_channels = []
        growing_channels = []
        
        for row in channel_results:
            if row[3] < -5:  # Queda maior que 5%
                declining_channels.append(row)
            elif row[3] > 5:  # Crescimento maior que 5%
                growing_channels.append(row)
        
        if declining_channels:
            answer += "🔴 **Canais com queda:**\n"
            for ch in declining_channels:
                answer += f"• {ch[0]}: R$ {ch[1]:.2f} (↓ {abs(ch[3]):.1f}%)\n"
        
        if growing_channels:
            answer += "\n🟢 **Canais em crescimento:**\n"
            for ch in growing_channels:
                answer += f"• {ch[0]}: R$ {ch[1]:.2f} (↑ {ch[3]:.1f}%)\n"
        
        # Análise geral
        overall_query = """
            SELECT 
                AVG(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' 
                    THEN total_amount END) as current_avg,
                AVG(CASE WHEN created_at < CURRENT_DATE - INTERVAL '7 days' 
                    THEN total_amount END) as previous_avg
            FROM sales
            WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
        """
        
        overall = self.db.execute(text(overall_query)).fetchone()
        
        if overall[0] and overall[1]:
            change = ((overall[0] - overall[1]) / overall[1]) * 100
            answer += f"\n**Ticket Médio Geral:**\n"
            answer += f"• Atual: R$ {overall[0]:.2f}\n"
            answer += f"• Anterior: R$ {overall[1]:.2f}\n"
            answer += f"• Variação: {change:+.1f}%\n"
            
            # Diagnóstico
            if declining_channels:
                answer += f"\n💡 **Diagnóstico:** A queda está concentrada em {len(declining_channels)} canal(is). "
                answer += f"Recomendo focar ações promocionais em: {declining_channels[0][0]}"
        
        return {
            'query': query,
            'answer': answer,
            'interpretation': 'ticket_trend_analysis',
            'confidence': 0.9,
            'context': {}
        }
        
    except Exception as e:
        logger.error(f"Erro em ticket trend analysis: {str(e)}")
        return {
            'query': query,
            'answer': 'Erro ao analisar tendência do ticket médio.',
            'interpretation': 'error',
            'confidence': 0.0,
            'context': {}
        }

def analyze_delivery_performance(self, query: str) -> Dict[str, Any]:
    """
    Analisa performance de entrega por dia/horário
    Ex: "Meu tempo de entrega piorou. Em quais dias/horários?"
    """
    try:
        # Análise por dia da semana e horário
        delivery_query = """
            SELECT 
                CASE EXTRACT(DOW FROM created_at)
                    WHEN 0 THEN 'Domingo'
                    WHEN 1 THEN 'Segunda'
                    WHEN 2 THEN 'Terça'
                    WHEN 3 THEN 'Quarta'
                    WHEN 4 THEN 'Quinta'
                    WHEN 5 THEN 'Sexta'
                    WHEN 6 THEN 'Sábado'
                END as day_name,
                CASE 
                    WHEN EXTRACT(HOUR FROM created_at) < 12 THEN 'Manhã'
                    WHEN EXTRACT(HOUR FROM created_at) < 18 THEN 'Tarde'
                    ELSE 'Noite'
                END as period,
                COUNT(*) as total_orders,
                AVG(delivery_time) as avg_delivery_time
            FROM sales
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            AND delivery_time IS NOT NULL
            GROUP BY EXTRACT(DOW FROM created_at), 
                     CASE 
                        WHEN EXTRACT(HOUR FROM created_at) < 12 THEN 'Manhã'
                        WHEN EXTRACT(HOUR FROM created_at) < 18 THEN 'Tarde'
                        ELSE 'Noite'
                     END
            ORDER BY avg_delivery_time DESC
            LIMIT 10
        """
        
        results = self.db.execute(text(delivery_query)).fetchall()
        
        if results:
            answer = "⏱️ **Análise de Tempo de Entrega (últimos 30 dias)**\n\n"
            answer += "**Períodos com maior tempo de entrega:**\n"
            
            critical_periods = []
            for row in results[:5]:
                if row[3] and row[3] > 45:  # Mais de 45 minutos
                    critical_periods.append(row)
                    answer += f"🔴 {row[0]} - {row[1]}: {row[3]:.0f} min ({row[2]} pedidos)\n"
                elif row[3] and row[3] > 35:  # Entre 35-45 minutos
                    answer += f"🟡 {row[0]} - {row[1]}: {row[3]:.0f} min ({row[2]} pedidos)\n"
                elif row[3]:
                    answer += f"🟢 {row[0]} - {row[1]}: {row[3]:.0f} min ({row[2]} pedidos)\n"
            
            if critical_periods:
                answer += f"\n⚠️ **Atenção:** {len(critical_periods)} períodos críticos identificados.\n"
                answer += "**Recomendações:**\n"
                answer += "• Reforçar equipe de entrega nestes períodos\n"
                answer += "• Ajustar raio de entrega em horários de pico\n"
                answer += "• Revisar processos de preparação"
        else:
            answer = "Não há dados suficientes de tempo de entrega para análise."
        
        return {
            'query': query,
            'answer': answer,
            'interpretation': 'delivery_analysis',
            'confidence': 0.85,
            'context': {}
        }
        
    except Exception as e:
        logger.error(f"Erro em delivery analysis: {str(e)}")
        # Se não tiver coluna delivery_time, dar resposta alternativa
        return {
            'query': query,
            'answer': 'Os dados de tempo de entrega não estão disponíveis no momento. Verifique se o campo está sendo registrado.',
            'interpretation': 'delivery_analysis',
            'confidence': 0.5,
            'context': {}
        }

def analyze_customer_retention(self, query: str) -> Dict[str, Any]:
    """
    Analisa retenção de clientes
    Ex: "Quais clientes compraram 3+ vezes mas não voltam há 30 dias?"
    """
    try:
        retention_query = """
            WITH customer_stats AS (
                SELECT 
                    c.id,
                    c.name,
                    c.phone,
                    COUNT(s.id) as total_orders,
                    MAX(s.created_at) as last_order,
                    SUM(s.total_amount) as lifetime_value,
                    AVG(s.total_amount) as avg_ticket
                FROM customers c
                JOIN sales s ON c.id = s.customer_id
                GROUP BY c.id, c.name, c.phone
                HAVING COUNT(s.id) >= 3
                AND MAX(s.created_at) < CURRENT_DATE - INTERVAL '30 days'
            )
            SELECT 
                name,
                phone,
                total_orders,
                DATE(last_order) as last_order_date,
                lifetime_value,
                avg_ticket,
                CURRENT_DATE - DATE(last_order) as days_inactive
            FROM customer_stats
            ORDER BY lifetime_value DESC
            LIMIT 20
        """
        
        results = self.db.execute(text(retention_query)).fetchall()
        
        if results:
            answer = "👥 **Clientes Fiéis Inativos (3+ compras, 30+ dias sem comprar)**\n\n"
            answer += f"Encontrei {len(results)} clientes nesta situação:\n\n"
            
            # Top 5 por valor
            answer += "**Top 5 por valor total gasto:**\n"
            for i, row in enumerate(results[:5], 1):
                answer += f"{i}. **{row[0]}**\n"
                answer += f"   • Pedidos: {row[2]}\n"
                answer += f"   • Última compra: {row[3]} ({row[6]} dias atrás)\n"
                answer += f"   • Total gasto: R$ {row[4]:,.2f}\n"
                answer += f"   • Ticket médio: R$ {row[5]:.2f}\n\n"
            
            # Análise e recomendações
            total_value = sum(r[4] for r in results)
            answer += f"💰 **Potencial de recuperação:** R$ {total_value:,.2f}\n\n"
            answer += "📱 **Recomendações:**\n"
            answer += "• Enviar cupom de desconto personalizado\n"
            answer += "• Campanha de reativação via WhatsApp\n"
            answer += "• Oferecer frete grátis no próximo pedido"
        else:
            answer = "Ótima notícia! Não há clientes fiéis inativos há mais de 30 dias."
        
        return {
            'query': query,
            'answer': answer,
            'interpretation': 'retention_analysis',
            'confidence': 0.9,
            'context': {}
        }
        
    except Exception as e:
        logger.error(f"Erro em retention analysis: {str(e)}")
        return {
            'query': query,
            'answer': 'Erro ao analisar retenção de clientes.',
            'interpretation': 'error',
            'confidence': 0.0,
            'context': {}
        }

def process_query(self, query: str, context: Dict = None) -> Dict[str, Any]:
    """
    Process query principal - VERSÃO AVANÇADA
    """
    try:
        self.db.rollback()
        query_lower = query.lower()
        
        # 1. QUERIES COMPLEXAS DE PRODUTO
        if ('produto' in query_lower and 
            any(day in query_lower for day in self.weekdays.keys()) or
            any(period in query_lower for period in self.day_periods.keys()) or
            any(channel in query_lower for channel in self.channels.keys())):
            return self.process_complex_product_query(query)
        
        # 2. ANÁLISE DE TICKET MÉDIO
        elif 'ticket' in query_lower and ('caindo' in query_lower or 'canal' in query_lower or 'loja' in query_lower):
            return self.analyze_ticket_trend(query)
        
        # 3. ANÁLISE DE ENTREGA
        elif 'entrega' in query_lower and ('pior' in query_lower or 'dia' in query_lower or 'horário' in query_lower):
            return self.analyze_delivery_performance(query)
        
        # 4. ANÁLISE DE RETENÇÃO
        elif 'cliente' in query_lower and ('voltam' in query_lower or 'inativos' in query_lower or '30 dias' in query_lower):
            return self.analyze_customer_retention(query)
        
        # 5. QUERIES SIMPLES (código anterior)
        elif any(word in query_lower for word in ['vendi', 'vendeu', 'faturamento']):
            # ... código anterior para vendas simples ...
            pass
            
        # [Resto do código anterior para queries simples]
        
    except Exception as e:
        self.db.rollback()
        logger.error(f"Erro no process_query: {str(e)}")
        return {
            'query': query,
            'answer': 'Erro ao processar sua pergunta.',
            'interpretation': 'error',
            'confidence': 0.0,
            'context': {}
        }
























































































































































































































