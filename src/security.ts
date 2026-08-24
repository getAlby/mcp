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
 * Lowercases a Host header value and strips the port. A bracketed host keeps
 * its brackets ([::1]:3000 -> [::1]); a bare IPv6 address is left alone, since
 * only a single colon can be a port separator (::1 is a host, not host ":1").
 */
function normalizeHost(host: string): string {
  const lower = host.trim().toLowerCase();
  if (lower.startsWith("[")) {
    const end = lower.indexOf("]");
    return end === -1 ? lower : lower.slice(0, end + 1);
  }
  const first = lower.indexOf(":");
  if (first !== -1 && lower.indexOf(":", first + 1) === -1) {
    return lower.slice(0, first);
  }
  return lower;
}

/**
 * Express middleware that rejects requests whose Host or Origin header is not
 * explicitly allowed, as recommended for locally-bound MCP HTTP transports.
 *
 * Defaults to loopback-only. Set ALLOWED_HOSTS (comma-separated) for public
 * deployments and ALLOWED_ORIGINS to permit specific browser origins.
 */
export function hostOriginGuard(): RequestHandler {
  // When ALLOWED_HOSTS is set it replaces the loopback defaults rather than
  // extending them, so a deployment that names its hostname does not keep
  // accepting "localhost" as well.
  const configuredHosts = parseCsvEnv(process.env.ALLOWED_HOSTS);
  const allowedHosts = new Set(
    (configuredHosts.length > 0 ? configuredHosts : DEFAULT_ALLOWED_HOSTS).map(
      normalizeHost
    )
  );
  const allowedOrigins = new Set(parseCsvEnv(process.env.ALLOWED_ORIGINS));

  return (req, res, next) => {
    const host = normalizeHost(req.headers.host ?? "");
    if (!allowedHosts.has(host)) {
      res
        .status(403)
        .send(
          `Forbidden: host ${host || "(none)"} not allowed. ` +
            `Set ALLOWED_HOSTS to permit it.`
        );
      return;
    }

    // An absent Origin (every non-browser MCP client) is allowed; a present
    // one must be listed, including the empty string and the literal "null".
    const origin = req.headers.origin;
    if (origin !== undefined && !allowedOrigins.has(origin.toLowerCase())) {
      res
        .status(403)
        .send(
          `Forbidden: origin ${origin || "(empty)"} not allowed. ` +
            `Set ALLOWED_ORIGINS to permit it.`
        );
      return;
    }

    next();
  };
}

function isPublicAddress(address: string): boolean {
  let parsed: ipaddr.IPv4 | ipaddr.IPv6 = ipaddr.parse(address);
  // Unwrap IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1) so the embedded
  // IPv4 address is classified rather than the wrapper.
  if (parsed instanceof ipaddr.IPv6 && parsed.isIPv4MappedAddress()) {
    parsed = parsed.toIPv4Address();
  }
  // "unicast" is the only globally-routable range; everything else (loopback,
  // private, linkLocal, uniqueLocal, carrierGradeNat, reserved, ...) is blocked.
  return parsed.range() === "unicast";
}

/**
 * Throws unless `rawUrl` is an http(s) URL that resolves exclusively to public
 * (globally-routable) addresses, so outbound fetches cannot reach loopback,
 * link-local (incl. 169.254.169.254), RFC1918 or IPv6 local ranges.
 *
 * Note: the address is validated here, but the fetch resolves the hostname
 * again independently. A DNS server that returns a public address to this
 * check and a private one to the fetch therefore defeats it; closing that
 * requires connecting to the validated address, which @getalby/lightning-tools
 * cannot currently express.
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
