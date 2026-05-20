import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK } from '@cowprotocol/common-const'
import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { useWeb3ModalAccount } from '@web3modal/ethers5/react'

import { SidebarFooter } from './footer/sidebar-footer.component'
import { SidebarHeader } from './header/sidebar-header.component'
import { AdvancedSectionForm } from './sections/advanced/AdvancedSectionForm'
import { BasicsSectionForm } from './sections/basics/BasicsSectionForm'
import { BehaviorSectionForm } from './sections/behavior/BehaviorSectionForm'
import { CustomizationSectionForm } from './sections/customization/CustomizationSectionForm'
import { DeadlinesSectionForm } from './sections/deadlines/DeadlinesSectionForm'
import { IntegrationsSectionForm } from './sections/integrations/IntegrationsSectionForm'
import { LayoutSectionForm } from './sections/layout/LayoutSectionForm'
import {
  type ConfiguratorFormChangeHandler,
  type ConfiguratorFormInputEvent,
  type ConfiguratorFormValues,
} from './sections/section.types'
import { ThemeColorsSectionForm } from './sections/theme-colors/ThemeColorsSectionForm'
import { TokensSectionForm } from './sections/tokens/TokensSectionForm'
import { TradeSetupSectionForm } from './sections/trade-setup/TradeSetupSectionForm'
import { drawerContentColumnSx, drawerPaperRowSx, getDrawerPatternFillerSx, getDrawerSx } from './sidebar.styles'

import { DEFAULT_STATE, DEFAULT_TOKEN_LISTS, IS_IFRAME, TRADE_MODES } from '../../configurator.constants'
import { ConfiguratorState } from '../../configurator.types'
import { useColorPaletteManager } from '../../hooks/useColorPaletteManager'
import { type JsonState } from '../../hooks/useJsonState'
import { useSyncWidgetNetwork } from '../../hooks/useSyncWidgetNetwork'
import { UseToastsManagerReturn } from '../../hooks/useToastsManager'
import { ColorModeContext } from '../../theme/ColorModeContext'
import { CONFIGURATOR_DEFAULT_WIDGET_BASE_URL } from '../../utils/baseUrl'
import { AccordionFormSection } from '../ui/Accordion/AccordionFormSection'
import { type NetworkOption, NetworkOptions } from '../ui/controls/Select/NetworkControl'

import type { Theme } from '@mui/material/styles'
import type * as CSS from 'csstype'

interface ParsedJsonField<T extends object> extends JsonState<T> {}

const JSON_FIELD_NAMES = new Set<keyof ConfiguratorFormValues>([
  'iframeStyleJson',
  'appWrapperStyleJson',
  'bodyWrapperStyleJson',
  'cardStyleJson',
  'rawParamsJson',
])

const MODE_FIELD_NAME = 'mode'

