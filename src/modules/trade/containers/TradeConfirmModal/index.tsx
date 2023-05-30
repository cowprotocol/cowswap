import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import React, { useCallback } from 'react'

import { isSupportedChain } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

import { GpModal } from 'common/pure/Modal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { TradeConfirmPendingContent } from './TradeConfirmPendingContent'

import { tradeConfirmStateAtom, updateTradeConfirmStateAtom } from '../../state/tradeConfirmStateAtom'

export interface TradeConfirmModalProps {
  isOpen: boolean
  children: JSX.Element
}

export function TradeConfirmModal(props: TradeConfirmModalProps) {
  const { isOpen, children } = props

  const { chainId } = useWalletInfo()

  const { pendingTrade, transactionHash, error } = useAtomValue(tradeConfirmStateAtom)
  const updateState = useUpdateAtom(updateTradeConfirmStateAtom)

  const onDismiss = useCallback(() => {
    updateState({ pendingTrade: null, transactionHash: null })
  }, [updateState])

  if (!isSupportedChain(chainId)) return null

  return (
    <GpModal isOpen={isOpen} onDismiss={onDismiss}>
      {(() => {
        if (error) {
          return <TransactionErrorContent message={error} onDismiss={onDismiss} />
        }

        if (pendingTrade) {
          return <TradeConfirmPendingContent pendingTrade={pendingTrade} onDismiss={onDismiss} />
        }

        // TODO: use <TransactionSubmittedContent/> for Swap
        if (transactionHash) {
          return <OrderSubmittedContent chainId={chainId} onDismiss={onDismiss} hash={transactionHash} />
        }

        return children
      })()}
    </GpModal>
  )
}
