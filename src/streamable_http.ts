import { Express, Request, Response } from "express";
import { createMCPServer } from "./mcp_server.js";
import { nwc } from "@getalby/sdk";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getConnectionSecret } from "./auth.js";
import { json } from "express";

export function addStreamableHttpEndpoints(app: Express) {
  app.post("/mcp", json(), async (req: Request, res: Response) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.
    try {
      const nostrWalletConnectUrl = getConnectionSecret(
        req.header("Authorization"),
        req.query.nwc as string
      );
      if (!nostrWalletConnectUrl) {
        res
          .status(400)
          .send("Bearer auth with NWC connection secret or nwc query parameter not provided");
        return;
      }

      const client = new nwc.NWCClient({
        nostrWalletConnectUrl,
      });
      const server = createMCPServer(client);
      const transport: StreamableHTTPServerTransport =
        new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
      res.on("close", () => {
        console.log("Request closed");
        transport.close();
        server.close();
        client.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });
}
