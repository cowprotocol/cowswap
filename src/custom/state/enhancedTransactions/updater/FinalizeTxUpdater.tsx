/**
 * This file is basically a Mod of src/state/transactions/updater
 */

import { useEffect, useMemo } from 'react'
import { useAppDispatch } from 'state/hooks'
// import { SupportedChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { updateBlockNumber } from 'state/application/actions'
import { useAddPopup, useBlockNumber } from 'state/application/hooks'
import { checkedTransaction, finalizeTransaction, updateSafeTransaction } from '../actions'
import { EnhancedTransactionDetails, HashType } from '../reducer'
import { GetReceipt, useGetReceipt } from 'hooks/useGetReceipt'
import { useAllTransactionsDetails } from 'state/enhancedTransactions/hooks'
import { Dispatch } from 'redux'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { GetSafeInfo, useGetSafeInfo } from 'hooks/useGetSafeInfo'

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
  dispatch: Dispatch
  addPopup: ReturnType<typeof useAddPopup>
}

type Cancel = () => void

// async function checkEthereumTransactions(transaction: EnhancedTransactionDetails) {}

function finalizeEthereumTransaction(
  receipt: TransactionReceipt,
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions
) {
  const { chainId, lastBlockNumber, addPopup, dispatch } = params
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

  addPopup(
    {
      txn: {
        hash: receipt.transactionHash,
        success: receipt.status === 1,
        summary: transaction.summary,
      },
    },
    hash
  )

  // the receipt was fetched before the block, fast forward to that block to trigger balance updates
  if (receipt.blockNumber > lastBlockNumber) {
    dispatch(updateBlockNumber({ chainId, blockNumber: receipt.blockNumber }))
  }
}

function checkEthereumTransactions(params: CheckEthereumTransactions): Cancel[] {
  const { transactions, chainId, lastBlockNumber, getReceipt, getSafeInfo, dispatch } = params

  const promiseCancellations = transactions.map((transaction) => {
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

  return promiseCancellations
}

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React()
  const lastBlockNumber = useBlockNumber()

  const dispatch = useAppDispatch()
  const getReceipt = useGetReceipt()
  const getSafeInfo = useGetSafeInfo()
  const addPopup = useAddPopup()

  // Get, from the pending transaction, the ones that we should re-check
  const shouldCheckFilter = useMemo(() => {
    if (!lastBlockNumber) {
      return
    }
    return (tx: EnhancedTransactionDetails) => shouldCheck(lastBlockNumber, tx)
  }, [lastBlockNumber])
  const transactions = useAllTransactionsDetails(shouldCheckFilter)

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return

    const promiseCancellations = checkEthereumTransactions({
      transactions,
      chainId,
      lastBlockNumber,
      getReceipt,
      getSafeInfo,
      addPopup,
      dispatch,
    })

    return () => {
      // Cancel all promises
      promiseCancellations.forEach((cancel) => cancel())
    }
  }, [chainId, library, transactions, lastBlockNumber, dispatch, addPopup, getReceipt, getSafeInfo])

  return null
}
