import { Dispatch, SetStateAction, useEffect, useCallback } from 'react'

import { HookDappBase, HookDappType, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { useWalletInfo } from '@cowprotocol/wallet'

import { HookDappIframe } from '../../../types/hooks'
import { validateHookDappManifest } from '../../../validateHookDappManifest'

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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, options.timeout)

  try {
    const response = await fetch(url, { signal: controller.signal, ...options })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
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
        // Basic URL validation first
        let urlObject: URL
        try {
          urlObject = new URL(url)
          // Accept only https, convert http in parent component
          if (!urlObject.protocol.startsWith('https')) {
            setManifestError(
              <>
                HTTPS is required. Please use <code>https://</code>
              </>,
            )
            setDappInfo(null) // Reset dapp info when there's an error
            setLoading(false)
            return
          }

          // Handle common URL mistakes
          if (urlObject.pathname === '/manifest.json') {
            setManifestError('Please enter the base URL of your dapp, not the direct manifest.json path')
            setDappInfo(null) // Reset dapp info when there's an error
            setLoading(false)
            return
          }
        } catch {
          setManifestError(
            <>
              Invalid URL format. Please enter a valid URL (e.g., <code>https://example.com</code>)
              <br />
              Make sure to include the protocol (<code>https://</code>)
            </>,
          )
          setDappInfo(null) // Reset dapp info when there's an error
          setLoading(false)
          return
        }

        const manifestResponse = await fetchWithTimeout(`${url}/manifest.json`, { timeout: TIMEOUT })
        const data = await manifestResponse.json()

        if (!data.cow_hook_dapp) {
          setManifestError('Invalid manifest format: missing cow_hook_dapp property')
          setDappInfo(null)
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
          setDappInfo(null) // Reset dapp info when there's an error
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
          setManifestError(
            <>
              Invalid manifest format
              <br />
              <small>Technical details: {error.message}</small>
            </>,
          )
        } else if (error.name === 'AbortError') {
          setManifestError('Request timed out. Please try again.')
        } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
          setManifestError('Invalid URL: No manifest.json file found. Please check the URL and try again.')
        } else {
          setManifestError(
            error instanceof Error ? error.message : 'Failed to load manifest. Please verify the URL and try again.',
          )
        }
        setDappInfo(null) // Reset dapp info when there's an error
      } finally {
        setLoading(false)
      }
    },
    [input, walletType, chainId, isPreHook, setDappInfo, setLoading, setManifestError],
  )

  useEffect(() => {
    let isRequestRelevant = true

    if (input) {
      fetchManifest(input)
    }

    return () => {
      isRequestRelevant = false
      setLoading(false)
    }
  }, [input, fetchManifest])

  return null
}
