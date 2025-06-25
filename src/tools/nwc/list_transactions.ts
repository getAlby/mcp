import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { transactionSchema } from "./schemas/transaction.js";

export function registerListTransactionsTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "list_transactions",
    {
      title: "List Transactions",
      description:
        "List all transactions from the connected wallet with optional filtering by time, type, and limit",
      inputSchema: {
        from: z
          .number()
          .describe(
            "Start unix timestamp for filtering transactions (inclusive)"
          )
          .nullish(),
        until: z
          .number()
          .describe("End unix timestamp for filtering transactions (inclusive)")
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
        transactions: z
          .array(z.object(transactionSchema))
          .describe("List of transactions"),
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

      // Convert millisats to sats in all transactions
      const convertedResult = {
        ...result,
        transactions: result.transactions.map((transaction) => ({
          ...transaction,
          amount: Math.ceil(transaction.amount / 1000), // Round up when converting millisats to sats
          fees_paid: Math.ceil(transaction.fees_paid / 1000),
        })),
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
