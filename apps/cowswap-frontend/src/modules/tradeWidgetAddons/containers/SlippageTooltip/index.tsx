import { JSX } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { ThemedText } from 'theme'

import { useIsEoaEthFlow } from 'modules/trade'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function SlippageTooltip(): JSX.Element {
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()

  return (
    <>
      <ThemedText.Black fontWeight={400} fontSize={14}>
        <Trans>MEV-protected slippage</Trans>
      </ThemedText.Black>
      <HelpTooltip
        text={
          isEoaEthFlow
            ? getNativeSlippageTooltip([nativeCurrency.symbol, getWrappedToken(nativeCurrency).symbol])
            : getNonNativeSlippageTooltip({ isDynamic: isSmartSlippageApplied, isSettingsModal: true })
        }
      />
    </>
  )
}
