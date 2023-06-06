/**
 * This file is basically a Mod of src/state/enhancedTransactions/updater
 */

import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'

import ms from 'ms.macro'

import { GetReceipt, useGetReceipt } from 'legacy/hooks/useGetReceipt'
import { GetSafeInfo, useGetSafeInfo } from 'legacy/hooks/useGetSafeInfo'
import { AppDispatch } from 'legacy/state'
import { useAddPopup } from 'legacy/state/application/hooks'
import { useAllTransactionsDetails } from 'legacy/state/enhancedTransactions/hooks'
import { useAppDispatch } from 'legacy/state/hooks'
// import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { cancelOrdersBatch, invalidateOrdersBatch } from 'legacy/state/orders/actions'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { removeInFlightOrderIdAtom } from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'
import { useWalletInfo } from 'modules/wallet'

import useBlockNumber from 'lib/hooks/useBlockNumber'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { checkedTransaction, finalizeTransaction, updateSafeTransaction } from '../actions'
import { EnhancedTransactionDetails, HashType } from '../reducer'

const DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS = ms`2m` // Delay removing the order ID since the creation time its mined (minor precaution just to avoid edge cases of delay in indexing times affect the collision detection

type TxInterface = Pick<
  EnhancedTransactionDetails,
  'addedTime' | 'lastCheckedBlockNumber' | 'receipt' | 'safeTransaction'
>

export function shouldCheck(lastBlockNumber: number, tx: TxInterface): boolean {
  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck >= 3
  } else {
    // otherwise every block
    return true
  }
}

interface CheckEthereumTransactions {
  chainId: number
  transactions: EnhancedTransactionDetails[]
  lastBlockNumber: number
  getReceipt: GetReceipt
  getSafeInfo: GetSafeInfo
  dispatch: AppDispatch
  addPopup: ReturnType<typeof useAddPopup>
  removeInFlightOrderId: (update: string) => void
  nativeCurrencySymbol: string
}

type Cancel = () => void

function finalizeEthereumTransaction(
  receipt: TransactionReceipt,
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions
) {
  const { chainId, addPopup, dispatch } = params
  const { hash } = transaction

  console.log(`[FinalizeTxUpdater] Transaction ${receipt.transactionHash} has been mined`, receipt)

  dispatch(
    finalizeTransaction({
      chainId,
      hash,
      receipt: {
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        contractAddress: receipt.contractAddress,
        from: receipt.from,
        status: receipt.status,
        to: receipt.to,
        transactionHash: receipt.transactionHash,
        transactionIndex: receipt.transactionIndex,
      },
    })
  )

  if (transaction.ethFlow) {
    finalizeEthFlowTx(transaction.ethFlow, receipt, params, hash)
    return
  }

  if (transaction.onChainCancellation) {
    const { orderId, sellTokenSymbol } = transaction.onChainCancellation

    finalizeOnChainCancellation(receipt, params, hash, orderId, sellTokenSymbol)
    return
  }

  addPopup(
    {
      txn: {
        hash: receipt.transactionHash,
        success: receipt.status === 1 && transaction.replacementType !== 'cancel',
        summary: transaction.summary,
      },
    },
    hash
  )
}

function finalizeEthFlowTx(
  ethFlowInfo: { orderId: string; subType: 'creation' | 'cancellation' | 'refund' },
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string
): void {
  const { orderId, subType } = ethFlowInfo
  const { chainId, dispatch, addPopup, nativeCurrencySymbol } = params

  // Remove inflight order ids, after a delay to avoid creating the same again in quick succession
  setTimeout(() => params.removeInFlightOrderId(orderId), DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS)

  if (subType === 'creation') {
    if (receipt.status !== 1) {
      // If creation failed:
      // 1. Mark order as invalid
      dispatch(invalidateOrdersBatch({ chainId, ids: [orderId] }))
      // 2. Show failure tx pop-up
      addPopup(
        {
          txn: {
            hash,
            success: false,
            summary: `Failed to place order selling ${nativeCurrencySymbol}`,
          },
        },
        hash
      )
    }
  }

  if (subType === 'cancellation') {
    finalizeOnChainCancellation(receipt, params, hash, orderId, nativeCurrencySymbol)
  }
}

