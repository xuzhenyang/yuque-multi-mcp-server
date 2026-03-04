# Yuque Multi-MCP-Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 [yuque/yuque-mcp-server](https://github.com/yuque/yuque-mcp-server) 的增强版本，专注于**多知识库管理**和**安全控制**。

[语雀](https://www.yuque.com/) MCP Server — 通过 [Model Context Protocol](https://modelcontextprotocol.io/) 让 AI 助手安全地访问你的语雀知识库。

[English](./README.en.md)

---

## ✨ 核心增强特性

### 🔑 1. 多知识库 Token 支持

同时连接多个语雀知识库，每个知识库独立配置 Token：

```json
{
  "mcpServers": {
    "yuque-multi-readonly": {
      "command": "node",
      "args": ["/path/to/yuque-mcp-server/dist/cli.js"],
      "env": {
        "A_TOKEN": "tech-team-token",
        "B_TOKEN": "product-team-token",
        "WORK_TOKEN": "personal-token"
      }
    }
  }
}
```

任意以 `_TOKEN` 结尾的环境变量自动识别为知识库：

| 环境变量 | 知识库名称 |
|---------|-----------|
| `A_TOKEN` | `a` |
| `B_TOKEN` | `b` |
| `TEAM_TOKEN` | `team` |

### 🔒 2. 安全模式控制（默认只读）

**默认以只读模式启动**，防止 AI 误操作：

| 模式 | 工具数量 | 权限说明 |
|------|---------|----------|
| `readonly` (默认) | 16 | 只读：查询、列表、搜索、统计 |
| `write` | 22 | 读写：+ 创建、更新 |
| `full` | 25 | 完整：+ 删除（危险） |

开启完整权限需显式配置：

```json
{
  "env": {
    "A_TOKEN": "xxx",
    "YUQUE_MODE": "full"
  }
}
```

---

## 🚀 快速开始

### 1. 获取语雀 API Token

前往 [语雀开发者设置](https://www.yuque.com/settings/tokens) 创建个人访问令牌。

### 2. 安装依赖并构建

```bash
git clone https://github.com/xuzhenyang/yuque-multi-mcp-server.git
cd yuque-multi-mcp-server
npm install
npm run build
```

### 3. Cursor 配置

编辑 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "yuque-multi-readonly": {
      "command": "node",
      "args": ["/path/to/yuque-mcp-server/dist/cli.js"],
      "env": {
        "A_TOKEN": "your-first-token",
        "B_TOKEN": "your-second-token"
      }
    }
  }
}
```

重启 Cursor，在 MCP 面板中确认 `yuque-multi-readonly` 已连接。

### 4. 使用

在 Cursor Chat 中：

```
你：查看 A 知识库的文档列表
AI：我来为您查询 A 知识库的文档...

你：在 B 知识库中搜索"API 文档"
AI：在 B 知识库中搜索到以下内容...
```

---

## 📖 详细配置

### 多知识库配置

支持多种配置方式：

**方式 1：动态 Token 名称（推荐）**

```bash
export A_TOKEN=token1
export B_TOKEN=token2
export TEAM_TOKEN=token3
```

**方式 2：命令行参数**

```bash
node dist/cli.js --kb=a:token1 --kb=b:token2
```

**方式 3：YUQUE_KB_* 前缀（向后兼容）**

```bash
export YUQUE_KB_PERSONAL=token1
export YUQUE_KB_WORK=token2
```

### 权限模式配置

**只读模式（默认，最安全）**
```json
{
  "mcpServers": {
    "yuque-readonly": {
      "command": "node",
      "args": ["/path/to/dist/cli.js"],
      "env": {
        "A_TOKEN": "xxx"
      }
    }
  }
}
```

**读写模式（允许创建/更新）**
```json
{
  "mcpServers": {
    "yuque-write": {
      "command": "node",
      "args": ["/path/to/dist/cli.js"],
      "env": {
        "A_TOKEN": "xxx",
        "YUQUE_MODE": "write"
      }
    }
  }
}
```

**完整模式（包含删除，危险）**
```json
{
  "mcpServers": {
    "yuque-full": {
      "command": "node",
      "args": ["/path/to/dist/cli.js"],
      "env": {
        "A_TOKEN": "xxx",
        "YUQUE_MODE": "full"
      }
    }
  }
}
```

---

## 🔧 可用工具

每个工具都支持 `knowledge_base` 参数指定目标知识库。

### 只读工具（16个，默认启用）

| 工具 | 说明 |
|------|------|
| `yuque_get_user` | 获取当前用户信息 |
| `yuque_list_groups` | 列出用户所在团队 |
| `yuque_search` | 搜索文档 |
| `yuque_list_repos` | 列出知识库 |
| `yuque_get_repo` | 获取知识库详情 |
| `yuque_list_docs` | 列出文档 |
| `yuque_get_doc` | 获取文档内容 |
| `yuque_get_toc` | 获取目录结构 |
| `yuque_list_group_members` | 列出团队成员 |
| `yuque_group_stats` | 团队统计 |
| `yuque_hello` | 测试连接 |

### 写入工具（额外6个，`write`/`full` 模式）

- `yuque_create_repo` / `yuque_update_repo`
- `yuque_create_doc` / `yuque_update_doc`
- `yuque_update_toc`
- `yuque_update_group_member`

### 危险工具（额外3个，`full` 模式）

- `yuque_delete_repo`
- `yuque_delete_doc`
- `yuque_remove_group_member`

---

## 📚 原项目信息

本项目基于 [yuque/yuque-mcp-server](https://github.com/yuque/yuque-mcp-server) 进行增强开发，新增了多知识库支持和安全模式控制。

原项目功能：
- 语雀 API 完整封装
- MCP 协议支持
- TypeScript 严格类型

---

## License

[MIT](./LICENSE)
