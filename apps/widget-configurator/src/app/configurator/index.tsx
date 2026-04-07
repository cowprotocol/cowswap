import { type CSSProperties, ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK, SupportedLocale } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { CowWidgetEventListeners } from '@cowprotocol/events'
import { CowSwapWidgetParams, TokenInfo, TradeType, WidgetHookEvents } from '@cowprotocol/widget-lib'
import { CowSwapWidget } from '@cowprotocol/widget-react'

import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import LanguageIcon from '@mui/icons-material/Language'
import { IconButton, Snackbar } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useWeb3ModalAccount, useWeb3ModalTheme } from '@web3modal/ethers5/react'

import { COW_LISTENERS, DEFAULT_IFRAME_BORDER_RADIUS, DEFAULT_TOKEN_LISTS, IS_IFRAME, TRADE_MODES } from './consts'
import { AccordionSection } from './controls/AccordionSection'
import { BooleanSwitchControl } from './controls/BooleanSwitchControl'
import { ConfiguratorBrandHeader } from './controls/ConfiguratorBrandHeader'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { CustomImagesControl } from './controls/CustomImagesControl'
import { CustomSoundsControl } from './controls/CustomSoundsControl'
import { DeadlineControl } from './controls/DeadlineControl'
import { IframeBackgroundColorControl } from './controls/IframeBackgroundColorControl'
import { IframeBorderRadiusControl } from './controls/IframeBorderRadiusControl'
import { IframeWidthControl } from './controls/IframeWidthControl'
import { LocaleControl } from './controls/LocaleControl'
import { ModeControl } from './controls/ModeControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { PaletteControl } from './controls/PaletteControl'
import { PartnerFeeControl } from './controls/PartnerFeeControl'
import { ThemeControl } from './controls/ThemeControl'
import { TokenListControl } from './controls/TokenListControl'
import { TradeModesControl } from './controls/TradeModesControl'
import { WidgetBorderRadiusControl } from './controls/WidgetBorderRadiusControl'
import { WidgetHooksControl } from './controls/WidgetHooksControl'
import { WidgetPaddingControl } from './controls/WidgetPaddingControl'
import { WidgetShadowControl } from './controls/WidgetShadowControl'
import { useColorPaletteManager } from './hooks/useColorPaletteManager'
import { useEmbedDialogState } from './hooks/useEmbedDialogState'
import { useProvider } from './hooks/useProvider'
import { useResizableDrawerWidth } from './hooks/useResizableDrawerWidth'
import { useSyncWidgetNetwork } from './hooks/useSyncWidgetNetwork'
import { useToastsManager } from './hooks/useToastsManager'
import { CONFIGURATOR_DEFAULT_WIDGET_BASE_URL, useWidgetParams } from './hooks/useWidgetParamsAndSettings'
import {
  ContentStyled,
  DRAWER_WIDTH_CSS_VAR,
  DrawerToggleButtonStyled,
  DrawerStyled,
  ResizeHandleStyled,
  WalletConnectionWrapper,
  WrapperStyled,
} from './styled'
import { ConfiguratorState, TokenListItem } from './types'

import { AnalyticsCategory } from '../../common/analytics/types'
import { ColorModeContext } from '../../theme/ColorModeContext'
import { EmbedDialog } from '../embedDialog'

declare global {
  interface Window {
    cowSwapWidgetParams?: Partial<CowSwapWidgetParams>
  }
}

const DEFAULT_STATE = {
  sellToken: 'USDC',
  buyToken: 'COW',
  sellAmount: 100000,
  buyAmount: 0,
}

const UTM_PARAMS = 'utm_content=cow-widget-configurator&utm_medium=web&utm_source=widget.cow.fi'

export type WidgetMode = 'dapp' | 'standalone'

function getOptionalTextValue(value: string): string | undefined {
  return value || undefined
}

