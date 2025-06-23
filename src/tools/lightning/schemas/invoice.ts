import { z } from "zod";

export const invoiceSchema = {
  paymentRequest: z.string().describe("The BOLT-11 payment request"),
  paymentHash: z.string().describe("Payment hash"),
  preimage: z.string().nullable().describe("Payment preimage if available"),
  verify: z
    .string()
    .nullable()
    .describe("URL to verify if the email was paid (LNURL-verify)"),
  satoshi: z.number().describe("Amount in sats"),
  expiry: z.number().nullish().describe("Expiry time in seconds"),
  timestamp: z.number().describe("Creation unix timestamp"),
  createdDate: z.string().describe("Creation date string"),
  expiryDate: z.string().nullish().describe("Expiry date string"),
  description: z.string().nullable().describe("Invoice description"),
  successAction: z
    .unknown()
    .nullable()
    .describe("Success action to initiate after the invoice has been paid"),
};
