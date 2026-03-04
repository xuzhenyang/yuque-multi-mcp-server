import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { MultiYuqueClient } from './services/multi-yuque-client.js';
import type { KnowledgeBaseConfig } from './services/multi-yuque-client.js';
import { YuqueClient } from './services/yuque-client.js';
import { userTools } from './tools/user.js';
import { repoTools } from './tools/repo.js';
import { docTools } from './tools/doc.js';
import { tocTools } from './tools/toc.js';
import { searchTools } from './tools/search.js';
import { groupTools } from './tools/group.js';
import { statsTools } from './tools/stats.js';
import { versionTools } from './tools/version.js';

// Re-export for convenience
export type { KnowledgeBaseConfig };

// Tool definition interface - flexible to accommodate existing tools
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ToolDefinition {
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (client: YuqueClient, args: any) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

export function createServer(configs: KnowledgeBaseConfig[]) {
  const multiClient = new MultiYuqueClient(configs);
  const knowledgeBases = multiClient.getKnowledgeBases();
  const defaultKB = multiClient.getDefaultKnowledgeBase();

  const server = new Server(
    {
      name: 'yuque-mcp',
      version: '0.2.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Combine all tools and cast to the expected type
  const allTools: Record<string, ToolDefinition> = {
    ...userTools,
    ...repoTools,
    ...docTools,
    ...tocTools,
    ...searchTools,
    ...groupTools,
    ...statsTools,
    ...versionTools,
  };

  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const kbDescription = knowledgeBases.length > 1
      ? `Available knowledge bases: ${knowledgeBases.join(', ')}. Default: ${defaultKB}. `
      : '';

    return {
      tools: Object.entries(allTools).map(([name, tool]) => {
        // Create enhanced schema with knowledge_base parameter
        const enhancedSchema = tool.inputSchema.extend({
          knowledge_base: z.string().optional().describe(
            `Knowledge base to use. Options: ${knowledgeBases.join(', ')}. Default: ${defaultKB}`
          ),
        });

        return {
          name,
          description: `${kbDescription}${tool.description}`,
          inputSchema: zodToJsonSchema(enhancedSchema),
        };
      }),
    };
  });

  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = allTools[toolName as keyof typeof allTools];

    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    try {
      // Create enhanced schema with knowledge_base for validation
      const enhancedSchema = tool.inputSchema.extend({
        knowledge_base: z.string().optional(),
      });

      // Validate arguments with zod
      const args = enhancedSchema.parse(request.params.arguments);

      // Extract knowledge_base parameter
      const { knowledge_base, ...toolArgs } = args as { knowledge_base?: string } & Record<string, unknown>;

      // Get the appropriate client
      const client = multiClient.getClient(knowledge_base);

      // Call the tool handler
      return await tool.handler(client, toolArgs);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
      throw error;
    }
  });

  return server;
}

export async function runStdioServer(configs: KnowledgeBaseConfig[]) {
  const server = createServer(configs);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const kbNames = configs.map((c) => c.name).join(', ');
  console.error(`Yuque MCP Server running with ${configs.length} knowledge base(s): ${kbNames}`);
}
