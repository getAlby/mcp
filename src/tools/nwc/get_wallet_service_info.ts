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
      description:
        "Get NWC capabilities, supported encryption and notification types of the connected lightning wallet",
      outputSchema: {
        capabilities: z
          .array(z.string())
          .describe(
            "Capabilities supported by this wallet - for example, NWC methods like 'pay_invoice', and 'notifications' if any notification types are supported."
          ),
        encryptions: z
          .array(z.string())
          .nullish()
          .describe("NWC encryption types supported by this connection"),
        notifications: z
          .array(z.string())
          .nullish()
          .describe("NWC notification types supported by this connection"),
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
