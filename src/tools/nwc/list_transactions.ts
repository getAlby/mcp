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
        .optional(),
      until: z
        .number()
        .describe("End timestamp (Unix epoch) for filtering transactions")
        .optional(),
      limit: z
        .number()
        .describe("Maximum number of transactions to return")
        .optional(),
      type: z
        .enum(["incoming", "outgoing"])
        .describe("Filter transactions by type")
        .optional(),
      unpaid: z
        .boolean()
        .describe("Filter for unpaid transactions only")
        .optional(),
    },
    async (params) => {
      const result = await client.listTransactions({
        from: params.from,
        until: params.until,
        limit: params.limit,
        type: params.type,
        unpaid: params.unpaid,
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