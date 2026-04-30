import { ChangeEvent, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { SupportedLocale, DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { CowSwapWidgetParams, TokenInfo, TradeType, WidgetHookEvents } from '@cowprotocol/widget-lib'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useWeb3ModalAccount } from '@web3modal/ethers5/react'

import { SidebarFooter } from './footer/sidebar-footer.component'
import { SidebarHeader } from './header/sidebar-header.component'
import { drawerContentColumnSx, drawerPaperRowSx, getDrawerPatternFillerSx, getDrawerSx } from './sidebar.styles'

import { DEFAULT_STATE, DEFAULT_TOKEN_LISTS, IS_IFRAME, TRADE_MODES } from '../../configurator.constants'
import { ConfiguratorState, TokenListItem, WidgetMode } from '../../configurator.types'
import { useColorPaletteManager } from '../../hooks/useColorPaletteManager'
import { useJsonState, EMPTY_JSON_STATE } from '../../hooks/useJsonState'
import { useSyncWidgetNetwork } from '../../hooks/useSyncWidgetNetwork'
import { UseToastsManagerReturn } from '../../hooks/useToastsManager'
import { ColorModeContext } from '../../theme/ColorModeContext'
import { CONFIGURATOR_DEFAULT_WIDGET_BASE_URL } from '../../utils/baseUrl'
import { jsonHelperText } from '../../utils/jsonFieldParsing'
import { AppearanceStyleControls } from '../controls/AppearanceStyleControls'
import { CustomImagesControl } from '../controls/CustomImagesControl'
import { CustomSoundsControl } from '../controls/CustomSoundsControl'
import { DeadlineControl } from '../controls/DeadlineControl'
import { PaletteControl } from '../controls/PaletteControl'
import { PartnerFeeControl } from '../controls/PartnerFeeControl'
import { ThemeControl, type ThemeOptionValue } from '../controls/ThemeControl'
import { TokenListControl } from '../controls/TokenListControl'
import { COMMENTS_BY_PARAM_NAME } from '../snippet/snippet.const'
import { AccordionSection } from '../ui/Accordion/AccordionSection'
import { BooleanSwitchControl } from '../ui/controls/BooleanSwitch/BooleanSwitchControl'
import { CurrencyInputControl } from '../ui/controls/CurrencyInput/CurrencyInputControl'
import { JsonInput } from '../ui/controls/JsonInput/JsonInput.component'
import { CurrentTradeTypeControl } from '../ui/controls/Select/CurrentTradeTypeControl'
import { LocaleControl } from '../ui/controls/Select/LocaleControl'
import { ModeControl } from '../ui/controls/Select/ModeControl'
import { NetworkControl, NetworkOption, NetworkOptions } from '../ui/controls/Select/NetworkControl'
import { TradeModesControl } from '../ui/controls/Select/TradeModesControl'
import { WidgetHooksControl } from '../ui/controls/Select/WidgetHooksControl'
import { TextInput } from '../ui/controls/TextInput/TextInput.component'

import type { PaletteMode } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import type * as CSS from 'csstype'

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
  const availableChains = useAvailableChains()

  const [expandedSection, setExpandedSection] = useState<string | null>('Basics')

  const toggleSection = useCallback(
    (title: string) => (isExpanded: boolean) => setExpandedSection(isExpanded ? title : null),
    [],
  )

  // Basics Section:

  const [appCode, setAppCode] = useState<string>('')
  const [widgetMode, setWidgetMode] = useState<WidgetMode>('dapp')
  const standaloneMode = widgetMode === 'standalone'

  const selectWidgetMode = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setWidgetMode(event.target.value as WidgetMode)
  }

  const localeState = useState<SupportedLocale | ''>('')
  const [locale] = localeState

  // Trade Setup Section:

  const networkControlState = useState<NetworkOption>(NetworkOptions[0])
  const [{ chainId }, setNetworkControlState] = networkControlState

  const tradeTypeState = useState<TradeType>(TRADE_MODES[0])
  const [currentTradeType] = tradeTypeState

  const tradeModesState = useState<TradeType[]>(TRADE_MODES)
  const [enabledTradeTypes] = tradeModesState

  const [disableCrossChainSwap, setDisableCrossChainSwap] = useState<boolean>(false)
  const setAllowCrossChainSwap = useCallback((enabled: boolean) => setDisableCrossChainSwap(!enabled), [])

  // Tokens Section:

  const sellTokenState = useState<string>(DEFAULT_STATE.sellToken)
  const sellTokenAmountState = useState<number>(DEFAULT_STATE.sellAmount)
  const [sellToken] = sellTokenState
  const [sellTokenAmount] = sellTokenAmountState

  const buyTokenState = useState<string>(DEFAULT_STATE.buyToken)
  const buyTokenAmountState = useState<number>(DEFAULT_STATE.buyAmount)
  const [buyToken] = buyTokenState
  const [buyTokenAmount] = buyTokenAmountState

  const tokenListUrlsState = useState<TokenListItem[]>(DEFAULT_TOKEN_LISTS)
  const customTokensState = useState<TokenInfo[]>([])

  // Theme Colors Section:

  const { mode } = useContext(ColorModeContext)
  const [theme, setTheme] = useState<PaletteMode>('light')

  const handleWidgetThemeSelect = useCallback((value: ThemeOptionValue) => {
    setTheme(value)
  }, [])

  const paletteManager = useColorPaletteManager(theme)
  const { colorPalette, defaultPalette } = paletteManager

  // Layout Section:

  const [autoResizeEnabled, setAutoResizeEnabled] = useState<boolean>(true)
  const [showIframeOutline, setShowIframeOutline] = useState<boolean>(true)

  const [iframeStyleJson, setIframeStyleJson] = useJsonState<CSS.Properties>(EMPTY_JSON_STATE)
  const [cardStyleJson, setCardStyleJson] = useJsonState<CSS.Properties>(EMPTY_JSON_STATE)
  const [appWrapperStyleJson, setAppWrapperStyleJson] = useJsonState<CSS.Properties>(EMPTY_JSON_STATE)
  const [bodyWrapperStyleJson, setBodyWrapperStyleJson] = useJsonState<CSS.Properties>(EMPTY_JSON_STATE)

  // Behavior Section:

  const [disableProgressBar, setDisableProgressBar] = useState<boolean>(false)
  const setShowProgressBar = useCallback((enabled: boolean) => setDisableProgressBar(!enabled), [])

  const [disablePostTradeTips, setDisablePostTradeTips] = useState<boolean>(false)
  const setShowPostTradeTips = useCallback((enabled: boolean) => setDisablePostTradeTips(!enabled), [])

  const [disableTokenImport, setDisableTokenImport] = useState<boolean>(false)
  const setAllowTokenImport = useCallback((enabled: boolean) => setDisableTokenImport(!enabled), [])

  const [hideRecentTokens, setHideRecentTokens] = useState<boolean>(false)
  const setShowRecentTokens = useCallback((enabled: boolean) => setHideRecentTokens(!enabled), [])

  const [hideFavoriteTokens, setHideFavoriteTokens] = useState<boolean>(false)
  const setShowFavoriteTokens = useCallback((enabled: boolean) => setHideFavoriteTokens(!enabled), [])

  const [hideBridgeInfo, setHideBridgeInfo] = useState<boolean | undefined>(false)
  const setShowBridgeInfo = useCallback((enabled: boolean) => setHideBridgeInfo(!enabled), [])

  const [hideOrdersTable, setHideOrdersTable] = useState<boolean | undefined>(false)
  const setShowOrdersTable = useCallback((enabled: boolean) => setHideOrdersTable(!enabled), [])

  const [disableTradeWhenPriceImpactIsUnknown, setDisableTradeWhenPriceImpactIsUnknown] = useState(false)
  const setBlockUnknownPriceImpact = useCallback((enabled: boolean) => {
    setDisableTradeWhenPriceImpactIsUnknown(enabled)
  }, [])

  const [disableTradeWhenPriceImpactIsHigherThan, setDisableTradeWhenPriceImpactIsHigherThan] = useState<
    number | undefined
  >()

  const setBlockPriceImpactAboveValue = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.trim()

    if (!nextValue) {
      setDisableTradeWhenPriceImpactIsHigherThan(undefined)

      return
    }

    const parsedValue = Number(nextValue)

    if (Number.isNaN(parsedValue)) return

    setDisableTradeWhenPriceImpactIsHigherThan(parsedValue)
  }, [])

  // Deadlines Section:

  const deadlineState = useState<number | undefined>()
  const [deadline] = deadlineState
  const swapDeadlineState = useState<number | undefined>()
  const [swapDeadline] = swapDeadlineState
  const limitDeadlineState = useState<number | undefined>()
  const [limitDeadline] = limitDeadlineState
  const advancedDeadlineState = useState<number | undefined>()
  const [advancedDeadline] = advancedDeadlineState

  // Integrations Section:

  const partnerFeeBpsState = useState<number>(0)

  // Customization Section:

  const customImagesState = useState<CowSwapWidgetParams['images']>({})
  const customSoundsState = useState<CowSwapWidgetParams['sounds']>({})
  const [baseUrl, setBaseUrl] = useState<string | null>(null)
  const [rawParamsJson, setRawParamsJson] = useJsonState<Partial<CowSwapWidgetParams>>(EMPTY_JSON_STATE)

  // Advanced Section:

  const widgetHooksState = useState<WidgetHookEvents[]>([])

  // Merge and propagate state:

  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount()

  const [enabledWidgetHooks] = widgetHooksState
  const [tokenListUrls] = tokenListUrlsState
  const [customTokens] = customTokensState
  const [partnerFeeBps] = partnerFeeBpsState
  const [customImages] = customImagesState
  const [customSounds] = customSoundsState

  // Don't change chainId in the widget URL if the user is connected to a wallet
  // Because useSyncWidgetNetwork() will send a request to change the network
  const effectiveChainId = IS_IFRAME ? undefined : !isConnected || !walletChainId ? chainId : walletChainId

  // TODO: This probably needs a field per chain in the UI:
  const partnerFeeRecipient = DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK[chainId]

  const configuratorState: ConfiguratorState = useMemo(
    () => ({
      // Basics:

      appCode,
      // widgetMode: WidgetMode
      standaloneMode,
      locale: locale || undefined,

      // Trade Setup:

      enabledTradeTypes,
      currentTradeType,
      chainId: effectiveChainId,
      disableCrossChainSwap,
      // slippage, // TODO: Defined but not in the form.

      // Tokens:

      sellToken,
      sellTokenAmount,
      buyToken,
      buyTokenAmount,
      tokenListUrls,
      customTokens,

      // Theme Colors:

      theme,
      customColors: colorPalette,
      defaultColors: defaultPalette,

      // Layout:

      autoResizeEnabled,
      showIframeOutline,
      iframeStyle: iframeStyleJson.mergedValue,
      appWrapperStyle: appWrapperStyleJson.mergedValue,
      bodyWrapperStyle: bodyWrapperStyleJson.mergedValue,
      cardStyle: cardStyleJson.mergedValue,

      // Behavior:

      disableToastMessages: toastManager.disableToastMessages,
      disableProgressBar,
      disablePostTradeTips,
      disableTokenImport,
      hideRecentTokens,
      hideFavoriteTokens,
      hideBridgeInfo,
      hideOrdersTable,
      disableTradeWhenPriceImpactIsUnknown,
      disableTradeWhenPriceImpactIsHigherThan,

      // Deadlines:

      deadline,
      swapDeadline,
      limitDeadline,
      advancedDeadline,

      // Integrations:

      partnerFeeBps,
      partnerFeeRecipient,

      // Customization:

      customImages,
      customSounds,

      // Advanced:

      baseUrl,
      enabledWidgetHooks,
      rawParams: rawParamsJson.mergedValue,
    }),
    [
      // Basics:

      appCode,
      // widgetMode: WidgetMode
      standaloneMode,
      locale,

      // Trade Setup:

      enabledTradeTypes,
      currentTradeType,
      effectiveChainId,
      disableCrossChainSwap,
      // slippage, // TODO: Defined but not in form.

      // Tokens:

      sellToken,
      sellTokenAmount,
      buyToken,
      buyTokenAmount,
      tokenListUrls,
      customTokens,

      // Theme Colors:

      theme,
      colorPalette,
      defaultPalette,

      // Layout:

      autoResizeEnabled,
      showIframeOutline,
      iframeStyleJson.mergedValue,
      appWrapperStyleJson.mergedValue,
      bodyWrapperStyleJson.mergedValue,
      cardStyleJson.mergedValue,

      // Behavior:

      toastManager.disableToastMessages,
      disableProgressBar,
      disablePostTradeTips,
      disableTokenImport,
      hideRecentTokens,
      hideFavoriteTokens,
      hideBridgeInfo,
      hideOrdersTable,
      disableTradeWhenPriceImpactIsUnknown,
      disableTradeWhenPriceImpactIsHigherThan,

      // Deadlines:

      deadline,
      swapDeadline,
      limitDeadline,
      advancedDeadline,

      // Integrations:

      partnerFeeBps,
      partnerFeeRecipient,

      // Customization:

      customImages,
      customSounds,

      // Advanced:

      baseUrl,
      enabledWidgetHooks,
      rawParamsJson.mergedValue,
    ],
  )

  useEffect(() => {
    onStateChange(configuratorState)
  }, [configuratorState, onStateChange])

  useSyncWidgetNetwork(chainId, setNetworkControlState, standaloneMode)

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

  - [ ] Fix sticky style issue.
  - [ ] Update AccordionSection so that we just pass title, currentTitle and onChange, and handle that with a single state variable and a single handler function.
  - [ ] Create reusable TextInput, NumberInput and SelectInput components.
  - [ ] Add name to all fields.
  - [ ] Move fields to individual panels. Pass one prop per value and one single callback that takes a ChangeEvent or name + value.
  - [ ] Add presets for baseUrl and layout.
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
            baseUrl={baseUrl || CONFIGURATOR_DEFAULT_WIDGET_BASE_URL}
          />

          <Stack spacing={0} sx={{ display: 'flex', flexDirection: 'column' }}>
            <AccordionSection title="Basics" expanded={expandedSection === 'Basics'} onChange={toggleSection('Basics')}>
              <TextInput
                name="appCode"
                label="App code"
                value={appCode}
                onChange={(_, value) => setAppCode(value ?? '')}
                helperText={COMMENTS_BY_PARAM_NAME.appCode}
                inputProps={{ maxLength: 50 }}
              />
              {!IS_IFRAME && <ModeControl value={widgetMode} onChange={selectWidgetMode} />}
              <LocaleControl state={localeState} />
            </AccordionSection>

            <AccordionSection
              title="Trade Setup"
              expanded={expandedSection === 'Trade setup'}
              onChange={toggleSection('Trade setup')}
            >
              <TradeModesControl state={tradeModesState} />
              <CurrentTradeTypeControl state={tradeTypeState} />
              {!IS_IFRAME && (
                <NetworkControl
                  state={networkControlState}
                  standaloneMode={standaloneMode}
                  availableChains={availableChains}
                />
              )}
              <BooleanSwitchControl
                checked={!disableCrossChainSwap}
                label="Allow cross-chain swaps"
                onChange={setAllowCrossChainSwap}
              />
            </AccordionSection>

            <AccordionSection title="Tokens" expanded={expandedSection === 'Tokens'} onChange={toggleSection('Tokens')}>
              <CurrencyInputControl
                label="Sell token"
                tokenIdState={sellTokenState}
                tokenAmountState={sellTokenAmountState}
              />
              <CurrencyInputControl
                label="Buy token"
                tokenIdState={buyTokenState}
                tokenAmountState={buyTokenAmountState}
              />
              <TokenListControl tokenListUrlsState={tokenListUrlsState} customTokensState={customTokensState} />
            </AccordionSection>

            <AccordionSection
              title="Theme Colors"
              expanded={expandedSection === 'Theme Colors'}
              onChange={toggleSection('Theme Colors')}
            >
              <ThemeControl selectedValue={theme} onChange={handleWidgetThemeSelect} />
              <PaletteControl paletteManager={paletteManager} />
            </AccordionSection>

            <AccordionSection title="Layout" expanded={expandedSection === 'Layout'} onChange={toggleSection('Layout')}>
              <BooleanSwitchControl
                checked={autoResizeEnabled}
                label="Auto-resize iframe"
                onChange={setAutoResizeEnabled}
                helperText="When enabled, the iframe height adjusts automatically to fit its content."
              />
              <BooleanSwitchControl
                checked={showIframeOutline}
                label="Show iframe outline"
                onChange={setShowIframeOutline}
                tooltip="Preview-only visual aid to see the iframe boundaries. This setting is not included in the exported widget code."
              />
              <AppearanceStyleControls
                iframeStyleJson={iframeStyleJson}
                onIframeStyleJson={setIframeStyleJson}
                appWrapperStyleJson={appWrapperStyleJson}
                onAppWrapperStyleJson={setAppWrapperStyleJson}
                bodyWrapperStyleJson={bodyWrapperStyleJson}
                onBodyWrapperStyleJson={setBodyWrapperStyleJson}
                cardStyleJson={cardStyleJson}
                onCardStyleJson={setCardStyleJson}
              />
            </AccordionSection>

            <AccordionSection
              title="Behavior"
              expanded={expandedSection === 'Behavior'}
              onChange={toggleSection('Behavior')}
            >
              <BooleanSwitchControl
                checked={toastManager.disableToastMessages}
                label="Use app toasts"
                helperText="When off, the widget keeps toast messages inside the iframe."
                onChange={toastManager.setToastMessagesInDappMode}
              />
              <BooleanSwitchControl
                checked={!disableProgressBar}
                label="Show progress bar"
                onChange={setShowProgressBar}
              />
              <BooleanSwitchControl
                checked={!disablePostTradeTips}
                label="Show post-trade tips"
                onChange={setShowPostTradeTips}
              />
              <BooleanSwitchControl
                checked={!disableTokenImport}
                label="Allow custom token imports"
                onChange={setAllowTokenImport}
              />
              <BooleanSwitchControl
                checked={!hideRecentTokens}
                label="Show recent tokens"
                onChange={setShowRecentTokens}
              />
              <BooleanSwitchControl
                checked={!hideFavoriteTokens}
                label="Show favorite tokens"
                onChange={setShowFavoriteTokens}
              />
              <BooleanSwitchControl checked={!hideBridgeInfo} label="Show bridge info" onChange={setShowBridgeInfo} />
              <BooleanSwitchControl
                checked={!hideOrdersTable}
                label="Show orders table"
                onChange={setShowOrdersTable}
              />
              <BooleanSwitchControl
                checked={disableTradeWhenPriceImpactIsUnknown}
                label="Block trade if price impact is unknown"
                onChange={setBlockUnknownPriceImpact}
              />
              <TextField
                fullWidth
                margin="dense"
                id="disableTradeWhenPriceImpactIsHigherThan"
                label="Block trade above price impact (%)"
                type="number"
                value={disableTradeWhenPriceImpactIsHigherThan ?? ''}
                onChange={setBlockPriceImpactAboveValue}
                size="medium"
                helperText="Leave empty to disable"
                inputProps={{
                  min: 0,
                  step: 'any',
                }}
              />
            </AccordionSection>

            <AccordionSection
              title="Deadlines"
              expanded={expandedSection === 'Deadlines'}
              onChange={toggleSection('Deadlines')}
            >
              <DeadlineControl label="Global Deadline" deadlineState={deadlineState} />
              <DeadlineControl label="Swap Deadline" deadlineState={swapDeadlineState} />
              <DeadlineControl label="Limit Deadline" deadlineState={limitDeadlineState} />
              <DeadlineControl label="Advanced Deadline" deadlineState={advancedDeadlineState} />
            </AccordionSection>

            <AccordionSection
              title="Integrations"
              expanded={expandedSection === 'Integrations'}
              onChange={toggleSection('Integrations')}
            >
              <PartnerFeeControl feeBpsState={partnerFeeBpsState} />
            </AccordionSection>

            <AccordionSection
              title="Customization"
              expanded={expandedSection === 'Customization'}
              onChange={toggleSection('Customization')}
            >
              <CustomImagesControl state={customImagesState} />
              <CustomSoundsControl state={customSoundsState} />
            </AccordionSection>

            <AccordionSection
              title="Advanced"
              expanded={expandedSection === 'Advanced'}
              onChange={toggleSection('Advanced')}
            >
              <TextInput
                name="baseUrl"
                label="Widget App URL"
                value={baseUrl}
                onChange={(_, value) => setBaseUrl(value)}
                placeholder={CONFIGURATOR_DEFAULT_WIDGET_BASE_URL}
                helperText={`Optional. Sets baseUrl (overrides Raw JSON). Default preview URL: ${CONFIGURATOR_DEFAULT_WIDGET_BASE_URL}`}
              />
              <WidgetHooksControl state={widgetHooksState} />
              <JsonInput
                label="Raw JSON params"
                name="rawParams"
                value={rawParamsJson.rawJsonValue}
                onChange={(_name, value) => setRawParamsJson(null, value)}
                helperText={jsonHelperText(rawParamsJson.error)}
              />
            </AccordionSection>
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
