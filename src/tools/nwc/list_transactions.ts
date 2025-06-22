import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerListTransactionsTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "list_transactions",
    {
      title: "List Transactions",
      description: "List all transactions from the connected wallet with optional filtering by time, type, and limit",
      inputSchema: {
        from: z
          .number()
          .describe("Start timestamp (Unix epoch) for filtering transactions")
          .nullish(),
        until: z
          .number()
          .describe("End timestamp (Unix epoch) for filtering transactions")
          .nullish(),
        limit: z
          .number()
          .describe("Maximum number of transactions to return")
          .nullish(),
        offset: z
          .number()
          .describe("Offset of the first transaction to return")
          .nullish(),
        type: z
          .enum(["incoming", "outgoing"])
          .describe("Filter transactions by type")
          .nullish(),
        unpaid: z
          .boolean()
          .describe("Filter for unpaid transactions only")
          .nullish(),
      },
      outputSchema: {
        transactions: z.array(z.object({
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
        })).describe("List of transactions"),
        total_count: z.number().describe("Total number of transactions"),
      },
    },
    async (params) => {
      const result = await client.listTransactions({
        from: params.from || undefined,
        until: params.until || undefined,
        limit: params.limit || undefined,
        type: params.type || undefined,
        unpaid: params.unpaid || undefined,
        offset: params.offset || undefined,
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
