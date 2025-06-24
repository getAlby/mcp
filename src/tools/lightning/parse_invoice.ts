import { Invoice } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { invoiceSchema } from "./schemas/invoice.js";

export function registerParseInvoiceTool(server: McpServer) {
  server.registerTool(
    "parse_invoice",
    {
      title: "Parse Invoice",
      description: "Parse a BOLT-11 lightning invoice. Amounts are in sats (1 sat = 1000 millisats). Preferred human-readable unit is sats.",
      inputSchema: {
        invoice: z.string().describe("the bolt11 invoice"),
      },
      outputSchema: invoiceSchema,
    },
    async (params) => {
      const invoice = new Invoice({ pr: params.invoice });

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
