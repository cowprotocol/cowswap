import { useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command, UiOrderType } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import {
  useSigningStep,
  useSolanaSigningDeadline,
  SolanaSigningDeadlineState,
  solanaSigningDeadlineAtom,
  solanaSigningAbandonedAtom,
} from 'entities/trade'
import styled from 'styled-components/macro'

import {
  useHasNotificationSubscription,
  useOpenNotificationSidebar,
  useTelegramNotificationsAvailability,
  useTrackOrderBannerDismissal,
} from 'modules/notifications'

import { PermitModal } from 'common/containers/PermitModal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'
import { TradeAmounts } from 'common/types'

import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { SolanaSigningCountdown } from '../../pure/SolanaSigningCountdown'

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
  onViewOrders?: () => void | Promise<void>
}

interface InnerComponentProps extends React.PropsWithChildren {
  chainId: SupportedChainId
  account: string
  orderType: UiOrderType
  error: string | null
  pendingTrade: TradeAmounts | null
  solanaSigningDeadline: SolanaSigningDeadlineState | null
  onSolanaSigningExpiredDismiss: Command
  transactionHash: string | null
  onDismiss: Command
  permitSignatureState: string | undefined
  isSafeWallet: boolean
  submittedContent?: ReactNode
  showGetNotifiedMessage: boolean
  onGetNotifiedClick: () => void
  onDismissGetNotifiedMessage: () => void
  onViewOrders?: () => void | Promise<void>
}

export function TradeConfirmModal({
  children,
  submittedContent,
  orderType,
  showGetNotifiedMessage,
  onViewOrders,
}: TradeConfirmModalProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { permitSignatureState, pendingTrade, transactionHash, error } = useTradeConfirmState()
  const tradeConfirmActions = useTradeConfirmActions()
  const { onDismiss } = tradeConfirmActions
  const signingStep = useSigningStep()
  const solanaSigningDeadline = useSolanaSigningDeadline()
  const setSolanaSigningDeadline = useSetAtom(solanaSigningDeadlineAtom)
  const setSolanaSigningAbandoned = useSetAtom(solanaSigningAbandonedAtom)

  // The wallet prompt can't be cancelled programmatically: the abandoned flag silences its eventual
  // rejection, and price confirmation is forced because the quote kept refreshing meanwhile.
  const onSolanaSigningExpiredDismiss = useCallback(() => {
    setSolanaSigningAbandoned(true)
    setSolanaSigningDeadline(null)
    tradeConfirmActions.onOpen(true)
  }, [setSolanaSigningAbandoned, setSolanaSigningDeadline, tradeConfirmActions])
  const { isAvailable: areTelegramNotificationsAvailable } = useTelegramNotificationsAvailability()
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
        solanaSigningDeadline={solanaSigningDeadline}
        onSolanaSigningExpiredDismiss={onSolanaSigningExpiredDismiss}
        transactionHash={transactionHash}
        onDismiss={onDismiss}
        // Disable default permit flow when signingStep is set
        permitSignatureState={signingStep ? undefined : permitSignatureState}
        isSafeWallet={isSafeWallet}
        submittedContent={submittedContent}
        showGetNotifiedMessage={Boolean(
          showGetNotifiedMessage &&
            areTelegramNotificationsAvailable &&
            !isNotificationSubscriptionLoading &&
            !hasSubscription &&
            !isInjectedWidget() &&
            !isTrackOrderBannerDismissed,
        )}
        onGetNotifiedClick={handleGetNotifiedClick}
        onDismissGetNotifiedMessage={dismissTrackOrderBanner}
        onViewOrders={onViewOrders}
      >
        {children}
      </InnerComponent>
    </Container>
  )
}

function InnerComponent({
  account,
  chainId,
  children,
  error,
  isSafeWallet,
  onDismiss,
  orderType,
  pendingTrade,
  solanaSigningDeadline,
  onSolanaSigningExpiredDismiss,
  permitSignatureState,
  transactionHash,
  submittedContent,
  showGetNotifiedMessage,
  onGetNotifiedClick,
  onDismissGetNotifiedMessage,
  onViewOrders,
}: InnerComponentProps): ReactNode {
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

  if (pendingTrade && solanaSigningDeadline && isSolanaChain(chainId)) {
    return (
      <SolanaSigningCountdown
        expiresAt={solanaSigningDeadline.expiresAt}
        durationMs={solanaSigningDeadline.durationMs}
        inputAmount={pendingTrade.inputAmount}
        outputAmount={pendingTrade.outputAmount}
        onDismiss={onDismiss}
        onExpiredDismiss={onSolanaSigningExpiredDismiss}
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
          onViewOrders={onViewOrders}
        />
      )
    )
  }

  return children
}
