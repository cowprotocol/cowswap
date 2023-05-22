import { useAtomValue } from 'jotai'
import { Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { advancedOrdersSettingsAtom } from '../state/advancedOrdersSettingsAtom'

export function useSlippage(): Percent | 'auto' {
  const { slippageValue } = useAtomValue(advancedOrdersSettingsAtom)

  return useMemo(() => (slippageValue === 'auto' ? 'auto' : new Percent(slippageValue, 10_000)), [slippageValue])
}
