import type { Hex, TransactionReceipt } from 'viem'
import type { Config } from 'wagmi'
import { getTransaction, getTransactionReceipt } from 'wagmi/actions'

import { createCowLogger, delay, normalizeError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { NOT_BROADCAST_GRACE_PERIOD_MS, TransactionNotBroadcastError } from 'common/hooks/useGetReceipt'

const log = createCowLogger('EOA TWAP receipt')

/** Interval between receipt / mempool lookups while waiting for the tx to mine or appear. */
const RECEIPT_POLL_MS = 2_000

/** Upper bound once the tx is known to exist in the mempool / on a lagging RPC. */
const RECEIPT_TIMEOUT_MS = 180_000

/**
 * Waits for a receipt without hanging forever on MetaMask Smart Transaction synthetic hashes
 * that are never broadcast (see `TransactionNotBroadcastError` / FinalizeTxUpdater).
 */
export async function waitForEoaTwapTxReceipt(
  config: Config,
  hash: Hex,
  chainId: SupportedChainId,
): Promise<TransactionReceipt> {
  const gracePeriodMs = NOT_BROADCAST_GRACE_PERIOD_MS[chainId]
  const startedAt = Date.now()

  while (Date.now() - startedAt < RECEIPT_TIMEOUT_MS) {
    const receipt = await getTransactionReceipt(config, { hash }).catch(() => null)

    if (receipt) {
      return receipt
    }

    let txExists = false
    try {
      await getTransaction(config, { hash })
      txExists = true
    } catch (err: unknown) {
      const error = normalizeError(err)
      if (error.name === 'TransactionNotFoundError') {
        txExists = false
      } else {
        // Transient RPC failure — keep polling.
        await delay(RECEIPT_POLL_MS)
        continue
      }
    }

    const pendingMs = Date.now() - startedAt

    if (!txExists && pendingMs >= gracePeriodMs) {
      log.warn('Tx hash not found on-chain after grace period (likely STX synthetic hash)', {
        hash,
        pendingMs,
        gracePeriodMs,
      })
      throw new TransactionNotBroadcastError(hash)
    }

    await delay(RECEIPT_POLL_MS)
  }

  throw new Error(t`Timed out waiting for the transaction. Please try again.`)
}
