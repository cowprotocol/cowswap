import { ReactNode, useCallback } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command, UiOrderType } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useSigningStep } from 'entities/trade'
import styled from 'styled-components/macro'

import {
  useHasNotificationSubscription,
  useOpenNotificationSidebar,
  useTrackOrderBannerDismissal,
} from 'modules/notifications'

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
  overflow: hidden;

  .modalMode & {
    box-shadow: none;
  }
`

export interface TradeConfirmModalProps extends React.PropsWithChildren {
  orderType: UiOrderType
  submittedContent?: ReactNode
  showGetNotifiedMessage?: boolean
}

interface InnerComponentProps extends React.PropsWithChildren {
  chainId: SupportedChainId
  account: string
  orderType: UiOrderType
  error: string | null
  pendingTrade: TradeAmounts | null
  transactionHash: string | null
  onDismiss: Command
  permitSignatureState: string | undefined
  isSafeWallet: boolean
  submittedContent?: ReactNode
  showGetNotifiedMessage?: boolean
  onGetNotifiedClick: () => void
  onDismissGetNotifiedMessage: () => void
}

export function TradeConfirmModal(props: TradeConfirmModalProps): ReactNode {
  const { children, submittedContent, orderType, showGetNotifiedMessage } = props

  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { permitSignatureState, pendingTrade, transactionHash, error } = useTradeConfirmState()
  const { onDismiss } = useTradeConfirmActions()
  const signingStep = useSigningStep()
  const { areTelegramNotificationsEnabled } = useFeatureFlags()
  const { hasSubscription, isLoading: isNotificationSubscriptionLoading } = useHasNotificationSubscription()
  const openNotificationSidebar = useOpenNotificationSidebar()
  const { isDismissed: isTrackOrderBannerDismissed, dismiss: dismissTrackOrderBanner } = useTrackOrderBannerDismissal()

  const handleGetNotifiedClick = useCallback(() => {
    openNotificationSidebar()
  }, [openNotificationSidebar])

  if (!account) return null

  return (
    <Container>
      <InnerComponent
        chainId={chainId}
        account={account}
        error={error}
        orderType={orderType}
        pendingTrade={pendingTrade}
        transactionHash={transactionHash}
        onDismiss={onDismiss}
        // Disable default permit flow when signingStep is set
        permitSignatureState={signingStep ? undefined : permitSignatureState}
        isSafeWallet={isSafeWallet}
        submittedContent={submittedContent}
        showGetNotifiedMessage={
          showGetNotifiedMessage &&
          areTelegramNotificationsEnabled &&
          !isNotificationSubscriptionLoading &&
          !hasSubscription &&
          !isInjectedWidget() &&
          !isTrackOrderBannerDismissed
        }
        onGetNotifiedClick={handleGetNotifiedClick}
        onDismissGetNotifiedMessage={dismissTrackOrderBanner}
      >
        {children}
      </InnerComponent>
    </Container>
  )
}

function InnerComponent(props: InnerComponentProps): ReactNode {
  const {
    account,
    chainId,
    children,
    error,
    isSafeWallet,
    onDismiss,
    orderType,
    pendingTrade,
    permitSignatureState,
    transactionHash,
    submittedContent,
    showGetNotifiedMessage,
    onGetNotifiedClick,
    onDismissGetNotifiedMessage,
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
        orderType={orderType}
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
          showGetNotifiedMessage={showGetNotifiedMessage}
          onGetNotifiedClick={onGetNotifiedClick}
          onDismissGetNotifiedMessage={onDismissGetNotifiedMessage}
        />
      )
    )
  }

  return children
}
