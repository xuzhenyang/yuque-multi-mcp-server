# Yuque Multi-MCP-Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Enhanced version based on [yuque/yuque-mcp-server](https://github.com/yuque/yuque-mcp-server), focusing on **multi-knowledge-base management** and **security control**.

[Yuque](https://www.yuque.com/) MCP Server — Let AI assistants safely access your Yuque knowledge base via [Model Context Protocol](https://modelcontextprotocol.io/).

[中文文档](./README.md)

---

## ✨ Key Enhancements

### 🔑 1. Multi-Knowledge-Base Token Support

Connect to multiple Yuque knowledge bases simultaneously, each with independent token configuration:

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

Any environment variable ending with `_TOKEN` is automatically recognized as a knowledge base:

| Environment Variable | Knowledge Base Name |
|---------------------|---------------------|
| `A_TOKEN` | `a` |
| `B_TOKEN` | `b` |
| `TEAM_TOKEN` | `team` |

### 🔒 2. Security Mode Control (Readonly by Default)

**Starts in readonly mode by default** to prevent accidental AI operations:

| Mode | Tool Count | Permissions |
|------|-----------|-------------|
| `readonly` (default) | 16 | Read-only: query, list, search, stats |
| `write` | 22 | Read-write: + create, update |
| `full` | 25 | Full: + delete (dangerous) |

Full permissions require explicit configuration:

```json
{
  "env": {
    "A_TOKEN": "xxx",
    "YUQUE_MODE": "full"
  }
}
```

---

## 🚀 Quick Start

### 1. Get Yuque API Token

Visit [Yuque Developer Settings](https://www.yuque.com/settings/tokens) to create a personal access token.

### 2. Install Dependencies and Build

```bash
git clone https://github.com/xuzhenyang/yuque-multi-mcp-server.git
cd yuque-multi-mcp-server
npm install
npm run build
```

### 3. Cursor Configuration

Edit `~/.cursor/mcp.json`:

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

Restart Cursor and confirm `yuque-multi-readonly` is connected in the MCP panel.

### 4. Usage

In Cursor Chat:

```
You: List documents in knowledge base A
AI: Let me query the documents in knowledge base A...

You: Search for "API documentation" in knowledge base B
AI: Found the following content in knowledge base B...
```

---

## 📖 Detailed Configuration

### Multi-Knowledge-Base Configuration

Supports multiple configuration methods:

**Method 1: Dynamic Token Names (Recommended)**

```bash
export A_TOKEN=token1
export B_TOKEN=token2
export TEAM_TOKEN=token3
```

**Method 2: CLI Arguments**

```bash
node dist/cli.js --kb=a:token1 --kb=b:token2
```

**Method 3: YUQUE_KB_* Prefix (Backward Compatible)**

```bash
export YUQUE_KB_PERSONAL=token1
export YUQUE_KB_WORK=token2
```

### Permission Mode Configuration

**Readonly Mode (Default, Safest)**
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

**Write Mode (Allow Create/Update)**
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

**Full Mode (Include Delete, Dangerous)**
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

## 🔧 Available Tools

Each tool supports the `knowledge_base` parameter to specify the target knowledge base.

### Readonly Tools (16, Enabled by Default)

| Tool | Description |
|------|-------------|
| `yuque_get_user` | Get current user info |
| `yuque_list_groups` | List user's groups |
| `yuque_search` | Search documents |
| `yuque_list_repos` | List knowledge bases |
| `yuque_get_repo` | Get knowledge base details |
| `yuque_list_docs` | List documents |
| `yuque_get_doc` | Get document content |
| `yuque_get_toc` | Get table of contents |
| `yuque_list_group_members` | List group members |
| `yuque_group_stats` | Group statistics |
| `yuque_hello` | Test connection |

### Write Tools (Additional 6, `write`/`full` mode)

- `yuque_create_repo` / `yuque_update_repo`
- `yuque_create_doc` / `yuque_update_doc`
- `yuque_update_toc`
- `yuque_update_group_member`

### Dangerous Tools (Additional 3, `full` mode)

- `yuque_delete_repo`
- `yuque_delete_doc`
- `yuque_remove_group_member`

---

## 📚 Original Project Info

This project is an enhanced version based on [yuque/yuque-mcp-server](https://github.com/yuque/yuque-mcp-server), adding multi-knowledge-base support and security mode control.

Original project features:
- Complete Yuque API wrapper
- MCP protocol support
- TypeScript strict types

---

## License

[MIT](./LICENSE)
