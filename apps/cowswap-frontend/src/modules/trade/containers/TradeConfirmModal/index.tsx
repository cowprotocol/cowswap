import { useAtomValue } from 'jotai'

import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { PermitModal } from 'common/containers/PermitModal'
import { CowModal, NewCowModal } from 'common/pure/Modal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { TradeConfirmPendingContent } from './TradeConfirmPendingContent'

import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { tradeConfirmStateAtom } from '../../state/tradeConfirmStateAtom'

export interface TradeConfirmModalProps {
  children: JSX.Element
}

export function TradeConfirmModal(props: TradeConfirmModalProps) {
  const { children } = props

  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { isOpen, permitSignatureState, pendingTrade, transactionHash, error } = useAtomValue(tradeConfirmStateAtom)
  const { onDismiss } = useTradeConfirmActions()

  if (!account) return null

  const renderModalContent = () => {
    if (error) {
      return <TransactionErrorContent message={error} onDismiss={onDismiss} />
    }

    if (pendingTrade && permitSignatureState) {
      // TODO: potentially replace TradeConfirmPendingContent completely with PermitModal
      // We could use this not just for permit, but for any token, even already approved
      const step = permitSignatureState === 'signed' ? 'submit' : 'approve'
      return (
        <PermitModal
          inputAmount={pendingTrade.inputAmount}
          outputAmount={pendingTrade.outputAmount}
          step={step}
          onDismiss={onDismiss}
        />
      )
    }

    if (pendingTrade) {
      return <TradeConfirmPendingContent pendingTrade={pendingTrade} onDismiss={onDismiss} />
    }

    if (transactionHash) {
      return (
        <OrderSubmittedContent
          chainId={chainId}
          account={account}
          isSafeWallet={isSafeWallet}
          onDismiss={onDismiss}
          hash={transactionHash}
        />
      )
    }

    return children
  }

  const renderModal = () => {
    if (permitSignatureState) {
      return (
        <NewCowModal isOpen={isOpen} onDismiss={onDismiss}>
          {renderModalContent()}
        </NewCowModal>
      )
    }
    return (
      <CowModal isOpen={isOpen} onDismiss={onDismiss}>
        {renderModalContent()}
      </CowModal>
    )
  }

  return renderModal()
}
