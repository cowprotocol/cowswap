import { isTruthy } from '@cowprotocol/common-utils'
import { useWalletDetails } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { useIsEoaEthFlow } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function NetworkCostsTooltipSuffix() {
  const { allowsOffchainSigning } = useWalletDetails()
  const isEoaEthFlow = useIsEoaEthFlow()
  const native = useNativeCurrency()

  const isPresign = !isEoaEthFlow && !allowsOffchainSigning
  const nativeSymbol = native.symbol || ''

  const addons = [
    isPresign && t`Because you are using a smart contract wallet`,
    isEoaEthFlow && t`Because you are selling ${nativeSymbol} (native currency)`,
    (isPresign || isEoaEthFlow) && `, ` + t`you will pay a separate gas cost for signing the order placement on-chain.`,
  ].filter(isTruthy)

  if (!addons.length) return null

  return (
    <>
      <br />
      <br />
      {addons.join('')}
    </>
  )
}
