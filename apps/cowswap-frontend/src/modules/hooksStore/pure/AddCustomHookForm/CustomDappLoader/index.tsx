import { Dispatch, SetStateAction, useEffect, useCallback } from 'react'

import { getTimeoutAbortController } from '@cowprotocol/common-utils'
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

const fetchWithTimeout = async (url: string, options: any) => {
  try {
    const response = await fetch(url, { signal: getTimeoutAbortController(options.timeout).signal, ...options })
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT)
    }
    throw error
  }
}

export function ExternalDappLoader({
  input,
  setLoading,
  setManifestError,
  setDappInfo,
  walletType,
  isPreHook,
}: ExternalDappLoaderProps) {
  const { chainId } = useWalletInfo()

  const fetchManifest = useCallback(
    async (url: string) => {
      if (!url) return

      setLoading(true)

      try {
        const validation = validateHookDappUrl(url)
        if (!validation.isValid) {
          setManifestError(validation.error)
          setDappInfo(null)
          setLoading(false)
          return
        }

        const trimmedUrl = url.trim()
        const manifestUrl = `${trimmedUrl}${trimmedUrl.endsWith('/') ? '' : '/'}manifest.json`

        const response = await fetchWithTimeout(manifestUrl, { timeout: TIMEOUT })
        if (!response.ok) {
          setManifestError('Failed to fetch manifest. Please verify the URL and try again.')
          setDappInfo(null)
          setLoading(false)
          return
        }

        const data = await response.json()

        if (!data.cow_hook_dapp) {
          setManifestError('Invalid manifest format: missing cow_hook_dapp property')
          setDappInfo(null)
          setLoading(false)
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
          setManifestError(validationError)
          setDappInfo(null)
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
          setManifestError(ERROR_MESSAGES.INVALID_MANIFEST_HTML)
        } else if (error.name === 'AbortError') {
          setManifestError(ERROR_MESSAGES.TIMEOUT)
        } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
          setManifestError(ERROR_MESSAGES.CONNECTION_ERROR)
        } else {
          setManifestError(
            error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_MANIFEST_ERROR
          )
        }
        setDappInfo(null)
      } finally {
        setLoading(false)
      }
    },
    [input, walletType, chainId, isPreHook, setDappInfo, setLoading, setManifestError],
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
