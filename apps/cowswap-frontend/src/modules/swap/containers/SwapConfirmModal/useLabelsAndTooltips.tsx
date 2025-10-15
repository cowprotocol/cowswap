import { useMemo } from 'react'

import { getMinimumReceivedTooltip, isSellOrder } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { useIsEoaEthFlow, useShouldPayGas } from 'modules/trade'
import { useIsSmartSlippageApplied } from 'modules/tradeSlippage'
import { NetworkCostsTooltipSuffix } from 'modules/tradeWidgetAddons'

import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLabelsAndTooltips() {
  const { slippage, orderKind } = useSwapDerivedState()
  const shouldPayGas = useShouldPayGas()
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const isSell = isSellOrder(orderKind)
  const { t } = useLingui()

  return useMemo(
    () => ({
      slippageLabel: isSmartSlippageApplied
        ? t`Slippage tolerance` + ` ` + `(` + (isSmartSlippageApplied ? t`dynamic` : t`modified`) + `)`
        : undefined,
      slippageTooltip: isEoaEthFlow
        ? getNativeSlippageTooltip([nativeCurrency.symbol])
        : getNonNativeSlippageTooltip({ isDynamic: isSmartSlippageApplied }),
      expectReceiveLabel: isSell ? t`Expected to receive` : t`Expected to sell`,
      minReceivedLabel: isSell ? t`Minimum receive` : t`Maximum sent`,
      minReceivedTooltip: slippage ? getMinimumReceivedTooltip(slippage, isSell) : '',
      networkCostsSuffix: shouldPayGas ? <NetworkCostsSuffix /> : null,
      networkCostsTooltipSuffix: <NetworkCostsTooltipSuffix />,
    }),
    [slippage, nativeCurrency.symbol, isEoaEthFlow, isSell, shouldPayGas, isSmartSlippageApplied, t],
  )
}
