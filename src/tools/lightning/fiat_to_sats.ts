import { fiat } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFiatToSatsTool(server: McpServer) {
  server.registerTool(
    "fiat_to_sats",
    {
      title: "Fiat To Sats",
      description: "Convert fiat amounts to sats. Amounts are in sats (1 sat = 1000 millisats). Preferred human-readable unit is sats.",
      inputSchema: {
        currency: z.string().describe("the fiat currency (e.g., USD, EUR)"),
        amount: z.number().describe("fiat amount to convert"),
      },
      outputSchema: {
        satoshi: z.number().describe("Amount in sats"),
      },
    },
    async (params) => {
      const satoshi = await fiat.getSatoshiValue(params);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ satoshi }),
          },
        ],
        structuredContent: {
          satoshi,
        },
      };
    }
  );
}
