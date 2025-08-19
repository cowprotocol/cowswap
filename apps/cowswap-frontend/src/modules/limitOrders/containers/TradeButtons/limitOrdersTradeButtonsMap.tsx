import { ReactElement } from 'react'

import { Trans } from '@lingui/react/macro'

import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

import { LimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

interface ButtonConfig {
  text: ReactElement | string
  id?: string
}

interface ButtonCallback {
  (): ReactElement | null
}

export const limitOrdersTradeButtonsMap: { [key in LimitOrdersFormState]: ButtonConfig | ButtonCallback } = {
  [LimitOrdersFormState.RateLoading]: {
    text: <TradeLoadingButton />,
  },
  [LimitOrdersFormState.PriceIsNotSet]: {
    text: <Trans>Enter a price</Trans>,
  },
  [LimitOrdersFormState.ZeroPrice]: {
    text: <Trans>Invalid price. Try increasing input/output amount.</Trans>,
  },
  [LimitOrdersFormState.FeeExceedsFrom]: {
    text: <Trans>Sell amount is too small</Trans>,
  },
}