function finalizeOnChainCancellation(
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string,
  orderId: string,
  sellTokenSymbol: string
) {
  const { chainId, dispatch, addPopup } = params

  if (receipt.status === 1) {
    // If cancellation succeeded, mark order as cancelled
    dispatch(cancelOrdersBatch({ chainId, ids: [orderId] }))
  } else {
    // If cancellation failed:
    // 1. Update order state and remove the isCancelling flag and cancellationHash
    partialOrderUpdate({ chainId, order: { id: orderId, isCancelling: false, cancellationHash: undefined } }, dispatch)
    // 2. Show failure tx pop-up
    addPopup(
      {
        txn: {
          hash,
          success: false,
          summary: `Failed to cancel order selling ${sellTokenSymbol}`,
        },
      },
      hash
    )
  }
}

function checkEthereumTransactions(params: CheckEthereumTransactions): Cancel[] {
  const { transactions, chainId, lastBlockNumber, getReceipt, getSafeInfo, dispatch } = params

  return transactions.map((transaction) => {
    const { hash, hashType, receipt } = transaction

    if (hashType === HashType.GNOSIS_SAFE_TX) {
      // Get safe info and receipt
      const { promise: safeTransactionPromise, cancel } = getSafeInfo(hash)

      // Get safe info
      safeTransactionPromise
        .then(async (safeTransaction) => {
          const { isExecuted, transactionHash } = safeTransaction

          // If the safe transaction is executed, but we don't have a tx receipt yet
          if (isExecuted && !receipt) {
            // Get the ethereum tx receipt
            console.log(
              '[FinalizeTxUpdater] Safe transaction is executed, but we have not fetched the receipt yet. Tx: ',
              transactionHash
            )
            // Get the transaction receipt
            const { promise: receiptPromise } = getReceipt(transactionHash)

            receiptPromise
              .then((newReceipt) => finalizeEthereumTransaction(newReceipt, transaction, params))
              .catch((error) => {
                if (!error.isCancelledError) {
                  console.error(
                    `[FinalizeTxUpdater] Failed to get transaction receipt for safeTransaction: ${hash}`,
                    error
                  )
                }
              })
          }

          dispatch(updateSafeTransaction({ chainId, safeTransaction, blockNumber: lastBlockNumber }))
        })
        .catch((error) => {
          if (!error.isCancelledError) {
            console.error(`[FinalizeTxUpdater] Failed to check transaction hash: ${hash}`, error)
          }
        })

      return cancel
    } else {
      // Get receipt for transaction, and finalize if needed
      const { promise, cancel } = getReceipt(hash)
      promise
        .then((receipt) => {
          if (receipt) {
            // If the tx is mined. We finalize it!
            finalizeEthereumTransaction(receipt, transaction, params)
          } else {
            // Update the last checked blockNumber
            dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
          }
        })
        .catch((error) => {
          if (!error.isCancelledError) {
            console.error(`[FinalizeTxUpdater] Failed to get transaction receipt for tx: ${hash}`, error)
          }
        })

      return cancel
    }
  })
}

export default function Updater(): null {
  const { provider } = useWeb3React()
  const { chainId: _chainId, account } = useWalletInfo()
  const chainId = supportedChainId(_chainId)
  const lastBlockNumber = useBlockNumber()
  const accountLowerCase = account?.toLowerCase() || ''

  const dispatch = useAppDispatch()
  const getReceipt = useGetReceipt()
  const getSafeInfo = useGetSafeInfo()
  const addPopup = useAddPopup()
  const removeInFlightOrderId = useSetAtom(removeInFlightOrderIdAtom)
  const nativeCurrencySymbol = useNativeCurrency().symbol || 'ETH'

  // Get, from the pending transaction, the ones that we should re-check
  const shouldCheckFilter = useMemo(() => {
    if (!lastBlockNumber) {
      return
    }
    return (tx: EnhancedTransactionDetails) =>
      tx.from.toLowerCase() === accountLowerCase && shouldCheck(lastBlockNumber, tx)
  }, [accountLowerCase, lastBlockNumber])
  const transactions = useAllTransactionsDetails(shouldCheckFilter)

  useEffect(() => {
    if (!chainId || !provider || !lastBlockNumber) return

    const promiseCancellations = checkEthereumTransactions({
      transactions,
      chainId,
      lastBlockNumber,
      getReceipt,
      getSafeInfo,
      addPopup,
      dispatch,
      removeInFlightOrderId,
      nativeCurrencySymbol,
    })

    return () => {
      // Cancel all promises
      promiseCancellations.forEach((cancel) => cancel())
    }
  }, [
    chainId,
    provider,
    transactions,
    lastBlockNumber,
    dispatch,
    addPopup,
    getReceipt,
    getSafeInfo,
    removeInFlightOrderId,
    nativeCurrencySymbol,
  ])

  return null
}
