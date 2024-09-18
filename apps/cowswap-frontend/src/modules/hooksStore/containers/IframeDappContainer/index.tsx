import { useLayoutEffect, useRef, useState } from 'react'

import { CoWHookDappEvents, hookDappIframeTransport } from '@cowprotocol/hook-dapp-lib'
import { EthereumProvider, IframeRpcProviderBridge } from '@cowprotocol/iframe-transport'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import styled from 'styled-components/macro'

import { HookDappContext as HookDappContextType, HookDappIframe } from '../../types/hooks'

const Iframe = styled.iframe`
  border: 0;
  min-height: 350px;
`

interface IframeDappContainerProps {
  dapp: HookDappIframe
  context: HookDappContextType
}
export function IframeDappContainer({ dapp, context }: IframeDappContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const addHookRef = useRef(context.addHook)
  const editHookRef = useRef(context.editHook)

  const [bridge, setBridge] = useState<IframeRpcProviderBridge | null>(null)
  const [isIframeActive, setIsIframeActive] = useState<boolean>(false)

  const walletProvider = useWalletProvider()

  addHookRef.current = context.addHook
  editHookRef.current = context.editHook

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow) return

    const activateListener = hookDappIframeTransport.listenToMessageFromWindow(window, CoWHookDappEvents.ACTIVATE, () =>
      setIsIframeActive(true),
    )

    const rpcBridge = new IframeRpcProviderBridge(iframeWindow)
    setBridge(rpcBridge)

    const addHookListener = hookDappIframeTransport.listenToMessageFromWindow(
      window,
      CoWHookDappEvents.ADD_HOOK,
      (payload) => {
        addHookRef.current(payload)
      },
    )

    const editHookListener = hookDappIframeTransport.listenToMessageFromWindow(
      window,
      CoWHookDappEvents.EDIT_HOOK,
      (payload) => {
        editHookRef.current(payload)
      },
    )

    return () => {
      hookDappIframeTransport.stopListeningWindowListener(window, activateListener)
      hookDappIframeTransport.stopListeningWindowListener(window, addHookListener)
      hookDappIframeTransport.stopListeningWindowListener(window, editHookListener)
      rpcBridge.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    if (!walletProvider || !bridge) return

    bridge.onConnect(walletProvider.provider as EthereumProvider)
  }, [bridge, walletProvider])

  useLayoutEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow

    if (!iframeWindow || !isIframeActive) return

    // Omit unnecessary parameter
    const { addHook: _, editHook: _1, signer: _2, ...iframeContext } = context

    hookDappIframeTransport.postMessageToWindow(iframeWindow, CoWHookDappEvents.CONTEXT_UPDATE, iframeContext)
  }, [context, isIframeActive])

  return <Iframe ref={iframeRef} src={dapp.url} allow="clipboard-read; clipboard-write" />
}
