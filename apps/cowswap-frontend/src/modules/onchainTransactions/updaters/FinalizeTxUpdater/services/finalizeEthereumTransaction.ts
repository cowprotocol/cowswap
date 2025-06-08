import { TransactionReceipt } from '@ethersproject/abstract-provider'

import { finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { finalizeEthFlowTx } from './finalizeEthFlowTx'
import { finalizeOnChainCancellation } from './finalizeOnChainCancellation'

import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents } from '../../../onchainTransactionsEvents'
import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function finalizeEthereumTransaction(
  receipt: TransactionReceipt,
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions,
  safeTransactionHash?: string,
) {
  const { chainId, account, dispatch, addPriorityAllowance } = params
  const { hash } = transaction

  console.log(`[FinalizeTxUpdater] Transaction ${receipt.transactionHash} has been mined`, receipt, transaction)

  ONCHAIN_TRANSACTIONS_EVENTS.emit(OnchainTxEvents.BEFORE_TX_FINALIZE, { transaction, receipt })

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
    }),
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
      transactionHash: safeTransactionHash || receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      replacementType: transaction.replacementType,
    },
    summary: transaction.summary || '',
  })
}
