import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerApodTool } from './tools/apod.js';
import { registerMarsTool } from './tools/mars.js';
import { registerAsteroidsTool } from './tools/asteroids.js';

const server = new McpServer({
  name: 'nasa-mcp',
  version: '1.0.0',
});

registerApodTool(server);
registerMarsTool(server);
registerAsteroidsTool(server);

// Stateless transport: no session tracking, any number of concurrent clients
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

await server.connect(transport);

const app = express();
app.use(express.json());

// Single endpoint handles both GET (SSE stream) and POST (tool calls)
app.all('/mcp', async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('MCP request error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'nasa-mcp', version: '1.0.0' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`NASA MCP server listening on port ${port}`);
  console.log(`Tools: get_astronomy_picture, get_mars_photos, search_near_earth_objects`);
});
