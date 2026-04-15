import { ReactNode, useLayoutEffect, useRef, useState } from 'react'

import { CoWHookDappEvents, hookDappIframeTransport } from '@cowprotocol/hook-dapp-lib'
import { EthereumProvider, IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { useWalletClient } from 'wagmi'

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
}
// eslint-disable-next-line max-lines-per-function
export function IframeDappContainer({ dapp, context }: IframeDappContainerProps): ReactNode {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const bridgeRef = useRef<IframeRpcProviderBridge | null>(null)
  const addHookRef = useRef(context.addHook)
  const editHookRef = useRef(context.editHook)
  const setSellTokenRef = useRef(context.setSellToken)
  const setBuyTokenRef = useRef(context.setBuyToken)

  const [isIframeActive, setIsIframeActive] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const dappOrigin = getDappOrigin(dapp.url)

  const { data: walletClient } = useWalletClient()

  // eslint-disable-next-line react-hooks/refs
  addHookRef.current = context.addHook
  // eslint-disable-next-line react-hooks/refs
  editHookRef.current = context.editHook
  // eslint-disable-next-line react-hooks/refs
  setSellTokenRef.current = context.setSellToken
  // eslint-disable-next-line react-hooks/refs
  setBuyTokenRef.current = context.setBuyToken

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow || !dappOrigin) return

    const listeners = [
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.ACTIVATE,
        () => setIsIframeActive(true),
        dappOrigin,
      ),
    ]

    bridgeRef.current = new IframeRpcProviderBridge(iframeWindow, dappOrigin)

    listeners.push(
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.ADD_HOOK,
        (payload) => addHookRef.current(payload),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.EDIT_HOOK,
        (payload) => editHookRef.current(payload),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.SET_SELL_TOKEN,
        (payload) => setSellTokenRef.current(payload.address),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        iframeWindow,
        CoWHookDappEvents.SET_BUY_TOKEN,
        (payload) => setBuyTokenRef.current(payload.address),
        dappOrigin,
      ),
    )

    return () => {
      listeners.forEach((listener) => hookDappIframeTransport.stopListeningWindowListener(window, listener))
      bridgeRef.current?.disconnect()
    }
  }, [dappOrigin])

  useLayoutEffect(() => {
    if (!walletClient || !bridgeRef.current) return

    bridgeRef.current.onConnect(walletClient as unknown as EthereumProvider)
  }, [walletClient])

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow || !isIframeActive || !dappOrigin) return

    // Omit unnecessary parameter
    const { addHook: _, editHook: _1, setSellToken: _3, setBuyToken: _4, ...iframeContext } = context

    hookDappIframeTransport.postMessageToWindow(
      iframeWindow,
      CoWHookDappEvents.CONTEXT_UPDATE,
      iframeContext,
      dappOrigin,
    )
  }, [context, dappOrigin, isIframeActive])

  return (
    <>
      {isLoading && (
        <LoadingWrapper>
          <StyledProductLogo variant={ProductVariant.CowSwap} logoIconOnly height={56} />
          <LoadingText>
            <Trans>Loading hook...</Trans>
          </LoadingText>
        </LoadingWrapper>
      )}
      <Iframe
        ref={iframeRef}
        src={dapp.url}
        allow={HOOK_DAPP_IFRAME_ALLOW}
        referrerPolicy={HOOK_DAPP_IFRAME_REFERRER_POLICY}
        sandbox={HOOK_DAPP_IFRAME_SANDBOX}
        onLoad={handleIframeLoad}
        $isLoading={isLoading}
      />
    </>
  )
}
