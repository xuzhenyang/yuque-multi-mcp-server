# Yuque MCP Server

[![CI](https://github.com/yuque/yuque-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/yuque/yuque-mcp-server/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/yuque-mcp)](https://www.npmjs.com/package/yuque-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[语雀](https://www.yuque.com/) MCP Server — 通过 [Model Context Protocol](https://modelcontextprotocol.io/) 让 AI 助手访问你的语雀知识库。

🌐 **[官网](https://yuque.github.io/yuque-ecosystem/)** · 📖 [API 文档](https://www.yuque.com/yuque/developer/api) · [English](./README.md)

---

## 快速开始

### 1. 获取语雀 API Token

前往 [语雀开发者设置](https://www.yuque.com/settings/tokens) 创建个人访问令牌。

### 2. 快速安装（推荐）

使用内置 CLI 命令一键配置 MCP 客户端：

```bash
npx yuque-mcp install --token=YOUR_TOKEN --client=cursor
```

支持的客户端：`claude-desktop`、`vscode`、`cursor`、`windsurf`、`cline`、`trae`

或使用交互式安装向导：

```bash
npx yuque-mcp setup
```

CLI 会自动找到对应操作系统的配置文件路径，与已有配置合并（不会覆盖其他服务器），并打印成功信息。

### 3. 手动配置

<details>
<summary>偏好手动配置？点击展开所有客户端配置。</summary>

选择你使用的客户端：

<details open>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add yuque-mcp -- npx -y yuque-mcp --token=YOUR_TOKEN
```

或使用环境变量：

```bash
export YUQUE_PERSONAL_TOKEN=YOUR_TOKEN
claude mcp add yuque-mcp -- npx -y yuque-mcp
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

添加到 `claude_desktop_config.json`：

- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

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

添加到工作区的 `.vscode/mcp.json`：

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

然后在 GitHub Copilot Chat 中启用 Agent 模式。

</details>

<details>
<summary><b>Cursor</b></summary>

添加到 Cursor MCP 配置（`~/.cursor/mcp.json`）：

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

添加到 Windsurf MCP 配置（`~/.windsurf/mcp.json`）：

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

添加到 Cline MCP 配置（`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`）：

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

在 Trae 中，打开 **设置**，进入 **MCP** 部分，添加一个 stdio 类型的 MCP Server，配置如下：

- **Command:** `npx`
- **Args:** `-y yuque-mcp`
- **Env:** `YUQUE_PERSONAL_TOKEN=YOUR_TOKEN`

详见 [Trae MCP 文档](https://docs.trae.ai/ide/model-context-protocol)。

</details>

> **更多客户端：** 任何支持 stdio 传输的 MCP 客户端均可使用 yuque-mcp。通用配置：command = `npx`，args = `["-y", "yuque-mcp"]`，env = `YUQUE_PERSONAL_TOKEN`。

</details>

### 4. 开始使用！

让 AI 助手搜索语雀文档、创建文档、管理知识库。

---

## 认证方式

服务器支持多种方式提供语雀 API Token：

| 方式 | 环境变量 / 参数 | 说明 |
|------|----------------|------|
| **个人 Token**（推荐） | `YUQUE_PERSONAL_TOKEN` | 访问个人语雀账号 |
| **团队 Token** | `YUQUE_GROUP_TOKEN` | 访问语雀团队 |
| **旧版 Token** | `YUQUE_TOKEN` | 向后兼容 |
| **CLI 参数** | `--token=YOUR_TOKEN` | 通过命令行参数传入 |

**优先级：** `YUQUE_PERSONAL_TOKEN` > `YUQUE_GROUP_TOKEN` > `YUQUE_TOKEN` > `--token`

---

## 多知识库支持（多 Token）

Yuque MCP Server 支持同时连接多个知识库，每个知识库使用不同的 Token。每个工具都支持可选的 `knowledge_base` 参数来指定要使用的知识库。

### 配置方式

**方式 1：动态 Token 名称（推荐用于 Cursor/VSCode）**

任何以 `_TOKEN` 结尾的环境变量都会自动被识别为知识库 Token。

| 环境变量 | 知识库名称 |
|---------|-----------|
| `TECH_TEAM_TOKEN` | `tech_team` |
| `ONLINE_MERCHANT_TOKEN` | `online_merchant` |
| `PERSONAL_TOKEN` | `personal` |
| `WORK_TOKEN` | `work` |

```bash
export TECH_TEAM_TOKEN=your_tech_team_token
export ONLINE_MERCHANT_TOKEN=your_merchant_token
npx yuque-mcp
```

**Cursor 配置示例：**
```json
{
  "mcpServers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "github:xuzhenyang/yuque-mcp-server"],
      "env": {
        "TECH_TEAM_TOKEN": "xxx",
        "ONLINE_MERCHANT_TOKEN": "yyy"
      }
    }
  }
}
```

**方式 2：YUQUE_KB_* 前缀**

```bash
export YUQUE_KB_PERSONAL=your_personal_token
export YUQUE_KB_WORK=your_work_token
export YUQUE_KB_TEAM=your_team_token
npx yuque-mcp
```

**方式 3：命令行参数**

```bash
npx yuque-mcp --kb=personal:token1 --kb=work:token2 --kb=team:token3
```

**方式 4：Claude Desktop 配置（YUQUE_KB_*）**

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

### 使用方式

配置多个知识库后，每个工具都会包含 `knowledge_base` 参数：

```json
{
  "name": "yuque_list_docs",
  "description": "可用知识库: personal, work. 默认: personal. 列出知识库中的所有文档",
  "inputSchema": {
    "properties": {
      "repo_id": { ... },
      "knowledge_base": {
        "description": "要使用的知识库. 选项: personal, work. 默认: personal",
        "type": "string"
      }
    }
  }
}
```

如果未指定 `knowledge_base`，将使用第一个配置的知识库（默认）。

---

## 可用工具（25 个）

| 分类 | 工具 |
|------|------|
| **用户** | `yuque_get_user`、`yuque_list_groups` |
| **搜索** | `yuque_search` |
| **知识库** | `yuque_list_repos`、`yuque_get_repo`、`yuque_create_repo`、`yuque_update_repo`、`yuque_delete_repo` |
| **文档** | `yuque_list_docs`、`yuque_get_doc`、`yuque_create_doc`、`yuque_update_doc`、`yuque_delete_doc` |
| **目录** | `yuque_get_toc`、`yuque_update_toc` |
| **版本** | `yuque_list_doc_versions`、`yuque_get_doc_version` |
| **团队** | `yuque_list_group_members`、`yuque_update_group_member`、`yuque_remove_group_member` |
| **统计** | `yuque_group_stats`、`yuque_group_member_stats`、`yuque_group_book_stats`、`yuque_group_doc_stats` |
| **工具** | `yuque_hello` |

---

## 常见问题

| 错误 | 解决方案 |
|------|----------|
| `YUQUE_PERSONAL_TOKEN is required` | 设置环境变量（`YUQUE_PERSONAL_TOKEN`、`YUQUE_GROUP_TOKEN` 或 `YUQUE_TOKEN`）或传入 `--token=YOUR_TOKEN` |
| `401 Unauthorized` | Token 无效或已过期 — 到[语雀设置](https://www.yuque.com/settings/tokens)重新生成 |
| `429 Rate Limited` | 请求过于频繁，等待后重试 |
| 找不到工具 | 更新到最新版本：`npx -y yuque-mcp@latest` |
| 找不到 `npx` 命令 | 安装 [Node.js](https://nodejs.org/)（v18 或更高版本） |

---

## 开发

```bash
git clone https://github.com/yuque/yuque-mcp-server.git
cd yuque-mcp-server
npm install
npm test              # 运行测试
npm run build         # 编译 TypeScript
npm run dev           # 开发模式（热重载）
```

---

## 链接

- [官网](https://yuque.github.io/yuque-ecosystem/)
- [语雀 API 文档](https://www.yuque.com/yuque/developer/api)
- [MCP 协议](https://modelcontextprotocol.io/)
- [MCP Registry](https://github.com/modelcontextprotocol/servers)
- [贡献指南](./CONTRIBUTING.md)

## 许可证

[MIT](./LICENSE)
