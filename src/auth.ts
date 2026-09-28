import { nwc } from "@getalby/sdk";

const HEX_KEY_REGEX = /^[0-9a-f]{64}$/i;

function isValidConnectionSecret(connectionSecret: string): boolean {
  if (!connectionSecret.startsWith("nostr+walletconnect://")) {
    return false;
  }
  try {
    const { walletPubkey, secret, relayUrl } =
      nwc.NWCClient.parseWalletConnectUrl(connectionSecret);
    if (!HEX_KEY_REGEX.test(walletPubkey) || !secret || !HEX_KEY_REGEX.test(secret)) {
      return false;
    }
    const relayProtocol = new URL(relayUrl).protocol;
    return relayProtocol === "wss:" || relayProtocol === "ws:";
  } catch {
    return false;
  }
}

function getConnectionSecretFromBearerAuth(
  authorizationHeader: string | undefined
) {
  const authParts = authorizationHeader?.split(" ");
  if (
    authParts?.length !== 2 ||
    authParts[0] !== "Bearer" ||
    !isValidConnectionSecret(authParts[1])
  ) {
    return undefined;
  }
  return authParts[1];
}

function getConnectionSecretFromQueryParam(
  nwcParam: string | undefined
): string | undefined {
  if (!nwcParam || !isValidConnectionSecret(nwcParam)) {
    return undefined;
  }
  return nwcParam;
}

export function getConnectionSecret(
  authorizationHeader: string | undefined,
  nwcQueryParam: string | undefined
): string | undefined {
  // Try query parameter first, then fall back to bearer auth
  return (
    getConnectionSecretFromQueryParam(nwcQueryParam) ||
    getConnectionSecretFromBearerAuth(authorizationHeader)
  );
}
