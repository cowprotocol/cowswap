import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Networks the app trades on and the wallet modal offers, Ethereum first as the default. `getRegistry()` leaves out
 * the tokens of `data/RWAs.json` on other networks, and the assets left without tokens.
 */
export const RWA_CHAIN_IDS: readonly SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.BNB,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.PLASMA,
  SupportedChainId.INK,
  SupportedChainId.GNOSIS_CHAIN,
]
