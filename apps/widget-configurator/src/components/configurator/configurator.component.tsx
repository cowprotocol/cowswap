import React, { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useLocalStorageState } from '@cowprotocol/common-hooks'
import { CowWidgetEventListeners } from '@cowprotocol/events'
import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { Box, IconButton, Snackbar } from '@mui/material'
import { X } from 'react-feather'
import { useConnection } from 'wagmi'

import {
  COW_CONFIGURATOR_PREVIEW_HOST_ATTR,
  configuratorCheckeredCanvasSx,
  configuradorRootSx,
} from './configurator.styles'

import { AnalyticsCategory } from '../../common/analytics/types'
import {
  COW_LISTENERS,
  CONFIGURATOR_SIDEBAR_OPEN_STORAGE_KEY,
  WIDGET_PREVIEW_READY_FALLBACK_MS,
} from '../../configurator.constants'
import { ConfiguratorState } from '../../configurator.types'
import { useProvider } from '../../hooks/useProvider'
import { useResizableDrawerWidth } from '../../hooks/useResizableDrawerWidth'
import { useToastsManager } from '../../hooks/useToastsManager'
import { useWidgetParams } from '../../hooks/useWidgetParamsAndSettings'
import { SidebarControls } from '../sidebar/controls/sidebar-controls.component'
import { Sidebar } from '../sidebar/sidebar.component'
import { DRAWER_WIDTH_CSS_VAR } from '../sidebar/sidebar.styles'
import { Snippet } from '../snippet/snippet.component'
import { VersionedCowSwapWidget } from '../VersionedCowSwapWidget/VersionedCowSwapWidget'

declare global {
  interface Window {
    cowSwapWidgetParams?: Partial<CowSwapWidgetParams>
  }
}

