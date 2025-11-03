#!/bin/bash

# ============================================
# NOLA ANALYTICS - SETUP SCRIPT
# Quick setup for development environment
# ============================================

set -e  # Exit on error

echo "🚀 Nola Analytics - Setup Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Por favor, instale o Docker primeiro.${NC}"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro.${NC}"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose encontrados${NC}"
echo ""

# Check if ports are available
echo "🔍 Verificando portas disponíveis..."

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Porta $port ($service) já está em uso${NC}"
        echo "   Execute: lsof -i :$port para ver o processo"
        return 1
    else
        echo -e "${GREEN}✅ Porta $port ($service) disponível${NC}"
        return 0
    fi
}

ports_ok=true
check_port 3000 "Frontend" || ports_ok=false
check_port 8000 "Backend" || ports_ok=false
check_port 5432 "PostgreSQL" || ports_ok=false
check_port 6379 "Redis" || ports_ok=false

if [ "$ports_ok" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Algumas portas estão em uso. Deseja continuar mesmo assim? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "=============================================="
echo "📦 INSTALANDO E INICIANDO TODOS OS SERVIÇOS"
echo "=============================================="
echo ""
echo "Isso inclui:"
echo "  • PostgreSQL (banco de dados)"
echo "  • Redis (cache)"
echo "  • Backend (FastAPI + Python)"
echo "  • Frontend (Next.js + React)"
echo ""
echo "Docker vai:"
echo "  1. Baixar imagens necessárias (se primeira vez)"
echo "  2. Buildar os containers (Backend + Frontend)"
echo "  3. Instalar todas as dependências automaticamente"
echo "  4. Criar networks e volumes"
echo "  5. Iniciar todos os serviços"
echo ""
echo "⏳ Isso pode demorar 3-5 minutos na primeira vez..."
echo "   (Próximas vezes serão mais rápidas!)"
echo ""
read -p "Pressione ENTER para continuar..."
echo ""

# Start services
echo "🚀 Executando: docker-compose up -d"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Erro ao iniciar serviços${NC}"
    echo ""
    echo "Possíveis causas:"
    echo "  • Portas já em uso"
    echo "  • Docker daemon não está rodando"
    echo "  • Permissões insuficientes"
    echo ""
    echo "Tente:"
    echo "  • sudo docker-compose up -d"
    echo "  • docker-compose logs"
    exit 1
fi

echo ""
echo "⏳ Aguardando serviços ficarem prontos..."
echo ""

# Wait for PostgreSQL
echo "   Aguardando PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U challenge -d challenge_db > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}   ✅ PostgreSQL pronto${NC}"

# Wait for Redis
echo "   Aguardando Redis..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}   ✅ Redis pronto${NC}"

# Wait for Backend
echo "   Aguardando Backend..."
max_attempts=30
attempt=0
until curl -s http://localhost:8000/ > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}   ❌ Backend não iniciou a tempo${NC}"
        echo "   Verifique os logs: docker-compose logs backend"
        exit 1
    fi
    sleep 2
done
echo -e "${GREEN}   ✅ Backend pronto${NC}"

# Wait for Frontend
echo "   Aguardando Frontend..."
attempt=0
until curl -s http://localhost:3000/ > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}   ❌ Frontend não iniciou a tempo${NC}"
        echo "   Verifique os logs: docker-compose logs frontend"
        exit 1
    fi
    sleep 2
done
echo -e "${GREEN}   ✅ Frontend pronto${NC}"

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Setup completo! Aplicação rodando!${NC}"
echo "=============================================="
echo ""

# Ask if user wants to generate data
echo ""
echo -e "${YELLOW}📊 Deseja gerar dados de teste? (500k+ vendas)${NC}"
echo "   Isso pode levar 5-10 minutos, mas é necessário para ver o dashboard funcionando."
echo ""
echo -e "   ${GREEN}Recomendado para demonstração e avaliação!${NC}"
echo ""
read -p "   Gerar dados agora? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}⏳ Gerando dados de teste... (isso pode demorar alguns minutos)${NC}"
    echo ""
    
    docker-compose --profile tools run --rm data-generator
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Dados gerados com sucesso!${NC}"
        echo ""
        echo "   Reiniciando backend para limpar cache..."
        docker-compose restart backend
        sleep 3
        echo -e "${GREEN}✅ Backend reiniciado!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Erro ao gerar dados${NC}"
        echo "   Você pode tentar novamente com:"
        echo "   docker-compose --profile tools run --rm data-generator"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  Pulando geração de dados${NC}"
    echo ""
    echo "   ${RED}ATENÇÃO: O dashboard estará vazio sem dados!${NC}"
    echo ""
    echo "   Para gerar dados depois, execute:"
    echo "   docker-compose --profile tools run --rm data-generator"
    echo ""
fi

echo ""
echo "=============================================="
echo -e "${GREEN}📍 Acesse a aplicação:${NC}"
echo "=============================================="
echo ""
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔧 Backend:   http://localhost:8000"
echo "   📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "📊 Ferramentas opcionais:"
echo ""
echo "   Para acessar o PgAdmin:"
echo "   docker-compose --profile tools up -d pgadmin"
echo "   🗄️  PgAdmin: http://localhost:5050"
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "   Para gerar dados de teste:"
    echo "   docker-compose --profile tools run --rm data-generator"
    echo ""
fi
echo "🛑 Para parar a aplicação:"
echo "   docker-compose down"
echo ""
echo "📋 Ver logs em tempo real:"
echo "   docker-compose logs -f"
echo ""
echo "=============================================="
