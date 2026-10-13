import { ConnectionType, useConnectionType, useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

export function useIsPermitEnabled(): boolean {
  const { disableEIP2612Permits } = useInjectedWidgetParams()
  const isEoa = useIsSmartContractWallet() === false
  const connectionType = useConnectionType()

  if (disableEIP2612Permits) return false
  // Base Account looks like an EOA on-chain (no code, or an EIP-7702 delegation),
  // but signs with its passkey owner, so its signatures cannot be used for EIP-2612 permits
  if (connectionType === ConnectionType.BASE_ACCOUNT) return false
  // Permit is only available for EOAs
  return isEoa
}
