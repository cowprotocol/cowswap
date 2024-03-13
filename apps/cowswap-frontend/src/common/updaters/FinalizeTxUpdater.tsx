import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { useAddPriorityAllowance } from '@cowprotocol/balances-and-allowances'
import { GetReceipt, useBlockNumber, useGetReceipt } from '@cowprotocol/common-hooks'
import { getCowSoundError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'
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
  updateSafeTransaction,
} from 'legacy/state/enhancedTransactions/actions'
import { useAllTransactionsDetails } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useAppDispatch } from 'legacy/state/hooks'
import { invalidateOrdersBatch } from 'legacy/state/orders/actions'
import { CancelOrdersBatchCallback, useCancelOrdersBatch } from 'legacy/state/orders/hooks'
import { partialOrderUpdate } from 'legacy/state/orders/utils'

import { TransactionContentWithLink, emitCancelledOrderEvent } from 'modules/orders'
import { removeInFlightOrderIdAtom } from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'
import { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

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
  isSafeWallet: boolean
  transactions: EnhancedTransactionDetails[]
  lastBlockNumber: number
  getTwapOrderById: ReturnType<typeof useGetTwapOrderById>
  getReceipt: GetReceipt
  getSafeInfo: GetSafeInfo
  dispatch: AppDispatch
  addSnackbar: ReturnType<typeof useAddSnackbar>
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
  const { chainId, account, addSnackbar, dispatch, addPriorityAllowance } = params
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
    finalizeEthFlowTx(transaction.ethFlow, receipt, params, hash)
    return
  }

  if (transaction.onChainCancellation) {
    const { orderId, sellTokenSymbol } = transaction.onChainCancellation

    finalizeOnChainCancellation(receipt, params, hash, orderId, sellTokenSymbol)
    return
  }

  const isSuccess = receipt.status === 1 && transaction.replacementType !== 'cancel'
  addSnackbar({
    content: (
      <TransactionContentWithLink transactionHash={transaction.hash}>
        <>{transaction.summary}</>
      </TransactionContentWithLink>
    ),
    id: transaction.hash,
    icon: isSuccess ? 'success' : 'alert',
  })

  if (!isSuccess) {
    getCowSoundError().play()
  }
}

function finalizeEthFlowTx(
  ethFlowInfo: { orderId: string; subType: 'creation' | 'cancellation' | 'refund' },
  receipt: TransactionReceipt,
  params: CheckEthereumTransactions,
  hash: string
): void {
  const { orderId, subType } = ethFlowInfo
  const { chainId, isSafeWallet, dispatch, addSnackbar, nativeCurrencySymbol } = params

  // Remove inflight order ids, after a delay to avoid creating the same again in quick succession
  setTimeout(() => params.removeInFlightOrderId(orderId), DELAY_REMOVAL_ETH_FLOW_ORDER_ID_MILLISECONDS)

  if (subType === 'creation') {
    if (receipt.status !== 1) {
      // If creation failed:
      // 1. Mark order as invalid
      dispatch(invalidateOrdersBatch({ chainId, ids: [orderId], isSafeWallet }))
      // 2. Show failure tx pop-up
      addSnackbar({
        content: (
          <TransactionContentWithLink transactionHash={hash}>
            <>Failed to place order selling ${nativeCurrencySymbol}</>
          </TransactionContentWithLink>
        ),
        id: hash,
        icon: 'alert',
      })

      getCowSoundError().play()
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
  const { chainId, isSafeWallet, dispatch, addSnackbar, cancelOrdersBatch, getTwapOrderById } = params

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
    addSnackbar({
      content: (
        <TransactionContentWithLink transactionHash={hash}>
          <>Failed to cancel order selling ${sellTokenSymbol}</>
        </TransactionContentWithLink>
      ),
      id: hash,
      icon: 'alert',
    })

    getCowSoundError().play()
  }
}
function checkEthereumTransactions(params: CheckEthereumTransactions): Command[] {
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

export function FinalizeTxUpdater(): null {
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
  const addSnackbar = useAddSnackbar()
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
      isSafeWallet,
      lastBlockNumber,
      getReceipt,
      getSafeInfo,
      addSnackbar,
      dispatch,
      removeInFlightOrderId,
      nativeCurrencySymbol,
      cancelOrdersBatch,
      addPriorityAllowance,
      account,
      getTwapOrderById,
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
    addSnackbar,
    getReceipt,
    getSafeInfo,
    removeInFlightOrderId,
    nativeCurrencySymbol,
    cancelOrdersBatch,
    addPriorityAllowance,
    getTwapOrderById,
  ])

  return null
}
