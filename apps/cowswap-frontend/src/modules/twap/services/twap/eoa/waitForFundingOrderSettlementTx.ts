import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol/api'

const POLL_INTERVAL_MS = 1_500
const POLL_TIMEOUT_MS = 45_000

/**
 * EOA TWAP is created in a post-hook when the funding sell=buy order settles.
 * The toast we show after the order is placed should link to the public explorer of the current network, so we need to
 * wait for the funding order to settle to get its tx hash.
 */
export async function waitForFundingOrderSettlementTx(
  chainId: SupportedChainId,
  fundingOrderUid: string,
): Promise<string | undefined> {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    try {
      const trades = await getTrades({ orderUid: fundingOrderUid }, { chainId, env: 'prod' })
      const txHash = trades[0]?.txHash
      if (txHash) {
        return txHash
      }
    } catch {
      // Keep retrying until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  return undefined
}
