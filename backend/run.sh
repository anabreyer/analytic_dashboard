# #!/bin/bash

# # Script to run Nola Analytics Backend
# # This script sets up and runs the backend server

# echo "🚀 Starting Nola Analytics Backend..."

# # Check if virtual environment exists
# if [ ! -d "venv" ]; then
#     echo "📦 Creating virtual environment..."
#     python3 -m venv venv
# fi

# # Activate virtual environment
# echo "🔧 Activating virtual environment..."
# source venv/bin/activate

# # Install dependencies
# echo "📚 Installing dependencies..."
# pip install -r requirements.txt

# # Check if Redis is running
# echo "🔍 Checking Redis..."
# if ! nc -z localhost 6379 2>/dev/null; then
#     echo "⚠️  Redis not found. Starting Redis in Docker..."
#     docker run -d --name redis-nola -p 6379:6379 redis:alpine
#     echo "✅ Redis started"
# else
#     echo "✅ Redis is running"
# fi

# # Check if PostgreSQL is running
# echo "🔍 Checking PostgreSQL..."
# if ! nc -z localhost 5432 2>/dev/null; then
#     echo "❌ PostgreSQL not found. Please run: docker-compose up -d postgres"
#     exit 1
# else
#     echo "✅ PostgreSQL is running"
# fi

# # Run the application
# echo "🎯 Starting FastAPI server..."
# echo "📊 API Documentation: http://localhost:8000/docs"
# echo "📈 Frontend will connect to: http://localhost:8000"
# echo ""
# echo "Press Ctrl+C to stop the server"
# echo "=================================="

# python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

#!/bin/bash
set -euo pipefail

echo "🚀 Starting Nola Analytics Backend..."

# Choose a Python (prefer 3.12 to avoid psycopg2 build issues)
PY_BIN="${PY_BIN:-python3.12}"

if [ ! -d "venv" ]; then
  echo "📦 Creating virtual environment with ${PY_BIN}..."
  "${PY_BIN}" -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Show python version (helps when debugging psycopg wheels)
echo "🐍 Python version: $(python -V)"

echo "⬆️  Upgrading pip..."
python -m pip install --upgrade pip

echo "📚 Installing dependencies..."
pip install -r requirements.txt

echo "🔍 Checking Redis..."
if ! nc -z localhost 6379 2>/dev/null; then
  echo "⚠️  Redis not found. Starting Redis in Docker..."
  if docker ps -a --format '{{.Names}}' | grep -q '^redis-nola$'; then
    docker start redis-nola >/dev/null
  else
    docker run -d --name redis-nola -p 6379:6379 redis:alpine >/dev/null
  fi
  echo "✅ Redis started"
else
  echo "✅ Redis is running"
fi

echo "🔍 Checking PostgreSQL..."
if ! nc -z localhost 5432 2>/dev/null; then
  echo "❌ PostgreSQL not found. Please run: docker-compose up -d postgres"
  exit 1
else
  echo "✅ PostgreSQL is running"
fi

echo "🎯 Starting FastAPI server..."
echo "📊 API Docs: http://localhost:8000/docs"
echo "📈 Frontend will connect to: http://localhost:8000"
echo "=================================="
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if [[ "$1" == "--clean" ]]; then
    echo "🧹 Cleaning environment..."
    
    # Stop and remove Docker containers (Redis/Postgres)
    docker ps -aq | xargs -r docker stop
    docker ps -aq | xargs -r docker rm
    docker volume prune -f
    docker network prune -f

    # Remove venv and caches
    rm -rf venv
    rm -rf __pycache__ */__pycache__ .pytest_cache .mypy_cache

    # Optional: remove compiled Python files
    find . -name "*.pyc" -delete

    echo "✅ Cleaned. Rebuilding environment..."
fi