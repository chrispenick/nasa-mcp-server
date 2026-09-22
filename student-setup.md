# Connecting to the NASA MCP Server

## Requirements
- VS Code with GitHub Copilot extension
- Copilot Chat enabled in agent mode

## Setup (one-time, ~30 seconds)

Create a file called `.vscode/mcp.json` in your project folder with this content:

```json
{
  "servers": {
    "nasa": {
      "type": "http",
      "url": "https://YOUR-SERVER-URL.railway.app/mcp"
    }
  }
}
```

*(Your instructor will give you the exact URL to paste in.)*

## Using the Tools in Copilot Chat

Open Copilot Chat, switch to **Agent mode** (click the dropdown next to the send button), then try:

- *"What is NASA's astronomy picture of the day?"*
- *"Show me photos from the Curiosity rover on sol 500."*
- *"What asteroids are passing near Earth this week?"*
- *"Get the APOD for 2004-01-04 — the first day Opportunity landed on Mars."*

## Available Tools

| Tool | What it does |
|------|-------------|
| `get_astronomy_picture` | NASA's Astronomy Picture of the Day — photo + explanation |
| `get_mars_photos` | Real photos from Curiosity, Opportunity, or Spirit rovers |
| `search_near_earth_objects` | Asteroids passing near Earth in a date range (≤ 7 days) |