function parseJsonField<T extends object>(rawValue: string | null, fallbackValue: T): ParsedJsonField<T> {
  const normalizedRaw = rawValue?.trim() ? rawValue : JSON.stringify(fallbackValue)

  try {
    return {
      rawJsonValue: normalizedRaw,
      parsedJsonValue: JSON.parse(normalizedRaw) as T,
      error: false,
    }
  } catch {
    return {
      rawJsonValue: normalizedRaw,
      parsedJsonValue: fallbackValue,
      error: true,
    }
  }
}

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
  const { mode } = useContext(ColorModeContext)
  const [expandedSection, setExpandedSection] = useState<string | null>('Basics')

  const [configuratorFormValues, setConfiguratorFormValues] = useState<ConfiguratorFormValues>({
    appCode: '',
    widgetMode: 'dapp',
    locale: '',
    enabledTradeTypes: TRADE_MODES,
    currentTradeType: TRADE_MODES[0],
    chainId: NetworkOptions[0].chainId,
    disableCrossChainSwap: false,
    sellToken: DEFAULT_STATE.sellToken,
    sellTokenAmount: DEFAULT_STATE.sellAmount,
    buyToken: DEFAULT_STATE.buyToken,
    buyTokenAmount: DEFAULT_STATE.buyAmount,
    tokenListUrls: DEFAULT_TOKEN_LISTS,
    customTokens: [],
    theme: 'light',
    autoResizeEnabled: true,
    showIframeOutline: true,
    iframeStyleJson: '{}',
    appWrapperStyleJson: '{}',
    bodyWrapperStyleJson: '{}',
    cardStyleJson: '{}',
    disableProgressBar: false,
    disablePostTradeTips: false,
    disableTokenImport: false,
    hideRecentTokens: false,
    hideFavoriteTokens: false,
    hideBridgeInfo: false,
    hideOrdersTable: false,
    disableTradeWhenPriceImpactIsUnknown: false,
    disableTradeWhenPriceImpactIsHigherThan: undefined,
    deadline: undefined,
    swapDeadline: undefined,
    limitDeadline: undefined,
    advancedDeadline: undefined,
    partnerFeeBps: 0,
    customImages: {},
    customSounds: {},
    baseUrl: null,
    enabledWidgetHooks: [],
    rawParamsJson: '{}',
  })

  const standaloneMode = configuratorFormValues.widgetMode === 'standalone'

  const handleToggleExpanded = useCallback(
    (title: string) => (isExpanded: boolean) => setExpandedSection(isExpanded ? title : null),
    [],
  )

  const handleConfiguratorFormChange = useCallback(
    (nameOrEvent: keyof ConfiguratorFormValues | ConfiguratorFormInputEvent, value?: unknown) => {
      if (typeof nameOrEvent !== 'string') {
        const { name, value: eventValue } = nameOrEvent.target
        const normalizedName = name === MODE_FIELD_NAME ? 'widgetMode' : name

        if (!normalizedName) return

        setConfiguratorFormValues((prevState) => {
          if (!(normalizedName in prevState)) return prevState

          const key = normalizedName as keyof ConfiguratorFormValues
          const shouldKeepNull = key === 'baseUrl' || JSON_FIELD_NAMES.has(key)
          const nextValue = eventValue === null && !shouldKeepNull ? '' : eventValue

          return {
            ...prevState,
            [key]: nextValue,
          }
        })

        return
      }

      setConfiguratorFormValues((prevState) => {
        const shouldKeepNull = nameOrEvent === 'baseUrl' || JSON_FIELD_NAMES.has(nameOrEvent)
        const nextValue = value === null && !shouldKeepNull ? '' : value

        return {
          ...prevState,
          [nameOrEvent]: nextValue,
        }
      })
    },
    [],
  ) as ConfiguratorFormChangeHandler

  const setNetworkControlState = useCallback(
    (option: NetworkOption): void => {
      handleConfiguratorFormChange('chainId', option.chainId)
    },
    [handleConfiguratorFormChange],
  )

  const iframeStyleJson = useMemo(
    () => parseJsonField<CSS.Properties>(configuratorFormValues.iframeStyleJson, {}),
    [configuratorFormValues.iframeStyleJson],
  )
  const appWrapperStyleJson = useMemo(
    () => parseJsonField<CSS.Properties>(configuratorFormValues.appWrapperStyleJson, {}),
    [configuratorFormValues.appWrapperStyleJson],
  )
  const bodyWrapperStyleJson = useMemo(
    () => parseJsonField<CSS.Properties>(configuratorFormValues.bodyWrapperStyleJson, {}),
    [configuratorFormValues.bodyWrapperStyleJson],
  )
  const cardStyleJson = useMemo(
    () => parseJsonField<CSS.Properties>(configuratorFormValues.cardStyleJson, {}),
    [configuratorFormValues.cardStyleJson],
  )
  const rawParamsJson = useMemo(
    () => parseJsonField<Partial<CowSwapWidgetParams>>(configuratorFormValues.rawParamsJson, {}),
    [configuratorFormValues.rawParamsJson],
  )

  const paletteManager = useColorPaletteManager(configuratorFormValues.theme)
  const { colorPalette, defaultPalette } = paletteManager

  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount()

  const effectiveChainId = IS_IFRAME
    ? undefined
    : !isConnected || !walletChainId
      ? configuratorFormValues.chainId
      : walletChainId

  const partnerFeeRecipient = DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK[configuratorFormValues.chainId]

  const configuratorState: ConfiguratorState = useMemo(
    () => ({
      appCode: configuratorFormValues.appCode,
      standaloneMode,
      locale: configuratorFormValues.locale || undefined,
      enabledTradeTypes: configuratorFormValues.enabledTradeTypes,
      currentTradeType: configuratorFormValues.currentTradeType,
      chainId: effectiveChainId,
      disableCrossChainSwap: configuratorFormValues.disableCrossChainSwap,
      sellToken: configuratorFormValues.sellToken,
      sellTokenAmount: configuratorFormValues.sellTokenAmount,
      buyToken: configuratorFormValues.buyToken,
      buyTokenAmount: configuratorFormValues.buyTokenAmount,
      tokenListUrls: configuratorFormValues.tokenListUrls,
      customTokens: configuratorFormValues.customTokens,
      theme: configuratorFormValues.theme,
      customColors: colorPalette,
      defaultColors: defaultPalette,
      autoResizeEnabled: configuratorFormValues.autoResizeEnabled,
      showIframeOutline: configuratorFormValues.showIframeOutline,
      iframeStyle: iframeStyleJson.parsedJsonValue,
      appWrapperStyle: appWrapperStyleJson.parsedJsonValue,
      bodyWrapperStyle: bodyWrapperStyleJson.parsedJsonValue,
      cardStyle: cardStyleJson.parsedJsonValue,
      disableToastMessages: toastManager.disableToastMessages,
      disableProgressBar: configuratorFormValues.disableProgressBar,
      disablePostTradeTips: configuratorFormValues.disablePostTradeTips,
      disableTokenImport: configuratorFormValues.disableTokenImport,
      hideRecentTokens: configuratorFormValues.hideRecentTokens,
      hideFavoriteTokens: configuratorFormValues.hideFavoriteTokens,
      hideBridgeInfo: configuratorFormValues.hideBridgeInfo,
      hideOrdersTable: configuratorFormValues.hideOrdersTable,
      disableTradeWhenPriceImpactIsUnknown: configuratorFormValues.disableTradeWhenPriceImpactIsUnknown,
      disableTradeWhenPriceImpactIsHigherThan: configuratorFormValues.disableTradeWhenPriceImpactIsHigherThan,
      deadline: configuratorFormValues.deadline,
      swapDeadline: configuratorFormValues.swapDeadline,
      limitDeadline: configuratorFormValues.limitDeadline,
      advancedDeadline: configuratorFormValues.advancedDeadline,
      partnerFeeBps: configuratorFormValues.partnerFeeBps,
      partnerFeeRecipient,
      customImages: configuratorFormValues.customImages,
      customSounds: configuratorFormValues.customSounds,
      baseUrl: configuratorFormValues.baseUrl,
      enabledWidgetHooks: configuratorFormValues.enabledWidgetHooks,
      rawParams: rawParamsJson.parsedJsonValue,
    }),
    [
      configuratorFormValues,
      standaloneMode,
      effectiveChainId,
      colorPalette,
      defaultPalette,
      iframeStyleJson.parsedJsonValue,
      appWrapperStyleJson.parsedJsonValue,
      bodyWrapperStyleJson.parsedJsonValue,
      cardStyleJson.parsedJsonValue,
      toastManager.disableToastMessages,
      partnerFeeRecipient,
      rawParamsJson.parsedJsonValue,
    ],
  )

  useEffect(() => {
    onStateChange(configuratorState)
  }, [configuratorState, onStateChange])

  useSyncWidgetNetwork(configuratorFormValues.chainId, setNetworkControlState, standaloneMode)

  /*

  TODO:

  - [x] Classify state props into categories in type definition file.
  - [x] Add field for appCode.
  - [x] Automatically set baseUrl based on widget configurator env.
  - [x] Add env indicator.
  - [x] Allow wider sidebar to use it as mobile mode.
  - [x] Add loader to widget, also when reloading / updating.
  - [x] Add update/reload widget button if needed.
  - [x] Make widget theme selector work.
  - [x] Create PresetsButtons component.
  - [x] Add presets for baseUrl and layout.
  - [x] Fix sticky style issue.

  - [x] Update AccordionSection so that we just pass title, currentTitle and onChange, and handle that with a single state variable and a single handler function.
  - [x] Move fields to individual panels. Pass one prop per value and one single callback that takes a ChangeEvent or name + value.

  - [ ] Add toggle to disable scrollbars.
  - [ ] Add name to all fields.
  - [ ] Create reusable TextInput, NumberInput and SelectInput components.
  - [ ] Bug: when in dApp mode, reload the page with the wallet connected. You are connected outside, not within the widget.
  */

  return (
    <Drawer sx={(theme: Theme) => getDrawerSx(theme, isResizing)} variant="persistent" anchor="left" open={isOpen}>
      <Box sx={drawerPaperRowSx}>
        <Box sx={drawerContentColumnSx}>
          <SidebarHeader
            title={title}
            themeMode={mode}
            standaloneMode={standaloneMode}
            baseUrl={configuratorFormValues.baseUrl || CONFIGURATOR_DEFAULT_WIDGET_BASE_URL}
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
                jsonStates: {
                  iframeStyleJson,
                  appWrapperStyleJson,
                  bodyWrapperStyleJson,
                  cardStyleJson,
                  onIframeStyleJson: (value: string | null) => handleConfiguratorFormChange('iframeStyleJson', value),
                  onAppWrapperStyleJson: (value: string | null) =>
                    handleConfiguratorFormChange('appWrapperStyleJson', value),
                  onBodyWrapperStyleJson: (value: string | null) =>
                    handleConfiguratorFormChange('bodyWrapperStyleJson', value),
                  onCardStyleJson: (value: string | null) => handleConfiguratorFormChange('cardStyleJson', value),
                },
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
          />
        </Box>

        <Box sx={(theme: Theme) => getDrawerPatternFillerSx(theme)} aria-hidden />
      </Box>
    </Drawer>
  )
}
