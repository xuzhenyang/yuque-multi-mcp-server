import { YuqueClient } from './yuque-client.js';

export interface KnowledgeBaseConfig {
  name: string;
  token: string;
  description?: string;
}

export class MultiYuqueClient {
  private clients: Map<string, YuqueClient> = new Map();
  private defaultKey: string;

  constructor(configs: KnowledgeBaseConfig[]) {
    if (configs.length === 0) {
      throw new Error('At least one knowledge base configuration is required');
    }

    for (const config of configs) {
      this.clients.set(config.name, new YuqueClient(config.token));
    }

    this.defaultKey = configs[0].name;
  }

  /**
   * Get a client by knowledge base name
   * If not specified, returns the default (first) client
   */
  getClient(knowledgeBase?: string): YuqueClient {
    const key = knowledgeBase || this.defaultKey;
    const client = this.clients.get(key);

    if (!client) {
      const available = Array.from(this.clients.keys()).join(', ');
      throw new Error(
        `Unknown knowledge base: "${key}". Available: ${available}`
      );
    }

    return client;
  }

  /**
   * Get list of available knowledge base names
   */
  getKnowledgeBases(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Get default knowledge base name
   */
  getDefaultKnowledgeBase(): string {
    return this.defaultKey;
  }
}
