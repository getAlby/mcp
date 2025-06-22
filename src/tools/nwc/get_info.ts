import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGetInfoTool(server: McpServer, client: nwc.NWCClient) {
  server.registerTool(
    "get_info",
    {
      title: "Get Info",
      description: "Get NWC capabilities of the connected lightning wallet, and general information about the wallet and underlying lightning node",
      outputSchema: {
        alias: z.string().describe("Wallet alias"),
        color: z.string().describe("Wallet color"),
        pubkey: z.string().describe("Wallet public key"),
        network: z.string().describe("Network (mainnet/testnet)"),
        block_height: z.number().describe("Current block height"),
        block_hash: z.string().describe("Current block hash"),
        methods: z.array(z.string()).describe("Available NWC methods"),
        notifications: z.array(z.string()).optional().describe("Available notification types"),
        metadata: z.unknown().optional().describe("Additional metadata"),
        lud16: z.string().optional().describe("Lightning address"),
      },
    },
    async () => {
      const info = await client.getInfo();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(info, null, 2),
          },
        ],
        structuredContent: info,
      };
    }
  );
}
