import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetBalanceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.tool(
    "get_balance",
    "Get the balance of the connected lightning wallet",
    async () => {
      const balance = await client.getBalance();
      return {
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
