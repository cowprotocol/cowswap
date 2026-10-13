import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

export function useIsPermitEnabled(): boolean {
  const { disableEIP2612Permits } = useInjectedWidgetParams()
  const isEoa = useIsSmartContractWallet() === false

  if (disableEIP2612Permits) return false
  // Permit is only available for EOAs
  return isEoa
}
