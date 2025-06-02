import { Invoice } from "@getalby/lightning-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerParseInvoiceTool(server: McpServer) {
  server.tool(
    "parse_invoice",
    "Parse a BOLT-11 lightning invoice",
    {
      invoice: z.string().describe("the bolt11 invoice"),
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
      };
    }
  );
}
