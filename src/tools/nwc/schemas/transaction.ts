import { z } from "zod";

export const transactionSchema = {
  type: z.enum(["incoming", "outgoing"]).describe("Transaction type"),
  state: z
    .enum(["settled", "pending", "failed"])
    .nullish()
    .describe("Transaction state"),
  invoice: z.string().describe("BOLT-11 invoice"),
  description: z.string().nullish().describe("Invoice description"),
  description_hash: z.string().nullish().describe("Description hash"),
  preimage: z.string().nullish().describe("Preimage of settled payment"),
  payment_hash: z.string().describe("Payment hash"),
  amount_in_sats: z.number().describe("Amount in sats"),
  fees_paid_in_sats: z.number().nullish().describe("Fees paid in sats"),
  settled_at: z.number().nullish().describe("Timestamp, of settled payment"),
  created_at: z.number().describe("Creation unix timestamp"),
  expires_at: z.number().nullish().describe("Expiry unix timestamp"), // TODO: remove nullish once Primal supports it
  settle_deadline: z
    .number()
    .nullish()
    .describe("HOLD invoice settle deadline"),
  metadata: z
    .unknown()
    .nullish()
    .describe("Additional metadata about the transaction"),
};
