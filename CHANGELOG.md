# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-28

This release upgrades the repository with professional open-source standards, adds CI/CD pipelines, containerization support, comprehensive code quality tooling, and standard community health governance.

### Added

- GitHub Actions continuous integration workflow for Python backend (linting, type checking, and unit testing).
- GitHub Actions continuous integration workflow for React frontend (TypeScript compilation, ESLint verification, and production build).
- Dependabot configuration for automated weekly dependency updates for both pip and npm packages.
- Docker containerization files including Dockerfiles for backend and frontend along with a root docker-compose.yml configuration for seamless one-command local orchestration.
- Scaffolding for pytest unit test suite in the backend with tests for health check and dataset upload routers.
- Local configuration environments through `.env.example` templates in both `backend` and `frontend` subdirectories.
- Comprehensive codebase linting, formatting, and typing configuration via `pyproject.toml` (Ruff, Black, Mypy, Pytest) in the backend.
- Code formatting rules for Prettier in the frontend.
- Standard pre-commit hooks configuration to validate syntax, formatting, and lint rules prior to Git commits.
- Make command shortcuts (`Makefile`) in the root directory for standard build, dev, lint, format, and test workflows.
- Professional community documentation including contributing guidelines (`CONTRIBUTING.md`), code of conduct (`CODE_OF_CONDUCT.md`), and security policy (`SECURITY.md`).

### Changed

- Restructured the project's root `README.md` to present a clean, high-impact, and emoji-free visual identity, featuring evolutionary status badges, target technical characteristics, clear local setup instructions, a detailed system architecture flow, and a long-term roadmap.
- Configured ESLint standard parameters inside the frontend environment to prevent potential compile-time failures.

## [0.3.0] - 2025-11-20

### Added

- Interactive explainability engine with SHAP (SHapley Additive exPlanations) supporting feature importance analysis and PDF report generation.
- Chat with Dataset workspace utilizing local LLMs via Ollama integration (Phi-3 Mini).
- Advanced exploration page with K-Means Clustering analysis and univariate Time-Series forecasting models.
- Support for persistent dataset storage and deployment tracking via MongoDB and Firebase databases.
- Multi-model benchmarking leaderboard with automatic problem classification, hyperparameter grids, and real-time execution updates over WebSockets.
