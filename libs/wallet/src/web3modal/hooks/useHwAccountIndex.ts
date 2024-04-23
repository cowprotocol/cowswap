import { useAtom } from 'jotai/index'
import { hwAccountIndexAtom } from '../hwAccountIndexState'

export function useHwAccountIndex() {
  return useAtom(hwAccountIndexAtom)
}
