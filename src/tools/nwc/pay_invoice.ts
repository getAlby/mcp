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
        amount_in_sats: z
          .number()
          .describe(
            "Optional amount in sats, only provide if paying a zero-amount invoice"
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
        fees_paid_in_sats: z.number().nullish().describe("Fees paid in sats"),
      },
    },
    async (params) => {
      const { fees_paid, ...result } = await client.payInvoice({
        invoice: params.invoice,
        amount: params.amount_in_sats
          ? params.amount_in_sats * 1000
          : undefined, // Convert sats to millisats for NWC
        metadata: params.metadata || undefined,
      });

      // Convert millisats back to sats in the response
      const convertedResult = {
        ...result,
        fees_paid_in_sats: fees_paid ? Math.ceil(fees_paid / 1000) : 0, // Round up fees when converting millisats to sats
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
