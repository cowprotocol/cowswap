import { useAtom, useSetAtom } from 'jotai'
import { ReactNode, type SetStateAction, useEffect, useRef } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { deepEqual, logBaseWallet } from '@cowprotocol/common-utils'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import {
  CowSwapWidgetAppParams,
  PartnerFee,
  UpdateAppDataPayload,
  UpdateParamsPayload,
  widgetIframeTransport,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from '@cowprotocol/widget-lib'

import * as Sentry from '@sentry/browser'
import { injectedWidgetParamsAtom, type WidgetParamsErrors } from 'entities/injectedWidget'

import { useNavigate } from 'common/hooks/useNavigate'

import { IframeResizer } from './IframeResizer'

import { WidgetParamsErrorsScreen } from '../pure/WidgetParamsErrorsScreen'
import { injectedWidgetHooksEnabledAtom } from '../state/injectedWidgetHooksEnabledAtom'
import { injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'
import { validateWidgetParams } from '../utils/validateWidgetParams'
import {
  cacheWidgetMessage,
  clearCachedWidgetMessage,
  getCachedWidgetMessageMethods,
  registerCachedMessageHandler,
  replayCachedWidgetMessage,
} from '../utils/widgetMessagesCache.utils'

let isWindowOpenInterceptInstalled = false

;(function initInjectedWidget() {
  const isInIframe = window.parent !== window.self

  if (!isInIframe) {
    return
  }

  window.addEventListener('message', cacheWidgetMessage)

  const parent = window.parent
  const parentOrigin = getParentOrigin()

  if (!parentOrigin) {
    logBaseWallet('iframe', 'parentOrigin unavailable at module init — deferring window.open intercept', {
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ancestorOrigins:
        typeof window.location.ancestorOrigins !== 'undefined' ? Array.from(window.location.ancestorOrigins) : [],
    })
    return
  }

  installInjectedWidgetWindowOpenIntercept(parent, parentOrigin)
  widgetIframeTransport.postMessageToWindow(parent, WidgetMethodsEmit.ACTIVATE, void 0, parentOrigin)
})()

function installInjectedWidgetWindowOpenIntercept(parent: Window, parentOrigin: string): void {
  if (isWindowOpenInterceptInstalled) {
    return
  }

  isWindowOpenInterceptInstalled = true

  logBaseWallet('iframe', 'InjectedWidget window.open intercept installed', {
    parentOrigin,
    href: window.location.href,
  })

  const nativeWindowOpen = window.open.bind(window)
  window.open = function (...args) {
    const [href = '', target = '', features = ''] = args
    const hrefString = resolveInterceptedWindowOpenHref(href)
    const openInIframe = isWalletPopupWindowOpen(hrefString, features)

    logBaseWallet('iframe', 'window.open intercepted', {
      href: hrefString,
      target,
      features,
      openInIframe,
      action: openInIframe ? 'native-popup-in-iframe' : 'forward-to-parent',
    })

    if (openInIframe) {
      const popup = nativeWindowOpen(href, target, features)
      logBaseWallet('iframe', 'native window.open result', {
        href: hrefString,
        popupIsNull: popup === null,
        popupClosed: popup?.closed,
      })
      return popup
    }

    widgetIframeTransport.postMessageToWindow(
      parent,
      WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN,
      { href: hrefString, target, rel: features },
      parentOrigin,
    )

    return window
  }
}

function resolveInterceptedWindowOpenHref(href: string | URL): string {
  if (typeof href === 'string') {
    return href
  }

  return href.toString()
}

function isWalletPopupWindowOpen(href: string, features: unknown): boolean {
  if (typeof features === 'string' && /\b(width|height)\s*=/.test(features)) {
    return true
  }

  return /keys\.coinbase\.com/i.test(href)
}

type InjectedWidgetParamsState = {
  params: Partial<CowSwapWidgetAppParams>
  errors: WidgetParamsErrors
}

type SetInjectedWidgetParams = (value: SetStateAction<InjectedWidgetParamsState>) => void
type SetInjectedWidgetHooksEnabled = (value: SetStateAction<boolean>) => void
type SetInjectedWidgetMetaData = (value: SetStateAction<UpdateAppDataPayload['metaData']>) => void

export function InjectedWidgetUpdater(): ReactNode {
  const [
    {
      errors: validationErrors,
      params: { partnerFee, appCode },
    },
    updateParams,
  ] = useAtom(injectedWidgetParamsAtom)
  const setHooksEnabled = useSetAtom(injectedWidgetHooksEnabledAtom)
  const updateMetaData = useSetAtom(injectedWidgetMetaDataAtom)

  const prevPartnerFee = usePrevious(partnerFee)
  const navigate = useNavigate()

  useInjectedWidgetMessaging({ navigate, setHooksEnabled, updateMetaData, updateParams })
  useLogDiscardedPartnerFee(appCode, partnerFee, prevPartnerFee)

  return (
    <>
      <WidgetParamsErrorsScreen errors={validationErrors} />
      <IframeResizer />
    </>
  )
}

function useInjectedWidgetMessaging({
  navigate,
  setHooksEnabled,
  updateMetaData,
  updateParams,
}: {
  navigate: ReturnType<typeof useNavigate>
  setHooksEnabled: SetInjectedWidgetHooksEnabled
  updateMetaData: SetInjectedWidgetMetaData
  updateParams: SetInjectedWidgetParams
}): void {
  const prevData = useRef<UpdateParamsPayload | null>(null)
  const isReadySentRef = useRef(false)

  useEffect(() => {
    window.removeEventListener('message', cacheWidgetMessage)

    const parentOrigin = getParentOrigin()

    if (!parentOrigin) {
      logBaseWallet('iframe', 'parentOrigin unavailable in React mount — window.open intercept not installed')
      return
    }

    const parent = window.parent !== window.self ? window.parent : null

    if (parent) {
      installInjectedWidgetWindowOpenIntercept(parent, parentOrigin)
    }

    const updateParamsHandler = (data: UpdateParamsPayload): void => {
      if (
        prevData.current &&
        deepEqual(prevData.current, data) &&
        window.location.pathname === data.urlParams.pathname
      ) {
        return
      }

      prevData.current = data

      const appParams = data.appParams
      const hooksEnabled = new URLSearchParams(data.urlParams.search).get('hooksEnabled') === 'true'

      const errors = validateWidgetParams(appParams)
      setHooksEnabled(hooksEnabled)

      updateParams({
        params: appParams,
        errors,
      })

      navigate(data.urlParams, { replace: true })
    }

    const updateParamsListener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      window.parent,
      WidgetMethodsListen.UPDATE_PARAMS,
      updateParamsHandler,
      parentOrigin,
    )
    registerCachedMessageHandler(WidgetMethodsListen.UPDATE_PARAMS, updateParamsHandler)

    const updateAppDataHandler = (data: UpdateAppDataPayload): void => {
      if (data.metaData) {
        updateMetaData(data.metaData)
      }
    }

    const updateAppDataListener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      window.parent,
      WidgetMethodsListen.UPDATE_APP_DATA,
      updateAppDataHandler,
      parentOrigin,
    )
    registerCachedMessageHandler(WidgetMethodsListen.UPDATE_APP_DATA, updateAppDataHandler)

    getCachedWidgetMessageMethods().forEach((method) => {
      replayCachedWidgetMessage(method)
      clearCachedWidgetMessage(method)
    })

    const frameId = window.requestAnimationFrame(() => {
      if (!parent || isReadySentRef.current) return

      isReadySentRef.current = true
      widgetIframeTransport.postMessageToWindow(parent, WidgetMethodsEmit.READY, void 0, parentOrigin)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      widgetIframeTransport.stopListeningWindowListener(window, updateParamsListener)
      widgetIframeTransport.stopListeningWindowListener(window, updateAppDataListener)
    }
  }, [setHooksEnabled, updateMetaData, navigate, updateParams])
}

function useLogDiscardedPartnerFee(
  appCode: string | undefined,
  partnerFee: PartnerFee | null | undefined,
  prevPartnerFee: PartnerFee | null | undefined,
): void {
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
}
