# Contributing to Nexora

Thank you for your interest in contributing to Nexora. This document outlines the guidelines and workflows for contributing to this project. Following these instructions helps ensure a smooth collaboration process.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please review the document to understand the behavior expected from all community members.

## Development Workflow

We follow a standard fork-and-pull workflow for all contributions:

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Create a feature branch from the main branch.
4. Make your modifications.
5. Verify changes with tests, linting, and formatting.
6. Commit your changes using Conventional Commits.
7. Push the branch to your fork.
8. Submit a Pull Request targeting the main branch of the upstream repository.

### Branch Naming Conventions

Please use descriptive prefixes for branch names:
- `feature/` for new features (e.g., `feature/time-series-forecasting`)
- `fix/` for bug fixes (e.g., `fix/csv-parsing-nulls`)
- `docs/` for documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` for code refactoring (e.g., `refactor/shap-plots`)
- `test/` for adding or improving tests (e.g., `test/health-endpoint`)

### Conventional Commits

We enforce the Conventional Commits specification for all commit messages. This allows for automated changelog generation and versioning.

Format: `<type>(<scope>): <description>`

Common types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts

Example:
`feat(backend): add support for lightgbm model training`

---

## Local Development Setup

### Prerequisites

- Python 3.11 or higher
- Node.js 20 or higher
- npm 10 or higher
- MongoDB (optional, memory persistence is used by default in development)
- Ollama (optional, for local LLM features)

### Backend Setup

Navigate to the backend directory and set up a virtual environment:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file from the example:

```bash
cp .env.example .env  # On Windows: copy .env.example .env
```

Run the development server:

```bash
python run.py
```

The API will be available at `http://localhost:8000`. You can access the interactive API docs at `http://localhost:8000/docs`.

### Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local  # On Windows: copy .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Testing and Quality Standards

### Python (Backend)

We use Ruff for linting and formatting, mypy for type checking, and pytest for tests.

Before submitting a Pull Request, run the following:

```bash
# Format code
ruff format .

# Run linter
ruff check .

# Type checking
mypy app/

# Run tests
pytest
```

### TypeScript (Frontend)

We use ESLint for linting and Prettier for formatting.

Before submitting a Pull Request, run the following:

```bash
# Format code
npm run format

# Run linter
npm run lint

# Verify build
npm run build
```

---

## Pull Request Checklist

Before submitting your PR, ensure that:
- Your branch is up to date with the upstream main branch.
- The change is focused and addresses a single issue or feature.
- New functionality is covered by appropriate unit tests.
- All backend lints, type checks, and tests pass.
- All frontend lints, formats, and build steps pass.
- Documentation has been updated to reflect the changes.
- The commit history is clean and uses Conventional Commit messages.
