import { nwc } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { toolResult } from "../tool_result.js";

const outputSchema = {
  alias: z.string().nullish().describe("Node alias"),
  color: z.string().nullish().describe("Node color"),
  pubkey: z.string().nullish().describe("Node public key"),
  network: z
    .string()
    .nullish()
    .describe("Bitcoin Network (mainnet/testnet)"),
  block_height: z.number().nullish().describe("Current block height"),
  block_hash: z.string().nullish().describe("Current block hash"),
  methods: z
    .array(z.string())
    .describe("NWC methods supported by this connection"),
  notifications: z
    .array(z.string())
    .nullish()
    .describe("NWC notification types supported by this connection"),
  metadata: z
    .unknown()
    .nullish()
    .describe("Additional metadata about this connection"),
  lud16: z.string().nullish().describe("Lightning address of the wallet"),
};

export function registerGetInfoTool(server: McpServer, client: nwc.NWCClient) {
  server.registerTool(
    "get_info",
    {
      title: "Get Info",
      description:
        "Get NWC capabilities of the connected lightning wallet, and general information about the wallet and underlying lightning node",
      outputSchema,
    },
    async () => {
      const info = await client.getInfo();
      return toolResult(outputSchema, info);
    }
  );
}
