import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'

import { useIsEoaEthFlow, useShouldPayGas } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function NetworkCostsTooltipSuffix(): ReactNode {
  const isEoaEthFlow = useIsEoaEthFlow()
  const shouldPayGas = useShouldPayGas()
  const native = useNativeCurrency()

  if (!shouldPayGas) return null

  const nativeSymbol = native.symbol || ''
  const reason = isEoaEthFlow
    ? t`Because you are selling ${nativeSymbol} (native currency)`
    : t`Because you are using a smart contract wallet`

  return (
    <>
      <br />
      <br />
      {reason + `, ` + t`you will pay a separate gas cost for signing the order placement on-chain.`}
    </>
  )
}
