import { nwc, webln } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetInfoTool } from "./tools/nwc/get_info.js";
import { registerGetWalletServiceInfoTool } from "./tools/nwc/get_wallet_service_info.js";
import { registerLookupInvoiceTool } from "./tools/nwc/lookup_invoice.js";
import { registerMakeInvoiceTool } from "./tools/nwc/make_invoice.js";
import { registerPayInvoiceTool } from "./tools/nwc/pay_invoice.js";
import { registerGetBalanceTool } from "./tools/nwc/get_balance.js";
import { registerListTransactionsTool } from "./tools/nwc/list_transactions.js";
import { registerFetchL402Tool } from "./tools/lightning/fetch_l402.js";
import { registerFiatToSatsTool } from "./tools/lightning/fiat_to_sats.js";
import { registerParseInvoiceTool } from "./tools/lightning/parse_invoice.js";
import { registerRequestInvoiceFromLightningAddressTool } from "./tools/lightning/request_invoice.js";

export function createMCPServer(client: nwc.NWCClient): McpServer {
  const server = new McpServer({
    name: "@getalby/mcp",
    version: "1.1.0",
    title: "Alby MCP Server",
  });

  // NWC
  registerGetWalletServiceInfoTool(server, client);
  registerGetInfoTool(server, client);
  registerMakeInvoiceTool(server, client);
  registerPayInvoiceTool(server, client);
  registerGetBalanceTool(server, client);
  registerLookupInvoiceTool(server, client);
  registerListTransactionsTool(server, client);

  // Lightning tools
  registerFetchL402Tool(
    server,
    new webln.NostrWebLNProvider({
      client,
    })
  );
  registerFiatToSatsTool(server);
  registerParseInvoiceTool(server);
  registerRequestInvoiceFromLightningAddressTool(server);

  return server;
}
