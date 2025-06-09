import { useAtomValue } from 'jotai'

import { customPostHookDappsAtom, customPreHookDappsAtom } from '../state/customHookDappsAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCustomHookDapps(isPreHook: boolean) {
  const pre = useAtomValue(customPreHookDappsAtom)
  const post = useAtomValue(customPostHookDappsAtom)

  return isPreHook ? pre : post
}
