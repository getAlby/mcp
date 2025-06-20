import { fiat } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define Zod schema for the response - returns number of satoshis
const FiatToSatsResponseSchema = z.number().describe("Amount in satoshis (sats)");

export function registerFiatToSatsTool(server: McpServer) {
  server.tool(
    "fiat_to_sats",
    "Convert fiat amounts to satoshis (sats)",
    {
      currency: z.string().describe("the fiat currency (e.g., USD, EUR)"),
      amount: z.number().describe("fiat amount to convert to sats"),
    },
    async (params) => {
      const satoshi = await fiat.getSatoshiValue(params);
      
      // Validate the response
      const validatedSatoshi = FiatToSatsResponseSchema.parse(satoshi);

      return {
        content: [
          {
            type: "text",
            text: validatedSatoshi.toString(),
          },
        ],
      };
    }
  );
}
