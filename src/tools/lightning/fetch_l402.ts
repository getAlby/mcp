import { l402 } from "@getalby/lightning-tools";
import { webln } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerFetchL402Tool(
  server: McpServer,
  webln: webln.NostrWebLNProvider
) {
  server.registerTool(
    "fetch_l402",
    {
      title: "Fetch L402",
      description: "Fetch a paid resource protected by L402",
      inputSchema: {
        url: z.string().describe("the URL to fetch"),
        method: z.string().nullish().describe("HTTP request method. Default GET"),
        body: z
          .string()
          .nullish()
          .describe(
            "HTTP request body as a string (either plaintext or stringified JSON)"
          ),
      },
      outputSchema: {
        content: z.string().describe("Response content"),
        status: z.number().describe("HTTP status code"),
      },
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

      const responseData = {
        content: responseContent,
        status: result.status,
      };

      return {
        content: [
          {
            type: "text",
            text: responseContent,
          },
        ],
        structuredContent: responseData,
      };
    }
  );
}
