import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { PermitModal } from 'common/containers/PermitModal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'
import { TradeAmounts } from 'common/types'

import { TradeConfirmPendingContent } from './TradeConfirmPendingContent'

import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'

const Container = styled.div`
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  box-shadow: ${({ theme }) => theme.boxShadow1};
`

type CustomSubmittedContent = (order: Order | undefined, onDismiss: () => void) => JSX.Element

export interface TradeConfirmModalProps {
  children: JSX.Element
  submittedContent?: CustomSubmittedContent
}

export function TradeConfirmModal(props: TradeConfirmModalProps) {
  const { children, submittedContent } = props

  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { permitSignatureState, pendingTrade, transactionHash, error } = useTradeConfirmState()
  const { onDismiss } = useTradeConfirmActions()
  const order = useOrder({ chainId, id: transactionHash || undefined })

  if (!account) return null

  return (
    <Container>
      <InnerComponent
        chainId={chainId}
        account={account}
        error={error}
        pendingTrade={pendingTrade}
        transactionHash={transactionHash}
        onDismiss={onDismiss}
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
  error: string | null
  pendingTrade: TradeAmounts | null
  transactionHash: string | null
  onDismiss: () => void
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
    pendingTrade,
    permitSignatureState,
    transactionHash,
    order,
    submittedContent,
  } = props

  if (error) {
    return <TransactionErrorContent isScreenMode={true} message={error} onDismiss={onDismiss} />
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
        orderType={'Limit Order'}
      />
    )
  }

  if (pendingTrade) {
    return <TradeConfirmPendingContent pendingTrade={pendingTrade} onDismiss={onDismiss} />
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
