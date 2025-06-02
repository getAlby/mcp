import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetWalletServiceInfoTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.tool(
    "get_wallet_service_info",
    "Get NWC capabilities, supported encryption and notification types of the connected lightning wallet",
    async () => {
      const info = await client.getWalletServiceInfo();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    }
  );
}