// eslint-disable-next-line max-lines-per-function
export function Configurator({ title }: { title: string }): ReactNode {
  const configuratorRef = useRef<HTMLDivElement | null>(null)
  const { isConnected } = useConnection()
  const provider = useProvider()
  const cowAnalytics = useCowAnalytics()

  // Widget Configurator UI:

  const [widgetKey, setWidgetKey] = useState(0)
  const [isWidgetReady, setIsWidgetReadyState] = useState(false)
  const widgetReadyRef = useRef(false)
  const isWidgetReadyTimeoutId = useRef(0)

  const setIsWidgetReady = useCallback((isReady: boolean): void => {
    widgetReadyRef.current = isReady
    window.clearTimeout(isWidgetReadyTimeoutId.current)
    setIsWidgetReadyState(isReady)
  }, [])

  // Sidebar Handling:

  const { drawerWidth, isResizing, handleResizeStart } = useResizableDrawerWidth(configuratorRef, DRAWER_WIDTH_CSS_VAR)

  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorageState(
    CONFIGURATOR_SIDEBAR_OPEN_STORAGE_KEY,
    (persistedValue) => (typeof persistedValue === 'boolean' ? persistedValue : true),
  )

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [setIsSidebarOpen])

  // Snippet Handling:

  const [isSnippetOpen, setIsSnippetOpen] = useState(false)

  const handleSnippetToggle = useCallback(() => {
    setIsSnippetOpen((prev) => !prev)
  }, [])

  // Widget Configurator State:

  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState | null>(null)
  const sdkVersion = configuratorState?.sdkVersion
  const [params, isPending] = useWidgetParams(configuratorState)
  const hasParams = params && configuratorState

  const handlePreviewReady = useCallback((): void => {
    console.log(`[WIDGET] READY`)
    setIsWidgetReady(true)
  }, [setIsWidgetReady])

  const handleForceWidgetReload = useCallback((): void => {
    if (widgetReadyRef.current) {
      setIsWidgetReady(false)
      setWidgetKey((k) => k + 1)
    } else {
      // If the widget is not ready yet but we click here, we just force the iframe to appear.
      // This is useful for older Widget App versions that did not have the READY event.
      setIsWidgetReady(true)
    }
  }, [setIsWidgetReady])

  const previousBaseUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!params) return

    if (previousBaseUrlRef.current === null) {
      previousBaseUrlRef.current = params.baseUrl || null
      return
    }

    if (previousBaseUrlRef.current !== params.baseUrl) {
      previousBaseUrlRef.current = params.baseUrl || null
      setIsWidgetReady(false)
      setWidgetKey((k) => k + 1)
    }
  }, [params, setIsWidgetReady])

  useEffect(() => {
    if (!sdkVersion) return

    setIsWidgetReady(false)
  }, [sdkVersion, setIsWidgetReady])

  // onReady when supported; legacy SDKs use iframe `load` via VersionedCowSwapWidget; 60s last resort.
  useEffect(() => {
    if (isWidgetReady || !hasParams) return

    isWidgetReadyTimeoutId.current = window.setTimeout(() => {
      setIsWidgetReady(true)
    }, WIDGET_PREVIEW_READY_FALLBACK_MS)

    return () => {
      window.clearTimeout(isWidgetReadyTimeoutId.current)
    }
  }, [isWidgetReady, hasParams, sdkVersion, widgetKey, setIsWidgetReady])

  const [listeners, setListeners] = useState<CowWidgetEventListeners>(COW_LISTENERS)
  const toastManager = useToastsManager(setListeners)
  const { closeToast, toasts } = toastManager
  const firstToast = toasts?.[0]

  // Analytics: Fire an event to GA when user connect a wallet.

  useEffect(() => {
    if (isConnected) {
      cowAnalytics.sendEvent({
        category: AnalyticsCategory.WIDGET_CONFIGURATOR,
        action: 'Connect wallet',
      })
    }
  }, [isConnected, cowAnalytics])

  const showIframeOutline = configuratorState?.showIframeOutline ?? false

  const shouldShowLoader = !params || !configuratorState || !isWidgetReady

  const loaderElement = (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 'calc(50% - 28px)',
        left: 'calc(50% - 28px)',
        width: 56,
        height: 56,
        background: (theme) => theme.palette.background.paper,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        opacity: shouldShowLoader ? 1 : 0,
        visibility: shouldShowLoader ? 'visible' : 'hidden',
        pointerEvents: 'none',
        transition: 'opacity 300ms ease, visibility 300ms ease',
        '@keyframes cowConfiguratorLoaderSpin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        animation: shouldShowLoader ? 'cowConfiguratorLoaderSpin 0.25s linear infinite' : 'none',
        '&::before': {
          content: (theme) => (theme.palette.mode === 'light' ? '"📀"' : '"💿"'),
          display: 'block',
          lineHeight: 1,
        },
      }}
    />
  )

  let configuratorContent: React.ReactNode = null

  if (!params || !configuratorState) {
    configuratorContent = (
      <Box sx={configuratorCheckeredCanvasSx(isWidgetReady, showIframeOutline)}>
        {loaderElement}
        <Box component="div" {...{ [COW_CONFIGURATOR_PREVIEW_HOST_ATTR]: '' }} />
      </Box>
    )
  } else {
    const showIframeOutline = configuratorState?.showIframeOutline ?? false
    configuratorContent = (
      <>
        <Box sx={configuratorCheckeredCanvasSx(isWidgetReady, showIframeOutline, isSnippetOpen)}>
          {loaderElement}

          <Box component="div" {...{ [COW_CONFIGURATOR_PREVIEW_HOST_ATTR]: '' }}>
            <VersionedCowSwapWidget
              key={`${widgetKey}-${configuratorState.sdkVersion}`}
              sdkVersion={configuratorState.sdkVersion}
              params={params}
              provider={configuratorState.widgetMode === 'standalone' ? undefined : provider}
              listeners={listeners}
              onReady={handlePreviewReady}
            />
          </Box>

          {isSnippetOpen && isWidgetReady ? (
            <Snippet
              params={params}
              defaultPalette={configuratorState.defaultColors}
              open
              handleClose={handleSnippetToggle}
            />
          ) : null}
        </Box>
      </>
    )
  }

  return (
    <Box
      ref={configuratorRef}
      style={{ [DRAWER_WIDTH_CSS_VAR]: `${isSidebarOpen ? drawerWidth : 0}px` } as CSSProperties}
      sx={configuradorRootSx}
    >
      <Sidebar
        title={title}
        isOpen={isSidebarOpen}
        isResizing={isResizing}
        isSnippetOpen={isSnippetOpen}
        onSidebarToggle={handleSidebarToggle}
        onSnippetToggle={handleSnippetToggle}
        onStateChange={setConfiguratorState}
        toastManager={toastManager}
        isWidgetReady={isWidgetReady}
        isWidgetSyncPending={isPending}
        onForceWidgetReload={handleForceWidgetReload}
      />

      <SidebarControls
        isSidebarOpen={isSidebarOpen}
        toggleSidebarOpen={handleSidebarToggle}
        onResizeStart={handleResizeStart}
      />

      {configuratorContent}

      <Snackbar
        open={!!firstToast}
        autoHideDuration={6_000}
        onClose={closeToast}
        message={firstToast}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={closeToast}>
            <X size={16} strokeWidth={2} aria-hidden />
          </IconButton>
        }
      />
    </Box>
  )
}
