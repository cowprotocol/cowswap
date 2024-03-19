import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { useAddPriorityAllowance } from '@cowprotocol/balances-and-allowances'
import { GetReceipt, useBlockNumber, useGetReceipt } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'

import { orderBookApi } from 'cowSdk'
import ms from 'ms.macro'

import { GetSafeInfo, useGetSafeInfo } from 'legacy/hooks/useGetSafeInfo'
import { AppDispatch } from 'legacy/state'
import {
  checkedTransaction,
  finalizeTransaction,
  replaceTransaction,
  updateSafeTransaction,
} from 'legacy/state/enhancedTransactions/actions'
import { useAllTransactionsDetails } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useAppDispatch } from 'legacy/state/hooks'
import { invalidateOrdersBatch } from 'legacy/state/orders/actions'
import { CancelOrdersBatchCallback, useCancelOrdersBatch } from 'legacy/state/orders/hooks'
import { partialOrderUpdate } from 'legacy/state/orders/utils'

import { emitCancelledOrderEvent } from 'modules/orders'
import { removeInFlightOrderIdAtom } from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'
import { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { OnchainTransactionEventsUpdater } from './OnchainTransactionEventsUpdater'

import { emitOnchainTransactionEvent } from '../utils/emitOnchainTransactionEvent'

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
  chainId: SupportedChainId
  account: string | undefined
  transactionsCount: number
  isSafeWallet: boolean
  transactions: EnhancedTransactionDetails[]
  lastBlockNumber: number
  getTwapOrderById: ReturnType<typeof useGetTwapOrderById>
  getReceipt: GetReceipt
  getSafeInfo: GetSafeInfo
  dispatch: AppDispatch
  addPriorityAllowance: ReturnType<typeof useAddPriorityAllowance>
  removeInFlightOrderId: (update: string) => void
  nativeCurrencySymbol: string
  cancelOrdersBatch: CancelOrdersBatchCallback
}

function finalizeEthereumTransaction(
  receipt: TransactionReceipt,
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions
) {
  const { chainId, account, dispatch, addPriorityAllowance } = params
  const { hash } = transaction

  console.log(`[FinalizeTxUpdater] Transaction ${receipt.transactionHash} has been mined`, receipt, transaction)

  // Once approval tx is mined, we add the priority allowance to immediately allow the user to place orders
  if (transaction.approval) {
    addPriorityAllowance({
      chainId,
      account,
      blockNumber: receipt.blockNumber,
      tokenAddress: transaction.approval.tokenAddress,
    })
  }

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
    finalizeEthFlowTx(transaction, receipt, params, hash)
    return
  }

  if (transaction.onChainCancellation) {
    const { orderId, sellTokenSymbol } = transaction.onChainCancellation

    finalizeOnChainCancellation(transaction, receipt, params, hash, orderId, sellTokenSymbol)
    return
  }

  emitOnchainTransactionEvent({
    receipt: {
      to: receipt.to,
      from: receipt.from,
      contractAddress: receipt.contractAddress,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      replacementType: transaction.replacementType,
    },
    summary: transaction.summary || '',
  })
}

function finalizeEthFlowTx(
  transaction: EnhancedTransactionDetails,
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string
): void {
  const ethFlowInfo = transaction.ethFlow!
  const { orderId, subType } = ethFlowInfo
  const { chainId, isSafeWallet, dispatch, nativeCurrencySymbol } = params

  // Remove inflight order ids, after a delay to avoid creating the same again in quick succession
  setTimeout(() => params.removeInFlightOrderId(orderId), DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS)

  if (subType === 'creation') {
    if (receipt.status !== 1) {
      // If creation failed:
      // 1. Mark order as invalid
      dispatch(invalidateOrdersBatch({ chainId, ids: [orderId], isSafeWallet }))
      // 2. Show failure tx pop-up

      emitOnchainTransactionEvent({
        receipt: {
          to: receipt.to,
          from: receipt.from,
          contractAddress: receipt.contractAddress,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          replacementType: transaction.replacementType,
        },
        summary: `Failed to place order selling ${nativeCurrencySymbol}`,
      })
    }
  }

  if (subType === 'cancellation') {
    finalizeOnChainCancellation(transaction, receipt, params, hash, orderId, nativeCurrencySymbol)
  }
}

