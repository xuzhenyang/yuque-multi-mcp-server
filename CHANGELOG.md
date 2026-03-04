# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Multi-Knowledge Base Support**: Connect to multiple Yuque knowledge bases with different tokens
  - New `MultiYuqueClient` class for managing multiple clients
  - All tools now support optional `knowledge_base` parameter
  - Configuration via `YUQUE_KB_{NAME}` environment variables or `--kb=name:token` CLI arguments
  - **Dynamic token names**: Any environment variable ending with `_TOKEN` is automatically recognized
    - Example: `A_TOKEN` → `a` knowledge base
    - Example: `B_TOKEN` → `b` knowledge base
  - Backward compatible with single-token configuration

### Changed
- Support `YUQUE_PERSONAL_TOKEN` and `YUQUE_GROUP_TOKEN` as primary environment variables (with `YUQUE_TOKEN` as fallback for backward compatibility)
- Update error messages to reflect new environment variable naming

## [0.1.0] - 2025-02-15

### Added
- Initial release of Yuque MCP Server
- 25 tools covering Yuque API (user, repo, doc, toc, search, group, stats, version)
- Stdio transport for local MCP clients (Claude Desktop, Cursor, Claude Code)
- TypeScript implementation with strict mode
- Zod-based parameter validation for all tools
- AI-optimized response formatting (minimal token usage)
- Authentication via `YUQUE_TOKEN` environment variable or `--token` CLI argument
- Comprehensive test suite with vitest
- ESLint + Prettier code quality tooling
- CI pipeline (Node 18/20/22)
- Docker support
- Documentation in English and Chinese

[Unreleased]: https://github.com/yuque/yuque-mcp-server/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yuque/yuque-mcp-server/releases/tag/v0.1.0
