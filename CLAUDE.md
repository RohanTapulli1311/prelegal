# Prelegal Project

## Overview

A SaaS platform for drafting legal agreements based on CommonPaper templates. Users fill in deal-specific fields and receive a completed, downloadable legal document.

Available templates are catalogued in `catalog.json` at the project root:

@catalog.json

## Current State (as of PL-4)

- **Frontend** (`frontend/`): Next.js 16 app with a Mutual NDA creator — side-by-side form and live preview, download as `.md` or print to PDF
- **Backend** (`backend/`): FastAPI with a `/health` endpoint and SQLite DB initialised on startup
- **Scripts**: `start.sh` and `stop.sh` at repo root start/stop both services
- **Only Mutual NDA is implemented** — the other 11 templates in `catalog.json` are not yet wired up
- No AI chat, no authentication, no document persistence yet

## Development Process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature — do not skip any step from the feature-dev 7-step process
3. Thoroughly test with Playwright (existing suite in `frontend/tests/nda.spec.ts`) and fix any issues
4. Submit a PR using your GitHub tools

## Technical Design (Target)

- **Backend**: `backend/` — FastAPI, using `uv` for package management, SQLite database created fresh on each start
- **Frontend**: `frontend/` — Next.js, statically built and served via FastAPI in production
- **Scripts**: Platform-specific scripts in `scripts/`:
  ```
  scripts/start-mac.sh / scripts/stop-mac.sh
  scripts/start-linux.sh / scripts/stop-linux.sh
  scripts/start-windows.ps1 / scripts/stop-windows.ps1
  ```
- **Docker**: Full stack packaged into a Docker container
- Backend available at `http://localhost:8000`, frontend at `http://localhost:3000`

## AI Design (Target)

When writing code that calls LLMs, use LiteLLM via OpenRouter with the `openrouter/openai/gpt-oss-120b` model using Cerebras as the inference provider. Use Structured Outputs to interpret results and populate legal document fields.

`OPENROUTER_API_KEY` is available in `.env` at the project root.

## Color Scheme

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`
