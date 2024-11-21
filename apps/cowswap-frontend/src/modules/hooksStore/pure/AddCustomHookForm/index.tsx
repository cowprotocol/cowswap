import { ReactElement, useCallback, useMemo, useState, Dispatch, SetStateAction } from 'react'

import { debounce, uriToHttp } from '@cowprotocol/common-utils'
import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { BannerOrientation, ButtonOutlined, ButtonPrimary, InlineBanner, Loader, SearchInput } from '@cowprotocol/ui'

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
    setManifestError(null)
    setLoading(false)
    setFinalStep(false)
    setWarningAccepted(false)
  }, [])

  const goBack = useCallback(() => {
    dismiss()
    setInput('')
    setSearchOpen(false)
  }, [dismiss])

  const addHookDappCallback = useCallback(() => {
    if (!dappInfo) return
    addHookDapp(dappInfo)
    goBack()
  }, [addHookDapp, dappInfo, goBack])

  // Normalizes URLs only on explicit actions (paste/submit) to prevent interrupting user typing
  const normalizeUrl = useCallback((url: string, shouldNormalize = false) => {
    if (!url) return ''

    if (shouldNormalize) {
      try {
        const normalizedUrl = url.replace(/\/+$/, '')

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

  const validateUrl = useMemo(() => {
    type SetErrorType = Dispatch<SetStateAction<string | React.ReactNode | null>>

    return debounce((value: string, setError: SetErrorType) => {
      if (!value || (!value.includes('://') && !value.includes('.'))) {
        setError(null)
        return
      }

      try {
        const url = new URL(value)
        if (!url.protocol.startsWith('https')) {
          setError(
            <>
              HTTPS is required. Please use <code>https://</code>
            </>,
          )
        } else {
          setError(null)
        }
      } catch {
        if (value.includes('://')) {
          setError(
            <>
              Invalid URL format. Please enter a valid URL (e.g., <code>https://example.com</code>)
            </>,
          )
        }
      }
    }, 1500)
  }, [])

  const debouncedValidate = useCallback(
    (value: string) => {
      validateUrl(value, setManifestError)
    },
    [validateUrl],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInput(value)
      debouncedValidate(value)
      dismiss()
    },
    [debouncedValidate, dismiss],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedValue = e.clipboardData.getData('text')
      const normalizedValue = normalizeUrl(pastedValue, true)
      e.preventDefault() // Prevent default to avoid double paste
      setInput(normalizedValue)
      debouncedValidate(normalizedValue)
      dismiss()
    },
    [normalizeUrl, debouncedValidate, dismiss],
  )

  const handleBlur = useCallback(() => {
    if (!input.startsWith('https://')) {
      const normalizedValue = normalizeUrl(input, true)
      setInput(normalizedValue)
      debouncedValidate(normalizedValue)
    }
  }, [input, normalizeUrl, debouncedValidate])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const normalizedValue = normalizeUrl(input, true)
      setInput(normalizedValue)
      debouncedValidate(normalizedValue)
    },
    [input, normalizeUrl, debouncedValidate],
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
              type="text"
              placeholder="Enter a hook dapp URL"
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onBlur={handleBlur}
            />

            {manifestError && (
              <InlineBanner bannerType="danger" orientation={BannerOrientation.Horizontal}>
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
