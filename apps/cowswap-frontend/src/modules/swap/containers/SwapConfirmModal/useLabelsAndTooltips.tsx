import { useMemo } from 'react'

import { getMinimumReceivedTooltip, isSellOrder } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

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
  const { chainId } = useWalletInfo()
  const shouldPayGas = useShouldPayGas()
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const isSell = isSellOrder(orderKind)

  return useMemo(
    () => ({
      slippageLabel:
        isSmartSlippageApplied
          ? `Slippage tolerance (${isSmartSlippageApplied ? 'dynamic' : 'modified'})`
          : undefined,
      slippageTooltip: isEoaEthFlow
        ? getNativeSlippageTooltip(chainId, [nativeCurrency.symbol])
        : getNonNativeSlippageTooltip({ isDynamic: isSmartSlippageApplied }),
      expectReceiveLabel: isSell ? 'Expected to receive' : 'Expected to sell',
      minReceivedLabel: isSell ? 'Minimum receive' : 'Maximum sent',
      minReceivedTooltip: slippage ? getMinimumReceivedTooltip(slippage, isSell) : '',
      networkCostsSuffix: shouldPayGas ? <NetworkCostsSuffix /> : null,
      networkCostsTooltipSuffix: <NetworkCostsTooltipSuffix />,
    }),
    [
      chainId,
      slippage,
      nativeCurrency.symbol,
      isEoaEthFlow,
      isSell,
      shouldPayGas,
      isSmartSlippageApplied,
    ],
  )
}
