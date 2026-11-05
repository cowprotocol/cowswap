import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency } from '@cowprotocol/currency'

import {
  acknowledgeTokenWarningsAtom,
  getAcknowledgementKey,
  tokenWarningsAcknowledgementAtom,
} from '../../state/tokens/tokenWarningsAcknowledgementAtom'

const NO_CODES: string[] = []

export function useAcknowledgedWarningCodes(currency: Currency | null | undefined): string[] {
  const acknowledgements = useAtomValue(tokenWarningsAcknowledgementAtom)

  if (!currency || getIsNativeToken(currency)) return NO_CODES

  return acknowledgements[getAcknowledgementKey(currency.chainId, currency.address)] ?? NO_CODES
}

export function useAcknowledgeTokenWarnings(): (currency: Currency, codes: string[]) => void {
  const acknowledge = useSetAtom(acknowledgeTokenWarningsAtom)

  return useCallback(
    (currency: Currency, codes: string[]) => {
      if (getIsNativeToken(currency)) return

      acknowledge({ chainId: currency.chainId, address: currency.address, codes })
    },
    [acknowledge],
  )
}
