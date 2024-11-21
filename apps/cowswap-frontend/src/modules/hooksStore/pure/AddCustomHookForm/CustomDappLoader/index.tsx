import { Dispatch, SetStateAction, useEffect } from 'react'

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

export function ExternalDappLoader({
  input,
  setLoading,
  setManifestError,
  setDappInfo,
  walletType,
  isPreHook,
}: ExternalDappLoaderProps) {
  const { chainId } = useWalletInfo()

  useEffect(() => {
    let isRequestRelevant = true

    const fetchManifest = async () => {
      setLoading(true)
      setManifestError(null) // Reset error state at the start

      try {
        // Basic URL validation first
        let url: URL
        try {
          url = new URL(input)
          // Accept only https, convert http in parent component
          if (!url.protocol.startsWith('https')) {
            setManifestError(
              <>
                HTTPS is required. Please use <code>https://</code>
                <br />
                <small>HTTP is not supported as this app runs on HTTPS</small>
              </>,
            )
            return
          }

          // Handle common URL mistakes
          if (url.pathname === '/manifest.json') {
            setManifestError('Please enter the base URL of your dapp, not the direct manifest.json path')
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
          return
        }

        // Try to fetch with a timeout to quickly detect non-existent domains
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        try {
          // First try a simple HEAD request
          const response = await fetch(url.origin, {
            method: 'HEAD',
            signal: controller.signal,
          })

          if (!response.ok) {
            setManifestError(
              <>
                The domain <strong>{url.host}</strong> returned an error (HTTP {response.status})
                <br />
                Please verify the URL is correct and the server is running.
              </>,
            )
            return
          }
        } catch (error) {
          // Check if it's a CORS error
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            // Try DNS lookup to distinguish between non-existent domain and CORS
            try {
              const dnsResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${url.hostname}&type=A`, {
                headers: { Accept: 'application/dns-json' },
              })
              const dnsResult = await dnsResponse.json()

              if (!dnsResult.Answer) {
                setManifestError(
                  <>
                    Unable to connect: The domain <strong>{url.host}</strong> does not exist
                  </>,
                )
                return
              }

              // Domain exists but we can't access it - likely CORS
              setManifestError(
                <>
                  The domain <strong>{url.host}</strong> exists but is not accessible due to CORS restrictions. The
                  server needs to allow requests from {window.location.origin}
                </>,
              )
              return
            } catch {
              setManifestError(
                <>
                  Unable to verify if domain <strong>{url.host}</strong> exists. Please check the URL and try again
                </>,
              )
              return
            }
          }

          setManifestError(
            <>
              Unable to connect to <strong>{url.host}</strong>. Please check the URL and try again
            </>,
          )
          return
        } finally {
          clearTimeout(timeoutId)
        }

        // If we get here, the domain exists and is accessible, proceed with manifest fetch
        try {
          const manifestResponse = await fetch(`${input}/manifest.json`)

          if (!manifestResponse.ok) {
            if (manifestResponse.status === 404) {
              throw new Error('MANIFEST_NOT_FOUND')
            } else if (manifestResponse.status >= 500) {
              throw new Error('SERVER_ERROR')
            } else {
              throw new Error(`HTTP_ERROR_${manifestResponse.status}`)
            }
          }

          const data = await manifestResponse.json()

          if (!isRequestRelevant) return

          if (!data.cow_hook_dapp) {
            throw new Error('INVALID_MANIFEST_STRUCTURE')
          }

          const dapp = data.cow_hook_dapp as HookDappBase

          const validationError = validateHookDappManifest(
            dapp,
            chainId,
            isPreHook,
            walletType === HookDappWalletCompatibility.SMART_CONTRACT,
          )

          if (validationError) {
            setManifestError(validationError)
          } else {
            setManifestError(null)
            setDappInfo({
              ...dapp,
              type: HookDappType.IFRAME,
              url: input,
            })
          }
        } catch (error) {
          if (!isRequestRelevant) return

          console.error('Hook dapp loading error:', error)

          if (error instanceof TypeError) {
            const errorMessage = error.message.toLowerCase()
            if (errorMessage.includes('networkerror') || !window.navigator.onLine) {
              setManifestError('Unable to connect: Please check your internet connection.')
            } else {
              setManifestError(
                'Unable to connect: The server is not responding. Please verify the URL or try again later.',
              )
            }
          } else if (error instanceof SyntaxError) {
            setManifestError(
              <>
                The manifest.json file contains invalid JSON. Please ensure it is properly formatted.
                <br />
                <small>Technical details: {error.message}</small>
              </>,
            )
          } else if (error instanceof Error) {
            if (error.message === 'MANIFEST_NOT_FOUND') {
              setManifestError(
                <>
                  Could not find <code>manifest.json</code> at <code>{input}/manifest.json</code>
                  <br />
                  Please verify:
                  <ul>
                    <li>The URL points to your dapp's root directory</li>
                    <li>The manifest.json file exists and is accessible</li>
                    <li>CORS is properly configured to allow requests from {window.location.origin}</li>
                  </ul>
                </>,
              )
            } else if (error.message === 'SERVER_ERROR') {
              setManifestError(
                <>
                  The server is experiencing issues. Please try again later.
                  <br />
                  <small>Server returned a 5xx error code</small>
                </>,
              )
            } else if (error.message.startsWith('HTTP_ERROR_')) {
              const statusCode = error.message.split('_')[2]
              setManifestError(
                <>
                  Server returned an error (HTTP {statusCode}).
                  <br />
                  Please verify:
                  <ul>
                    <li>The URL is correct</li>
                    <li>You have permission to access this resource</li>
                    <li>The server is configured correctly</li>
                  </ul>
                </>,
              )
            } else if (error.message === 'INVALID_MANIFEST_STRUCTURE') {
              setManifestError(
                <>
                  The manifest.json file is missing required data.
                  <br />
                  Please ensure it contains a valid <code>cow_hook_dapp</code> object with all required fields.
                  <br />
                  <small>
                    <a href="https://docs.cow.fi/cow-hooks/manifest-json" target="_blank" rel="noopener noreferrer">
                      View manifest.json documentation
                    </a>
                  </small>
                </>,
              )
            } else {
              setManifestError(
                <>
                  An unexpected error occurred while loading the manifest.
                  <br />
                  Please check the URL and try again.
                  <br />
                  <small>Error: {error.message}</small>
                </>,
              )
            }
          }
        }
      } finally {
        if (isRequestRelevant) {
          setLoading(false)
        }
      }
    }

    fetchManifest()

    return () => {
      isRequestRelevant = false
    }
  }, [input, walletType, chainId, isPreHook, setDappInfo, setLoading, setManifestError])

  return null
}
