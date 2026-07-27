import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { DEFAULT_APP_CODE, SAFE_APP_CODE } from '@cowprotocol/common-const'
import { deepEqual } from '@cowprotocol/common-utils'
import { useIsSafeApp } from '@cowprotocol/wallet'

import { appDataBuiltWithHooksAtom, appDataHooksAtom, appDataInfoAtom } from './state/atoms'
import { AppDataInfo } from './types'

const APP_CODE = process.env.REACT_APP_APP_CODE

export function useAppCode(): string | null {
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    if (APP_CODE) {
      // appCode coming from env var has priority
      return APP_CODE
    }

    return isSafeApp ? SAFE_APP_CODE : DEFAULT_APP_CODE
  }, [isSafeApp])
}

export function useAppData(): AppDataInfo | null {
  return useAtomValue(appDataInfoAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAppDataHooks() {
  return useAtomValue(appDataHooksAtom)
}

/**
 * Whether the current appDataInfo was built from the latest hooks.
 *
 * appDataInfo is rebuilt asynchronously when hooks change, so right after a hook
 * is added/removed there is a short window where it is stale. Placing an order in
 * that window would produce an order without the just-changed hooks (see #7872).
 */
export function useIsAppDataHooksInSync(): boolean {
  const currentHooks = useAtomValue(appDataHooksAtom)
  const builtWithHooks = useAtomValue(appDataBuiltWithHooksAtom)

  return useMemo(() => deepEqual(currentHooks, builtWithHooks), [currentHooks, builtWithHooks])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateAppDataHooks() {
  return useSetAtom(appDataHooksAtom)
}
