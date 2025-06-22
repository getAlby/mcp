import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGetWalletServiceInfoTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "get_wallet_service_info",
    {
      title: "Get Wallet Service Info",
      description: "Get NWC capabilities, supported encryption and notification types of the connected lightning wallet",
      outputSchema: {
        capabilities: z.array(z.string()).describe("Available capabilities"),
        encryptionTypes: z.array(z.string()).optional().describe("Supported encryption types"),
        notificationTypes: z.array(z.string()).optional().describe("Supported notification types"),
      },
    },
    async () => {
      const info = await client.getWalletServiceInfo();
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
