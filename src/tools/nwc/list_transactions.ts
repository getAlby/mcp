import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerListTransactionsTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.tool(
    "list_transactions",
    "List all transactions from the connected wallet with optional filtering by time, type, and limit",
    {
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
      };
    }
  );
}
