import { l402 } from "@getalby/lightning-tools";
import { webln } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFetchL402Tool(
  server: McpServer,
  webln: webln.NostrWebLNProvider
) {
  server.tool(
    "fetch_l402",
    "Fetch a paid resource protected by L402",
    {
      url: z.string().describe("the URL to fetch"),
      method: z.string().nullish().describe("HTTP request method. Default GET"),
      body: z
        .string()
        .nullish()
        .describe(
          "HTTP request body as a string (either plaintext or stringified JSON)"
        ),
    },
    async (params) => {
      const requestOptions: RequestInit = {
        method: params.method || undefined,
      };

      if (
        params.method &&
        params.method !== "GET" &&
        params.method !== "HEAD"
      ) {
        requestOptions.body = params.body;
        requestOptions.headers = {
          "Content-Type": "application/json",
        };
      }

      const result = await l402.fetchWithL402(params.url, requestOptions, {
        webln,
      });

      const responseContent = await result.text();
      if (!result.ok) {
        console.error(
          "L402 fetch returned non-OK status",
          result.status,
          responseContent
        );
        throw new Error(
          "fetch returned non-OK status: " +
            result.status +
            " " +
            responseContent
        );
      }

      return {
        content: [
          {
            type: "text",
            text: responseContent,
          },
        ],
      };
    }
  );
}
