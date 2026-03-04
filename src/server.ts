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
import { getToolsByMode } from './tools/index.js';

// Re-export for convenience
export type { KnowledgeBaseConfig };

export function createServer(configs: KnowledgeBaseConfig[], mode: 'readonly' | 'write' | 'full' = 'readonly') {
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

  // 根据模式获取工具
  const allTools = getToolsByMode(mode);
  const toolCount = Object.keys(allTools).length;
  const modeLabel = mode === 'readonly' ? '只读' : mode === 'write' ? '读写' : '完整';

  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const kbDescription = knowledgeBases.length > 1
      ? `可用知识库: ${knowledgeBases.join(', ')}. 默认: ${defaultKB}. `
      : '';
    const modeDescription = `模式: ${modeLabel}(${toolCount}个工具). `;

    return {
      tools: Object.entries(allTools).map(([name, tool]) => {
        // Create enhanced schema with knowledge_base parameter
        const enhancedSchema = tool.inputSchema.extend({
          knowledge_base: z.string().optional().describe(
            `知识库名称. 选项: ${knowledgeBases.join(', ')}. 默认: ${defaultKB}`
          ),
        });

        return {
          name,
          description: `${modeDescription}${kbDescription}${tool.description}`,
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

export async function runStdioServer(configs: KnowledgeBaseConfig[], mode: 'readonly' | 'write' | 'full' = 'readonly') {
  const server = createServer(configs, mode);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const kbNames = configs.map((c) => c.name).join(', ');
  const toolCount = Object.keys(getToolsByMode(mode)).length;
  const modeLabel = mode === 'readonly' ? '只读' : mode === 'write' ? '读写' : '完整';
  console.error(`Yuque MCP Server running [${modeLabel}模式, ${toolCount}个工具] with ${configs.length} KB(s): ${kbNames}`);
}
