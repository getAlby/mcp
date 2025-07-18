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
      description: "Get the balance of the connected lightning wallet",
      outputSchema: {
        amount_in_sats: z.number().describe("Current wallet balance in sats"),
      },
    },
    async () => {
      const balance = await client.getBalance();

      // Convert millisats to sats
      const convertedBalance = {
        amount_in_sats: Math.floor(balance.balance / 1000), // Round down when converting millisats to sats as balance
      };

      return {
        structuredContent: convertedBalance,
        content: [
          {
            type: "text",
            text: JSON.stringify(convertedBalance, null, 2),
          },
        ],
      };
    }
  );
}
