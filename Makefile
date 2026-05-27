.PHONY: help install dev dev-backend dev-frontend lint test format docker-up docker-down clean

# Windows compatibility settings
ifeq ($(OS),Windows_NT)
    ACTIVATE = .venv\Scripts\activate
    RM_DIR = rmdir /s /q
else
    ACTIVATE = .venv/bin/activate
    RM_DIR = rm -rf
endif

help:
	@echo "Available commands:"
	@echo "  install       Install both backend and frontend dependencies"
	@echo "  dev           Run both backend and frontend development servers"
	@echo "  dev-backend   Run the backend development server"
	@echo "  dev-frontend  Run the frontend development server"
	@echo "  lint          Run linters on both backend and frontend"
	@echo "  test          Run pytest unit tests in the backend"
	@echo "  format        Format code for both backend and frontend"
	@echo "  docker-up     Start all containers using docker-compose"
	@echo "  docker-down   Stop and remove all containers"
	@echo "  clean         Remove cache directories and build artifacts"

install:
	@echo "Installing backend dependencies..."
	cd backend && python -m venv .venv
	cd backend && . $(ACTIVATE) && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev-backend:
	cd backend && python run.py

dev-frontend:
	cd frontend && npm run dev

dev:
	@echo "To run both backend and frontend in parallel, use separate terminals:"
	@echo "  Terminal 1: make dev-backend"
	@echo "  Terminal 2: make dev-frontend"

lint:
	@echo "Linting backend..."
	cd backend && ruff check .
	cd backend && mypy app/
	@echo "Linting frontend..."
	cd frontend && npm run lint

test:
	cd backend && pytest -v

format:
	@echo "Formatting backend..."
	cd backend && ruff format .
	@echo "Formatting frontend..."
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css,json}"

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

clean:
	@echo "Cleaning cache files..."
	cd backend && $(RM_DIR) .pytest_cache || true
	cd backend && $(RM_DIR) .ruff_cache || true
	cd backend && $(RM_DIR) .mypy_cache || true
	cd backend && $(RM_DIR) __pycache__ || true
	cd backend && $(RM_DIR) app\__pycache__ || true
	cd backend && $(RM_DIR) app\routers\__pycache__ || true
	cd backend && $(RM_DIR) app\services\__pycache__ || true
	cd backend && $(RM_DIR) app\models\__pycache__ || true
	cd backend && $(RM_DIR) app\utils\__pycache__ || true
	cd frontend && $(RM_DIR) dist || true
	cd frontend && $(RM_DIR) .vite || true
