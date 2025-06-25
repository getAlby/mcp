import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { transactionSchema } from "./schemas/transaction.js";

export function registerMakeInvoiceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "make_invoice",
    {
      title: "Make Invoice",
      description: "Create a lightning invoice",
      inputSchema: {
        amount_in_sats: z.number().describe("amount in sats"),
        expiry: z.number().describe("expiry in seconds").nullish(),
        description: z
          .string()
          .describe("note, memo or description describing the invoice")
          .nullish(),
        description_hash: z
          .string()
          .describe(
            "hash of a note, memo or description that is too long to fit within the invoice"
          )
          .nullish(),
        metadata: z
          .object({})
          .passthrough()
          .describe("Optional metadata to include with the payment")
          .nullish(),
      },
      outputSchema: transactionSchema,
    },
    async (params) => {
      const { amount, fees_paid, ...result } = await client.makeInvoice({
        amount: params.amount_in_sats * 1000, // Convert sats to millisats for NWC
        description: params.description || undefined,
        description_hash: params.description_hash || undefined,
        expiry: params.expiry || undefined,
        metadata: params.metadata || undefined,
      });

      // Convert millisats back to sats in the response
      const convertedResult = {
        ...result,
        amount_in_sats: Math.floor(amount / 1000), // Round down when converting millisats to sats
        fees_paid_in_sats: Math.ceil(fees_paid / 1000), // Round up fees
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(convertedResult, null, 2),
          },
        ],
        structuredContent: convertedResult,
      };
    }
  );
}
