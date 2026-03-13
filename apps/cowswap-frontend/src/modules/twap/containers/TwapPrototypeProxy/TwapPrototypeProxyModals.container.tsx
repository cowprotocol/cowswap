import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { formatTokenAmount, shortenAddress, shortenOrderId } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
import { twapOrdersListAtom, useTwapOrdersTokens } from 'entities/twap'

import { LegacyConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'

import {
  HistoryStatusFilter,
  OrderTabId,
  ordersTableHistoryStatusFilterOverrideAtom,
  useNavigateToOrdersTableTab,
} from 'modules/ordersTable'

import { CowModal } from 'common/pure/Modal'

import * as styledEl from './TwapPrototypeProxy.styled'

import {
  dismissTwapPrototypeCancellationNoticeAtom,
  twapPrototypeCancellationNoticeAtom,
} from '../../state/twapPrototypeProxyUiAtom'
import { TwapOrderItem } from '../../types'
import { isCurrentPrototypeOrder } from '../../utils/prototypeOrderState'

type PrototypeCancellationNoticeItem = {
  shortId: string
  summary: string
}

interface PrototypeCancellationNoticeModalProps {
  notices: PrototypeCancellationNoticeItem[]
  onDismiss(): void
}

type TwapOrderTokenData = NonNullable<NonNullable<ReturnType<typeof useTwapOrdersTokens>>[string]>

export function TwapPrototypeProxyModals(): ReactNode {
  const { account, chainId } = useWalletInfo()
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const allTwapOrders = useAtomValue(twapOrdersListAtom)
  const tokensByAddress = useTwapOrdersTokens()
  const { orderIds: noticeOrderIds } = useAtomValue(twapPrototypeCancellationNoticeAtom)
  const dismissCancellationNotice = useSetAtom(dismissTwapPrototypeCancellationNoticeAtom)
  const setHistoryStatusFilterOverride = useSetAtom(ordersTableHistoryStatusFilterOverrideAtom)
  const accountLowerCase = account?.toLowerCase()

  const noticeOrders = useMemo(() => {
    if (!accountLowerCase || !chainId || !noticeOrderIds.length) {
      return []
    }

    const noticeSet = new Set(noticeOrderIds)

    return allTwapOrders.filter((order) => {
      return noticeSet.has(order.id) && isCurrentPrototypeOrder(order, chainId, accountLowerCase)
    })
  }, [accountLowerCase, allTwapOrders, chainId, noticeOrderIds])

  const notices = useMemo(() => {
    return noticeOrders.map((order) => getPrototypeCancellationNoticeItem(order, tokensByAddress))
  }, [noticeOrders, tokensByAddress])

  if (!notices.length) {
    return null
  }

  const handleDismiss = (): void => {
    dismissCancellationNotice()
    setHistoryStatusFilterOverride(HistoryStatusFilter.CANCELLED)
    navigateToOrdersTableTab(OrderTabId.history)
  }

  return <PrototypeCancellationNoticeModal notices={notices} onDismiss={handleDismiss} />
}

function getPrototypeCancellationNoticeItem(
  order: TwapOrderItem,
  tokensByAddress: ReturnType<typeof useTwapOrdersTokens>,
): PrototypeCancellationNoticeItem {
  const sellToken =
    tokensByAddress?.[order.order.sellToken.toLowerCase()]?.symbol || shortenAddress(order.order.sellToken)
  const buyToken = tokensByAddress?.[order.order.buyToken.toLowerCase()]?.symbol || shortenAddress(order.order.buyToken)
  const sellTokenData = tokensByAddress?.[order.order.sellToken.toLowerCase()]
  const buyTokenData = tokensByAddress?.[order.order.buyToken.toLowerCase()]

  const summary =
    sellTokenData && buyTokenData
      ? getPrototypeOrderSummary(order, sellTokenData, buyTokenData)
      : `${sellToken} -> ${buyToken}`

  return {
    shortId: shortenOrderId(order.id),
    summary,
  }
}

function getPrototypeOrderSummary(
  order: TwapOrderItem,
  sellToken: TwapOrderTokenData,
  buyToken: TwapOrderTokenData,
): string {
  const totalSellAmount = CurrencyAmount.fromRawAmount(
    sellToken,
    (BigInt(order.order.partSellAmount) * BigInt(order.order.n)).toString(),
  )
  const totalBuyAmount = CurrencyAmount.fromRawAmount(
    buyToken,
    (BigInt(order.order.minPartLimit) * BigInt(order.order.n)).toString(),
  )

  return `Sell ${formatTokenAmount(totalSellAmount)} ${sellToken.symbol} for at least ${formatTokenAmount(totalBuyAmount)} ${
    buyToken.symbol
  }`
}

function PrototypeCancellationNoticeModal({ onDismiss, notices }: PrototypeCancellationNoticeModalProps): ReactNode {
  const singleNoticeShortId = notices[0]?.shortId || ''
  const title =
    notices.length > 1 ? <Trans>Orders cancelled</Trans> : <Trans>Order cancelled {singleNoticeShortId}</Trans>
  const message =
    notices.length > 1 ? (
      <Trans>
        These TWAP orders were cancelled. Any unused funds from your TWAP proxy account were automatically withdrawn to
        your wallet.
      </Trans>
    ) : (
      <Trans>
        This TWAP order was cancelled. Any unused funds from your TWAP proxy account were automatically withdrawn to
        your wallet.
      </Trans>
    )

  return (
    <CowModal isOpen onDismiss={onDismiss} maxHeight={56} maxWidth={480}>
      <LegacyConfirmationModalContent
        title={title}
        onDismiss={onDismiss}
        topContent={
          <styledEl.ModalWrapper>
            {notices.length > 1 ? (
              <>
                <styledEl.ModalDescription>{message}</styledEl.ModalDescription>
                <styledEl.Section>
                  <styledEl.SectionTitle>
                    <Trans>Cancelled orders</Trans>
                  </styledEl.SectionTitle>
                  <styledEl.TokenMeta>
                    {notices.map((notice, index) => (
                      <span key={`${notice.shortId}-${index}`}>
                        {notice.shortId}: {notice.summary}
                      </span>
                    ))}
                  </styledEl.TokenMeta>
                </styledEl.Section>
              </>
            ) : (
              <>
                <styledEl.SummaryCard>{notices[0]?.summary}</styledEl.SummaryCard>
                <styledEl.ModalDescription>{message}</styledEl.ModalDescription>
              </>
            )}
          </styledEl.ModalWrapper>
        }
        bottomContent={
          <styledEl.ActionsRow>
            <styledEl.SecondaryButton onClick={onDismiss}>
              <Trans>Close</Trans>
            </styledEl.SecondaryButton>
          </styledEl.ActionsRow>
        }
      />
    </CowModal>
  )
}