function getIframeDefaultBackgroundColor(paperColor: string, defaultPaperColor: string): string {
  return paperColor || defaultPaperColor
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function Configurator({ title }: { title: string }) {
  const configuratorRef = useRef<HTMLDivElement | null>(null)
  const { setThemeMode } = useWeb3ModalTheme()
  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount()
  const provider = useProvider()
  const cowAnalytics = useCowAnalytics()

  const [listeners, setListeners] = useState<CowWidgetEventListeners>(COW_LISTENERS)
  const { mode } = useContext(ColorModeContext)

  const [widgetMode, setWidgetMode] = useState<WidgetMode>('dapp')
  const standaloneMode = widgetMode === 'standalone'

  const selectWidgetMode = (event: ChangeEvent<HTMLInputElement>): void => {
    setWidgetMode(event.target.value as WidgetMode)
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)
  const { drawerWidth, handleResizeStart } = useResizableDrawerWidth(configuratorRef)

  const networkControlState = useState<NetworkOption>(NetworkOptions[0])
  const [{ chainId }, setNetworkControlState] = networkControlState

  const tradeTypeState = useState<TradeType>(TRADE_MODES[0])
  const [currentTradeType] = tradeTypeState

  const localeState = useState<SupportedLocale | ''>('')
  const [locale] = localeState

  const tradeModesState = useState<TradeType[]>(TRADE_MODES)
  const [enabledTradeTypes] = tradeModesState

  const widgetHooksState = useState<WidgetHookEvents[]>([])
  const [enabledWidgetHooks] = widgetHooksState

  const sellTokenState = useState<string>(DEFAULT_STATE.sellToken)
  const sellTokenAmountState = useState<number>(DEFAULT_STATE.sellAmount)
  const [sellToken] = sellTokenState
  const [sellTokenAmount] = sellTokenAmountState

  const buyTokenState = useState<string>(DEFAULT_STATE.buyToken)
  const buyTokenAmountState = useState<number>(DEFAULT_STATE.buyAmount)
  const [buyToken] = buyTokenState
  const [buyTokenAmount] = buyTokenAmountState

  const deadlineState = useState<number | undefined>()
  const [deadline] = deadlineState
  const swapDeadlineState = useState<number | undefined>()
  const [swapDeadline] = swapDeadlineState
  const limitDeadlineState = useState<number | undefined>()
  const [limitDeadline] = limitDeadlineState
  const advancedDeadlineState = useState<number | undefined>()
  const [advancedDeadline] = advancedDeadlineState

  const tokenListUrlsState = useState<TokenListItem[]>(DEFAULT_TOKEN_LISTS)
  const customTokensState = useState<TokenInfo[]>([])
  const [tokenListUrls] = tokenListUrlsState
  const [customTokens] = customTokensState

  const partnerFeeBpsState = useState<number>(0)
  const [partnerFeeBps] = partnerFeeBpsState

  const customImagesState = useState<CowSwapWidgetParams['images']>({})
  const customSoundsState = useState<CowSwapWidgetParams['sounds']>({})
  const [customImages] = customImagesState
  const [customSounds] = customSoundsState

  const [widgetAppBaseUrl, setWidgetAppBaseUrl] = useState<string>('')
  const [rawParams, setRawParams] = useState<string | undefined>()
  const [isWidgetDisplayed, setIsWidgetDisplayed] = useState(true)

  const paletteManager = useColorPaletteManager(mode)
  const { colorPalette, defaultPalette } = paletteManager
  const iframeDefaultBackgroundColor = getIframeDefaultBackgroundColor(colorPalette.paper, defaultPalette.paper)
  const [iframeWidth, setIframeWidth] = useState<string>('')
  const [iframeBackgroundColor, setIframeBackgroundColor] = useState<string>('')
  const [iframeBorderRadius, setIframeBorderRadius] = useState<string>(DEFAULT_IFRAME_BORDER_RADIUS)
  const [boxShadow, setBoxShadow] = useState<string>('')
  const [widgetPadding, setWidgetPadding] = useState<string>('')
  const [widgetBorderRadius, setWidgetBorderRadius] = useState<string>('')

  const { dialogOpen, handleDialogClose, handleDialogOpen } = useEmbedDialogState()

  const { closeToast, toasts, setToastMessagesInDappMode, disableToastMessages } = useToastsManager(setListeners)
  const firstToast = toasts?.[0]

  const [disableProgressBar, setDisableProgressBar] = useState<boolean>(false)
  const setShowProgressBar = useCallback((enabled: boolean) => setDisableProgressBar(!enabled), [])

  const [disableCrossChainSwap, setDisableCrossChainSwap] = useState<boolean>(false)
  const setAllowCrossChainSwap = useCallback((enabled: boolean) => setDisableCrossChainSwap(!enabled), [])

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

  const LINKS = [
    { icon: <CodeIcon />, label: 'View embed code', onClick: () => handleDialogOpen() },
    { icon: <LanguageIcon />, label: 'Widget web', url: `https://cow.fi/widget/?${UTM_PARAMS}` },
    {
      icon: <ChromeReaderModeIcon />,
      label: 'Developer docs',
      url: `https://docs.cow.fi/cow-protocol/tutorials/widget?${UTM_PARAMS}`,
    },
  ]

  // Don't change chainId in the widget URL if the user is connected to a wallet
  // Because useSyncWidgetNetwork() will send a request to change the network
  const state: ConfiguratorState = {
    deadline,
    swapDeadline,
    limitDeadline,
    advancedDeadline,
    chainId: IS_IFRAME ? undefined : !isConnected || !walletChainId ? chainId : walletChainId,
    locale: locale || undefined,
    theme: mode,
    iframeWidth: getOptionalTextValue(iframeWidth),
    iframeBackgroundColor: getOptionalTextValue(iframeBackgroundColor),
    iframeBorderRadius: getOptionalTextValue(iframeBorderRadius),
    boxShadow: getOptionalTextValue(boxShadow),
    widgetPadding: getOptionalTextValue(widgetPadding),
    widgetBorderRadius: getOptionalTextValue(widgetBorderRadius),
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
    disableToastMessages,
    disableProgressBar,
    disableCrossChainSwap,
    disableTokenImport,
    hideRecentTokens,
    hideFavoriteTokens,
    hideBridgeInfo,
    hideOrdersTable,
    disableTradeWhenPriceImpactIsUnknown,
    disableTradeWhenPriceImpactIsHigherThan,
  }

  const rawParamsObject = useMemo(() => {
    if (!rawParams) return undefined
    try {
      return JSON.parse(rawParams)
    } catch {
      return undefined
    }
  }, [rawParams])

  const computedParams = useWidgetParams(state)

  const params = useMemo(() => {
    const trimmedWidgetAppBaseUrl = widgetAppBaseUrl.trim()

    return {
      ...computedParams,
      images: customImages,
      sounds: customSounds,
      customTokens,
      ...rawParamsObject,
      ...(trimmedWidgetAppBaseUrl ? { baseUrl: trimmedWidgetAppBaseUrl } : null),
      ...window.cowSwapWidgetParams,
    }
  }, [computedParams, customImages, customSounds, customTokens, rawParamsObject, widgetAppBaseUrl])

  const updateWidget = useCallback(() => {
    setIsWidgetDisplayed(false)

    setTimeout(() => setIsWidgetDisplayed(true), 100)
  }, [])

  useEffect(() => {
    setThemeMode(mode)
  }, [setThemeMode, mode])

  // Fire an event to GA when user connect a wallet
  useEffect(() => {
    if (isConnected) {
      cowAnalytics.sendEvent({
        category: AnalyticsCategory.WIDGET_CONFIGURATOR,
        action: 'Connect wallet',
      })
    }
  }, [isConnected, cowAnalytics])

  useSyncWidgetNetwork(chainId, setNetworkControlState, standaloneMode)

  const availableChains = useAvailableChains()

  return (
    <Box
      ref={configuratorRef}
      style={{ [DRAWER_WIDTH_CSS_VAR]: `${drawerWidth}px` } as CSSProperties}
      sx={WrapperStyled}
    >
      {!isDrawerOpen && (
        <IconButton
          aria-label="show drawer"
          onClick={(e) => {
            e.stopPropagation()
            setIsDrawerOpen(true)
          }}
          sx={(theme) => ({
            ...DrawerToggleButtonStyled(theme),
            position: 'fixed',
            top: '1.6rem',
            left: '1.6rem',
          })}
        >
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      )}

      <Drawer sx={(theme) => DrawerStyled(theme)} variant="persistent" anchor="left" open={isDrawerOpen}>
        <ConfiguratorBrandHeader title={title} themeMode={mode} />

        {!IS_IFRAME && (
          <>
            {!standaloneMode && (
              <div style={WalletConnectionWrapper}>
                {/* Attempt 2 at fixing issue on Vercel build (locally it builds fine) */}
                {/* Error: apps/widget-configurator/src/app/configurator/index.tsx:272:17 - error TS2339: Property 'w3m-button' does not exist on type 'JSX.IntrinsicElements'.*/}
                {/* Fix from https://github.com/reown-com/appkit/issues/3093 */}
                {/* @ts-ignore */}
                <w3m-button />
              </div>
            )}
          </>
        )}

        <Stack spacing={1.6} sx={{ width: '100%' }}>
          <AccordionSection title="Basics" defaultExpanded>
            {!IS_IFRAME && <ModeControl value={widgetMode} onChange={selectWidgetMode} />}
            <LocaleControl state={localeState} />
          </AccordionSection>

          <AccordionSection title="Trade setup">
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

          <AccordionSection title="Tokens">
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

          <AccordionSection title="Appearance">
            <ThemeControl />
            <PaletteControl paletteManager={paletteManager} />
            <Divider sx={{ my: 1.6 }} />
            <Stack spacing={1.6}>
              <IframeWidthControl value={iframeWidth} onChange={setIframeWidth} />
              <IframeBackgroundColorControl
                defaultCustomColor={iframeDefaultBackgroundColor}
                value={iframeBackgroundColor}
                onChange={setIframeBackgroundColor}
              />
              <IframeBorderRadiusControl value={iframeBorderRadius} onChange={setIframeBorderRadius} />
            </Stack>
            <Divider sx={{ my: 1.6 }} />
            <Stack spacing={1.6}>
              <WidgetShadowControl value={boxShadow} mode={mode} onChange={setBoxShadow} />
              <WidgetPaddingControl value={widgetPadding} onChange={setWidgetPadding} />
              <WidgetBorderRadiusControl value={widgetBorderRadius} onChange={setWidgetBorderRadius} />
            </Stack>
          </AccordionSection>

          <AccordionSection title="Behavior">
            <BooleanSwitchControl
              checked={disableToastMessages}
              label="Use app toasts"
              helperText="When off, the widget keeps toast messages inside the iframe."
              onChange={setToastMessagesInDappMode}
            />
            <BooleanSwitchControl
              checked={!disableProgressBar}
              label="Show progress bar"
              onChange={setShowProgressBar}
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

          <AccordionSection title="Deadlines">
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

          <AccordionSection title="Integrations">
            <PartnerFeeControl feeBpsState={partnerFeeBpsState} />
          </AccordionSection>

          <AccordionSection title="Customization">
            <CustomImagesControl state={customImagesState} />
            <CustomSoundsControl state={customSoundsState} />
          </AccordionSection>

          <AccordionSection title="Advanced">
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
              value={rawParams}
              onChange={(e) => setRawParams(e.target.value)}
              size="medium"
            />
          </AccordionSection>
        </Stack>

        <Button sx={{ width: '100%' }} variant="contained" onClick={updateWidget}>
          Update widget
        </Button>

        {isDrawerOpen && (
          <IconButton
            aria-label="hide drawer"
            onClick={() => setIsDrawerOpen(false)}
            sx={(theme) => ({
              ...DrawerToggleButtonStyled(theme),
              width: '3.2rem',
              height: '3.2rem',
              position: 'absolute',
              top: '1.8rem',
              right: '1.2rem',
            })}
          >
            <KeyboardDoubleArrowLeftIcon />
          </IconButton>
        )}

        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          {LINKS.map(({ label, icon, url, onClick }) => (
            <ListItemButton
              key={label}
              component={onClick ? 'button' : 'a'}
              href={onClick ? undefined : url}
              target={onClick ? undefined : '_blank'}
              rel={onClick ? undefined : 'noopener noreferrer'}
              onClick={onClick}
              sx={{ width: '100%' }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>

        <Box aria-label="Resize sidebar" onPointerDown={handleResizeStart} role="separator" sx={ResizeHandleStyled} />
      </Drawer>

      <Box sx={ContentStyled}>
        {params && (
          <>
            <EmbedDialog
              params={params}
              defaultPalette={defaultPalette}
              open={dialogOpen}
              handleClose={handleDialogClose}
            />
            {isWidgetDisplayed && (
              <CowSwapWidget
                params={params}
                provider={!IS_IFRAME && !standaloneMode ? provider : undefined}
                listeners={listeners}
              />
            )}
          </>
        )}
      </Box>

      <Fab
        color="primary"
        size="large"
        variant="extended"
        sx={{ position: 'fixed', bottom: '2rem', right: '1.6rem' }}
        onClick={() => handleDialogOpen()}
      >
        <CodeIcon sx={{ mr: 1 }} />
        View Embed Code
      </Fab>
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
