import { LightningAddress } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

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
      outputSchema: {
        paymentRequest: z.string().describe("The BOLT-11 payment request"),
        paymentHash: z.string().describe("Payment hash"),
        preimage: z.string().nullable().describe("Payment preimage if available"),
        verify: z.string().nullable().describe("Verification string"),
        satoshi: z.number().describe("Amount in satoshis"),
        expiry: z.number().optional().describe("Expiry time in seconds"),
        timestamp: z.number().describe("Creation timestamp"),
        createdDate: z.date().describe("Creation date"),
        expiryDate: z.date().optional().describe("Expiry date"),
        description: z.string().nullable().describe("Invoice description"),
        successAction: z.unknown().nullable().describe("Success action"),
      },
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

      // Convert Invoice instance to a plain object to match structuredContent type
      const invoiceData = {
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
        preimage: invoice.preimage,
        verify: invoice.verify,
        satoshi: invoice.satoshi,
        expiry: invoice.expiry,
        timestamp: invoice.timestamp,
        createdDate: invoice.createdDate,
        expiryDate: invoice.expiryDate,
        description: invoice.description,
        successAction: invoice.successAction,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(invoice, null, 2),
          },
        ],
        structuredContent: invoiceData,
      };
    }
  );
}
