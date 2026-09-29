#!/usr/bin/env node
import "websocket-polyfill";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { nwc } from "@getalby/sdk";

import dotenv from "dotenv";
import express from "express";
import { createMCPServer } from "./mcp_server.js";
import { addSSEEndpoints } from "./sse.js";
import { addStreamableHttpEndpoints } from "./streamable_http.js";
import { hostOriginGuard } from "./security.js";

// Load environment variables from .env file
dotenv.config();

class NWCServer {
  async runSTDIO() {
    try {
      // NWC connection string should be provided as an environment variable
      const NWC_CONNECTION_STRING = process.env.NWC_CONNECTION_STRING;
      if (!NWC_CONNECTION_STRING) {
        throw new Error(
          "NWC_CONNECTION_STRING environment variable is required"
        );
      }

      const client = new nwc.NWCClient({
        nostrWalletConnectUrl: NWC_CONNECTION_STRING,
      });
      const transport = new StdioServerTransport();
      const server = createMCPServer(client);
      await server.connect(transport);
      // console.log("Server running in STDIO mode");
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to connect to NWC wallet: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  async runHTTP() {
    const app = express();

    app.use(hostOriginGuard());

    addSSEEndpoints(app);
    addStreamableHttpEndpoints(app);

    const port = parseInt(process.env.PORT || "3000");
    // Bind loopback by default so the listener is not reachable from the rest
    // of the network. Deployments that must accept external traffic set
    // BIND_HOST (e.g. "::" for dual-stack, "0.0.0.0" for IPv4).
    const bindHost = process.env.BIND_HOST || "127.0.0.1";
    app.listen(port, bindHost);
    console.log(`Server running in HTTP mode on ${bindHost}:${port}`);
  }
}

switch (process.env.MODE || "STDIO") {
  case "HTTP":
    new NWCServer().runHTTP().catch(console.error);
    break;
  case "STDIO":
    new NWCServer().runSTDIO().catch(console.error);
    break;
  default:
    console.error("Unknown transport: " + process.env.MCP_TRANSPORT);
}
