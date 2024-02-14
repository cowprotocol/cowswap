import { useAtomValue } from 'jotai'
import { environmentAtom } from '../../state/environmentAtom'

export function useIsOnlyUniswapListAvailable(): boolean {
  return !!useAtomValue(environmentAtom).useUniswapListOnly
}
