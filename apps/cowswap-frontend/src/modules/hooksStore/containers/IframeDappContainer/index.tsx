import { ReactNode, useLayoutEffect, useRef, useState } from 'react'

import { isHttpsUrlString } from '@cowprotocol/common-utils'
import { CoWHookDappEvents, hookDappIframeTransport } from '@cowprotocol/hook-dapp-lib'
import { EthereumProvider, IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { HookDappContext as HookDappContextType, HookDappIframe } from '../../types/hooks'

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

interface IframeState {
  isLoading: boolean
  isActive: boolean
  hasError: boolean
}

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

  const [iframeState, setIframeState] = useState<IframeState>({
    isLoading: true,
    isActive: false,
    hasError: false,
  })

  const dappOrigin = getDappOrigin(dapp.url)
  const isHttpsUrl = dappOrigin && isHttpsUrlString(dappOrigin)

  const { isLoading, isActive } = iframeState
  const hasError = iframeState.hasError || !dappOrigin || !isHttpsUrl

  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const walletProvider = useWalletProvider()

  // eslint-disable-next-line react-hooks/refs
  addHookRef.current = context.addHook
  // eslint-disable-next-line react-hooks/refs
  editHookRef.current = context.editHook
  // eslint-disable-next-line react-hooks/refs
  setSellTokenRef.current = context.setSellToken
  // eslint-disable-next-line react-hooks/refs
  setBuyTokenRef.current = context.setBuyToken

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
        CoWHookDappEvents.ADD_HOOK,
        (payload) => addHookRef.current(payload),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        CoWHookDappEvents.EDIT_HOOK,
        (payload) => editHookRef.current(payload),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
        CoWHookDappEvents.SET_SELL_TOKEN,
        (payload) => setSellTokenRef.current(payload.address),
        dappOrigin,
      ),
      hookDappIframeTransport.listenToMessageFromWindow(
        window,
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
    if (!walletProvider || !walletProvider.provider || !bridgeRef.current) return

    bridgeRef.current.onConnect(walletProvider.provider as EthereumProvider)
  }, [walletProvider])

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow || !isActive || !dappOrigin || !isHttpsUrlString(dappOrigin)) return

    // Omit unnecessary parameter
    const { addHook: _, editHook: _1, signer: _2, setSellToken: _3, setBuyToken: _4, ...iframeContext } = context

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
        allow="clipboard-read; clipboard-write"
        onLoad={handleIframeLoad}
        onAbort={handleIframeError}
        onError={handleIframeError}
        $isLoading={isLoading}
      />
    </>
  )
}

function getDappOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}
