import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

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
        amount: z.number().describe("amount in millisats"),
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
      const result = await client.makeInvoice({
        amount: params.amount,
        description: params.description || undefined,
        description_hash: params.description_hash || undefined,
        expiry: params.expiry || undefined,
        metadata: params.metadata || undefined,
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
