import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { deepEqual } from '@cowprotocol/common-utils'
import {
  UpdateParamsPayload,
  widgetIframeTransport,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from '@cowprotocol/widget-lib'

import * as Sentry from '@sentry/browser'

import { useNavigate } from 'common/hooks/useNavigate'

import { IframeResizer } from './IframeResizer'

import { WidgetParamsErrorsScreen } from '../pure/WidgetParamsErrorsScreen'
import { injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'
import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'
import { validateWidgetParams } from '../utils/validateWidgetParams'

const messagesCache: { [method: string]: unknown } = {}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getEventMethod = (event: MessageEvent) =>
  (event.data.key === widgetIframeTransport.key && (event.data.method as string)) || null

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const cacheMessages = (event: MessageEvent) => {
  const method = getEventMethod(event)

  if (!method) return

  messagesCache[method] = event.data
}

;(function initInjectedWidget() {
  const isInIframe = window.parent !== window.self

  const parent = window.parent

  if (!parent || !isInIframe) return

  /**
   * To avoid delays, immediately send an activation message and start listening messages
   */
  window.addEventListener('message', cacheMessages)
  widgetIframeTransport.postMessageToWindow(parent, WidgetMethodsEmit.ACTIVATE, void 0)

  /**
   * Intercept window.open and anchor clicks to send a message to the parent window
   * to handle the opening of deeplinks in the parent window
   */
  const originalWinOpen = window.open

  window.open = function (...args) {
    const [href = '', target = '', rel = ''] = args

    widgetIframeTransport.postMessageToWindow(parent, WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN, { href, target, rel })

    return originalWinOpen.apply(this, args)
  }

  document.body.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      const { href, target, rel } = event.target

      widgetIframeTransport.postMessageToWindow(parent, WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN, { href, target, rel })
    }
  })
})()

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function InjectedWidgetUpdater() {
  const [
    {
      errors: validationErrors,
      params: { partnerFee, appCode },
    },
    updateParams,
  ] = useAtom(injectedWidgetParamsAtom)
  const updateMetaData = useSetAtom(injectedWidgetMetaDataAtom)

  const prevPartnerFee = usePrevious(partnerFee)
  const navigate = useNavigate()
  const prevData = useRef<UpdateParamsPayload | null>(null)

  // Pathname is updated independently of the widget, thus we need to track it separately
  const pathNameRef = useRef<string | null>(null)
  pathNameRef.current = window.location.pathname

  useEffect(() => {
    // Stop listening of message outside of React
    window.removeEventListener('message', cacheMessages)

    // Start listening for messages inside of React
    const updateParamsListener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      WidgetMethodsListen.UPDATE_PARAMS,
      (data) => {
        if (
          // If the data is the same as the previous data
          prevData.current &&
          deepEqual(prevData.current, data) &&
          // And the pathname is the same as the current widget pathname, do nothing
          // This is needed since the app updates the pathname independently of the widget params
          pathNameRef.current === data.urlParams.pathname
        ) {
          return
        }

        // Update params
        prevData.current = data

        const appParams = data.appParams

        const errors = validateWidgetParams(appParams)

        updateParams({
          params: appParams,
          errors,
        })

        // Navigate to the new path
        navigate(data.urlParams, { replace: true })
      },
    )

    const updateAppDataListener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      WidgetMethodsListen.UPDATE_APP_DATA,
      (data) => {
        if (data.metaData) {
          updateMetaData(data.metaData)
        }
      },
    )

    // Process all cached messages
    Object.keys(messagesCache).forEach((method) => {
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      widgetIframeTransport.postMessageToWindow(window, method as any, messagesCache[method])

      delete messagesCache[method]
    })

    return () => {
      widgetIframeTransport.stopListeningWindowListener(window, updateParamsListener)
      widgetIframeTransport.stopListeningWindowListener(window, updateAppDataListener)
    }
  }, [updateMetaData, navigate, updateParams])

  // Log an error when partnerFee was set and then discarded
  useEffect(() => {
    if (!appCode) return

    if (prevPartnerFee && !partnerFee) {
      const sentryError = Object.assign(
        new Error(`AppCode: ${appCode}, BPS: ${prevPartnerFee.bps}, recipient: ${prevPartnerFee.recipient}`),
        {
          name: 'PartnerFeeDiscarded',
        },
      )

      Sentry.captureException(sentryError, {
        tags: {
          errorType: 'PartnerFeeDiscarded',
        },
      })
    }
  }, [appCode, partnerFee, prevPartnerFee])

  return (
    <>
      <WidgetParamsErrorsScreen errors={validationErrors} />
      <IframeResizer />
    </>
  )
}