function finalizeOnChainCancellation(
  transaction: EnhancedTransactionDetails,
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string,
  orderId: string,
  sellTokenSymbol: string
) {
  const { chainId, isSafeWallet, dispatch, cancelOrdersBatch, getTwapOrderById } = params

  if (receipt.status === 1) {
    // If cancellation succeeded, mark order as cancelled
    cancelOrdersBatch({ chainId, ids: [orderId], isSafeWallet })

    const twapOrder = getTwapOrderById(orderId)

    if (twapOrder) {
      emitCancelledOrderEvent({
        chainId,
        order: twapOrder,
        transactionHash: hash,
      })

      return
    }

    // Since TWAP parts are living only on PROD env, we should check both envs
    orderBookApi.getOrderMultiEnv(orderId, { chainId }).then((order) => {
      if (!order) return

      emitCancelledOrderEvent({
        chainId,
        order,
        transactionHash: hash,
      })
    })
  } else {
    // If cancellation failed:
    // 1. Update order state and remove the isCancelling flag and cancellationHash
    partialOrderUpdate(
      { chainId, order: { id: orderId, isCancelling: false, cancellationHash: undefined }, isSafeWallet },
      dispatch
    )
    // 2. Show failure tx pop-up
    emitOnchainTransactionEvent({
      receipt: {
        to: receipt.to,
        from: receipt.from,
        contractAddress: receipt.contractAddress,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        replacementType: transaction.replacementType,
      },
      summary: `Failed to cancel order selling ${sellTokenSymbol}`,
    })
  }
}
function checkEthereumTransactions(params: CheckEthereumTransactions): Command[] {
  const { transactions, chainId, lastBlockNumber, getReceipt, getSafeInfo, dispatch, transactionsCount } = params

  return transactions.map((transaction) => {
    const { hash, hashType, receipt } = transaction

    const handleTransactionFetchFail = () => {
      const isTransactionOutdated = transaction.nonce === undefined || transaction.nonce < transactionsCount

      if (isTransactionOutdated) {
        console.log('[FinalizeTxUpdater] Transaction is outdated, removing it from the store.', {
          hash,
          nonce: transaction.nonce,
          transactionsCount,
        })

        dispatch(replaceTransaction({ chainId, oldHash: hash, newHash: hash, type: 'replaced' }))
      }
    }

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

          handleTransactionFetchFail()
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

          handleTransactionFetchFail()
        })

      return cancel
    }
  })
}

export function FinalizeTxUpdater() {
  const { provider } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const lastBlockNumber = useBlockNumber()
  const accountLowerCase = account?.toLowerCase() || ''

  const dispatch = useAppDispatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const getReceipt = useGetReceipt(chainId)
  const getSafeInfo = useGetSafeInfo()
  const addPriorityAllowance = useAddPriorityAllowance()
  const getTwapOrderById = useGetTwapOrderById()
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
    if (!chainId || !provider || !lastBlockNumber || !account) return

    let promiseCancellations: Command[] = []

    provider.getTransactionCount(account).then((transactionsCount) => {
      promiseCancellations = checkEthereumTransactions({
        transactions,
        chainId,
        isSafeWallet,
        lastBlockNumber,
        getReceipt,
        getSafeInfo,
        dispatch,
        removeInFlightOrderId,
        nativeCurrencySymbol,
        cancelOrdersBatch,
        addPriorityAllowance,
        account,
        getTwapOrderById,
        transactionsCount,
      })
    })

    return () => {
      // Cancel all promises
      promiseCancellations.forEach((cancel) => cancel())
    }
  }, [
    chainId,
    account,
    isSafeWallet,
    provider,
    transactions,
    lastBlockNumber,
    dispatch,
    getReceipt,
    getSafeInfo,
    removeInFlightOrderId,
    nativeCurrencySymbol,
    cancelOrdersBatch,
    addPriorityAllowance,
    getTwapOrderById,
  ])

  return <OnchainTransactionEventsUpdater />
}
