import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPayInvoiceTool(
  server: McpServer,
  client: nwc.NWCClient
) {
  server.registerTool(
    "pay_invoice",
    {
      title: "Pay Invoice",
      description: "Pay a lightning invoice",
      inputSchema: {
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
      outputSchema: {
        preimage: z.string().describe("Payment preimage"),
        fees_paid: z.number().describe("Fees paid in millisats"),
      },
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
        structuredContent: result,
      };
    }
  );
}
