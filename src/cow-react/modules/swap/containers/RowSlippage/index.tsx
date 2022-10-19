import { useMemo } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { PERCENTAGE_PRECISION } from 'constants/index'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { formatSmart } from 'utils/format'
import { RowSlippageContent } from '@cow/modules/swap/pure/Row/RowSlippageContent'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import TradeGp from 'state/swap/TradeGp'

export interface RowSlippageProps {
  trade?: TradeGp
  allowedSlippage: Percent
  showSettingOnClick?: boolean
}

export function RowSlippage({ trade, allowedSlippage, showSettingOnClick = true }: RowSlippageProps) {
  const toggleSettings = useToggleSettingsMenu()

  // if is wrap/unwrap operation return null
  const wrapType = useWrapType()
  // should we show the warning?
  const showEthFlowSlippageWarning = !!trade?.inputAmount.currency.isNative
  const [nativeSymbol, wrappedSymbol] = [trade?.inputAmount.currency.symbol, trade?.inputAmount.currency.wrapped.symbol]

  const props = useMemo(
    () => ({
      showEthFlowSlippageWarning,
      symbols: [nativeSymbol, wrappedSymbol],
      showSettingOnClick,
      allowedSlippage,
      displaySlippage: `${formatSmart(allowedSlippage, PERCENTAGE_PRECISION)}%`,
    }),
    [allowedSlippage, nativeSymbol, showEthFlowSlippageWarning, showSettingOnClick, wrappedSymbol]
  )

  return wrapType !== WrapType.NOT_APPLICABLE ? null : <RowSlippageContent {...props} toggleSettings={toggleSettings} />
}
