import { Dispatch, SetStateAction, useEffect, useCallback } from 'react'

import { getTimeoutAbortController, isDevelopmentEnv } from '@cowprotocol/common-utils'
import { HookDappType, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
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
const TIMEOUT_ERROR_MESSAGE = 'Request timed out. Please try again.'

const fetchWithTimeout = async (url: string, options: any) => {
  try {
    const response = await fetch(url, { signal: getTimeoutAbortController(options.timeout).signal, ...options })
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(TIMEOUT_ERROR_MESSAGE)
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
        try {
          const urlObject = new URL(url)
          const isLocalhost = urlObject.hostname === 'localhost' || urlObject.hostname === '127.0.0.1'
          const isHttps = urlObject.protocol.startsWith('https')

          // In production, always require HTTPS except for localhost in development
          if (!isDevelopmentEnv() && !isLocalhost && !isHttps) {
            setManifestError(
              <>
                HTTPS is required. Please use <code>https://</code>
              </>,
            )
            return
          }

          // Handle common URL mistakes
          if (urlObject.pathname === '/manifest.json') {
            setManifestError('Please enter the base URL of your dapp, not the direct manifest.json path')
            setDappInfo(null)
            setLoading(false)
            return
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
            setManifestError(TIMEOUT_ERROR_MESSAGE)
          } else if (error instanceof TypeError) {
            if (error.message === 'Failed to fetch') {
              // Check if it might be a TLS issue
              const urlObject = new URL(url)
              if (urlObject.protocol === 'https:') {
                setManifestError(
                  <>
                    Failed to load manifest. This might be due to an SSL/TLS configuration issue.
                    <br />
                    <small>
                      If you're running a local development server:
                      <ul>
                        <li>Try using HTTP instead of HTTPS for localhost</li>
                        <li>Or ensure your server's SSL certificate is properly configured</li>
                        <li>Technical details: {error.message}</li>
                      </ul>
                    </small>
                  </>,
                )
              } else {
                setManifestError('Invalid URL: No manifest.json file found. Please check the URL and try again.')
              }
            } else {
              setManifestError(
                <>
                  Failed to load manifest
                  <br />
                  <small>Technical details: {error.message}</small>
                </>,
              )
            }
          } else {
            setManifestError(
              error instanceof Error ? error.message : 'Failed to load manifest. Please verify the URL and try again.',
            )
          }
          setDappInfo(null)
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
          setManifestError(
            <>
              Invalid manifest format
              <br />
              <small>Technical details: {error.message}</small>
            </>,
          )
        } else if (error.name === 'AbortError') {
          setManifestError(TIMEOUT_ERROR_MESSAGE)
        } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
          setManifestError('Invalid URL: No manifest.json file found. Please check the URL and try again.')
        } else {
          setManifestError(
            error instanceof Error ? error.message : 'Failed to load manifest. Please verify the URL and try again.',
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
