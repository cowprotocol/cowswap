import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'

import { GasPaymentReason, useGasPaymentReason } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function NetworkCostsTooltipSuffix(): ReactNode {
  const gasPaymentReason = useGasPaymentReason()
  const native = useNativeCurrency()

  if (!gasPaymentReason) return null

  const nativeSymbol = native.symbol || ''
  const reason =
    gasPaymentReason === GasPaymentReason.EthFlow
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
