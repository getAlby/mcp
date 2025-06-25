import { fiat } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFiatToSatsTool(server: McpServer) {
  server.registerTool(
    "fiat_to_sats",
    {
      title: "Fiat To Sats",
      description: "Convert fiat amounts to sats",
      inputSchema: {
        fiat_currency: z
          .string()
          .describe("the fiat currency (e.g., USD, EUR)"),
        fiat_amount: z.number().describe("fiat amount to convert"),
      },
      outputSchema: {
        amount_in_sats: z.number().describe("Amount in sats"),
      },
    },
    async (params) => {
      const satoshi = await fiat.getSatoshiValue({
        amount: params.fiat_amount,
        currency: params.fiat_currency,
      });

      // make output consistent with other tools
      const convertedResult = {
        amount_in_sats: satoshi,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(convertedResult),
          },
        ],
        structuredContent: convertedResult,
      };
    }
  );
}
