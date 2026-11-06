import { useMemo } from 'react'

import { getRandomInt } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLingui } from '@lingui/react/macro'

import { CHAIN_SPECIFIC_BENEFITS } from '../constants'

export function useRandomBenefit(chainId: SupportedChainId): string {
  const { t } = useLingui()

  const benefit = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return benefits[getRandomInt(0, benefits.length - 1)]
  }, [chainId])

  return t(benefit)
}
