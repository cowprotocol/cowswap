import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { HookDappBase, HookDappType } from '@cowprotocol/hook-dapp-lib'

import ms from 'ms.macro'

import { customHookDappsAtom, upsertCustomHookDappAtom } from '../state/customHookDappsAtom'
import { validateHookDappManifest } from '../validateHookDappManifest'

const UPDATE_TIME_KEY = 'HOOK_DAPPS_UPDATE_TIME'
const HOOK_DAPPS_UPDATE_INTERVAL = ms`6h`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getLastUpdateTimestamp = () => {
  const lastUpdate = localStorage.getItem(UPDATE_TIME_KEY)
  return lastUpdate ? +lastUpdate : null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function IframeDappsManifestUpdater() {
  const hooksState = useAtomValue(customHookDappsAtom)
  const upsertCustomHookDapp = useSetAtom(upsertCustomHookDappAtom)

  const [preHooks, postHooks] = useMemo(
    () => [Object.values(hooksState.pre), Object.values(hooksState.post)],
    [hooksState],
  )

  const fetchAndUpdateHookDapp = useCallback(
    (url: string, isPreHook: boolean) => {
      return fetch(`${url}/manifest.json`)
        .then((res) => res.json())
        .then((data) => {
          const dapp = data.cow_hook_dapp as HookDappBase

          // Don't pass parameters that are not needed for validation
          // In order to skip validation of the already added hook-dapp
          const validationError = validateHookDappManifest(
            data.cow_hook_dapp as HookDappBase,
            undefined,
            undefined,
            undefined,
          )

          if (validationError) {
            console.error('Cannot update iframe hook dapp:', validationError)
          } else {
            upsertCustomHookDapp(isPreHook, {
              ...dapp,
              type: HookDappType.IFRAME,
              url,
            })
          }
        })
    },
    [upsertCustomHookDapp],
  )

  /**
   * Update iframe hook dapps not more often than every 6 hours
   */
  useEffect(() => {
    if (!preHooks.length && !postHooks.length) return

    const lastUpdate = getLastUpdateTimestamp()
    const shouldUpdate = !lastUpdate || lastUpdate + HOOK_DAPPS_UPDATE_INTERVAL < Date.now()

    if (!shouldUpdate) return

    console.debug('Updating iframe hook dapps...', { preHooks, postHooks })

    localStorage.setItem(UPDATE_TIME_KEY, Date.now().toString())

    preHooks.forEach((hook) => fetchAndUpdateHookDapp(hook.url, true))
    postHooks.forEach((hook) => fetchAndUpdateHookDapp(hook.url, false))
  }, [preHooks, postHooks, fetchAndUpdateHookDapp])

  return null
}
