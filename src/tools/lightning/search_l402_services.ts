import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const SATRING_API = "https://satring.com/api/v1";

export function registerSearchL402ServicesTool(server: McpServer) {
  server.registerTool(
    "search_l402_services",
    {
      title: "Search L402 Services",
      description:
        "Search the satring.com directory to discover L402-paywalled API services. " +
        "Use this to find available paid APIs before calling fetch_l402. " +
        "Returns services with name, url, description, pricing, and ratings.",
      inputSchema: {
        query: z
          .string()
          .nullish()
          .describe("Search query (e.g. 'web search', 'ai', 'agent')"),
        category: z
          .string()
          .nullish()
          .describe(
            "Filter by category slug: 'ai-ml', 'data', 'finance', 'identity', 'media', 'search', 'social', 'storage', 'tools'"
          ),
      },
    },
    async (params) => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set("q", params.query);
      if (params.category) searchParams.set("category", params.category);

      const resp = await fetch(
        `${SATRING_API}/search?${searchParams.toString()}`,
        { signal: AbortSignal.timeout(10_000) }
      );
      if (!resp.ok) {
        const body = (await resp.text()).slice(0, 200);
        throw new Error(
          "L402 service search failed: " + resp.status + " " + body
        );
      }

      const data = await resp.json();
      const structuredContent = Array.isArray(data)
        ? { results: data }
        : (data as Record<string, unknown>);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data) }],
        structuredContent,
      };
    }
  );
}
