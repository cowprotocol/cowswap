import { useAtomValue } from 'jotai'
import { environmentAtom } from '../../state/environmentAtom'

export function useIsCuratedListAvailable(): boolean {
  return !!useAtomValue(environmentAtom).useCuratedListOnly
}
