import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerLookupInvoiceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "lookup_invoice",
    {
      title: "Lookup Invoice",
      description: "Look up lightning invoice details from a BOLT-11 invoice or payment hash",
      inputSchema: {
        payment_hash: z
          .string()
          .describe("The payment hash of the invoice to look up")
          .nullish(),
        invoice: z.string().describe("The BOLT 11 invoice to look up").nullish(),
      },
      outputSchema: {
        type: z.enum(["incoming", "outgoing"]).describe("Transaction type"),
        state: z.enum(["settled", "pending", "failed"]).describe("Transaction state"),
        invoice: z.string().describe("BOLT-11 invoice"),
        description: z.string().describe("Invoice description"),
        description_hash: z.string().describe("Description hash"),
        preimage: z.string().describe("Payment preimage"),
        payment_hash: z.string().describe("Payment hash"),
        amount: z.number().describe("Amount in millisats"),
        fees_paid: z.number().describe("Fees paid in millisats"),
        settled_at: z.number().describe("Settlement timestamp"),
        created_at: z.number().describe("Creation timestamp"),
        expires_at: z.number().describe("Expiry timestamp"),
        settle_deadline: z.number().optional().describe("Settlement deadline"),
        metadata: z.unknown().optional().describe("Additional metadata"),
      },
    },
    async (params) => {
      const result = await client.lookupInvoice({
        invoice: params.invoice || undefined,
        payment_hash: params.payment_hash || undefined,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    }
  );
}
