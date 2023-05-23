import { useAtomValue } from 'jotai'
import { Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useSlippage(): Percent | 'auto' {
  const { slippageValue } = useAtomValue(twapOrdersSettingsAtom)

  return useMemo(() => (slippageValue === 'auto' ? 'auto' : new Percent(slippageValue, 10_000)), [slippageValue])
}
