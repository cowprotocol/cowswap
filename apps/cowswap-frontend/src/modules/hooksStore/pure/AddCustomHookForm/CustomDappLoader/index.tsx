import { Dispatch, SetStateAction, useEffect } from 'react'

import {
  HOOK_DAPP_ID_LENGTH,
  HookDappBase,
  HookDappType,
  HookDappWalletCompatibility,
} from '@cowprotocol/hook-dapp-lib'
import { useWalletInfo } from '@cowprotocol/wallet'

import { HookDappIframe } from '../../../types/hooks'

type HookDappBaseInfo = Omit<HookDappBase, 'type' | 'conditions'>

const MANDATORY_DAPP_FIELDS: (keyof HookDappBaseInfo)[] = ['id', 'name', 'image', 'version', 'website']

const isHex = (val: string) => Boolean(val.match(/^[0-9a-f]+$/i))

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
  const { chainId } = useWalletInfo()

  useEffect(() => {
    let isRequestRelevant = true

    setLoading(true)

    fetch(`${input}/manifest.json`)
      .then((res) => res.json())
      .then((data) => {
        if (!isRequestRelevant) return

        const { conditions = {}, ...dapp } = data.cow_hook_dapp as HookDappBase

        if (dapp) {
          const emptyFields = MANDATORY_DAPP_FIELDS.filter((field) => typeof dapp[field] === 'undefined')

          if (emptyFields.length > 0) {
            setManifestError(`${emptyFields.join(',')} fields are no set.`)
          } else {
            if (
              isSmartContractWallet === true &&
              conditions.walletCompatibility &&
              !conditions.walletCompatibility.includes(HookDappWalletCompatibility.SMART_CONTRACT)
            ) {
              setManifestError('The app does not support smart-contract wallets.')
            } else if (!isHex(dapp.id) || dapp.id.length !== HOOK_DAPP_ID_LENGTH) {
              setManifestError(<p>Hook dapp id must be a hex with length 64.</p>)
            } else if (conditions.supportedNetworks && !conditions.supportedNetworks.includes(chainId)) {
              setManifestError(<p>This app/hook doesn't support current network (chainId={chainId}).</p>)
            } else if (conditions.position === 'post' && isPreHook) {
              setManifestError(
                <p>
                  This app/hook can only be used as a <strong>post-hook</strong> and cannot be added as a pre-hook.
                </p>,
              )
            } else if (conditions.position === 'pre' && !isPreHook) {
              setManifestError(
                <p>
                  This app/hook can only be used as a <strong>pre-hook</strong> and cannot be added as a post-hook.
                </p>,
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
  }, [input, chainId])

  return null
}
