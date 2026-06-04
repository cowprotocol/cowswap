import { ReactNode, useCallback, useEffect } from 'react'

import { useLocalStorageState, useThrottleFn } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { PaletteMode } from '@mui/material'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { useConnection } from 'wagmi'

import { SidebarFooter } from './footer/sidebar-footer.component'
import { SidebarHeader } from './header/sidebar-header.component'
import { drawerContentColumnSx, drawerPaperRowSx, getDrawerPatternFillerSx, getDrawerSx } from './sidebar.styles'

import {
  CONFIGURATOR_CUSTOM_COLORS_BY_THEME_STORAGE_KEY,
  CONFIGURATOR_FORM_VALUES_STORAGE_KEY,
  DEFAULT_CONFIGURATOR_FORM_VALUES,
} from '../../configurator.constants'
import { ColorPalette, ConfiguratorFormValues, ConfiguratorState } from '../../configurator.types'
import {
  buildConfiguratorState,
  getDefaultCustomColorsByTheme,
  resolveConfiguratorCustomColorsByTheme,
  resolveConfiguratorFormValues,
} from '../../configurator.utils'
import { useColorPaletteManager } from '../../hooks/useColorPaletteManager'
import { useExpandedSectionHash } from '../../hooks/useExpandedSectionHash'
import { useSyncWidgetNetwork } from '../../hooks/useSyncWidgetNetwork'
import { UseToastsManagerReturn } from '../../hooks/useToastsManager'
import { useColorMode } from '../../theme/context/hooks/useColorMode'
import { CONFIGURATOR_DEFAULT_WIDGET_BASE_URL } from '../../utils/base-url/baseUrl'
import { AdvancedSectionForm } from '../forms/advanced/AdvancedSectionForm'
import { BasicsSectionForm } from '../forms/basics/BasicsSectionForm'
import { BehaviorSectionForm } from '../forms/behavior/BehaviorSectionForm'
import { CustomizationSectionForm } from '../forms/customization/CustomizationSectionForm'
import { DeadlinesSectionForm } from '../forms/deadlines/DeadlinesSectionForm'
import { type ConfiguratorFormChangeHandler, type ConfiguratorFormInputEvent } from '../forms/forms.types'
import { IntegrationsSectionForm } from '../forms/integrations/IntegrationsSectionForm'
import { LayoutSectionForm } from '../forms/layout/LayoutSectionForm'
import { ThemeColorsSectionForm } from '../forms/theme-colors/ThemeColorsSectionForm'
import { TokensSectionForm } from '../forms/tokens/TokensSectionForm'
import { TradeSetupSectionForm } from '../forms/trade-setup/TradeSetupSectionForm'
import { AccordionFormSection } from '../ui/Accordion/AccordionFormSection'

import type { Theme } from '@mui/material/styles'

const JSON_FIELD_NAMES = new Set<keyof ConfiguratorFormValues>([
  'iframeStyleJson',
  'bodyWrapperStyleJson',
  'cardStyleJson',
  'rawParamsJson',
])

export interface SidebarProps {
  title: string
  isOpen: boolean
  isResizing: boolean
  isSnippetOpen: boolean
  onSidebarToggle: () => void
  onSnippetToggle: () => void
  onStateChange: (state: ConfiguratorState) => void
  toastManager: UseToastsManagerReturn
  isWidgetReady: boolean
  isWidgetSyncPending: boolean
  onForceWidgetReload: () => void
}

const CONFIGURATOR_FORM_PERSIST_DELAY_MS = 500
const CONFIGURATOR_STATE_PROPAGATION_THROTTLE_MS = 250

