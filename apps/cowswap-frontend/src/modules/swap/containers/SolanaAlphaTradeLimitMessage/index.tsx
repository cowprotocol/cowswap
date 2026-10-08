import { ReactNode } from 'react'

import { SOLANA_ALPHA_MAX_TRADE_SIZE_USD } from '@cowprotocol/common-const'
import { InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { TradeFormValidation, useGetTradeFormValidations } from 'modules/tradeFormValidation'

export function SolanaAlphaTradeLimitMessage(): ReactNode {
  const validations = useGetTradeFormValidations()

  if (!validations?.includes(TradeFormValidation.SolanaAlphaMaxTradeSize)) return null

  const maxTradeSize = SOLANA_ALPHA_MAX_TRADE_SIZE_USD.toLocaleString('en-US')

  return (
    <InlineBanner bannerType={StatusColorVariant.Danger} hideIcon>
      <Trans>Maximum ${maxTradeSize} per swap. Reduce the sell amount.</Trans>
    </InlineBanner>
  )
}
