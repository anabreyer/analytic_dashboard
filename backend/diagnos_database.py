"""
Script de Diagnóstico - Descobrir tabelas corretas no banco
Execute este script para descobrir os nomes reais das suas tabelas
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Conectar ao banco
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://admin:senha123@localhost:5432/nola_db')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

print("=" * 60)
print("DIAGNÓSTICO DO BANCO DE DADOS - NOLA ANALYTICS")
print("=" * 60)

# 1. Listar todas as tabelas
inspector = inspect(engine)
tables = inspector.get_table_names()

print("\n📊 TABELAS ENCONTRADAS NO BANCO:")
print("-" * 40)
for table in tables:
    print(f"  • {table}")

# 2. Procurar tabelas relacionadas a vendas/pedidos
print("\n🔍 TABELAS RELACIONADAS A VENDAS/PEDIDOS:")
print("-" * 40)
sales_keywords = ['order', 'venda', 'pedido', 'sale', 'transaction']
for table in tables:
    for keyword in sales_keywords:
        if keyword in table.lower():
            print(f"  ✓ {table} (possível tabela de vendas)")
            
            # Mostrar colunas desta tabela
            columns = inspector.get_columns(table)
            print(f"    Colunas:")
            for col in columns[:10]:  # Primeiras 10 colunas
                print(f"      - {col['name']} ({col['type']})")
            print()

# 3. Procurar tabelas de produtos/itens
print("\n🛍️ TABELAS RELACIONADAS A PRODUTOS:")
print("-" * 40)
product_keywords = ['product', 'produto', 'item', 'menu']
for table in tables:
    for keyword in product_keywords:
        if keyword in table.lower():
            print(f"  ✓ {table} (possível tabela de produtos)")

# 4. Tentar queries comuns
print("\n🔎 TESTANDO QUERIES COMUNS:")
print("-" * 40)

# Lista de possíveis nomes de tabelas
possible_tables = [
    'orders', 'sales', 'vendas', 'pedidos', 
    'transactions', 'order', 'venda', 'pedido'
]

for table_name in possible_tables:
    try:
        query = f"SELECT COUNT(*) FROM {table_name} LIMIT 1"
        result = db.execute(text(query))
        count = result.scalar()
        print(f"  ✅ Tabela '{table_name}' existe! ({count} registros)")
        
        # Se encontrou, mostrar estrutura
        try:
            query2 = f"SELECT * FROM {table_name} LIMIT 1"
            result2 = db.execute(text(query2))
            row = result2.fetchone()
            if row:
                print(f"     Colunas encontradas: {list(row.keys())[:10]}")
        except:
            pass
            
    except Exception as e:
        if "does not exist" not in str(e):
            print(f"  ❌ Erro inesperado com '{table_name}': {str(e)[:50]}")

# 5. Verificar estrutura específica
print("\n📋 ESTRUTURA ESPERADA vs REAL:")
print("-" * 40)

# Verificar se existe alguma tabela principal de vendas
if tables:
    main_table = None
    for t in tables:
        if any(keyword in t.lower() for keyword in ['order', 'venda', 'pedido', 'sale']):
            main_table = t
            break
    
    if main_table:
        print(f"\n🎯 TABELA PRINCIPAL DETECTADA: '{main_table}'")
        columns = inspector.get_columns(main_table)
        
        print("\nMAPEAMENTO SUGERIDO:")
        print("-" * 20)
        
        # Mapear colunas esperadas vs reais
        expected_columns = {
            'id': ['id', 'codigo', 'order_id', 'pedido_id'],
            'order_date': ['order_date', 'data', 'date', 'created_at', 'data_pedido', 'fecha'],
            'total_amount': ['total_amount', 'total', 'valor', 'value', 'valor_total', 'amount'],
            'customer_name': ['customer_name', 'cliente', 'customer', 'nome_cliente'],
            'customer_phone': ['customer_phone', 'telefone', 'phone', 'celular'],
            'channel': ['channel', 'canal', 'origem', 'source'],
            'store_id': ['store_id', 'loja', 'store', 'loja_id'],
            'delivery_time': ['delivery_time', 'tempo_entrega', 'delivery']
        }
        
        column_names = [c['name'].lower() for c in columns]
        
        for expected, possibles in expected_columns.items():
            found = None
            for possible in possibles:
                if possible in column_names:
                    found = possible
                    break
            
            if found:
                print(f"  ✓ {expected:20} → {found}")
            else:
                print(f"  ❌ {expected:20} → NÃO ENCONTRADO")

print("\n" + "=" * 60)
print("FIM DO DIAGNÓSTICO")
print("=" * 60)

db.close()