import { ReactElement, ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useSigningStep } from 'entities/trade'
import styled from 'styled-components/macro'

import { PermitModal } from 'common/containers/PermitModal'
import { useEffectiveChainId } from 'common/hooks/useEffectiveChainId'
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

export interface TradeConfirmModalProps {
  children: ReactElement
  title: string
  submittedContent?: ReactNode
}

export function TradeConfirmModal(props: TradeConfirmModalProps): ReactNode {
  const { children, submittedContent, title } = props

  const { account } = useWalletInfo()
  const effectiveChainId = useEffectiveChainId()
  const isSafeWallet = useIsSafeWallet()
  const { permitSignatureState, pendingTrade, transactionHash, error } = useTradeConfirmState()
  const { onDismiss } = useTradeConfirmActions()
  const signingStep = useSigningStep()

  // When returning from MM after signing, account can be briefly undefined; keep success state visible
  const showSuccessState = !!transactionHash
  if (!account && !showSuccessState) return null

  const effectiveAccount = account ?? ''

  return (
    <Container>
      <InnerComponent
        chainId={effectiveChainId}
        account={effectiveAccount}
        error={error}
        title={title}
        pendingTrade={pendingTrade}
        transactionHash={transactionHash}
        onDismiss={onDismiss}
        // Disable default permit flow when signingStep is set
        permitSignatureState={signingStep ? undefined : permitSignatureState}
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
  submittedContent?: ReactNode
}

function InnerComponent(props: InnerComponentProps): ReactNode {
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
    return (
      submittedContent || (
        <OrderSubmittedContent
          chainId={chainId}
          account={account}
          isSafeWallet={isSafeWallet}
          onDismiss={onDismiss}
          hash={transactionHash}
        />
      )
    )
  }

  return children
}
