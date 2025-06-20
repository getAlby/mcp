export function getConnectionSecretFromBearerAuth(
  authorizationHeader: string | undefined
) {
  const authParts = authorizationHeader?.split(" ");
  if (
    authParts?.length !== 2 ||
    authParts[0] !== "Bearer" ||
    !authParts[1].startsWith("nostr+walletconnect://")
  ) {
    return undefined;
  }
  return authParts[1];
}

export function getConnectionSecretFromQueryParam(
  nwcParam: string | undefined
): string | undefined {
  if (!nwcParam || !nwcParam.startsWith("nostr+walletconnect://")) {
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