// eslint-disable-next-line max-lines-per-function
export function Sidebar({
  title,
  isOpen,
  isResizing,
  isSnippetOpen,
  onSidebarToggle,
  onSnippetToggle,
  onStateChange,
  toastManager,
  isWidgetReady,
  isWidgetSyncPending,
  onForceWidgetReload,
}: SidebarProps): ReactNode {
  const { mode } = useColorMode()
  const { expandedSection, handleToggleExpanded } = useExpandedSectionHash('Basics')

  const [configuratorFormValues, setConfiguratorFormValues] = useLocalStorageState<ConfiguratorFormValues>(
    CONFIGURATOR_FORM_VALUES_STORAGE_KEY,
    resolveConfiguratorFormValues,
    CONFIGURATOR_FORM_PERSIST_DELAY_MS,
  )

  const [customColorsByTheme, setCustomColorsByTheme] = useLocalStorageState<Record<PaletteMode, ColorPalette>>(
    CONFIGURATOR_CUSTOM_COLORS_BY_THEME_STORAGE_KEY,
    resolveConfiguratorCustomColorsByTheme,
    CONFIGURATOR_FORM_PERSIST_DELAY_MS,
  )

  const handleConfiguratorFormChange = useCallback(
    (nameOrEvent: keyof ConfiguratorFormValues | ConfiguratorFormInputEvent, valueOrUndefined?: unknown) => {
      let name: keyof ConfiguratorFormValues | undefined
      let value: unknown

      if (typeof nameOrEvent !== 'string') {
        name = nameOrEvent.target.name as keyof ConfiguratorFormValues
        value = nameOrEvent.target.value
      } else {
        name = nameOrEvent
        value = valueOrUndefined
      }

      if (!name) {
        console.warn('[COW][CONFIGURATOR] Missing field name in change event:', nameOrEvent, valueOrUndefined)
        return
      }

      setConfiguratorFormValues((prevState) => {
        const shouldKeepNull = name === 'baseUrl' || JSON_FIELD_NAMES.has(name)
        const nextValue = value === null && !shouldKeepNull ? '' : value

        return {
          ...prevState,
          [name]: nextValue,
        }
      })
    },
    [setConfiguratorFormValues],
  ) as ConfiguratorFormChangeHandler

  const resetFormValues = useCallback(() => {
    setConfiguratorFormValues({ ...DEFAULT_CONFIGURATOR_FORM_VALUES })
    setCustomColorsByTheme(getDefaultCustomColorsByTheme())
  }, [setConfiguratorFormValues, setCustomColorsByTheme])

  const paletteManager = useColorPaletteManager(
    configuratorFormValues.theme,
    customColorsByTheme,
    setCustomColorsByTheme,
  )
  const { colorPalette, defaultPalette } = paletteManager

  const { chainId: walletChainId, isConnected } = useConnection()

  const effectiveChainId = !isConnected || !walletChainId ? configuratorFormValues.chainId : walletChainId

  // Building the resolved state (including parsing JSON fields) is only done when we
  // actually propagate it, and throttled so rapid edits don't recompute on every keystroke.
  const propagateConfiguratorState = useThrottleFn(() => {
    onStateChange(
      buildConfiguratorState({
        formValues: configuratorFormValues,
        effectiveChainId,
        colorPalette,
        defaultPalette,
        disableToastMessages: toastManager.disableToastMessages,
      }),
    )
  }, CONFIGURATOR_STATE_PROPAGATION_THROTTLE_MS)

  useEffect(() => {
    propagateConfiguratorState()
  }, [
    propagateConfiguratorState,
    configuratorFormValues,
    effectiveChainId,
    colorPalette,
    defaultPalette,
    toastManager.disableToastMessages,
  ])

  // Sync widget network with the selected network in the configurator:

  const setNetworkControlState = useCallback(
    (chainId: SupportedChainId): void => {
      handleConfiguratorFormChange('chainId', chainId)
    },
    [handleConfiguratorFormChange],
  )

  useSyncWidgetNetwork(configuratorFormValues.chainId, setNetworkControlState, configuratorFormValues.widgetMode)

  return (
    <Drawer sx={(theme: Theme) => getDrawerSx(theme, isResizing)} variant="persistent" anchor="left" open={isOpen}>
      <Box sx={drawerPaperRowSx}>
        <Box sx={drawerContentColumnSx}>
          <SidebarHeader
            title={title}
            themeMode={mode}
            widgetMode={configuratorFormValues.widgetMode}
            baseUrl={configuratorFormValues.baseUrl || CONFIGURATOR_DEFAULT_WIDGET_BASE_URL}
            sdkVersion={configuratorFormValues.sdkVersion}
          />

          <Stack spacing={0} sx={{ display: 'flex', flexDirection: 'column' }}>
            <AccordionFormSection
              title="Basics"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={BasicsSectionForm}
            />

            <AccordionFormSection
              title="Trade Setup"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={TradeSetupSectionForm}
            />

            <AccordionFormSection
              title="Tokens"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={TokensSectionForm}
            />

            <AccordionFormSection
              title="Theme Colors"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={ThemeColorsSectionForm}
              formProps={{ paletteManager }}
            />

            <AccordionFormSection
              title="Layout"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={LayoutSectionForm}
              formProps={{
                paperBackgroundColor: colorPalette.paper || defaultPalette.paper,
              }}
            />

            <AccordionFormSection
              title="Behavior"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={BehaviorSectionForm}
              formProps={{ toastManager }}
            />

            <AccordionFormSection
              title="Deadlines"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={DeadlinesSectionForm}
            />

            <AccordionFormSection
              title="Integrations"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={IntegrationsSectionForm}
            />

            <AccordionFormSection
              title="Customization"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={CustomizationSectionForm}
            />

            <AccordionFormSection
              title="Advanced"
              expandedSection={expandedSection}
              onToggleExpanded={handleToggleExpanded}
              values={configuratorFormValues}
              onChange={handleConfiguratorFormChange}
              formComponent={AdvancedSectionForm}
            />
          </Stack>

          <SidebarFooter
            isSidebarOpen={isOpen}
            onSidebarToggle={onSidebarToggle}
            isSnippetOpen={isSnippetOpen}
            onSnippetToggle={onSnippetToggle}
            isWidgetReady={isWidgetReady}
            isWidgetSyncPending={isWidgetSyncPending}
            onForceWidgetReload={onForceWidgetReload}
            onResetOptions={resetFormValues}
          />
        </Box>

        <Box sx={(theme: Theme) => getDrawerPatternFillerSx(theme)} aria-hidden />
      </Box>
    </Drawer>
  )
}
