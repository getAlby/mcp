# Alby Bitcoin Payments MCP Server

## Project Overview

MCP server that connects a Bitcoin Lightning wallet to LLMs using Nostr Wallet Connect (NWC). Built with the official MCP TypeScript SDK and Alby SDK. Supports NWC, LNURL, and L402 protocols.

## Architecture

- **Entry point**: `src/index.ts` — CLI and stdio transport
- **MCP server**: `src/mcp_server.ts` — tool registration and request routing
- **SSE transport**: `src/sse.ts` — Server-Sent Events for remote connections
- **HTTP Streamable transport**: `src/streamable_http.ts` — HTTP streaming transport
- **Auth**: `src/auth.ts` — NWC connection string authentication

### Tools

**Lightning tools** (`src/tools/lightning/`):
- `fetch_l402.ts` — Fetch L402-paywalled content
- `fiat_to_sats.ts` — Convert fiat to satoshis
- `parse_invoice.ts` — Decode Lightning invoices
- `request_invoice.ts` — Create payment requests

**NWC tools** (`src/tools/nwc/`):
- `get_balance.ts`, `get_info.ts`, `get_wallet_service_info.ts`
- `list_transactions.ts`, `lookup_invoice.ts`
- `make_invoice.ts`, `pay_invoice.ts`

### Schemas

Type definitions in `src/tools/*/schemas/`:
- `lightning/schemas/invoice.ts` — Invoice-related types
- `nwc/schemas/transaction.ts` — Transaction-related types

## Build & Development

```bash
# Install dependencies
yarn install

# Build TypeScript
yarn build          # Runs: tsc && chmod 755 build/index.js

# Run locally (stdio)
NWC_CONNECTION_STRING="nostr+walletconnect://..." yarn start

# Run with HTTP transport
MODE=HTTP NWC_CONNECTION_STRING="nostr+walletconnect://..." yarn start:http

# Inspect MCP server with official inspector
yarn inspect

# Package for npm
yarn prepack
```

## Key Dependencies

- `@modelcontextprotocol/sdk` — Official MCP TypeScript SDK
- `@getalby/sdk` — Alby SDK for Lightning operations
- `@getalby/lightning-tools` — Alby Lightning utilities
- `express` v5 — HTTP/SSE server

## Testing

No test suite currently exists. Manual testing via MCP inspector (`yarn inspect`).

## Configuration

Environment variables:
- `NWC_CONNECTION_STRING` — Required. Nostr Wallet Connect connection secret
- `PORT` — HTTP port (defaults to 3000)

## Deployment

- **Docker**: `Dockerfile` + `fly.toml` for Fly.io deployment
- **npm**: Published as `@getalby/mcp`
- **Remote server**: `https://mcp.getalby.com/` (SSE: `/sse`, Streamable: `/mcp`)

## Conventions

- TypeScript with ES modules (`"type": "module"`)
- Tools follow a consistent pattern: validate input, call SDK, return MCP response
- Errors should be returned as MCP error responses, not thrown
- Use `dotenv` for local env loading
