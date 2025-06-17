import { JSX } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'

import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from '../../../../common/utils/tradeSettingsTooltips'
import useNativeCurrency from '../../../../lib/hooks/useNativeCurrency'
import { ThemedText } from '../../../../theme'
import { useIsEoaEthFlow } from '../../../trade'
import { useIsSmartSlippageApplied } from '../../../tradeSlippage'

export function SlippageTooltip(): JSX.Element {
  const { chainId } = useWalletInfo()
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
            ? getNativeSlippageTooltip(chainId, [nativeCurrency.symbol, getWrappedToken(nativeCurrency).symbol])
            : getNonNativeSlippageTooltip({ isDynamic: isSmartSlippageApplied, isSettingsModal: true })
        }
      />
    </>
  )
}
