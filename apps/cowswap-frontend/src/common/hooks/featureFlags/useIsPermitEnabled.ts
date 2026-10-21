import { useAtomValue } from 'jotai'

import { isSmartContractWalletAtom } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

export function useIsPermitEnabled(): boolean {
  const { disableEIP2612Permits } = useInjectedWidgetParams()
  const isEoa = useAtomValue(isSmartContractWalletAtom) === false

  if (disableEIP2612Permits) return false
  // Permit is only available for EOAs
  return isEoa
}
