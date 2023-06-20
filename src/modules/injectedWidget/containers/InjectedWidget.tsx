import React from 'react'

import { SwapWidget } from 'modules/swap/containers/SwapWidget'

import { useUpdateWidgetUrl } from '../hooks/useUpdateWidgetUrl'

export function InjectedWidget() {
  useUpdateWidgetUrl()

  return <SwapWidget />
}
