import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define Zod schema for the balance response
const BalanceResponseSchema = z.object({
  balance: z.number().describe("Current wallet balance in millisatoshis (millisats)")
});

export function registerGetBalanceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.tool(
    "get_balance",
    "Get the balance of the connected lightning wallet (returned in millisatoshis)",
    async () => {
      const balance = await client.getBalance();
      
      // Validate the response against our schema
      const validatedBalance = BalanceResponseSchema.parse(balance);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(validatedBalance, null, 2),
          },
        ],
      };
    }
  );
}
