import { ChangeEvent, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { SupportedLocale, DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { CowSwapWidgetParams, TokenInfo, TradeType, WidgetHookEvents } from '@cowprotocol/widget-lib'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import { useWeb3ModalAccount } from '@web3modal/ethers5/react'

import { getDrawerSx } from './sidebar.styles'
import { SidebarFooter } from './footer/sidebar-footer.component'

import { ColorModeContext } from '../../../../theme/ColorModeContext'
import { DEFAULT_STATE, DEFAULT_TOKEN_LISTS, IS_IFRAME, TRADE_MODES } from '../../consts'
import { useColorPaletteManager } from '../../hooks/useColorPaletteManager'
import { useJsonState, EMPTY_JSON_STATE } from '../../hooks/useJsonState'
import { useSyncWidgetNetwork } from '../../hooks/useSyncWidgetNetwork'
import { UseToastsManagerReturn } from '../../hooks/useToastsManager'
import { CONFIGURATOR_DEFAULT_WIDGET_BASE_URL } from '../../hooks/useWidgetParamsAndSettings'
import { ConfiguratorState, TokenListItem, WidgetMode } from '../../types'
import { AccordionSection } from '../controls/AccordionSection'
import { AppearanceStyleControls } from '../controls/AppearanceStyleControls'
import { BooleanSwitchControl } from '../controls/BooleanSwitchControl'
import { SidebarHeader } from './header/sidebar-header.component'
import { CurrencyInputControl } from '../controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from '../controls/CurrentTradeTypeControl'
import { CustomImagesControl } from '../controls/CustomImagesControl'
import { CustomSoundsControl } from '../controls/CustomSoundsControl'
import { DeadlineControl } from '../controls/DeadlineControl'
import { LocaleControl } from '../controls/LocaleControl'
import { ModeControl } from '../controls/ModeControl'
import { NetworkControl, NetworkOption, NetworkOptions } from '../controls/NetworkControl'
import { PaletteControl } from '../controls/PaletteControl'
import { PartnerFeeControl } from '../controls/PartnerFeeControl'
import { ThemeControl } from '../controls/ThemeControl'
import { TokenListControl } from '../controls/TokenListControl'
import { TradeModesControl } from '../controls/TradeModesControl'
import { WidgetHooksControl } from '../controls/WidgetHooksControl'

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
}: SidebarProps): ReactNode {
  const availableChains = useAvailableChains()

  const [expandedSection, setExpandedSection] = useState<string | null>('Basics')

  const toggleSection = useCallback(
    (title: string) => (isExpanded: boolean) => setExpandedSection(isExpanded ? title : null),
    [],
  )

  // Basics Section:

  const { mode } = useContext(ColorModeContext)

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

  const paletteManager = useColorPaletteManager(mode)
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
  const [widgetAppBaseUrl, setWidgetAppBaseUrl] = useState<string>('')
  const [rawParamsJson, setRawParamsJson] = useJsonState<Partial<CowSwapWidgetParams>>(EMPTY_JSON_STATE)

  const handleRawParamsJsonChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setRawParamsJson(null, e.target.value)
  }

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

  const configuratorState: ConfiguratorState = useMemo(
    () => ({
      deadline,
      swapDeadline,
      limitDeadline,
      advancedDeadline,
      chainId: effectiveChainId,
      locale: locale || undefined,
      theme: mode,
      showIframeOutline,
      iframeStyle: iframeStyleJson.mergedValue,
      appWrapperStyle: appWrapperStyleJson.mergedValue,
      bodyWrapperStyle: bodyWrapperStyleJson.mergedValue,
      cardStyle: cardStyleJson.mergedValue,
      currentTradeType,
      enabledTradeTypes,
      enabledWidgetHooks,
      sellToken,
      sellTokenAmount,
      buyToken,
      buyTokenAmount,
      tokenListUrls,
      customColors: colorPalette,
      defaultColors: defaultPalette,
      partnerFeeBps,
      partnerFeeRecipient: DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK[chainId],
      standaloneMode,
      autoResizeEnabled,
      disableToastMessages: toastManager.disableToastMessages,
      disableProgressBar,
      disableCrossChainSwap,
      disableTokenImport,
      hideRecentTokens,
      hideFavoriteTokens,
      hideBridgeInfo,
      hideOrdersTable,
      disableTradeWhenPriceImpactIsUnknown,
      disableTradeWhenPriceImpactIsHigherThan,
      customImages,
      customSounds,
      customTokens,
      rawParams: rawParamsJson.mergedValue,
    }),
    [
      deadline,
      swapDeadline,
      limitDeadline,
      advancedDeadline,
      effectiveChainId,
      chainId,
      locale,
      mode,
      showIframeOutline,
      iframeStyleJson.mergedValue,
      appWrapperStyleJson.mergedValue,
      bodyWrapperStyleJson.mergedValue,
      cardStyleJson.mergedValue,
      currentTradeType,
      enabledTradeTypes,
      enabledWidgetHooks,
      sellToken,
      sellTokenAmount,
      buyToken,
      buyTokenAmount,
      tokenListUrls,
      colorPalette,
      defaultPalette,
      partnerFeeBps,
      standaloneMode,
      autoResizeEnabled,
      toastManager.disableToastMessages,
      disableProgressBar,
      disableCrossChainSwap,
      disableTokenImport,
      hideRecentTokens,
      hideFavoriteTokens,
      hideBridgeInfo,
      hideOrdersTable,
      disableTradeWhenPriceImpactIsUnknown,
      disableTradeWhenPriceImpactIsHigherThan,
      customImages,
      customSounds,
      customTokens,
      rawParamsJson.mergedValue,
    ],
  )

  useEffect(() => {
    onStateChange(configuratorState)
  }, [configuratorState, onStateChange])

  useSyncWidgetNetwork(chainId, setNetworkControlState, standaloneMode)

  return (
    <Drawer
      sx={(theme: Theme) => getDrawerSx(theme, isResizing)}
      variant="persistent"
      anchor="left"
      open={isOpen}
    >
      <SidebarHeader title={title} themeMode={mode} standaloneMode={ standaloneMode } />

      <Stack spacing={0}>
        <AccordionSection title="Basics" expanded={expandedSection === 'Basics'} onChange={toggleSection('Basics')}>
          {!IS_IFRAME && <ModeControl value={widgetMode} onChange={selectWidgetMode} />}
          <LocaleControl state={localeState} />
        </AccordionSection>

        <AccordionSection
          title="Trade setup"
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
          <CurrencyInputControl label="Buy token" tokenIdState={buyTokenState} tokenAmountState={buyTokenAmountState} />
          <TokenListControl tokenListUrlsState={tokenListUrlsState} customTokensState={customTokensState} />
        </AccordionSection>

        <AccordionSection
          title="Theme Colors"
          expanded={expandedSection === 'Theme Colors'}
          onChange={toggleSection('Theme Colors')}
        >
          <ThemeControl />
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
          <BooleanSwitchControl checked={!disableProgressBar} label="Show progress bar" onChange={setShowProgressBar} />
          <BooleanSwitchControl
            checked={!disableTokenImport}
            label="Allow custom token imports"
            onChange={setAllowTokenImport}
          />
          <BooleanSwitchControl checked={!hideRecentTokens} label="Show recent tokens" onChange={setShowRecentTokens} />
          <BooleanSwitchControl
            checked={!hideFavoriteTokens}
            label="Show favorite tokens"
            onChange={setShowFavoriteTokens}
          />
          <BooleanSwitchControl checked={!hideBridgeInfo} label="Show bridge info" onChange={setShowBridgeInfo} />
          <BooleanSwitchControl checked={!hideOrdersTable} label="Show orders table" onChange={setShowOrdersTable} />
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
          <Box>
            <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
              Global deadline
            </Typography>
            <DeadlineControl label="Deadline" deadlineState={deadlineState} />
          </Box>
          <Box>
            <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
              Per-trade deadlines
            </Typography>
            <Stack spacing={1.2}>
              <DeadlineControl label="Swap" deadlineState={swapDeadlineState} />
              <DeadlineControl label="Limit" deadlineState={limitDeadlineState} />
              <DeadlineControl label="Advanced" deadlineState={advancedDeadlineState} />
            </Stack>
          </Box>
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
          <WidgetHooksControl state={widgetHooksState} />
          <TextField
            fullWidth
            margin="dense"
            id="widgetAppBaseUrl"
            label="Widget App URL"
            value={widgetAppBaseUrl}
            onChange={(e) => setWidgetAppBaseUrl(e.target.value)}
            size="medium"
            placeholder={CONFIGURATOR_DEFAULT_WIDGET_BASE_URL}
            helperText={`Optional. Sets baseUrl (overrides Raw JSON). Default preview URL: ${CONFIGURATOR_DEFAULT_WIDGET_BASE_URL}`}
          />
          <TextField
            fullWidth
            margin="dense"
            id="rawParams"
            label="Raw JSON params"
            value={rawParamsJson.rawJsonValue}
            onChange={handleRawParamsJsonChange}
            size="medium"
          />
        </AccordionSection>
      </Stack>

      <SidebarFooter
        isSidebarOpen={isOpen}
        onSidebarToggle={onSidebarToggle}
        isSnippetOpen={isSnippetOpen}
        onSnippetToggle={onSnippetToggle}
      />
    </Drawer>
  )
}
