import { l402 } from "@getalby/lightning-tools";
import { webln } from "@getalby/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { assertPublicUrl } from "../../security.js";

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
        method: z
          .string()
          .nullish()
          .describe("HTTP request method. Default GET"),
        body: z
          .string()
          .nullish()
          .describe(
            "HTTP request body as a string (either plaintext or stringified JSON)"
          ),
      },
      outputSchema: {
        content: z.string().describe("Response content"),
      },
    },
    async (params) => {
      // Only public, globally-routable hosts may be fetched.
      await assertPublicUrl(params.url);

      const requestOptions: RequestInit = {
        method: params.method || undefined,
        // Redirects are refused rather than followed: a validated public URL
        // could otherwise redirect to a private one, and each hop would be a
        // separate L402 challenge that gets paid without the user seeing it.
        redirect: "error",
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

      let result: Response;
      try {
        result = await l402.fetchWithL402(params.url, requestOptions, {
          webln,
        });
      } catch (error) {
        // fetch reports a refused redirect as an opaque TypeError.
        throw new Error(
          "fetch failed (the URL may redirect, which is not followed): " +
            (error instanceof Error ? error.message : String(error))
        );
      }

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
