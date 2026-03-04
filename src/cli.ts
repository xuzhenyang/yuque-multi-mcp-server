#!/usr/bin/env node
import { createRequire } from 'node:module';
import { handleCliSubcommands } from './cli-install.js';
import { runStdioServer, type KnowledgeBaseConfig } from './server.js';

// Handle install/setup subcommands before starting the MCP server
if (handleCliSubcommands(process.argv)) {
  // Subcommand was handled — do not start the server.
  // For async subcommands (setup), the process will exit when done.
} else {
  // Parse multiple knowledge base configurations
  function parseKnowledgeBases(): KnowledgeBaseConfig[] {
    const configs: KnowledgeBaseConfig[] = [];

    // Method 1: Via --kb=name:token CLI arguments
    // Example: --kb=personal:token1 --kb=work:token2
    const kbArgs = process.argv.filter((arg) => arg.startsWith('--kb='));
    for (const arg of kbArgs) {
      const value = arg.slice(5); // Remove '--kb='
      const colonIndex = value.indexOf(':');
      if (colonIndex === -1) {
        console.error(
          `Error: Invalid --kb format. Expected --kb=name:token, got ${arg}`
        );
        process.exit(1);
      }
      const name = value.slice(0, colonIndex);
      const token = value.slice(colonIndex + 1);
      if (name && token) {
        configs.push({ name, token });
      }
    }

    // Method 2: Via YUQUE_KB_{NAME} environment variables
    // Example: YUQUE_KB_PERSONAL=token1 YUQUE_KB_WORK=token2
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('YUQUE_KB_') && value) {
        const name = key.slice(9).toLowerCase(); // Remove 'YUQUE_KB_'
        // Check if not already added via --kb
        if (!configs.find((c) => c.name === name)) {
          configs.push({ name, token: value });
        }
      }
    }

    // Method 3: Backward compatibility with single token
    if (configs.length === 0) {
      const legacyToken =
        process.env.YUQUE_PERSONAL_TOKEN ||
        process.env.YUQUE_GROUP_TOKEN ||
        process.env.YUQUE_TOKEN ||
        process.argv.find((arg) => arg.startsWith('--token='))?.split('=')[1];

      if (legacyToken) {
        configs.push({ name: 'default', token: legacyToken });
      }
    }

    return configs;
  }

  const configs = parseKnowledgeBases();

  if (configs.length === 0) {
    console.error(`
Error: No Yuque API token configured.

Please use one of the following methods:

1. Multiple knowledge bases via environment variables:
   export YUQUE_KB_PERSONAL=your_personal_token
   export YUQUE_KB_WORK=your_work_token
   npx yuque-mcp

2. Multiple knowledge bases via CLI arguments:
   npx yuque-mcp --kb=personal:token1 --kb=work:token2

3. Single knowledge base (backward compatible):
   export YUQUE_PERSONAL_TOKEN=your_token
   npx yuque-mcp
`);
    process.exit(1);
  }

  // If running directly in a terminal (not piped by an MCP client),
  // show a helpful guide instead of silently waiting on stdio.
  if (process.stdin.isTTY) {
    const require = createRequire(import.meta.url);
    const { version } = require('../package.json');

    const kbList = configs.map((c) => `    • ${c.name}`).join('\n');

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🍃 Yuque MCP Server v${version.padEnd(39)}║
╚══════════════════════════════════════════════════════════════╝

📚 Configured Knowledge Bases:
${kbList}

⚠️  MCP Server needs to be started by an MCP client, not directly in terminal.

🚀 Quick install to your editor:

   Claude Desktop (with multiple KBs):
   {
     "mcpServers": {
       "yuque": {
         "command": "npx",
         "args": ["-y", "yuque-mcp"],
         "env": {
           "YUQUE_KB_PERSONAL": "your_personal_token",
           "YUQUE_KB_WORK": "your_work_token"
         }
       }
     }
   }

   Or with CLI arguments:
   {
     "mcpServers": {
       "yuque": {
         "command": "npx",
         "args": [
           "-y", "yuque-mcp",
           "--kb=personal:your_token1",
           "--kb=work:your_token2"
         ]
       }
     }
   }

📖 Supported clients: vscode, cursor, windsurf, claude-desktop, trae, cline

🔗 More info: https://github.com/yuque/yuque-mcp-server
`);
    process.exit(0);
  }

  runStdioServer(configs).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
