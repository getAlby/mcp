import dns from "node:dns/promises";
import net from "node:net";
import ipaddr from "ipaddr.js";
import type { RequestHandler } from "express";

// Hostnames that are always allowed as the HTTP Host header. Additional hosts
// (e.g. a public deployment domain) can be added via the ALLOWED_HOSTS env var.
const DEFAULT_ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]", "::1"];

function parseCsvEnv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Express middleware that rejects requests whose Host or Origin header is not
 * explicitly allowed. This is the primary defense against DNS-rebinding: a
 * malicious web page can rebind its hostname to a loopback/private address, but
 * the browser still sends that hostname as the Host header (and the attacker
 * origin as Origin), neither of which is in the allowlist.
 *
 * Defaults to loopback-only. Set ALLOWED_HOSTS (comma-separated) for public
 * deployments and ALLOWED_ORIGINS to permit specific browser origins.
 */
export function hostOriginGuard(): RequestHandler {
  const allowedHosts = new Set([
    ...DEFAULT_ALLOWED_HOSTS,
    ...parseCsvEnv(process.env.ALLOWED_HOSTS),
  ]);
  const allowedOrigins = new Set(parseCsvEnv(process.env.ALLOWED_ORIGINS));

  return (req, res, next) => {
    const host = (req.headers.host ?? "").toLowerCase().replace(/:\d+$/, "");
    if (!allowedHosts.has(host)) {
      res.status(403).send("Forbidden: host not allowed");
      return;
    }

    const origin = req.headers.origin;
    if (origin && !allowedOrigins.has(origin.toLowerCase())) {
      res.status(403).send("Forbidden: origin not allowed");
      return;
    }

    next();
  };
}

function isPublicAddress(address: string): boolean {
  let parsed = ipaddr.parse(address);
  // Unwrap IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1) so the embedded
  // IPv4 address is classified rather than the wrapper.
  if (parsed.kind() === "ipv6" && parsed.isIPv4MappedAddress()) {
    parsed = parsed.toIPv4Address();
  }
  // "unicast" is the only globally-routable range; everything else (loopback,
  // private, linkLocal, uniqueLocal, carrierGradeNat, reserved, ...) is blocked.
  return parsed.range() === "unicast";
}

/**
 * Throws unless `rawUrl` is an http(s) URL that resolves exclusively to public
 * (globally-routable) addresses. Guards outbound fetches against SSRF into
 * loopback, link-local (incl. cloud metadata 169.254.169.254), RFC1918 and
 * IPv6 local ranges.
 */
export async function assertPublicUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Blocked URL scheme: ${url.protocol}`);
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  // Explicit opt-in for otherwise-blocked hosts (e.g. a local L402 test server
  // during development). Set ALLOWED_FETCH_HOSTS=localhost,127.0.0.1 to allow.
  const allowedFetchHosts = new Set(parseCsvEnv(process.env.ALLOWED_FETCH_HOSTS));
  if (allowedFetchHosts.has(hostname.toLowerCase())) {
    return;
  }

  const addresses = net.isIP(hostname)
    ? [hostname]
    : (await dns.lookup(hostname, { all: true })).map((r) => r.address);

  if (addresses.length === 0) {
    throw new Error(`Could not resolve host: ${hostname}`);
  }

  for (const address of addresses) {
    if (!isPublicAddress(address)) {
      throw new Error(
        `Blocked request to non-public address (${address}) for host ${hostname}`
      );
    }
  }
}
