import { ReactElement, useCallback, useEffect, useState } from 'react'

import { uriToHttp } from '@cowprotocol/common-utils'
import { ButtonOutlined, ButtonPrimary, InlineBanner, Loader, SearchInput } from '@cowprotocol/ui'

import { ExternalSourceAlert } from 'common/pure/ExternalSourceAlert'

import { ExternalDappLoader } from './ExternalDappLoader'
import { Wrapper } from './styled'

import { HookDappIframe } from '../../types/hooks'
import { HookDappDetails } from '../HookDappDetails'

interface AddExternalHookFormProps {
  isPreHook: boolean
  isSmartContractWallet: boolean | undefined
  addHookDapp(dapp: HookDappIframe): void
  children: ReactElement | null
}

export function AddExternalHookForm({
  addHookDapp,
  children,
  isPreHook,
  isSmartContractWallet,
}: AddExternalHookFormProps) {
  const [input, setInput] = useState<string | undefined>(undefined)
  const [isSearchOpen, setSearchOpen] = useState<boolean>(false)
  const [isWarningAccepted, setWarningAccepted] = useState<boolean>(false)
  const [isUrlValid, setUrlValid] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [isFinalStep, setFinalStep] = useState<boolean>(false)
  const [manifestError, setManifestError] = useState<string | React.ReactNode | null>(null)
  const [dappInfo, setDappInfo] = useState<HookDappIframe | null>(null)

  const dismiss = useCallback(() => {
    setDappInfo(null)
    setManifestError(null)
    setUrlValid(true)
    setLoading(false)
    setFinalStep(false)
    setWarningAccepted(false)
  }, [])

  const goBack = useCallback(() => {
    dismiss()
    setInput(undefined)
    setSearchOpen(false)
  }, [dismiss])

  const addHookDappCallback = useCallback(() => {
    if (!dappInfo) return
    addHookDapp(dappInfo)
    goBack()
  }, [addHookDapp, dappInfo, goBack])

  useEffect(() => {
    dismiss()
    setUrlValid(input ? uriToHttp(input).length > 0 : true)
  }, [input, dismiss])

  return (
    <div>
      {!isSearchOpen && children}
      {isSearchOpen && input && isUrlValid && (
        <ExternalDappLoader
          input={input}
          isPreHook={isPreHook}
          isSmartContractWallet={isSmartContractWallet}
          setDappInfo={setDappInfo}
          setLoading={setLoading}
          setManifestError={setManifestError}
        />
      )}
      <Wrapper>
        {isSearchOpen && (
          <SearchInput
            type="text"
            placeholder="Enter a hook dapp URL"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        )}
        {input && !isUrlValid && (
          <InlineBanner bannerType="danger" hideIcon>
            Hook Dapp URL must match "https://website" format
          </InlineBanner>
        )}
        {manifestError && (
          <InlineBanner bannerType="danger" hideIcon>
            {manifestError}
          </InlineBanner>
        )}
        {isFinalStep && (
          <>
            <ExternalSourceAlert
              title="Add the app at your own risk"
              onChange={() => setWarningAccepted((state) => !state)}
            >
              <>
                <p>
                  Adding this app/hook grants it access to your wallet actions and trading information. Ensure you
                  understand the implications.
                </p>
                <p>
                  <strong>Always review wallet requests carefully before approving.</strong>
                </p>
              </>
            </ExternalSourceAlert>
            <ButtonPrimary disabled={!isWarningAccepted} onClick={addHookDappCallback}>
              Add custom hook
            </ButtonPrimary>
          </>
        )}
        {dappInfo && !isFinalStep ? (
          <HookDappDetails dapp={dappInfo} onSelect={() => setFinalStep(true)} />
        ) : (
          !isFinalStep && (
            <ButtonPrimary disabled={isSearchOpen} onClick={() => setSearchOpen(true)}>
              {loading ? <Loader /> : 'Add custom hook'}
            </ButtonPrimary>
          )
        )}
        {isSearchOpen && (
          <ButtonOutlined style={{ fontSize: '16px', padding: '12px 0' }} onClick={goBack}>
            Back
          </ButtonOutlined>
        )}
      </Wrapper>
    </div>
  )
}
