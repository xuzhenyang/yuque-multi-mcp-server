import { createServer as createMCPServer } from './server.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { KnowledgeBaseConfig } from './services/multi-yuque-client.js';

// Parse knowledge base configurations from environment variables
function parseKnowledgeBases(): KnowledgeBaseConfig[] {
  const configs: KnowledgeBaseConfig[] = [];

  // Method 1: Parse YUQUE_KB_{NAME} environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('YUQUE_KB_') && value) {
      const name = key.slice(9).toLowerCase(); // Remove 'YUQUE_KB_'
      configs.push({ name, token: value });
    }
  }

  // Method 2: Via any env var ending with _TOKEN (dynamic names)
  for (const [key, value] of Object.entries(process.env)) {
    if (key.endsWith('_TOKEN') && value && !key.startsWith('YUQUE_')) {
      const name = key
        .slice(0, -6) // Remove '_TOKEN'
        .toLowerCase()
        .replace(/_+/g, '_');
      
      if (name && !configs.find((c) => c.name === name)) {
        configs.push({ name, token: value });
      }
    }
  }

  // Backward compatibility: single token mode
  if (configs.length === 0) {
    const legacyToken =
      process.env.YUQUE_PERSONAL_TOKEN ||
      process.env.YUQUE_GROUP_TOKEN ||
      process.env.YUQUE_TOKEN;

    if (legacyToken) {
      configs.push({ name: 'default', token: legacyToken });
    }
  }

  return configs;
}

// Parse mode from environment variable (default: readonly)
const mode = (process.env.YUQUE_MODE || 'readonly') as 'readonly' | 'write' | 'full';
if (!['readonly', 'write', 'full'].includes(mode)) {
  console.error(`Error: Invalid YUQUE_MODE: ${mode}. Must be one of: readonly, write, full`);
  process.exit(1);
}

const configs = parseKnowledgeBases();

if (configs.length === 0) {
  console.error(`
Error: No Yuque API token configured.

Please set one of the following environment variables:
- {NAME}_TOKEN=token (dynamic names)
  Example: A_TOKEN=xxx B_TOKEN=yyy
- YUQUE_KB_{NAME}=token (for multiple knowledge bases)
  Example: YUQUE_KB_PERSONAL=token1 YUQUE_KB_WORK=token2
- YUQUE_PERSONAL_TOKEN=token (backward compatible single token)
`);
  process.exit(1);
}

const mcpServer = createMCPServer(configs, mode);
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});

mcpServer.connect(transport).then(() => {
  const port = Number(process.env.PORT) || 3000;
  const httpServer = createServer((req, res) => {
    transport.handleRequest(req, res).catch((error) => {
      console.error('Request handling error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    });
  });

  httpServer.listen(port, () => {
    const kbNames = configs.map((c) => c.name).join(', ');
    const modeLabel = mode === 'readonly' ? '只读' : mode === 'write' ? '读写' : '完整';
    console.log(`Yuque MCP Server running on http://localhost:${port} [${modeLabel}模式] with KB(s): ${kbNames}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
