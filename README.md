# Alby Bitcoin Payment MCP Server

Connect a bitcoin lightning wallet to your LLM using Nostr Wallet Connect ([NWC](https://nwc.dev)).

This MCP server uses the [official MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

This MCP server has knowledge of [NWC](https://nwc.dev/), [LNURL](https://github.com/lnurl/luds) and [L402](https://docs.lightning.engineering/the-lightning-network/l402) using [Alby SDK](https://github.com/getAlby/js-sdk) and [Alby Lightning Tools](https://github.com/getAlby/js-lightning-tools).

<a href="https://glama.ai/mcp/servers/@getAlby/mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@getAlby/mcp/badge" />
</a>

## Quick Start

> In case you get stuck, see troubleshooting section below.

### Use the Alby-Hosted MCP Server

If your agent supports remote MCP servers - SSE (e.g. N8N) or HTTP Streamable transports, you can connect to Alby's MCP server.

- SSE: `https://mcp.getalby.com/sse`
- HTTP Streamable: `https://mcp.getalby.com/mcp`

#### Authentication

Both require providing an NWC connection secret as authentication, either as `Bearer` authentication (preferred) or via the `nwc` query parameter.

##### Bearer Auth

Example: `Authorization: Bearer nostr+walletconnect://...`

> If your agent UI supports bearer auth, just paste the connection secret into the bearer auth field.

##### Query Parameter

If your agent doesn't support bearer auth, you can pass the NWC connection secret as a query parameter.

Example: `https://mcp.getalby.com/sse?nwc=ENCODED_CONNECTION_SECRET` or `https://mcp.getalby.com/mcp?nwc=ENCODED_CONNECTION_SECRET`

_To get ENCODED_CONNECTION_SECRET, open browser devtools (right click -> inspect) and enter this in the console, with your own NWC connection secret set:_

```js
encodeURIComponent("nostr+walletconnect://...");
```

In case there is a message asking for confirmation for pasting, follow the instructions, and then enter the above command again.

Once the command has run, copy the output and replace ENCODED_CONNECTION_SECRET. It will look like this: `nostr%2Bwalletconnect%3A%2F%2F...`

### Add to Claude Web or Claude Desktop

#### Use the remote Alby MCP server

Currently, at least a Claude Pro subscription is required to be able to connect to remote MCP servers.

1. Go to Settings -> Integrations
2. Click on "Add Integration"
3. Call it `alby`
4. What is the endpoint URI: `https://mcp.getalby.com/mcp?nwc=ENCODED_NWC_URL` (see above for instructions)

#### Client-side

Add this to your claude_desktop_config.json:

```json
{
  "mcpServers": {
    "nwc": {
      "command": "npx",
      "args": ["-y", "@getalby/mcp"],
      "env": {
        "NWC_CONNECTION_STRING": "YOUR NWC CONNECTION STRING HERE"
      }
    }
  }
}
```

### Add to Goose Desktop

1. Open Goose Desktop
2. Go To Settings -> Advanced Settings
3. Click on "Add custom Extension"
4. Call it `alby`, and change the type to `SSE`
5. What is the SSE endpoint URI: `https://mcp.getalby.com/sse?nwc=ENCODED_NWC_URL` (see above for instructions)
6. Timeout: 30
7. Description: no
8. environment variables: no

### Add to Goose CLI

#### Use the Alby MCP server (SSE)

1. Type `goose configure`
2. Add extension -> Remote Extension
3. Call it `alby`
4. What is the SSE endpoint URI: `https://mcp.getalby.com/sse?nwc=ENCODED_NWC_URL` (see above for instructions)
5. Timeout: 30
6. Description: no
7. environment variables: no

#### Client-side

1. Type `goose configure`
2. Add extension -> Command Line Extension
3. Call it `alby`
4. What command should be run: `npx -y @getalby/mcp`
5. Timeout: 30
6. Description: no
7. environment variables: yes
8. environment variable name: `NWC_CONNECTION_STRING`
9. environment variable value: `nostr+walletconnect://...` (your NWC connection secret here)

### Add to Cline

> Copy the below and paste it into a cline prompt. It should prompt you to update the connection string.

```json
Add the following to my MCP servers list:

"nwc": {
  "command": "npx",
  "args": ["-y", "@getalby/mcp"],
  "env": {
    "NWC_CONNECTION_STRING": "nostr+walletconnect://..."
  },
  "disabled": false,
  "autoApprove": []
}
```

### Add to Claude Code

#### Use the Alby MCP server

```bash
claude mcp add --transport http alby https://mcp.getalby.com/mcp --header "Authorization: Bearer nostr+walletconnect://..."
```

### Add to N8N via SSE

You can use the native N8N MCP Client tool connected to an AI agent. Enter your SSE endpoint, set authentication to "Bearer" and paste your NWC connection secret.

Tested with OpenRouter + anthropic/claude-3.7-sonnet

See the [N8N workflow](examples/n8n-sse) for a simple example

### Add to N8N via STDIO (Community Node)

Currently this MCP server only works via command line (STDIO).

You can install the [n8n-nodes-mcp](https://github.com/nerding-io/n8n-nodes-mcp) community node and run n8n with tools enabled e.g.

```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true npx n8n
```

Create a blank workflow and add an AI agent node. Configure your LLM model and add a new tool "MCP Client" (which will have a cube next to it showing it's a community node).

Configure the MCP Client by adding a credential with Command Line (STDIO) selected.

command: `npx`
arguments: `-y @getalby/mcp`
environments `NWC_CONNECTION_STRING=nostr+walletconnect://your_key_here` (create the whole line in a text editor and paste it in, since the password field cannot be switched to plaintext)

See the [N8N paid chat workflow](examples/n8n-paid-chat-stdio) for a full example

## Modes

### STDIO

By default NWC MCP Server runs locally in `STDIO` mode.

### HTTP

You can set the following environment variable: `MODE=HTTP` which will enable Streamable HTTP (`http://localhost:3000/mcp`) and SSE (`http://localhost:3000/sse` Note: SSE is deprecated).

HTTP requires bearer authorization, where the token is a wallet's NWC connection secret. See the authentication section further above in the README.

## From Source

### Prerequisites

- Node.js 20+
- Yarn
- A connection string from a lightning wallet that supports NWC

### Installation

```bash
yarn install
```

### Building

```bash
yarn build
```

### Add your NWC connection

Copy `.env.example` to `.env` and update your connection string

### Inspect the tools (use/test without an LLM)

`yarn inspect`

### Supported Tools

See the [tools directory](./src/tools)

## Troubleshooting

### Model Usage

Make sure you use a decent model (e.g. Claude Sonnet 3.7) otherwise the MCP server will not work.

### Failure to connect to wallet, secret missing

Make sure you copied the entire NWC connection secret, without spaces

### Contact Alby Support

Visit [support.getalby.com](https://support.getalby.com) and we're happy to help you get the MCP server working.
