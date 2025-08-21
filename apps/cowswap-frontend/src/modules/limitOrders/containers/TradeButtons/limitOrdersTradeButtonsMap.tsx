import { ReactElement } from 'react'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

import { LimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

interface ButtonConfig {
  text: ReactElement | MessageDescriptor
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
    text: msg`Enter a price`,
  },
  [LimitOrdersFormState.ZeroPrice]: {
    text: msg`Invalid price. Try increasing input/output amount.`,
  },
  [LimitOrdersFormState.FeeExceedsFrom]: {
    text: msg`Sell amount is too small`,
  },
}
