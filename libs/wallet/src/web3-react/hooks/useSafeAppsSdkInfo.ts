import type { SafeInfo } from '@safe-global/safe-apps-sdk'

import { useAtom } from 'jotai/index'
import { gnosisSafeInfoAtom } from '@cowprotocol/wallet'

export type GnosisSafeSdkInfo = SafeInfo

export function useSafeAppsSdkInfo(): GnosisSafeSdkInfo | null {
  const gnosisSafeInfo = useAtom(gnosisSafeInfoAtom)[0]

  console.log('main use safe apps sdk info')

  if (!gnosisSafeInfo) {
    return null
  }

  return {
    safeAddress: gnosisSafeInfo.address,
    chainId: gnosisSafeInfo.chainId,
    threshold: gnosisSafeInfo.threshold,
    owners: gnosisSafeInfo.owners,
    isReadOnly: !!gnosisSafeInfo.isReadOnly,
  }
}
