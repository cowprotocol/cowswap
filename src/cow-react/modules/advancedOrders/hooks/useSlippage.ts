import { useAtomValue } from 'jotai'
import { Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { advancedOrdersSettingsAtom } from '../state/advancedOrdersSettingsAtom'

export function useSlippage(): Percent | 'auto' {
  const { slippage } = useAtomValue(advancedOrdersSettingsAtom)

  return useMemo(() => (slippage === 'auto' ? 'auto' : new Percent(slippage, 10_000)), [slippage])
}
