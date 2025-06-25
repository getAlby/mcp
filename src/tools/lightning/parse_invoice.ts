import { Invoice } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { invoiceSchema } from "./schemas/invoice.js";

export function registerParseInvoiceTool(server: McpServer) {
  server.registerTool(
    "parse_invoice",
    {
      title: "Parse Invoice",
      description: "Parse a BOLT-11 lightning invoice",
      inputSchema: {
        invoice: z.string().describe("the bolt11 invoice"),
      },
      outputSchema: invoiceSchema,
    },
    async (params) => {
      // make output consistent with other tools
      const { satoshi, ...invoice } = new Invoice({ pr: params.invoice });

      const convertedResult = {
        ...invoice,
        amount_in_sats: satoshi,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(convertedResult, null, 2),
          },
        ],
        structuredContent: JSON.parse(JSON.stringify(convertedResult)),
      };
    }
  );
}
