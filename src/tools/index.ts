import { z } from 'zod';
import type { YuqueClient } from '../services/yuque-client.js';
import { userTools } from './user.js';
import { searchTools } from './search.js';
import { repoTools } from './repo.js';
import { docTools } from './doc.js';
import { tocTools } from './toc.js';
import { groupTools } from './group.js';
import { statsTools } from './stats.js';
import { versionTools } from './version.js';

export interface ToolDefinition {
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (client: YuqueClient, args: any) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

// 只读工具（默认）
export const READONLY_TOOLS: Record<string, ToolDefinition> = {
  ...userTools,
  ...searchTools,
  ...statsTools,
  ...versionTools,
  // repo: 只读
  yuque_list_repos: repoTools.yuque_list_repos,
  yuque_get_repo: repoTools.yuque_get_repo,
  // doc: 只读
  yuque_list_docs: docTools.yuque_list_docs,
  yuque_get_doc: docTools.yuque_get_doc,
  // toc: 只读
  yuque_get_toc: tocTools.yuque_get_toc,
  // group: 只读
  yuque_list_group_members: groupTools.yuque_list_group_members,
};

// 写入工具
export const WRITE_TOOLS: Record<string, ToolDefinition> = {
  // repo: 创建、更新
  yuque_create_repo: repoTools.yuque_create_repo,
  yuque_update_repo: repoTools.yuque_update_repo,
  // doc: 创建、更新
  yuque_create_doc: docTools.yuque_create_doc,
  yuque_update_doc: docTools.yuque_update_doc,
  // toc: 更新
  yuque_update_toc: tocTools.yuque_update_toc,
  // group: 更新成员
  yuque_update_group_member: groupTools.yuque_update_group_member,
};

// 危险工具（删除操作）
export const DANGER_TOOLS: Record<string, ToolDefinition> = {
  // repo: 删除
  yuque_delete_repo: repoTools.yuque_delete_repo,
  // doc: 删除
  yuque_delete_doc: docTools.yuque_delete_doc,
  // group: 移除成员
  yuque_remove_group_member: groupTools.yuque_remove_group_member,
};

// 根据模式获取工具
export function getToolsByMode(mode: 'readonly' | 'write' | 'full'): Record<string, ToolDefinition> {
  switch (mode) {
    case 'readonly':
      return { ...READONLY_TOOLS };
    case 'write':
      return { ...READONLY_TOOLS, ...WRITE_TOOLS };
    case 'full':
    default:
      return { ...READONLY_TOOLS, ...WRITE_TOOLS, ...DANGER_TOOLS };
  }
}

// 获取所有可用工具（用于显示信息）
export const ALL_TOOLS: Record<string, ToolDefinition> = {
  ...READONLY_TOOLS,
  ...WRITE_TOOLS,
  ...DANGER_TOOLS,
};
