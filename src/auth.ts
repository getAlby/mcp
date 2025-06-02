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
