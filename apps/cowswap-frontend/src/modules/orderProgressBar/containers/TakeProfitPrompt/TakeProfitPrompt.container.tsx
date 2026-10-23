import { useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { PiTrendUpBold } from 'react-icons/pi'

import { Order } from 'legacy/state/orders/actions'

import { pendingLimitOrderDraftAtom } from 'modules/limitOrderDraft'
import { getTakeProfitNavigation, getTakeProfitDraft, PricePercentageShortcuts } from 'modules/trade'

import { useNavigate } from 'common/hooks/useNavigate'

import * as styledEl from './TakeProfitPrompt.styled'

export interface TakeProfitPromptProps {
  order: Order
  onDismiss?: Command
}

export function TakeProfitPrompt({ order, onDismiss }: TakeProfitPromptProps): ReactNode {
  const navigate = useNavigate()
  const setDraft = useSetAtom(pendingLimitOrderDraftAtom)
  const { account } = useWalletInfo()
  const takeProfitDraft = getTakeProfitDraft(order)
  if (!takeProfitDraft) return null

  const openLimitOrder = (percentage: string | null): void => {
    const { pathname, draft } = getTakeProfitNavigation(takeProfitDraft, percentage)
    setDraft({ draft, pathname, account })
    navigate(pathname)
    onDismiss?.()
  }

  return (
    <styledEl.Banner
      customIcon={
        <styledEl.TrendIcon>
          <PiTrendUpBold aria-hidden />
        </styledEl.TrendIcon>
      }
      borderRadius="16px"
      padding="12px"
      margin="24px 0 0"
      customContent={
        <PricePercentageShortcuts mode="navigation" isInverted={false} disabled={false} onSelect={openLimitOrder} />
      }
    >
      <styledEl.Title>
        <Trans>
          Take profit on your <TokenSymbol token={takeProfitDraft.inputAmount.currency} />
        </Trans>
      </styledEl.Title>
      <styledEl.Description>
        <Trans>Limit order to sell at a higher price. How much higher?</Trans>
      </styledEl.Description>
    </styledEl.Banner>
  )
}
