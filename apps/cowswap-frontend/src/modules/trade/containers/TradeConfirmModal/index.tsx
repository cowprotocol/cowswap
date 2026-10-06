import { ReactNode, useCallback } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Command, UiOrderType } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useSigningStep } from 'entities/trade'
import styled from 'styled-components/macro'

import { isMaxAmountToApprove } from 'modules/erc20Approve'
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
  transactionHash: string | null
  onDismiss: Command
  permitSignatureState: string | undefined
  permitAmount: CurrencyAmount<Currency> | null
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
  const { permitSignatureState, permitAmount, pendingTrade, transactionHash, error } = useTradeConfirmState()
  const { onDismiss } = useTradeConfirmActions()
  const signingStep = useSigningStep()
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
        transactionHash={transactionHash}
        onDismiss={onDismiss}
        // Disable default permit flow when signingStep is set
        permitSignatureState={signingStep ? undefined : permitSignatureState}
        permitAmount={permitAmount}
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
  permitSignatureState,
  permitAmount,
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
        amountToApprove={permitAmount && !isMaxAmountToApprove(permitAmount) ? permitAmount : undefined}
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
          onViewOrders={onViewOrders}
        />
      )
    )
  }

  return children
}
