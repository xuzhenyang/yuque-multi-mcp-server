# Yuque MCP Server

[![CI](https://github.com/yuque/yuque-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/yuque/yuque-mcp-server/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/yuque-mcp)](https://www.npmjs.com/package/yuque-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for [Yuque (语雀)](https://www.yuque.com/) — expose your knowledge base to AI assistants through the [Model Context Protocol](https://modelcontextprotocol.io/).

🌐 **[Website](https://yuque.github.io/yuque-ecosystem/)** · 📖 [API Docs](https://www.yuque.com/yuque/developer/api) · [中文文档](./README.md)

---

## Quick Start

### 1. Get Your Yuque API Token

Visit [Yuque Developer Settings](https://www.yuque.com/settings/tokens) to create a personal access token.

### 2. Quick Install (Recommended)

Use the built-in CLI to auto-configure your MCP client in one command:

```bash
npx yuque-mcp install --token=YOUR_TOKEN --client=cursor
```

Supported clients: `claude-desktop`, `vscode`, `cursor`, `windsurf`, `cline`, `trae`

Or use the interactive setup wizard:

```bash
npx yuque-mcp setup
```

The CLI will automatically find the correct config file for your OS, merge with any existing configuration (without overwriting other servers), and print a success message.

### 3. Manual Configuration

<details>
<summary>Prefer to configure manually? Click to expand all client configs.</summary>

Choose your preferred client below:

<details open>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add yuque-mcp -- npx -y yuque-mcp --token=YOUR_TOKEN
```

Or using environment variables:

```bash
export YUQUE_PERSONAL_TOKEN=YOUR_TOKEN
claude mcp add yuque-mcp -- npx -y yuque-mcp
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Add to your `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "yuque-mcp"],
      "env": {
        "YUQUE_PERSONAL_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}
```

</details>

<details>
<summary><b>VS Code (GitHub Copilot)</b></summary>

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "yuque-mcp"],
      "env": {
        "YUQUE_PERSONAL_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}
```

Then enable Agent mode in GitHub Copilot Chat.

</details>

<details>
<summary><b>Cursor</b></summary>

Add to your Cursor MCP configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "yuque-mcp"],
      "env": {
        "YUQUE_PERSONAL_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Add to your Windsurf MCP configuration (`~/.windsurf/mcp.json`):

```json
{
  "mcpServers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "yuque-mcp"],
      "env": {
        "YUQUE_PERSONAL_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Cline (VS Code)</b></summary>

Add to your Cline MCP settings (`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "yuque-mcp"],
      "env": {
        "YUQUE_PERSONAL_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Trae</b></summary>

In Trae, open **Settings** and navigate to the **MCP** section, then add a new stdio-type MCP Server with the following configuration:

- **Command:** `npx`
- **Args:** `-y yuque-mcp`
- **Env:** `YUQUE_PERSONAL_TOKEN=YOUR_TOKEN`

See [Trae MCP documentation](https://docs.trae.ai/ide/model-context-protocol) for detailed instructions.

</details>

> **More clients:** Any MCP-compatible client that supports stdio transport can use yuque-mcp. The general pattern is: command = `npx`, args = `["-y", "yuque-mcp"]`, env = `YUQUE_PERSONAL_TOKEN`.

</details>

### 4. Done!

Ask your AI assistant to search your Yuque docs, create documents, or manage books.

---

## Authentication

The server supports multiple ways to provide your Yuque API token:

| Method | Environment Variable / Flag | Description |
|--------|---------------------------|-------------|
| **Personal Token** (recommended) | `YUQUE_PERSONAL_TOKEN` | For accessing your personal Yuque account |
| **Group Token** | `YUQUE_GROUP_TOKEN` | For accessing a Yuque group |
| **Legacy Token** | `YUQUE_TOKEN` | Backward-compatible, works the same |
| **CLI Argument** | `--token=YOUR_TOKEN` | Pass directly as a command-line argument |

**Priority order:** `YUQUE_PERSONAL_TOKEN` > `YUQUE_GROUP_TOKEN` > `YUQUE_TOKEN` > `--token`

---

## Multiple Knowledge Bases (Multi-Token)

Yuque MCP Server supports connecting to multiple knowledge bases with different tokens. Each tool accepts an optional `knowledge_base` parameter to specify which knowledge base to use.

> ⚠️ **Security Note: Default Readonly Mode**
> 
> For security reasons, the Server **starts in readonly mode by default** (`YUQUE_MODE=readonly`), allowing only query operations.
> 
> To enable write or delete operations, explicitly set the environment variable: `"YUQUE_MODE": "write"` or `"YUQUE_MODE": "full"`

### Permission Modes

| Mode | Tool Count | Description |
|------|-----------|-------------|
| `readonly` (default) | 16 | Read-only queries: get user, list, search, stats, etc. |
| `write` | 22 | Read-write mode: includes create, update operations |
| `full` | 25 | Full mode: includes delete and other dangerous operations |

### Configuration Methods

**Method 1: Dynamic Token Names (Recommended for Cursor/VSCode)**

Any environment variable ending with `_TOKEN` will be automatically recognized as a knowledge base token.

| Environment Variable | Knowledge Base Name |
|---------------------|---------------------|
| `A_TOKEN` | `a` |
| `B_TOKEN` | `b` |
| `TEAM_TOKEN` | `team` |
| `WORK_TOKEN` | `work` |

```bash
export A_TOKEN=your_first_token
export B_TOKEN=your_second_token
npx yuque-mcp
```

**Cursor Config Example (GitHub):**
```json
{
  "mcpServers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "github:xuzhenyang/yuque-mcp-server"],
      "env": {
        "A_TOKEN": "xxx",
        "B_TOKEN": "yyy"
      }
    }
  }
}
```

**Cursor Config Example (Local Project, Readonly Mode):**
```json
{
  "mcpServers": {
    "yuque-multi-readonly": {
      "command": "node",
      "args": ["/Users/xxx/yuque-mcp-server/dist/cli.js"],
      "env": {
        "A_TOKEN": "xxx",
        "B_TOKEN": "yyy"
        // Default YUQUE_MODE=readonly, no extra config needed
      }
    }
  }
}
```

**For Full Permissions (including delete):**
```json
{
  "mcpServers": {
    "yuque-multi-full": {
      "command": "node",
      "args": ["/Users/xxx/yuque-mcp-server/dist/cli.js"],
      "env": {
        "A_TOKEN": "xxx",
        "B_TOKEN": "yyy",
        "YUQUE_MODE": "full"
      }
    }
  }
}
```

**Method 2: YUQUE_KB_* Prefix**

```bash
export YUQUE_KB_PERSONAL=your_personal_token
export YUQUE_KB_WORK=your_work_token
export YUQUE_KB_TEAM=your_team_token
npx yuque-mcp
```

**Method 3: CLI Arguments**

```bash
npx yuque-mcp --kb=personal:token1 --kb=work:token2 --kb=team:token3
```

**Method 4: Claude Desktop Config (YUQUE_KB_*)**

```json
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
```

### Usage

When multiple knowledge bases are configured, each tool will include a `knowledge_base` parameter:

```json
{
  "name": "yuque_list_docs",
  "description": "Available knowledge bases: personal, work. Default: personal. List all documents in a repo/book",
  "inputSchema": {
    "properties": {
      "repo_id": { ... },
      "knowledge_base": {
        "description": "Knowledge base to use. Options: personal, work. Default: personal",
        "type": "string"
      }
    }
  }
}
```

If `knowledge_base` is not specified, the first configured knowledge base (default) will be used.

---

## Available Tools (25)

| Category | Tools |
|----------|-------|
| **User** | `yuque_get_user`, `yuque_list_groups` |
| **Search** | `yuque_search` |
| **Books** | `yuque_list_repos`, `yuque_get_repo`, `yuque_create_repo`, `yuque_update_repo`, `yuque_delete_repo` |
| **Docs** | `yuque_list_docs`, `yuque_get_doc`, `yuque_create_doc`, `yuque_update_doc`, `yuque_delete_doc` |
| **TOC** | `yuque_get_toc`, `yuque_update_toc` |
| **Versions** | `yuque_list_doc_versions`, `yuque_get_doc_version` |
| **Groups** | `yuque_list_group_members`, `yuque_update_group_member`, `yuque_remove_group_member` |
| **Stats** | `yuque_group_stats`, `yuque_group_member_stats`, `yuque_group_book_stats`, `yuque_group_doc_stats` |
| **Utility** | `yuque_hello` |

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `YUQUE_PERSONAL_TOKEN is required` | Set one of the environment variables (`YUQUE_PERSONAL_TOKEN`, `YUQUE_GROUP_TOKEN`, or `YUQUE_TOKEN`) or pass `--token=YOUR_TOKEN` |
| `401 Unauthorized` | Token is invalid or expired — regenerate at [Yuque Settings](https://www.yuque.com/settings/tokens) |
| `429 Rate Limited` | Too many requests — wait a moment and retry |
| Tool not found | Update to the latest version: `npx -y yuque-mcp@latest` |
| `npx` command not found | Install [Node.js](https://nodejs.org/) (v18 or later) |

---

## Development

```bash
git clone https://github.com/yuque/yuque-mcp-server.git
cd yuque-mcp-server
npm install
npm test              # run tests
npm run build         # compile TypeScript
npm run dev           # dev mode with hot reload
```

---

## Links

- [Website](https://yuque.github.io/yuque-ecosystem/)
- [Yuque API Docs](https://www.yuque.com/yuque/developer/api)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [MCP Registry](https://github.com/modelcontextprotocol/servers)
- [Contributing](./CONTRIBUTING.md)

## License

[MIT](./LICENSE)
