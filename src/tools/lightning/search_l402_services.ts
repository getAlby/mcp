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
        "Example: search for 'web search' to find AI-powered search APIs you can pay with Lightning.",
      inputSchema: {
        query: z
          .string()
          .nullish()
          .describe("Search query (e.g. 'web search', 'ai', 'agent')"),
        category: z
          .string()
          .nullish()
          .describe(
            "Filter by category slug (e.g. 'ai-ml', 'search', 'finance', 'tools')"
          ),
      },
      outputSchema: {
        services: z.array(
          z.object({
            name: z.string().describe("Service name"),
            url: z.string().describe("Service endpoint URL"),
            description: z.string().describe("Service description"),
            pricing_sats: z.number().describe("Price in satoshis"),
            pricing_model: z.string().describe("Pricing model"),
            avg_rating: z.number().describe("Average rating (0-5)"),
            rating_count: z.number().describe("Number of ratings"),
            categories: z.array(
              z.object({
                name: z.string(),
                slug: z.string(),
              })
            ),
          })
        ),
        total: z.number().describe("Total number of matching services"),
      },
    },
    async (params) => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set("q", params.query);
      if (params.category) searchParams.set("category", params.category);

      const resp = await fetch(
        `${SATRING_API}/search?${searchParams.toString()}`
      );
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(
          "L402 service search failed: " + resp.status + " " + body
        );
      }

      const data = await resp.json();

      const services = (data.services || []).map(
        (s: Record<string, unknown>) => ({
          name: s.name,
          url: s.url,
          description: s.description,
          pricing_sats: s.pricing_sats,
          pricing_model: s.pricing_model,
          avg_rating: s.avg_rating,
          rating_count: s.rating_count,
          categories: (
            s.categories as Array<Record<string, unknown>>
          ).map((c) => ({
            name: c.name,
            slug: c.slug,
          })),
        })
      );

      const result = {
        services,
        total: data.total,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    }
  );
}
