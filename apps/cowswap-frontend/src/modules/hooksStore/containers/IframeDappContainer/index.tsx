import { useLayoutEffect, useRef, useState } from 'react'

import { CoWHookDappEvents, hookDappIframeTransport } from '@cowprotocol/hook-dapp-lib'
import { EthereumProvider, IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

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

interface IframeDappContainerProps {
  dapp: HookDappIframe
  context: HookDappContextType
}
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function IframeDappContainer({ dapp, context }: IframeDappContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const bridgeRef = useRef<IframeRpcProviderBridge | null>(null)
  const addHookRef = useRef(context.addHook)
  const editHookRef = useRef(context.editHook)
  const setSellTokenRef = useRef(context.setSellToken)
  const setBuyTokenRef = useRef(context.setBuyToken)

  const [isIframeActive, setIsIframeActive] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

  const walletProvider = useWalletProvider()

  addHookRef.current = context.addHook
  editHookRef.current = context.editHook
  setSellTokenRef.current = context.setSellToken
  setBuyTokenRef.current = context.setBuyToken

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow) return

    const listeners = [
      hookDappIframeTransport.listenToMessageFromWindow(window, CoWHookDappEvents.ACTIVATE, () =>
        setIsIframeActive(true),
      ),
    ]

    bridgeRef.current = new IframeRpcProviderBridge(iframeWindow)

    listeners.push(
      hookDappIframeTransport.listenToMessageFromWindow(window, CoWHookDappEvents.ADD_HOOK, (payload) =>
        addHookRef.current(payload),
      ),
      hookDappIframeTransport.listenToMessageFromWindow(window, CoWHookDappEvents.EDIT_HOOK, (payload) =>
        editHookRef.current(payload),
      ),
      hookDappIframeTransport.listenToMessageFromWindow(window, CoWHookDappEvents.SET_SELL_TOKEN, (payload) =>
        setSellTokenRef.current(payload.address),
      ),
      hookDappIframeTransport.listenToMessageFromWindow(window, CoWHookDappEvents.SET_BUY_TOKEN, (payload) =>
        setBuyTokenRef.current(payload.address),
      ),
    )

    return () => {
      listeners.forEach((listener) => hookDappIframeTransport.stopListeningWindowListener(window, listener))
      bridgeRef.current?.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    if (!walletProvider || !walletProvider.provider || !bridgeRef.current) return

    bridgeRef.current.onConnect(walletProvider.provider as EthereumProvider)
  }, [walletProvider])

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow || !isIframeActive) return

    // Omit unnecessary parameter
    const { addHook: _, editHook: _1, signer: _2, setSellToken: _3, setBuyToken: _4, ...iframeContext } = context

    hookDappIframeTransport.postMessageToWindow(iframeWindow, CoWHookDappEvents.CONTEXT_UPDATE, iframeContext)
  }, [context, isIframeActive])

  return (
    <>
      {isLoading && (
        <LoadingWrapper>
          <StyledProductLogo variant={ProductVariant.CowSwap} logoIconOnly height={56} />
          <LoadingText>Loading hook...</LoadingText>
        </LoadingWrapper>
      )}
      <Iframe
        ref={iframeRef}
        src={dapp.url}
        allow="clipboard-read; clipboard-write"
        onLoad={handleIframeLoad}
        $isLoading={isLoading}
      />
    </>
  )
}
