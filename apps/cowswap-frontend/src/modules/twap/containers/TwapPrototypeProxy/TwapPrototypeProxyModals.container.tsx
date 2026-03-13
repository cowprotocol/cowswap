import { ReactNode, useMemo } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { LegacyConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'

import { CowModal } from 'common/pure/Modal'

import * as styledEl from './TwapPrototypeProxy.styled'

import { useOpenTwapPrototypeProxyPage } from '../../hooks/useOpenTwapPrototypeProxyPage'
import { useTwapPrototypeProxy } from '../../hooks/useTwapPrototypeProxy'

interface PrototypeCancellationNoticeModalProps {
  ordersCount: number
  onDismiss(): void
  onOpenProxyAccount(): void
}

export function TwapPrototypeProxyModals(): ReactNode {
  const openProxyPage = useOpenTwapPrototypeProxyPage()
  const { claimableOrders, noticeOrderIds, dismissCancellationNotice } = useTwapPrototypeProxy()

  const noticeOrdersCount = useMemo(() => {
    if (!noticeOrderIds.length) {
      return 0
    }

    const noticeSet = new Set(noticeOrderIds)

    return claimableOrders.filter((order) => noticeSet.has(order.order.id)).length
  }, [claimableOrders, noticeOrderIds])

  const handleOpenProxyFromNotice = (): void => {
    dismissCancellationNotice()
    openProxyPage()
  }

  if (noticeOrdersCount === 0) {
    return null
  }

  return (
    <PrototypeCancellationNoticeModal
      ordersCount={noticeOrdersCount}
      onDismiss={dismissCancellationNotice}
      onOpenProxyAccount={handleOpenProxyFromNotice}
    />
  )
}

function PrototypeCancellationNoticeModal({
  ordersCount,
  onDismiss,
  onOpenProxyAccount,
}: PrototypeCancellationNoticeModalProps): ReactNode {
  const message =
    ordersCount > 1 ? (
      <Trans>These orders were cancelled. Any unused funds remain in your TWAP proxy account until withdrawn.</Trans>
    ) : (
      <Trans>This order was cancelled. Any unused funds remain in your TWAP proxy account until withdrawn.</Trans>
    )

  return (
    <CowModal isOpen onDismiss={onDismiss} maxHeight={56} maxWidth={480}>
      <LegacyConfirmationModalContent
        title={<Trans>TWAP funds need to be withdrawn</Trans>}
        onDismiss={onDismiss}
        topContent={<styledEl.ModalDescription>{message}</styledEl.ModalDescription>}
        bottomContent={
          <styledEl.ActionsRow>
            <ButtonPrimary onClick={onOpenProxyAccount}>
              <Trans>Go to TWAP proxy account</Trans>
            </ButtonPrimary>
          </styledEl.ActionsRow>
        }
      />
    </CowModal>
  )
}
