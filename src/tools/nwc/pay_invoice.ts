import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPayInvoiceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.tool(
    "pay_invoice",
    "Pay a lightning invoice",
    {
      invoice: z.string().describe("The lightning invoice to pay"),
      amount: z
        .number()
        .describe(
          "Optional amount in millisats, only provide if paying a zero-amount invoice"
        )
        .nullish(),
      metadata: z
        .object({})
        .passthrough()
        .describe("Optional metadata to include with the payment")
        .nullish(),
    },
    async (params) => {
      const result = await client.payInvoice({
        invoice: params.invoice,
        amount: params.amount || undefined,
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
