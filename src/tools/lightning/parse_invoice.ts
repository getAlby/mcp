import { Invoice } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerParseInvoiceTool(server: McpServer) {
  server.registerTool(
    "parse_invoice",
    {
      title: "Parse Invoice",
      description: "Parse a BOLT-11 lightning invoice",
      inputSchema: {
        invoice: z.string().describe("the bolt11 invoice"),
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
      const invoice = new Invoice({ pr: params.invoice });

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
