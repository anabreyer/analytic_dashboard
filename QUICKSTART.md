# ⚡ Quick Start Guide - Nola Analytics

## 🎯 Objetivo

Rodar a aplicação completa em **menos de 5 minutos** usando Docker.

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- ✅ **Docker** (versão 20.10 ou superior)
- ✅ **Docker Compose** (versão 2.0 ou superior)
- ✅ **Git**

**Você NÃO precisa instalar:**
- ❌ Python, pip, virtualenv
- ❌ Node.js, npm
- ❌ PostgreSQL
- ❌ Redis

> 💡 **Dica**: Tudo roda em containers! Verifique apenas Docker: `docker --version`

---

## 🚀 Instalação em 3 Passos

### 1️⃣ Clone o Repositório

```bash
git clone <seu-repo-url>
cd nola-analytics
```

### 2️⃣ Inicie a Aplicação

```bash
# Opção A: Com script de setup (⭐ RECOMENDADO - faz tudo!)
chmod +x setup.sh
./setup.sh

# O script automaticamente:
# ✅ Instala todas as dependências via Docker
# ✅ Builda Backend (Python/FastAPI)
# ✅ Builda Frontend (Next.js/React)
# ✅ Inicia PostgreSQL + Redis
# ✅ Aguarda tudo ficar pronto
# ✅ Pergunta se quer gerar dados
# ✅ Gera dados se você confirmar

# Opção B: Manual (se quiser controle total)
docker-compose up -d

# Opção C: One-liner completo
docker-compose up -d && \
docker-compose --profile tools run --rm data-generator && \
docker-compose restart backend
```

### 3️⃣ Aguarde e Acesse

⏳ **Importante:** 
- Setup inicial: 2-3 minutos
- Geração de dados (opcional): +5-10 minutos

Depois acesse:

- **Frontend**: http://localhost:3000 ← Acesse aqui!
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## ✅ Verificação

Para verificar se tudo está funcionando:

```bash
# Ver status dos containers
docker-compose ps

# Todos devem estar "healthy" ou "running"
```

Saída esperada:
```
NAME                STATUS
nola-frontend       Up (healthy)
nola-backend        Up (healthy)
nola-postgres       Up (healthy)
nola-redis          Up (healthy)
```

---

## 📊 Gerar Dados de Teste (Opcional mas Recomendado)

### Por que gerar dados?

⚠️ **Sem dados, o dashboard estará vazio!**

Os dados são necessários para:
- ✅ Ver gráficos e métricas funcionando
- ✅ Demonstrar filtros e análises
- ✅ Testar busca em linguagem natural
- ✅ Ver insights automáticos

### Como gerar?

```bash
# Opção 1: Durante o setup.sh (recomendado)
# O script perguntará se quer gerar dados

# Opção 2: Manualmente depois
docker-compose --profile tools run --rm data-generator

# Reiniciar backend para limpar cache
docker-compose restart backend
```

### Quanto tempo demora?

- 📦 Geração: 5-10 minutos
- 📊 Volume: ~500k vendas
- 💾 Espaço: ~200MB no banco

### Pulei a geração, e agora?

Se você pulou e o dashboard está vazio:

```bash
# Gere os dados agora
docker-compose --profile tools run --rm data-generator

# Reinicie
docker-compose restart backend

# Recarregue o frontend (F5 no browser)
```

---

## 🎮 Usando a Aplicação

### Dashboard Principal

1. Acesse http://localhost:3000
2. Explore as métricas na tela inicial
3. Use os filtros de data e loja

### Filtros Avançados

1. Clique em "Adicionar Filtro"
2. Escolha dimensões como:
   - Dia da semana (Segunda, Terça, etc)
   - Período do dia (Manhã, Tarde, Noite)
   - Canal de venda (iFood, Rappi, etc)
3. Veja os resultados atualizarem em tempo real

### Busca em Linguagem Natural

1. Use a barra de busca no topo
2. Digite perguntas como:
   - "Quanto vendi ontem?"
   - "Qual o produto mais vendido?"
   - "Mostre o ticket médio"

### Análise de Produtos

1. Clique na aba "Análise de Produto"
2. Digite o nome de um produto
3. Veja a evolução de vendas ao longo do tempo

---

## 🛑 Parar a Aplicação

```bash
# Parar (mantém dados)
docker-compose down

# Parar e limpar tudo (remove volumes)
docker-compose down -v
```

---

## 🔧 Problemas Comuns

### ❌ "Porta já em uso"

```bash
# Descubra qual processo está usando
lsof -i :3000  # ou 8000, 5432, 6379

# Mate o processo
kill -9 <PID>
```

### ❌ "Container não inicia"

```bash
# Veja os logs
docker-compose logs <service-name>

# Exemplo:
docker-compose logs backend
```

### ❌ "Sem espaço em disco"

```bash
# Limpe containers antigos
docker system prune -a --volumes
```

---

## 📚 Próximos Passos

- 📖 Leia o [README completo](./README.md)
- 🏗️ Veja a [Documentação de Arquitetura](./docs/ADR.md)
- 🔌 Explore a [API Documentation](http://localhost:8000/docs)

---

## 💡 Dicas

### Ver Logs em Tempo Real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas um serviço
docker-compose logs -f backend
```

### Reiniciar um Serviço

```bash
docker-compose restart backend
```

### Acessar o Shell de um Container

```bash
# Backend (Python)
docker-compose exec backend bash

# Frontend (Node)
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U challenge -d challenge_db
```

---

## 🎯 Checklist de Avaliação

Use este checklist para avaliar o projeto:

- [ ] ✅ Aplicação iniciou com sucesso
- [ ] ✅ Frontend carrega em http://localhost:3000
- [ ] ✅ Dashboard exibe métricas
- [ ] ✅ Filtros funcionam corretamente
- [ ] ✅ Charts são interativos
- [ ] ✅ Busca em linguagem natural responde
- [ ] ✅ API Docs acessível em /docs
- [ ] ✅ Código está bem organizado
- [ ] ✅ Documentação está clara

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Veja o [Troubleshooting](./README.md#-troubleshooting)
3. Abra uma issue no GitHub

---

**Desenvolvido com ❤️ para o desafio Nola**
