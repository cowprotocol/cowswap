import { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { PermitModal } from 'common/containers/PermitModal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'
import { TradeAmounts } from 'common/types'

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
type CustomSubmittedContent = (onDismiss: Command) => ReactElement

export interface TradeConfirmModalProps {
  children: ReactElement
  title: string
  submittedContent?: CustomSubmittedContent
}

export function TradeConfirmModal(props: TradeConfirmModalProps) {
  const { children, submittedContent, title } = props

  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { permitSignatureState, pendingTrade, transactionHash, error, isOpen } = useTradeConfirmState()
  const { onDismiss } = useTradeConfirmActions()

  // Prevent rendering if account is not available or modal is not open
  if (!account || !isOpen) return null

  return (
    <Container>
      <InnerComponent
        chainId={chainId}
        account={account}
        error={error}
        title={title}
        pendingTrade={pendingTrade}
        transactionHash={transactionHash}
        onDismiss={onDismiss}
        permitSignatureState={permitSignatureState}
        isSafeWallet={isSafeWallet}
        submittedContent={submittedContent}
      >
        {children}
      </InnerComponent>
    </Container>
  )
}

type InnerComponentProps = {
  children: ReactElement
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
    submittedContent,
  } = props

  if (error) {
    return <TransactionErrorContent message={error} onDismiss={onDismiss} />
  }

  if (pendingTrade && permitSignatureState && permitSignatureState !== 'signed') {
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
      submittedContent(onDismiss)
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
