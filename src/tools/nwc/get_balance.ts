import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGetBalanceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "get_balance",
    {
      title: "Get Balance",
      description: "Get the balance of the connected lightning wallet. Amounts are in millisats (1000 millisats = 1 sat). Preferred human-readable unit is sats.",
      outputSchema: {
        balance: z.number().describe("Current wallet balance in millisats"),
      },
    },
    async () => {
      const balance = await client.getBalance();

      return {
        structuredContent: balance,
        content: [
          {
            type: "text",
            text: JSON.stringify(balance, null, 2),
          },
        ],
      };
    }
  );
}
