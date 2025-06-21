import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMakeInvoiceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.tool(
    "make_invoice",
    "Create a lightning invoice",
    {
      amount: z.number().describe("amount in millisatoshis (millisats)"),
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
      };
    }
  );
}
