import { useAtomValue } from 'jotai'

import { hooksAtom } from '../state/hookDetailsAtom'

export function useHookById(uuid: string | undefined, isPreHook: boolean) {
  const hooks = useAtomValue(hooksAtom)

  if (!uuid) return undefined

  return (isPreHook ? hooks.preHooks : hooks.postHooks).find((i) => i.uuid === uuid)
}
