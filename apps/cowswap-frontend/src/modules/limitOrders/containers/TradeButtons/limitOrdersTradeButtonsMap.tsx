import { ReactElement } from 'react'

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
    text: 'Enter a price',
  },
  [LimitOrdersFormState.ZeroPrice]: {
    text: 'Invalid price. Try increasing input/output amount.',
  },
  [LimitOrdersFormState.FeeExceedsFrom]: {
    text: 'Sell amount is too small',
  },
}
