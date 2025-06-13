import { ReactElement, useCallback, useState } from 'react'

import { isDevelopmentEnv, uriToHttp } from '@cowprotocol/common-utils'
import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import {
  BannerOrientation,
  ButtonOutlined,
  ButtonPrimary,
  InlineBanner,
  Loader,
  SearchInput,
  StatusColorVariant,
} from '@cowprotocol/ui'

import { ExternalSourceAlert } from 'common/pure/ExternalSourceAlert'

import { ExternalDappLoader } from './CustomDappLoader'
import { Wrapper } from './styled'

import { HookDappIframe } from '../../types/hooks'
import { HookDappDetails } from '../HookDappDetails'

interface AddCustomHookFormProps {
  isPreHook: boolean
  walletType: HookDappWalletCompatibility
  addHookDapp(dapp: HookDappIframe): void
  children: ReactElement | null
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function AddCustomHookForm({ addHookDapp, children, isPreHook, walletType }: AddCustomHookFormProps) {
  const [input, setInput] = useState<string>('')
  const [isSearchOpen, setSearchOpen] = useState<boolean>(false)
  const [isWarningAccepted, setWarningAccepted] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isFinalStep, setFinalStep] = useState<boolean>(false)
  const [manifestError, setManifestError] = useState<string | React.ReactNode | null>(null)
  const [dappInfo, setDappInfo] = useState<HookDappIframe | null>(null)

  const dismiss = useCallback(() => {
    setDappInfo(null)
    setLoading(false)
    setFinalStep(false)
    setWarningAccepted(false)
  }, [])

  const goBack = useCallback(() => {
    dismiss()
    setManifestError(null)
    setInput('')
    setSearchOpen(false)
  }, [dismiss])

  const addHookDappCallback = useCallback(() => {
    if (!dappInfo) return
    addHookDapp(dappInfo)
    goBack()
  }, [addHookDapp, dappInfo, goBack])

  // Normalizes URLs only on explicit actions (paste/submit) to prevent interrupting user typing
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  const normalizeUrl = useCallback((url: string, shouldNormalize = false) => {
    if (!url) return ''

    if (shouldNormalize) {
      try {
        const normalizedUrl = url.trim().replace(/\/+$/, '')

        // Parse URL to check if it's localhost
        try {
          const urlObject = new URL(normalizedUrl)
          const isLocalhost = urlObject.hostname === 'localhost' || urlObject.hostname === '127.0.0.1'

          // In development mode or for localhost, preserve the original protocol
          if (isDevelopmentEnv() || isLocalhost) {
            return normalizedUrl
          }
        } catch {
          // URL parsing failed, continue with normal normalization
        }

        if (normalizedUrl.startsWith('https://')) {
          return normalizedUrl
        }

        if (normalizedUrl.startsWith('http://')) {
          return 'https://' + normalizedUrl.slice(7)
        }

        // Handle special protocols (ipfs/ipns/ar) via uriToHttp
        const urls = uriToHttp(normalizedUrl)
        if (urls.length > 0) {
          return urls[0]
        }

        return normalizedUrl
      } catch (error) {
        console.warn('Invalid URL during normalization:', error)
        return url
      }
    }

    return url
  }, [])

  const resetStates = useCallback(
    (value: string) => {
      // Only clear the error if the input value actually changed
      if (value !== input) {
        setManifestError(null)
      }
      setInput(value)
      setDappInfo(null)
      setLoading(false)
      setFinalStep(false)
      setWarningAccepted(false)
    },
    [input],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      resetStates(e.target.value)
    },
    [resetStates],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedValue = e.clipboardData.getData('text')
      const normalizedValue = normalizeUrl(pastedValue, true)
      e.preventDefault() // Prevent default to avoid double paste
      resetStates(normalizedValue)
    },
    [normalizeUrl, resetStates],
  )

  const handleBlur = useCallback(() => {
    if (!input.startsWith('https://')) {
      const normalizedValue = normalizeUrl(input, true)
      // Don't reset states on blur if the value hasn't changed
      if (normalizedValue !== input) {
        resetStates(normalizedValue)
      }
    }
  }, [input, normalizeUrl, resetStates])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const normalizedValue = normalizeUrl(input, true)
      resetStates(normalizedValue)
    },
    [input, normalizeUrl, resetStates],
  )

  return (
    <>
      {!isSearchOpen && children}

      {!isSearchOpen && (
        <Wrapper>
          <ButtonPrimary disabled={loading} onClick={() => setSearchOpen(true)}>
            {loading ? <Loader /> : 'Add custom hook'}
          </ButtonPrimary>
        </Wrapper>
      )}

      {isSearchOpen && (
        <Wrapper>
          <form onSubmit={handleSubmit}>
            <SearchInput
              placeholder="Enter a hook dapp URL"
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onBlur={handleBlur}
            />

            {manifestError && (
              <InlineBanner bannerType={StatusColorVariant.Danger} orientation={BannerOrientation.Horizontal}>
                <div>{manifestError}</div>
              </InlineBanner>
            )}

            {input && (
              <ExternalDappLoader
                input={input}
                isPreHook={isPreHook}
                walletType={walletType}
                setDappInfo={setDappInfo}
                setLoading={setLoading}
                setManifestError={setManifestError}
              />
            )}

            {dappInfo && !isFinalStep && (
              <HookDappDetails dapp={dappInfo} walletType={walletType} onSelect={() => setFinalStep(true)} />
            )}

            {isFinalStep && (
              <>
                <ExternalSourceAlert
                  title="Add the app at your own risk"
                  onChange={() => setWarningAccepted((state) => !state)}
                >
                  <p>
                    Adding this app/hook grants it access to your wallet actions and trading information. Ensure you
                    understand the implications. <br />
                    <br />
                    <strong>Always review wallet requests carefully before approving.</strong>
                  </p>
                </ExternalSourceAlert>
                <ButtonPrimary disabled={!isWarningAccepted} onClick={addHookDappCallback}>
                  Add custom hook
                </ButtonPrimary>
              </>
            )}

            <ButtonOutlined style={{ fontSize: '16px', padding: '12px 0' }} onClick={goBack}>
              Back
            </ButtonOutlined>
          </form>
        </Wrapper>
      )}
    </>
  )
}
