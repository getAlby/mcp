// Minimal ambient declaration for ipaddr.js (no official types published).
// Only the surface used by src/security.ts is declared.
declare module "ipaddr.js" {
  interface IP {
    kind(): "ipv4" | "ipv6";
    range(): string;
    isIPv4MappedAddress(): boolean;
    toIPv4Address(): IP;
  }
  export function parse(addr: string): IP;
  export function isValid(addr: string): boolean;
}
