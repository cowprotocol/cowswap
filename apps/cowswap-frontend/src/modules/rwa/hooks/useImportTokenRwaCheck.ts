import { TokenWithLogo } from '@cowprotocol/common-const'

import { useSelectTokenWidgetState } from 'modules/tokensList'

import { useRwaTokenStatus, RwaTokenStatus, RwaTokenInfo } from './useRwaTokenStatus'

type ImportTokenRwaStatus = 'allowed' | 'restricted' | 'requires-consent' | null

interface UseImportTokenRwaCheckResult {
  tokenToImport: TokenWithLogo | undefined
  rwaStatus: ImportTokenRwaStatus
  rwaTokenInfo: RwaTokenInfo | null
}

const RWA_STATUS_MAP: Readonly<Record<RwaTokenStatus, ImportTokenRwaStatus>> = {
  [RwaTokenStatus.Allowed]: 'allowed',
  [RwaTokenStatus.Restricted]: 'restricted',
  [RwaTokenStatus.RequiredConsent]: 'requires-consent',
  [RwaTokenStatus.ConsentIsSigned]: 'allowed',
}

export function useImportTokenRwaCheck(): UseImportTokenRwaCheckResult {
  const { tokenToImport } = useSelectTokenWidgetState()

  const { status, rwaTokenInfo } = useRwaTokenStatus({
    inputCurrency: tokenToImport,
    outputCurrency: undefined,
  })

  const rwaStatus = RWA_STATUS_MAP[status] ?? null

  return { tokenToImport, rwaStatus, rwaTokenInfo }
}
