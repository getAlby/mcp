import { LightningAddress } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { invoiceSchema } from "./schemas/invoice.js";

export function registerRequestInvoiceFromLightningAddressTool(
  server: McpServer
) {
  server.registerTool(
    "request_invoice",
    {
      title: "Request Invoice",
      description: "Request an invoice from a lightning address",
      inputSchema: {
        lightning_address: z
          .string()
          .describe("the recipient's lightning address"),
        amount: z.number().describe("amount in sats"),
        description: z
          .string()
          .describe("note, memo or description describing the invoice")
          .nullish(),
        payer_data: z
          .object({})
          .passthrough()
          .describe(
            "metadata to include with the payment such as the payer's name"
          )
          .nullish(),
      },
      outputSchema: invoiceSchema,
    },
    async (params) => {
      const ln = new LightningAddress(params.lightning_address);

      // fetch the LNURL data
      await ln.fetch();

      const invoice = await ln.requestInvoice({
        satoshi: params.amount,
        comment: params.description || undefined,
        payerdata: params.payer_data || undefined,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(invoice, null, 2),
          },
        ],
        structuredContent: JSON.parse(JSON.stringify(invoice)),
      };
    }
  );
}
