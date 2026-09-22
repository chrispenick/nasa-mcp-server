# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A publicly-hosted MCP server exposing NASA APIs, designed for classroom demos with GitHub Copilot in VS Code. Students add it once via `.vscode/mcp.json` and interact through Copilot Chat.

## Commands

```bash
npm run dev      # run with tsx (no build step, uses DEMO_KEY if NASA_API_KEY unset)
npm run build    # compile TypeScript → dist/
npm start        # run compiled output
```

Set `NASA_API_KEY` in a `.env` file (copy from `.env.example`). Get a free key at https://api.nasa.gov.

## Architecture

Single Express app + one stateless `StreamableHTTPServerTransport` (MCP SDK 1.30+). All MCP traffic goes through `POST /mcp`; `GET /health` is for Railway uptime checks.

- **`src/index.ts`** — wires MCP server, transport, and Express together. Top-level `await` (ESM).
- **`src/tools/apod.ts`** — `get_astronomy_picture`: NASA APOD by date
- **`src/tools/mars.ts`** — `get_mars_photos`: rover photos by sol
- **`src/tools/asteroids.ts`** — `search_near_earth_objects`: NEO feed (≤7-day window)

Tools use `server.registerTool()` (not the deprecated `server.tool()`). Transport is stateless (`sessionIdGenerator: undefined`) so one instance handles all concurrent students.

## Deployment (Railway)

Push to GitHub → connect Railway → set `NASA_API_KEY` env var. Railway runs `npm run build && npm start` automatically. The resulting URL goes into `student-setup.md`.

## Student Connection

Students create `.vscode/mcp.json`:
```json
{ "servers": { "nasa": { "type": "http", "url": "https://YOUR-URL.railway.app/mcp" } } }
```
