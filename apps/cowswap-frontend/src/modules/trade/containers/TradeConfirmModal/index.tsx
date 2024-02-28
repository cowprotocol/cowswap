import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { PermitModal } from 'common/containers/PermitModal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'
import { TradeAmounts } from 'common/types'

import { useSetShowFollowPendingTxPopup } from '../../../wallet/hooks/useSetShowFollowPendingTxPopup'
import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'

const Container = styled.div`
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  box-shadow: ${({ theme }) => theme.boxShadow1};

  .modalMode & {
    box-shadow: none;
  }
`
type CustomSubmittedContent = (order: Order | undefined, onDismiss: Command) => JSX.Element

export interface TradeConfirmModalProps {
  children: JSX.Element
  title: string
  submittedContent?: CustomSubmittedContent
}

export function TradeConfirmModal(props: TradeConfirmModalProps) {
  const { children, submittedContent, title } = props

  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { permitSignatureState, pendingTrade, transactionHash, error } = useTradeConfirmState()
  const { onDismiss } = useTradeConfirmActions()
  const setShowFollowPendingTxPopup = useSetShowFollowPendingTxPopup()

  const order = useOrder({ chainId, id: transactionHash || undefined })

  const dismissConfirmation = useCallback(() => {
    setShowFollowPendingTxPopup(true)
    onDismiss()
  }, [onDismiss, setShowFollowPendingTxPopup])

  if (!account) return null

  return (
    <Container>
      <InnerComponent
        chainId={chainId}
        account={account}
        error={error}
        title={title}
        pendingTrade={pendingTrade}
        transactionHash={transactionHash}
        onDismiss={dismissConfirmation}
        permitSignatureState={permitSignatureState}
        isSafeWallet={isSafeWallet}
        submittedContent={submittedContent}
        order={order}
      >
        {children}
      </InnerComponent>
    </Container>
  )
}

type InnerComponentProps = {
  children: JSX.Element
  chainId: SupportedChainId
  account: string
  title: string
  error: string | null
  pendingTrade: TradeAmounts | null
  transactionHash: string | null
  onDismiss: Command
  permitSignatureState: string | undefined
  isSafeWallet: boolean
  submittedContent?: CustomSubmittedContent
  order?: Order
}
function InnerComponent(props: InnerComponentProps) {
  const {
    account,
    chainId,
    children,
    error,
    isSafeWallet,
    onDismiss,
    title,
    pendingTrade,
    permitSignatureState,
    transactionHash,
    order,
    submittedContent,
  } = props

  if (error) {
    return <TransactionErrorContent message={error} onDismiss={onDismiss} />
  }

  if (pendingTrade && permitSignatureState && permitSignatureState !== 'signed') {
    // TODO: potentially replace TradeConfirmPendingContent completely with PermitModal
    // We could use this not just for permit, but for any token, even already approved
    const step = permitSignatureState === 'signed' ? 'submit' : 'approve'
    return (
      <PermitModal
        inputAmount={pendingTrade.inputAmount}
        outputAmount={pendingTrade.outputAmount}
        step={step}
        onDismiss={onDismiss}
        orderType={title}
      />
    )
  }

  if (transactionHash) {
    return submittedContent ? (
      submittedContent(order, onDismiss)
    ) : (
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
