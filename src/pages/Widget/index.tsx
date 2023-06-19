import React, { useEffect } from 'react'

import { Navigate, useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components/macro'

import { WRAPPED_NATIVE_CURRENCY as WETH } from 'legacy/constants/tokens'

import { SwapWidget } from 'modules/swap/containers/SwapWidget'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { useWalletInfo } from 'modules/wallet'

import { Routes } from 'constants/routes'

const POST_MESSAGE_TYPE = 'cowswap-widget'

const Wrapper = styled.div`
  margin-top: 20px;
`

interface MessageWidget<T> {
  method: string
  data?: T
}

function postMessage<T>(message: MessageWidget<T>) {
  window.parent.postMessage({
    type: POST_MESSAGE_TYPE,
    ...message,
  })
}

function replyMessage<T>(message: MessageWidget<T>, event: MessageEvent<any>) {
  if (!event.source || !event.origin) {
    return
  }

  event.source.postMessage(
    {
      type: POST_MESSAGE_TYPE,
      ...message,
    },
    {
      targetOrigin: event.origin,
    }
  )
}

function receiveMessage(event: MessageEvent<any>) {
  if (!event.source || !event.origin || event.data.type !== POST_MESSAGE_TYPE) {
    return
  }

  // Do we trust the sender of this message?

  console.log('WIDGET:GUEST Receive message', event.data)

  if (event.data.method === 'time') {
    replyMessage(
      {
        method: 'time:reply',
        data: { currentTime: new Date() },
      },
      event
    )
  }
}

export function WidgetPage() {
  const params = useParams()
  const postRandomMessage = () => {
    postMessage({ method: 'randomMessage', data: { message: 'Just a random message' } })
  }

  useEffect(() => {
    window.addEventListener('message', receiveMessage)

    // Send a periodic message
    window.parent.postMessage('hello', '*')

    const intervalId = setInterval(() => {
      postMessage({
        method: 'areYouThere',
        data: { message: 'Just checking' },
      })
    }, 10000)

    return () => {
      window.removeEventListener('message', receiveMessage)
      clearInterval(intervalId)
    }
  }, [])

  if (!params.chainId) {
    return <WidgetPageRedirect />
  }

  return (
    <Wrapper>
      <SwapWidget />
      <button onClick={postRandomMessage}>Post message</button>
    </Wrapper>
  )
}

function WidgetPageRedirect() {
  const { chainId } = useWalletInfo()
  const location = useLocation()

  if (!chainId) return null

  const defaultState = getDefaultTradeRawState(chainId)
  const searchParams = new URLSearchParams(location.search)
  const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId || WETH[chainId]?.symbol
  const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId || undefined

  searchParams.delete('inputCurrency')
  searchParams.delete('outputCurrency')
  searchParams.delete('chain')

  const pathname = parameterizeTradeRoute(
    { chainId: String(chainId), inputCurrencyId, outputCurrencyId },
    Routes.WIDGET
  )

  return <Navigate to={{ ...location, pathname, search: searchParams.toString() }} />
}
