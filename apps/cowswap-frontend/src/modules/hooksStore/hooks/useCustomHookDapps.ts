import { useAtomValue } from 'jotai/index'

import { customPostHookDappsAtom, customPreHookDappsAtom } from '../state/customHookDappsAtom'

export function useCustomHookDapps(isPreHook: boolean) {
  const pre = useAtomValue(customPreHookDappsAtom)
  const post = useAtomValue(customPostHookDappsAtom)

  return isPreHook ? pre : post
}
