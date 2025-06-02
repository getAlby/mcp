import { fiat } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFiatToSatsTool(server: McpServer) {
  server.tool(
    "fiat_to_sats",
    "Convert fiat amounts to sats",
    {
      currency: z.string().describe("the fiat currency"),
      amount: z.number().describe("amount in sats"),
    },
    async (params) => {
      const satoshi = await fiat.getSatoshiValue(params);

      return {
        content: [
          {
            type: "text",
            text: satoshi.toString(),
          },
        ],
      };
    }
  );
}
