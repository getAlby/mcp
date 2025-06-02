import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetInfoTool(server: McpServer, client: nwc.NWCClient) {
  server.tool(
    "get_info",
    "Get NWC capabilities of the connected lightning wallet, and general information about the wallet and underlying lightning node",
    async () => {
      const info = await client.getInfo();
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
