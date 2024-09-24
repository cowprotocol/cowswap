import { Dispatch, SetStateAction, useEffect } from 'react'

import { HookDappBase, HookDappIframe, HookDappType } from '../../../types/hooks'

interface HookDappConditions {
  position?: 'post' | 'pre'
  smartContractWalletSupported?: boolean
}

type HookDappBaseInfo = Omit<HookDappBase, 'type'>

type HookDappManifest = HookDappBaseInfo & {
  conditions?: HookDappConditions
}

const MANDATORY_DAPP_FIELDS: (keyof HookDappBaseInfo)[] = ['name', 'image', 'version', 'website']

interface ExternalDappLoaderProps {
  input: string
  isPreHook: boolean
  isSmartContractWallet: boolean | undefined
  setDappInfo: Dispatch<SetStateAction<HookDappIframe | null>>
  setLoading: Dispatch<SetStateAction<boolean>>
  setManifestError: Dispatch<SetStateAction<string | React.ReactNode | null>>
}

export function ExternalDappLoader({
  input,
  setLoading,
  setManifestError,
  setDappInfo,
  isSmartContractWallet,
  isPreHook,
}: ExternalDappLoaderProps) {
  useEffect(() => {
    let isRequestRelevant = true

    setLoading(true)

    fetch(`${input}/manifest.json`)
      .then((res) => res.json())
      .then((data) => {
        if (!isRequestRelevant) return

        const { conditions = {}, ...dapp } = data.cow_hook_dapp as HookDappManifest

        if (dapp) {
          const emptyFields = MANDATORY_DAPP_FIELDS.filter((field) => typeof dapp[field] === 'undefined')

          if (emptyFields.length > 0) {
            setManifestError(`${emptyFields.join(',')} fields are no set.`)
          } else {
            if (conditions.smartContractWalletSupported === false && isSmartContractWallet === true) {
              setManifestError('The app does not support smart-contract wallets.')
            } else if (conditions.position === 'post' && isPreHook) {
              setManifestError(
                <>
                  This app/hook can only be used as a <b>post-hook</b> and cannot be added as a pre-hook.
                </>,
              )
            } else if (conditions.position === 'pre' && !isPreHook) {
              setManifestError(
                <>
                  This app/hook can only be used as a <b>pre-hook</b> and cannot be added as a post-hook.
                </>,
              )
            } else {
              setManifestError(null)
              setDappInfo({
                ...dapp,
                type: HookDappType.IFRAME,
                url: input,
              })
            }
          }
        } else {
          setManifestError('Manifest does not contain "cow_hook_dapp" property.')
        }
      })
      .catch((error) => {
        if (!isRequestRelevant) return

        console.error(error)
        setManifestError('Can not fetch the manifest.json')
      })
      .finally(() => {
        if (!isRequestRelevant) return

        setLoading(false)
      })

    return () => {
      isRequestRelevant = false
    }
  }, [input])

  return null
}
