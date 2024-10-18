import { useLayoutEffect, useRef, useState } from 'react'

import { CoWHookDappEvents, hookDappIframeTransport } from '@cowprotocol/hook-dapp-lib'
import { EthereumProvider, IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import styled from 'styled-components/macro'

import { HookDappContext as HookDappContextType, HookDappIframe } from '../../types/hooks'

const Iframe = styled.iframe`
  border: 0;
  min-height: 300px;
`

interface IframeDappContainerProps {
  dapp: HookDappIframe
  context: HookDappContextType
}
export function IframeDappContainer({ dapp, context }: IframeDappContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const bridgeRef = useRef<IframeRpcProviderBridge | null>(null)
  const addHookRef = useRef(context.addHook)
  const editHookRef = useRef(context.editHook)
  const setSellTokenRef = useRef(context.setSellToken)
  const setBuyTokenRef = useRef(context.setBuyToken)

  const [isIframeActive, setIsIframeActive] = useState<boolean>(false)

  const walletProvider = useWalletProvider()

  addHookRef.current = context.addHook
  editHookRef.current = context.editHook
  setSellTokenRef.current = context.setSellToken
  setBuyTokenRef.current = context.setBuyToken

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

  return <Iframe ref={iframeRef} src={dapp.url} allow="clipboard-read; clipboard-write" />
}
