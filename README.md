# 🚀 Nola Analytics - Plataforma de Inteligência para Restaurantes

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Node](https://img.shields.io/badge/node-20.x-green.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue.svg)
![Redis](https://img.shields.io/badge/redis-7-red.svg)

**Plataforma completa de analytics em tempo real para restaurantes**

[Demo](#-demo) • [Features](#-features) • [Instalação](#-instalação-rápida) • [Arquitetura](#-arquitetura) • [Documentação](#-documentação)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Features](#-features)
- [Stack Tecnológica](#-stack-tecnológica)
- [Instalação Rápida](#-instalação-rápida)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura](#-arquitetura)
- [Documentação](#-documentação)
- [Demo](#-demo)

---

## 🎯 Sobre o Projeto

O **Nola Analytics** é uma plataforma completa de business intelligence desenvolvida especificamente para restaurantes e redes de food service. Processa **500k+ vendas** de dados reais e fornece insights automáticos acionáveis através de IA.

### Problema Resolvido

Restaurantes geram toneladas de dados mas lutam para transformá-los em decisões. Nossa plataforma:
- ✅ Centraliza dados de múltiplos canais (iFood, Rappi, Uber Eats, presencial)
- ✅ Gera insights automáticos com IA
- ✅ Oferece dashboards customizáveis
- ✅ Permite queries em linguagem natural
- ✅ Fornece análise preditiva

---

## ✨ Features

### 🎛️ Dashboard Interativo
- **Métricas em tempo real**: Pedidos, faturamento, ticket médio, clientes únicos
- **Comparação de períodos**: Analise variações vs período anterior
- **Filtros multidimensionais**: 8+ dimensões de filtro (dia da semana, horário, canal, categoria)
- **Visualizações avançadas**: Charts interativos com granularidade ajustável

### 🤖 Inteligência Artificial
- **Natural Language Queries**: "Quanto vendi ontem no iFood?"
- **Insights Automáticos**: Alertas proativos sobre problemas e oportunidades
- **Análise Preditiva**: Previsões de demanda e tendências
- **Recomendações Acionáveis**: Cada insight vem com ação sugerida

### 📊 Analytics Avançado
- **Análise de Produtos**: Timeline de vendas por produto
- **Performance de Canais**: Comparação detalhada entre canais
- **Jornada do Cliente**: Análise de funil e comportamento
- **Comparativos**: Múltiplas dimensões de comparação

### 🎨 Dashboard Builder
- **Drag & Drop**: Construa dashboards personalizados
- **Templates por Perfil**: Proprietário, Gerente, Marketing, Operações
- **Widgets Customizáveis**: Diversos tipos de visualização
- **Salvar/Carregar**: Persistência de configurações

### 🔍 Filtros Inteligentes
- **Dia da Semana**: Segunda a Domingo
- **Período do Dia**: Manhã, Tarde, Noite, Madrugada
- **Canais**: iFood, Rappi, Uber Eats, WhatsApp, Presencial
- **Categorias**: Hambúrgueres, Pizzas, Bebidas, Sobremesas
- **Tipo de Cliente**: Novos, Recorrentes, VIP
- **Salvar Filtros**: Crie presets de filtros

---

## 🛠️ Stack Tecnológica

### Backend
- **FastAPI** (0.104.1) - Framework web moderno e rápido
- **SQLAlchemy** (2.0.23) - ORM poderoso
- **PostgreSQL** (15) - Banco de dados robusto
- **Redis** (7) - Cache distribuído
- **Pandas** (2.1.4) - Análise de dados
- **Pydantic** (2.5.2) - Validação de dados
- **Python** (3.12)

### Frontend
- **Next.js** (14) - React framework com SSR
- **React** (18.2) - UI library
- **TypeScript** (5.3) - Type safety
- **TanStack React Query** (5.13) - Server state management
- **Tremor React** (3.11) - Dashboard UI components
- **Tailwind CSS** (3.3) - Utility-first CSS
- **Recharts** (2.10) - Data visualization
- **React DnD** (16.0) - Drag and drop

### Infrastructure
- **Docker** & **Docker Compose** - Containerização
- **Uvicorn** - ASGI server
- **Nginx** (opcional) - Reverse proxy

---

## 🚀 Instalação Rápida

### Pré-requisitos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git**

> ⚠️ **IMPORTANTE**: Certifique-se de que as portas 3000, 5432, 6379 e 8000 estão livres!

### Método 1: Docker Compose (Recomendado) ⭐

**O que você precisa:**
- ✅ Docker
- ✅ Docker Compose
- ❌ **NÃO precisa**: Python, Node, PostgreSQL, Redis localmente

**Setup:**

```bash
# 1. Clone o repositório
git clone <seu-repo-url>
cd nola-analytics

# 2. Execute o script de setup (faz TUDO automaticamente)
chmod +x setup.sh
./setup.sh

# O script vai:
# ✅ Verificar pré-requisitos
# ✅ Instalar todas as dependências via Docker
# ✅ Buildar Backend (Python + FastAPI)
# ✅ Buildar Frontend (Node + Next.js)
# ✅ Iniciar PostgreSQL com schema
# ✅ Iniciar Redis
# ✅ Perguntar se quer gerar dados (recomendado: sim!)
# ✅ Aguardar tudo ficar pronto

# 3. Aguarde 10-15 minutos (primeira vez)
#    Próximas vezes: ~2-3 minutos

# 4. Acesse a aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Alternativa (sem script):**

```bash
# Se preferir rodar manualmente:
docker-compose up -d  # Instala e inicia tudo
docker-compose --profile tools run --rm data-generator  # Gera dados
docker-compose restart backend  # Aplica
```

✅ **Pronto!** A aplicação está rodando!

### Método 2: Setup Local (Desenvolvimento)

```bash
# 1. Clone o repositório
git clone <seu-repo-url>
cd nola-analytics

# 2. Inicie o banco de dados
docker-compose up postgres redis -d

# 3. Configure o backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 4. Configure o frontend (novo terminal)
cd frontend
npm install
npm run dev
```

### Gerando Dados de Teste

```bash
# Execute o data generator (gera ~500k vendas)
docker-compose --profile tools run data-generator
```

### Parar os Serviços

```bash
# Parar
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v
```

---

## 📁 Estrutura do Projeto

```
nola-analytics/
│
├── backend/                    # Backend FastAPI
│   ├── app/
│   │   ├── api/               # Endpoints da API
│   │   │   └── analytics.py
│   │   ├── core/              # Configuração central
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── cache.py
│   │   ├── models/            # Models SQLAlchemy
│   │   │   └── models.py
│   │   ├── schemas/           # Schemas Pydantic
│   │   │   └── schemas.py
│   │   ├── services/          # Business logic
│   │   │   └── analytics_service.py
│   │   └── main.py            # Entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── run.sh
│
├── frontend/                   # Frontend Next.js
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/            # React Components
│   │   ├── dashboard/
│   │   │   ├── MetricCards.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   ├── TopProducts.tsx
│   │   │   ├── InsightsPanel.tsx
│   │   │   ├── ProductTimelineChart.tsx
│   │   │   └── DashboardBuilder.tsx
│   │   ├── filters/
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── StoreSelector.tsx
│   │   │   └── MultiDimensionalFilter.tsx
│   │   ├── layout/
│   │   │   └── Header.tsx
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx
│   │       └── LoadingCard.tsx
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utility functions
│   ├── package.json
│   ├── Dockerfile
│   └── tailwind.config.ts
│
├── database-schema.sql         # Schema do banco
├── generate_data.py            # Gerador de dados
├── docker-compose.yml          # Orquestração
├── .gitignore
└── README.md
```

---

## 🏗️ Arquitetura

### Visão Geral

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │ ───▶ │  Next.js    │ ───▶ │   FastAPI   │
│  (Client)   │ ◀─── │  Frontend   │ ◀─── │   Backend   │
└─────────────┘      └─────────────┘      └─────────────┘
                           │                      │
                           │                      │
                           ▼                      ▼
                     ┌─────────────┐      ┌─────────────┐
                     │   Redis     │      │ PostgreSQL  │
                     │   (Cache)   │      │    (DB)     │
                     └─────────────┘      └─────────────┘
```

### Camadas

#### 1. **Frontend Layer** (Next.js + React)
- **Presentation**: Components React com TypeScript
- **State Management**: React Query para server state
- **Styling**: Tailwind CSS + Tremor components
- **Routing**: Next.js App Router

#### 2. **Backend Layer** (FastAPI)
- **API Layer**: Endpoints REST
- **Service Layer**: Business logic
- **Repository Layer**: Data access (SQLAlchemy)
- **Cache Layer**: Redis para performance

#### 3. **Data Layer**
- **PostgreSQL**: Banco relacional normalizado (17 tabelas)
- **Redis**: Cache distribuído com TTL diferenciado

### Principais Decisões Arquiteturais

📄 **[Ver documentação completa de ADR](./docs/ADR.md)**

#### Separação de Concerns
- **Backend**: API pura, stateless, focada em dados
- **Frontend**: SPA com SSR, interatividade rica
- *Razão*: Escalabilidade independente, manutenibilidade

#### Cache Strategy
- **Redis** com TTLs diferenciados:
  - Overview: 60s
  - Timeline: 300s  
  - Products: 600s
  - Insights: 1800s
- *Razão*: Balance entre freshness e performance

#### Database Design
- **Modelo normalizado** com 17 tabelas
- **Soft deletes** (deleted_at)
- **Audit trail** (created_at em todas as tabelas)
- *Razão*: Integridade, rastreabilidade, recuperação

#### API Design
- **RESTful** com versionamento (/api/v1)
- **OpenAPI** auto-gerado (FastAPI)
- **Type-safe** com Pydantic schemas
- *Razão*: Documentação automática, validação, contratos

---

## 📚 Documentação

### Documentação Disponível

1. **[ADR - Architecture Decision Records](./docs/ADR.md)**
   - Decisões arquiteturais detalhadas
   - Justificativas técnicas
   - Trade-offs considerados

2. **[API Documentation](http://localhost:8000/docs)**
   - Swagger UI interativo
   - Todos os endpoints documentados
   - Try it out funcional

3. **[Database Schema](./docs/DATABASE.md)**
   - Diagrama ER
   - Descrição das tabelas
   - Relacionamentos

### Endpoints Principais

#### Analytics
- `GET /api/v1/analytics/overview` - Métricas gerais
- `GET /api/v1/analytics/timeline` - Evolução temporal
- `GET /api/v1/analytics/top-products` - Produtos mais vendidos
- `GET /api/v1/analytics/insights` - Insights automáticos
- `GET /api/v1/analytics/channels` - Performance por canal
- `GET /api/v1/analytics/products-list` - Lista de produtos
- `GET /api/v1/analytics/product-timeline` - Timeline de produto
- `POST /api/v1/analytics/natural-query` - Query em linguagem natural
- `GET /api/v1/analytics/health` - Health check

### Filtros Disponíveis

Todos os endpoints aceitam os seguintes parâmetros:

**Básicos:**
- `start_date` - Data inicial (YYYY-MM-DD)
- `end_date` - Data final (YYYY-MM-DD)
- `store_id` - ID da loja (opcional)
- `granularity` - hour/day/week/month (timeline)

**Avançados:**
- `day_of_week` - mon,tue,wed,thu,fri,sat,sun
- `time_of_day` - morning,afternoon,evening,night
- `channels` - ifood,rappi,uber,whatsapp,presencial
- `categories` - burgers,pizza,drinks,desserts
- `price_range` - low,medium,high
- `customer_type` - new,returning,vip
- `delivery_zone` - zone1,zone2,zone3
- `order_size` - small,medium,large

---

## 🎬 Demo

### Vídeo

📹 **[Assista ao vídeo de demonstração](link-do-video)**

### Screenshots

#### Dashboard Principal
![Dashboard](./screenshots/dashboard.png)

#### Filtros Multidimensionais
![Filters](./screenshots/filters.png)

#### Product Timeline
![Product Timeline](./screenshots/product-timeline.png)

#### Insights Automáticos
![Insights](./screenshots/insights.png)

---

## 🧪 Testes

### Executar Testes

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Coverage

```bash
# Backend
pytest --cov=app --cov-report=html

# Frontend
npm run test:coverage
```

---

## 🔧 Troubleshooting

### Porta já em uso

```bash
# Descubra qual processo está usando a porta
lsof -i :3000  # ou 8000, 5432, 6379

# Mate o processo
kill -9 <PID>

# Ou mude a porta no docker-compose.yml
```

### Docker sem espaço

```bash
# Limpe containers e volumes antigos
docker system prune -a --volumes
```

### Permissão negada

```bash
# Linux/Mac - adicione sudo
sudo docker-compose up

# Ou adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
```

### Erro de conexão com banco

```bash
# Verifique se o banco está rodando
docker-compose ps

# Veja os logs
docker-compose logs postgres

# Reinicie o serviço
docker-compose restart postgres
```

---

## 🤝 Contribuindo

Este é um projeto de avaliação técnica, mas sugestões são bem-vindas!

---

## 📝 Licença

Este projeto é licenciado sob a licença MIT.

---

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- **Nola** - Pelo desafio técnico
- **FastAPI** - Framework incrível
- **Next.js** - Melhor framework React
- **Tremor** - Componentes de analytics lindos

---

<div align="center">

**Desenvolvido com ❤️ para o desafio Nola**

[⬆ Voltar ao topo](#-nola-analytics---plataforma-de-inteligência-para-restaurantes)

</div>
