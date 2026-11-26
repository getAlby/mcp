import { z, ZodRawShape } from "zod";

// Clients validate structuredContent against the advertised JSON schema, which
// forbids undeclared fields, and NWC wallets may return fields beyond NIP-47.
export function toolResult(outputSchema: ZodRawShape, result: unknown) {
  const structuredContent = z.object(outputSchema).parse(result);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(structuredContent, null, 2),
      },
    ],
    structuredContent,
  };
}
