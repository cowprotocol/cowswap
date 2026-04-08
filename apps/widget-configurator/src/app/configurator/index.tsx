import React, { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowWidgetEventListeners } from '@cowprotocol/events'
import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'
import { CowSwapWidget } from '@cowprotocol/widget-react'

import CloseIcon from '@mui/icons-material/Close'
import { CircularProgress, IconButton, Snackbar } from '@mui/material'
import Box from '@mui/material/Box'
import { useWeb3ModalAccount, useWeb3ModalTheme } from '@web3modal/ethers5/react'

import { ConfiguratorSidebar } from './components/configurator-sidebar/configurator-sidebar.component'
import { DRAWER_WIDTH_CSS_VAR } from './components/configurator-sidebar/configurator-sidebar.styles'
import { SidebarControls } from './components/configurator-sidebar/controls/sidebar-controls.component'
import { COW_LISTENERS, IS_IFRAME } from './consts'
import { useProvider } from './hooks/useProvider'
import { useResizableDrawerWidth } from './hooks/useResizableDrawerWidth'
import { useToastsManager } from './hooks/useToastsManager'
import { useWidgetParams } from './hooks/useWidgetParamsAndSettings'
import { configuratorCheckeredCanvasSx, configuradorRootSx } from './styled'
import { ConfiguratorState } from './types'

import { AnalyticsCategory } from '../../common/analytics/types'
import { EmbedDialog } from '../embedDialog'

declare global {
  interface Window {
    cowSwapWidgetParams?: Partial<CowSwapWidgetParams>
  }
}

export function Configurator({ title }: { title: string }): ReactNode {
  const configuratorRef = useRef<HTMLDivElement | null>(null)
  const { setThemeMode } = useWeb3ModalTheme()
  const { isConnected } = useWeb3ModalAccount()
  const provider = useProvider()
  const cowAnalytics = useCowAnalytics()

  // Widget Configurator UI:

  // Note these theme is for the widget configurator UI, not for the widget app / preview.

  const [widgetTheme, _] = useState<'light' | 'dark'>('dark') // TODO: To be implemented...

  // TODO: Pass resolved theme from MUI
  useEffect(() => {
    setThemeMode(widgetTheme)
  }, [setThemeMode, widgetTheme])

  const [isWidgetReady, __] = useState(true) // TODO: To be implemented... Only if using latest production or localhost, sa older versions do not send events, so we do not know when they are ready.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSnippetOpen, setIsSnippetOpen] = useState(false)
  const { drawerWidth, isResizing, handleResizeStart } = useResizableDrawerWidth(configuratorRef, DRAWER_WIDTH_CSS_VAR)

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const handleSnippetToggle = useCallback(() => {
    setIsSnippetOpen((prev) => !prev)
  }, [])

  // Widget Configurator State:

  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState | null>(null)

  const params = useWidgetParams(configuratorState)

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

  let configuratorContent: React.ReactNode = null

  if (!isWidgetReady || !params || !configuratorState) {
    configuratorContent = (
      <Box sx={configuratorCheckeredCanvasSx}>
        <CircularProgress />
      </Box>
    )
  } else if (isSnippetOpen) {
    configuratorContent = (
      <EmbedDialog
        params={params}
        defaultPalette={configuratorState.defaultColors}
        open
        handleClose={handleSnippetToggle}
      />
    )
  } else {
    configuratorContent = (
      <Box sx={configuratorCheckeredCanvasSx}>
        <CowSwapWidget
          params={params}
          provider={!IS_IFRAME && !configuratorState.standaloneMode ? provider : undefined}
          listeners={listeners}
        />
      </Box>
    )
  }

  return (
    <Box
      ref={configuratorRef}
      style={{ [DRAWER_WIDTH_CSS_VAR]: `${isSidebarOpen ? drawerWidth : 0}px` } as CSSProperties}
      sx={configuradorRootSx}
    >
      <ConfiguratorSidebar
        title={title}
        isOpen={isSidebarOpen}
        isResizing={isResizing}
        isSnippetOpen={isSnippetOpen}
        onSnippetToggle={handleSnippetToggle}
        onStateChange={setConfiguratorState}
        toastManager={toastManager}
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
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  )
}
