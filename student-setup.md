# MCP Servers — Student Setup

## Requirements
- VS Code with GitHub Copilot extension
- Copilot Chat enabled in agent mode

---

## Part 1: NASA (remote server, no install)

This server is hosted by your instructor. It demonstrates how MCP works — the model decides when to call tools based on your question.

Create `.vscode/mcp.json` in your project folder:

```json
{
  "servers": {
    "nasa": {
      "type": "http",
      "url": "https://nasa-mcp-server-production.up.railway.app/mcp"
    }
  }
}
```

**Try these prompts in Copilot Chat (Agent mode):**
- *"What is NASA's astronomy picture of the day?"*
- *"Show me photos from the Curiosity rover on sol 500."*
- *"What asteroids are passing near Earth this week?"*
- *"Get the APOD for 2004-01-04 — the first day Opportunity landed on Mars."*

| Tool | What it does |
|------|-------------|
| `get_astronomy_picture` | NASA's Astronomy Picture of the Day — photo + explanation |
| `get_mars_photos` | Real photos from Curiosity, Opportunity, or Spirit rovers |
| `search_near_earth_objects` | Asteroids passing near Earth in a date range (≤ 7 days) |

---

## Part 2: Fetch (remote, no install)

Gives the model the ability to read live web pages — something it cannot do on its own. Run this once in your terminal to add it:

```bash
npx -y @modelcontextprotocol/create-server fetch
```

Or add it manually to `.vscode/mcp.json` alongside the nasa entry:

```json
{
  "servers": {
    "nasa": {
      "type": "http",
      "url": "https://nasa-mcp-server-production.up.railway.app/mcp"
    },
    "fetch": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

**Try these prompts:**
- *"Fetch the Wikipedia article on the Apollo 11 mission and give me the key dates."*
- *"Read https://example.com and summarise it."*
- *"Fetch the current MCP spec from spec.modelcontextprotocol.io and explain the transport types."*

---

## Part 3: Filesystem (local — the powerful one)

This is where MCP gets interesting. The model can read, create, and edit files in a folder you choose — no copy-paste, no uploads.

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/project"]
    }
  }
}
```

Replace `/path/to/your/project` with an actual folder path (e.g. `C:\Users\you\projects\myapp` or `/Users/you/projects/myapp`). Only give it access to folders you're comfortable with.

**Try these prompts:**
- *"List all the files in my project and explain what each one does."*
- *"Find every TODO comment across all files and summarise them."*
- *"Create a README.md for this project based on the code you see."*
- *"Rename all variables named `data` to `result` in main.py."*

> **Why this matters:** The model is now working directly with your actual files — not a copy, not a summary. This is what makes MCP different from just calling an API.
