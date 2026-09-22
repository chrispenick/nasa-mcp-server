import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerApodTool } from './tools/apod.js';
import { registerMarsTool } from './tools/mars.js';
import { registerAsteroidsTool } from './tools/asteroids.js';

function createServer() {
  const server = new McpServer({ name: 'nasa-mcp', version: '1.0.0' });
  registerApodTool(server);
  registerMarsTool(server);
  registerAsteroidsTool(server);
  return server;
}

const app = express();
app.use(express.json());

// Stateless: each HTTP request gets its own server+transport pair.
// This is required because the MCP SDK treats a transport as a 1:1 client
// connection — reusing one transport across requests causes initialize to fail.
app.all('/mcp', async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('finish', () => server.close().catch(() => {}));
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
