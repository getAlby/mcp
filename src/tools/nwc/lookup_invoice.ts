import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { transactionSchema } from "./schemas/transaction.js";

export function registerLookupInvoiceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "lookup_invoice",
    {
      title: "Lookup Invoice",
      description:
        "Look up lightning invoice details from a BOLT-11 invoice or payment hash",
      inputSchema: {
        payment_hash: z
          .string()
          .describe("The payment hash of the invoice to look up")
          .nullish(),
        invoice: z
          .string()
          .describe("The BOLT 11 invoice to look up")
          .nullish(),
      },
      outputSchema: transactionSchema,
    },
    async (params) => {
      const result = await client.lookupInvoice({
        invoice: params.invoice || undefined,
        payment_hash: params.payment_hash || undefined,
      });

      // Convert millisats to sats in the response
      const convertedResult = {
        ...result,
        amount: Math.ceil(result.amount / 1000), // Round up when converting millisats to sats
        fees_paid: Math.ceil(result.fees_paid / 1000),
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
