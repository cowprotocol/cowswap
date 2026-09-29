/**
 * Network slugs used in CoW API paths, mirroring the slug list in
 * `@cowprotocol/sdk-order-book`. An unknown slug is not an error — the request
 * still matches its endpoint, it just carries `chainId: undefined`.
 */
export const NETWORK_SLUG_TO_CHAIN_ID: Readonly<Record<string, number>> = {
  mainnet: 1,
  xdai: 100,
  bnb: 56,
  polygon: 137,
  base: 8453,
  arbitrum_one: 42161,
  avalanche: 43114,
  linea: 59144,
  ink: 57073,
  lens: 232,
  plasma: 9745,
  sepolia: 11155111,
}
