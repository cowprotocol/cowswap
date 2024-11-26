import { Dispatch, SetStateAction, useEffect, useCallback } from 'react'

import { fetchWithTimeout } from '@cowprotocol/common-utils'
import { HookDappType, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { useWalletInfo } from '@cowprotocol/wallet'

import { HookDappIframe } from '../../../types/hooks'
import { validateHookDappUrl } from '../../../utils/urlValidation'
import { validateHookDappManifest } from '../../../validateHookDappManifest'
import { ERROR_MESSAGES } from '../constants'

interface ExternalDappLoaderProps {
  input: string
  isPreHook: boolean
  walletType: HookDappWalletCompatibility
  setDappInfo: Dispatch<SetStateAction<HookDappIframe | null>>
  setLoading: Dispatch<SetStateAction<boolean>>
  setManifestError: Dispatch<SetStateAction<string | React.ReactNode | null>>
}

const TIMEOUT = 5000

export function ExternalDappLoader({
  input,
  setLoading,
  setManifestError,
  setDappInfo,
  walletType,
  isPreHook,
}: ExternalDappLoaderProps) {
  const { chainId } = useWalletInfo()

  const setError = useCallback(
    (message: string | React.ReactNode) => {
      setManifestError(message)
      setDappInfo(null)
      setLoading(false)
    },
    [setManifestError, setDappInfo, setLoading],
  )

  const fetchManifest = useCallback(
    async (url: string) => {
      if (!url) return

      setLoading(true)

      try {
        const validation = validateHookDappUrl(url)
        if (!validation.isValid) {
          setError(validation.error)
          return
        }

        const trimmedUrl = url.trim()
        const manifestUrl = `${trimmedUrl}${trimmedUrl.endsWith('/') ? '' : '/'}manifest.json`

        const response = await fetchWithTimeout(manifestUrl, {
          timeout: TIMEOUT,
          timeoutMessage: ERROR_MESSAGES.TIMEOUT,
        })
        if (!response.ok) {
          setError(`Failed to fetch manifest from ${manifestUrl}. Please verify the URL and try again.`)
          return
        }

        const data = await response.json()

        if (!data.cow_hook_dapp) {
          setError(`Invalid manifest format at ${manifestUrl}: missing cow_hook_dapp property`)
          return
        }

        const dapp = data.cow_hook_dapp

        const validationError = validateHookDappManifest(
          dapp,
          chainId,
          isPreHook,
          walletType === HookDappWalletCompatibility.SMART_CONTRACT,
        )

        if (validationError) {
          setError(validationError)
        } else {
          setManifestError(null)
          setDappInfo({
            ...dapp,
            type: HookDappType.IFRAME,
            url: input,
          })
        }
      } catch (error) {
        console.error('Hook dapp loading error:', error)

        if (error.message?.includes('JSON')) {
          setError(ERROR_MESSAGES.INVALID_MANIFEST_HTML)
        } else if (error.name === 'AbortError') {
          setError(ERROR_MESSAGES.TIMEOUT)
        } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
          setError(ERROR_MESSAGES.CONNECTION_ERROR)
        } else {
          setError(error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_MANIFEST_ERROR)
        }
      } finally {
        setLoading(false)
      }
    },
    [input, walletType, chainId, isPreHook, setDappInfo, setLoading, setManifestError, setError],
  )

  useEffect(() => {
    if (input) {
      fetchManifest(input)
    }

    return () => {
      setLoading(false)
    }
  }, [input, fetchManifest, setLoading])

  return null
}
