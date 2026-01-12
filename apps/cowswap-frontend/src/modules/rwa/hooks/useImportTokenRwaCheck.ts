import { TokenWithLogo } from '@cowprotocol/common-const'

import { useSelectTokenWidgetState } from 'modules/tokensList'

import { useRwaTokenStatus, RwaTokenStatus, RwaTokenInfo } from './useRwaTokenStatus'

type ImportTokenRwaStatus = 'allowed' | 'restricted' | 'requires-consent' | null

interface UseImportTokenRwaCheckResult {
  tokenToImport: TokenWithLogo | undefined
  rwaStatus: ImportTokenRwaStatus
  rwaTokenInfo: RwaTokenInfo | null
}

/**
 * Hook that checks RWA status for the token being imported.
 */
export function useImportTokenRwaCheck(): UseImportTokenRwaCheckResult {
  const { tokenToImport } = useSelectTokenWidgetState()

  const { status, rwaTokenInfo } = useRwaTokenStatus({
    inputCurrency: tokenToImport,
    outputCurrency: undefined,
  })

  const rwaStatus = mapStatus(status)

  return { tokenToImport, rwaStatus, rwaTokenInfo }
}

function mapStatus(status: RwaTokenStatus): ImportTokenRwaStatus {
  switch (status) {
    case RwaTokenStatus.Restricted:
      return 'restricted'
    case RwaTokenStatus.RequiredConsent:
      return 'requires-consent'
    case RwaTokenStatus.Allowed:
    case RwaTokenStatus.ConsentIsSigned:
      return 'allowed'
    default:
      return null
  }
}
