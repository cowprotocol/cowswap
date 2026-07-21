import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { isHttpsUrlString } from '@cowprotocol/common-utils'
import { CoWHookDappEvents, hookDappIframeTransport } from '@cowprotocol/hook-dapp-lib'
import { EthereumProvider, IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { useAccount } from 'wagmi'

import { getDappOrigin } from './getDappOrigin'

import { HookDappContext as HookDappContextType, HookDappIframe } from '../../types/hooks'

/**
 * Iframe sandbox allowlist for embedded hook dapps.
 * - allow-scripts: required for interactive SPA logic.
 * - allow-same-origin: preserves the hook dapp origin so storage/fetches work as expected.
 * - allow-forms: allows form controls used by dapp UIs.
 * - allow-popups + allow-popups-to-escape-sandbox: wallet popups / WalletConnect windows.
 */
const HOOK_DAPP_IFRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
/** Limits referrer leakage when embedding third-party hook dapps. */
const HOOK_DAPP_IFRAME_REFERRER_POLICY = 'strict-origin-when-cross-origin'
/** Permissions policy features delegated to the hook iframe (HTML `allow` attribute). */
const HOOK_DAPP_IFRAME_ALLOW = 'clipboard-read; clipboard-write'

const Iframe = styled.iframe`
  border: 0;
  min-height: 300px;
  opacity: ${({ $isLoading }: { $isLoading: boolean }) => ($isLoading ? 0 : 1)};
  transition: opacity 0.2s ease-in-out;
`

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  gap: 16px;
`

const LoadingText = styled.div`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 15px;
`

const StyledProductLogo = styled(ProductLogo)`
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.95);
    }
  }
`

interface IframeDappContainerProps {
  dapp: HookDappIframe
  context: HookDappContextType
  onAddHookRequest(payload: unknown): void
  onEditHookRequest(payload: unknown): void
  onSetSellTokenRequest(payload: unknown): void
  onSetBuyTokenRequest(payload: unknown): void
}

interface IframeState {
  isLoading: boolean
  isActive: boolean
  hasError: boolean
}
// eslint-disable-next-line max-lines-per-function
export function IframeDappContainer({
  dapp,
  context,
  onAddHookRequest,
  onEditHookRequest,
  onSetSellTokenRequest,
  onSetBuyTokenRequest,
}: IframeDappContainerProps): ReactNode {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const bridgeRef = useRef<IframeRpcProviderBridge | null>(null)
  const addHookRequestRef = useRef(onAddHookRequest)
  const editHookRequestRef = useRef(onEditHookRequest)
  const setSellTokenRequestRef = useRef(onSetSellTokenRequest)
  const setBuyTokenRequestRef = useRef(onSetBuyTokenRequest)

  const [iframeState, setIframeState] = useState<IframeState>({
    isLoading: true,
    isActive: false,
    hasError: false,
  })

  const dappOrigin = getDappOrigin(dapp.url)
  const isHttpsUrl = dappOrigin && isHttpsUrlString(dappOrigin)

  const { isLoading, isActive } = iframeState
  const hasError = iframeState.hasError || !dappOrigin || !isHttpsUrl

  const { connector } = useAccount()

  // eslint-disable-next-line react-hooks/refs
  addHookRequestRef.current = onAddHookRequest
  // eslint-disable-next-line react-hooks/refs
  editHookRequestRef.current = onEditHookRequest
  // eslint-disable-next-line react-hooks/refs
  setSellTokenRequestRef.current = onSetSellTokenRequest
  // eslint-disable-next-line react-hooks/refs
  setBuyTokenRequestRef.current = onSetBuyTokenRequest

  const handleIframeLoad = (): void => {
    setIframeState({
      isLoading: false,
      isActive: false,
      hasError: false,
    })
  }

  const handleIframeError = (): void => {
    setIframeState({
      isLoading: false,
      isActive: false,
      hasError: true,
    })
  }

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow || !dappOrigin || !isHttpsUrlString(dappOrigin)) return

    const listeners = [
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.ACTIVATE,
        () =>
          setIframeState({
            isLoading: false,
            isActive: true,
            hasError: false,
          }),
        dappOrigin,
      ),
    ]

    bridgeRef.current = new IframeRpcProviderBridge(iframeWindow, dappOrigin)

    listeners.push(
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.ADD_HOOK,
        (payload) => addHookRequestRef.current(payload),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.EDIT_HOOK,
        (payload) => editHookRequestRef.current(payload),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.SET_SELL_TOKEN,
        (payload) => setSellTokenRequestRef.current(payload),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.SET_BUY_TOKEN,
        (payload) => setBuyTokenRequestRef.current(payload),
        dappOrigin,
      ),
    )

    return () => {
      listeners.forEach((listener) => hookDappIframeTransport.stopListeningWindowListener(window, listener))
      bridgeRef.current?.disconnect()
    }
  }, [dappOrigin])

  useEffect(() => {
    if (!connector || !bridgeRef.current) return

    let cancelled = false

    connector.getProvider().then((provider) => {
      if (!cancelled && provider && bridgeRef.current) {
        bridgeRef.current.onConnect(provider as unknown as EthereumProvider)
      }
    })

    return () => {
      cancelled = true
    }
  }, [connector])

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow || !isActive || !dappOrigin || !isHttpsUrlString(dappOrigin)) return

    // Omit unnecessary parameter
    const { addHook: _, editHook: _1, setSellToken: _3, setBuyToken: _4, ...iframeContext } = context

    hookDappIframeTransport.postMessageToWindow(
      iframeWindow,
      CoWHookDappEvents.CONTEXT_UPDATE,
      iframeContext,
      dappOrigin,
    )
  }, [context, dappOrigin, isActive])

  let overlayNode: ReactNode | null = null

  if (hasError) {
    overlayNode = (
      <LoadingWrapper>
        <StyledProductLogo variant={ProductVariant.CowSwap} logoIconOnly height={56} />
        <LoadingText>
          <Trans>An error occurred while loading the hook</Trans>
        </LoadingText>
      </LoadingWrapper>
    )
  } else if (isLoading) {
    overlayNode = (
      <LoadingWrapper>
        <StyledProductLogo variant={ProductVariant.CowSwap} logoIconOnly height={56} />
        <LoadingText>
          <Trans>Loading hook...</Trans>
        </LoadingText>
      </LoadingWrapper>
    )
  }

  return (
    <>
      {overlayNode}
      <Iframe
        ref={iframeRef}
        src={dapp.url}
        allow={HOOK_DAPP_IFRAME_ALLOW}
        referrerPolicy={HOOK_DAPP_IFRAME_REFERRER_POLICY}
        sandbox={HOOK_DAPP_IFRAME_SANDBOX}
        onLoad={handleIframeLoad}
        onAbort={handleIframeError}
        onError={handleIframeError}
        $isLoading={isLoading}
      />
    </>
  )
}
