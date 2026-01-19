/**
 * HTTP Server wrapper for Oura MCP Server
 * Uses SSE (Server-Sent Events) transport for MCP communication
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { OuraMCPServer } from './index.js';

const PORT = process.env.PORT || 8080;
const OURA_TOKEN = process.env.OURA_PERSONAL_ACCESS_TOKEN;

if (!OURA_TOKEN) {
  console.error("Error: OURA_PERSONAL_ACCESS_TOKEN environment variable is required");
  process.exit(1);
}

const app = express();
app.use(cors());
// Note: Don't use express.json() globally - the /message endpoint needs the raw body

// Health check endpoint for Docker
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'oura-mcp-server' });
});

// Store active transports by session ID
const activeTransports = new Map<string, SSEServerTransport>();

// SSE endpoint for MCP communication
app.get('/sse', async (req: Request, res: Response) => {
  console.log('New SSE connection');

  // Create a new MCP server instance for this connection
  const mcpServer = new OuraMCPServer(OURA_TOKEN);

  // Create SSE transport
  const transport = new SSEServerTransport('/message', res);

  // Store transport by its session ID for message routing
  activeTransports.set(transport.sessionId, transport);

  // Clean up on connection close
  res.on('close', () => {
    console.log('SSE connection closed');
    activeTransports.delete(transport.sessionId);
  });

  // Connect the server to the transport
  await mcpServer.server.connect(transport);
});

// Message endpoint for client-to-server communication
app.post('/message', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  // Find the transport for this session
  const transport = activeTransports.get(sessionId);

  if (!transport) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // Forward the message to the transport for processing
  try {
    await transport.handlePostMessage(req, res);
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Oura MCP HTTP server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});
