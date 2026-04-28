import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK, SupportedLocale } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { CowWidgetEventListeners } from '@cowprotocol/events'
import { CowSwapWidgetParams, TokenInfo, TradeType, WidgetHookEvents } from '@cowprotocol/widget-lib'
import { CowSwapFederatedWidget, CowSwapWidget } from '@cowprotocol/widget-react'

import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import LanguageIcon from '@mui/icons-material/Language'
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Snackbar,
} from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useWeb3ModalAccount, useWeb3ModalTheme } from '@web3modal/ethers5/react'

import { COW_LISTENERS, DEFAULT_TOKEN_LISTS, IS_IFRAME, TRADE_MODES } from './consts'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { CustomImagesControl } from './controls/CustomImagesControl'
import { CustomSoundsControl } from './controls/CustomSoundsControl'
import { DeadlineControl } from './controls/DeadlineControl'
import { LocaleControl } from './controls/LocaleControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { PaletteControl } from './controls/PaletteControl'
import { PartnerFeeControl } from './controls/PartnerFeeControl'
import { ThemeControl } from './controls/ThemeControl'
import { TokenListControl } from './controls/TokenListControl'
import { TradeModesControl } from './controls/TradeModesControl'
import { WidgetHooksControl } from './controls/WidgetHooksControl'
import { useColorPaletteManager } from './hooks/useColorPaletteManager'
import { useEmbedDialogState } from './hooks/useEmbedDialogState'
import { useProvider } from './hooks/useProvider'
import { useSyncWidgetNetwork } from './hooks/useSyncWidgetNetwork'
import { useToastsManager } from './hooks/useToastsManager'
import { useWidgetParams } from './hooks/useWidgetParamsAndSettings'
import { ContentStyled, DrawerStyled, WalletConnectionWrapper, WrapperStyled } from './styled'
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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function Configurator({ title }: { title: string }) {
  const { setThemeMode } = useWeb3ModalTheme()
  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount()
  const provider = useProvider()
  const cowAnalytics = useCowAnalytics()

  const [listeners, setListeners] = useState<CowWidgetEventListeners>(COW_LISTENERS)
  const { mode } = useContext(ColorModeContext)

  const [widgetMode, setWidgetMode] = useState<WidgetMode>('dapp')
  const standaloneMode = widgetMode === 'standalone'
  const [useFederatedWidget, setUseFederatedWidget] = useState(true)
  const toggleFederatedWidget = useCallback(() => setUseFederatedWidget((curr) => !curr), [])

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const selectWidgetMode = (event: ChangeEvent<HTMLInputElement>) => {
    setWidgetMode(event.target.value as WidgetMode)
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

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

  const [rawParams, setRawParams] = useState<string | undefined>()
  const [isWidgetDisplayed, setIsWidgetDisplayed] = useState(true)

  const paletteManager = useColorPaletteManager(mode)
  const { colorPalette, defaultPalette } = paletteManager
  const [boxShadow, setBoxShadow] = useState<string>('')

  const { dialogOpen, handleDialogClose, handleDialogOpen } = useEmbedDialogState()

  const { closeToast, toasts, selectDisableToastMessages, disableToastMessages } = useToastsManager(setListeners)
  const firstToast = toasts?.[0]

  const [disableProgressBar, setDisableProgressBar] = useState<boolean>(false)
  const toggleDisableProgressBar = useCallback(() => setDisableProgressBar((curr) => !curr), [])

  const [disablePostTradeTips, setDisablePostTradeTips] = useState<boolean>(false)
  const toggleDisablePostTradeTips = useCallback(() => setDisablePostTradeTips((curr) => !curr), [])

  const [disableCrossChainSwap, setDisableCrossChainSwap] = useState<boolean>(false)
  const toggleDisableCrossChainSwap = useCallback(() => setDisableCrossChainSwap((curr) => !curr), [])

  const [disableTokenImport, setDisableTokenImport] = useState<boolean>(false)
  const toggleDisableTokenImport = useCallback(() => setDisableTokenImport((curr) => !curr), [])

  const [hideRecentTokens, setHideRecentTokens] = useState<boolean>(false)
  const toggleHideRecentTokens = useCallback(() => setHideRecentTokens((curr) => !curr), [])

  const [hideFavoriteTokens, setHideFavoriteTokens] = useState<boolean>(false)
  const toggleHideFavoriteTokens = useCallback(() => setHideFavoriteTokens((curr) => !curr), [])

  const [hideBridgeInfo, setHideBridgeInfo] = useState<boolean | undefined>(false)
  const toggleHideBridgeInfo = useCallback(() => setHideBridgeInfo((curr) => !curr), [])

  const [hideOrdersTable, setHideOrdersTable] = useState<boolean | undefined>(false)
  const toggleHideOrdersTable = useCallback(() => setHideOrdersTable((curr) => !curr), [])

  const [disableTradeWhenPriceImpactIsUnknown, setDisableTradeWhenPriceImpactIsUnknown] = useState(false)
  const selectBlockUnknownPriceImpact = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDisableTradeWhenPriceImpactIsUnknown(event.target.value === 'true')
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
    boxShadow: boxShadow || undefined,
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
    disablePostTradeTips,
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
  const params = useMemo(
    () => ({
      ...computedParams,
      images: customImages,
      sounds: customSounds,
      customTokens,
      ...rawParamsObject,
      ...window.cowSwapWidgetParams,
    }),
    [computedParams, customImages, customSounds, customTokens, rawParamsObject],
  )

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
    <Box sx={WrapperStyled}>
      {!isDrawerOpen && (
        <Fab
          size="medium"
          color="secondary"
          aria-label="edit"
          onClick={(e) => {
            e.stopPropagation()
            setIsDrawerOpen(true)
          }}
          sx={{ position: 'fixed', bottom: '1.6rem', left: '1.6rem' }}
        >
          <EditIcon />
        </Fab>
      )}

      <Drawer sx={DrawerStyled} variant="persistent" anchor="left" open={isDrawerOpen}>
        <Typography variant="h6" sx={{ width: '100%', textAlign: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>
          {title}
        </Typography>

        {!IS_IFRAME && (
          <>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Mode:</FormLabel>
              <RadioGroup row aria-label="mode" name="mode" value={widgetMode} onChange={selectWidgetMode}>
                <FormControlLabel value="dapp" control={<Radio />} label="Dapp mode" />
                <FormControlLabel value="standalone" control={<Radio />} label="Standalone mode" />
              </RadioGroup>
            </FormControl>
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

        <Divider variant="middle">General</Divider>

        {!IS_IFRAME && (
          <FormControlLabel
            control={<Checkbox checked={useFederatedWidget} onChange={toggleFederatedWidget} />}
            label="Use federated React widget"
          />
        )}

        <ThemeControl />

        <PaletteControl paletteManager={paletteManager} />

        <TextField
          fullWidth
          margin="dense"
          id="boxShadow"
          label="Widget shadow"
          helperText='CSS box-shadow value. Use "none" to disable it.'
          value={boxShadow}
          onChange={(event) => setBoxShadow(event.target.value)}
          size="medium"
        />

        <TradeModesControl state={tradeModesState} />

        <WidgetHooksControl state={widgetHooksState} />

        <CurrentTradeTypeControl state={tradeTypeState} />

        <LocaleControl state={localeState} />

        {!IS_IFRAME && (
          <NetworkControl
            state={networkControlState}
            standaloneMode={standaloneMode}
            availableChains={availableChains}
          />
        )}

        <Divider variant="middle">Tokens</Divider>

        <CurrencyInputControl
          label="Sell token"
          tokenIdState={sellTokenState}
          tokenAmountState={sellTokenAmountState}
        />

        <CurrencyInputControl label="Buy token" tokenIdState={buyTokenState} tokenAmountState={buyTokenAmountState} />

        <TokenListControl tokenListUrlsState={tokenListUrlsState} customTokensState={customTokensState} />

        <Divider variant="middle">Forced Order Deadline</Divider>

        <Typography variant="subtitle1">Global deadline settings</Typography>
        <DeadlineControl label={'Deadline'} deadlineState={deadlineState} />

        <Typography variant="subtitle1">Individual deadline settings</Typography>
        <DeadlineControl label={'Swap'} deadlineState={swapDeadlineState} />
        <DeadlineControl label={'Limit'} deadlineState={limitDeadlineState} />
        <DeadlineControl label={'Advanced'} deadlineState={advancedDeadlineState} />

        <Divider variant="middle">Integrations</Divider>

        <PartnerFeeControl feeBpsState={partnerFeeBpsState} />

        <Divider variant="middle">Customization</Divider>

        <CustomImagesControl state={customImagesState} />

        <CustomSoundsControl state={customSoundsState} />

        <Divider variant="middle">Other settings</Divider>
        <FormControl component="fieldset">
          <FormLabel component="legend">Toast notifications:</FormLabel>
          <RadioGroup
            row
            aria-label="mode"
            name="mode"
            value={disableToastMessages}
            onChange={selectDisableToastMessages}
          >
            <FormControlLabel value="false" control={<Radio />} label="Self-contain in Widget" />
            <FormControlLabel value="true" control={<Radio />} label="Dapp mode" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Progress bar:</FormLabel>
          <RadioGroup row aria-label="mode" name="mode" value={disableProgressBar} onChange={toggleDisableProgressBar}>
            <FormControlLabel value="false" control={<Radio />} label="Show SWAP progress bar" />
            <FormControlLabel value="true" control={<Radio />} label="Hide SWAP progress bar" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Post-trade CoW Swap tips:</FormLabel>
          <RadioGroup
            row
            aria-label="mode"
            name="mode"
            value={disablePostTradeTips}
            onChange={toggleDisablePostTradeTips}
          >
            <FormControlLabel value="false" control={<Radio />} label="Show post-trade tips" />
            <FormControlLabel value="true" control={<Radio />} label="Hide post-trade tips" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Cross-chain swaps:</FormLabel>
          <RadioGroup
            row
            aria-label="mode"
            name="mode"
            value={disableCrossChainSwap}
            onChange={toggleDisableCrossChainSwap}
          >
            <FormControlLabel value="false" control={<Radio />} label="Enable cross-chain swaps" />
            <FormControlLabel value="true" control={<Radio />} label="Disable cross-chain swaps" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Custom tokens and lists:</FormLabel>
          <RadioGroup row aria-label="mode" name="mode" value={disableTokenImport} onChange={toggleDisableTokenImport}>
            <FormControlLabel value="false" control={<Radio />} label="Allow importing custom tokens/lists" />
            <FormControlLabel value="true" control={<Radio />} label="Disable importing custom tokens/lists" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Recent tokens:</FormLabel>
          <RadioGroup row aria-label="mode" name="mode" value={hideRecentTokens} onChange={toggleHideRecentTokens}>
            <FormControlLabel value="false" control={<Radio />} label="Show recent tokens" />
            <FormControlLabel value="true" control={<Radio />} label="Hide recent tokens" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Favorite tokens:</FormLabel>
          <RadioGroup row aria-label="mode" name="mode" value={hideFavoriteTokens} onChange={toggleHideFavoriteTokens}>
            <FormControlLabel value="false" control={<Radio />} label="Show favorite tokens" />
            <FormControlLabel value="true" control={<Radio />} label="Hide favorite tokens" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Hide bridge info:</FormLabel>
          <RadioGroup row aria-label="mode" name="mode" value={hideBridgeInfo} onChange={toggleHideBridgeInfo}>
            <FormControlLabel value="false" control={<Radio />} label="Show bridge info" />
            <FormControlLabel value="true" control={<Radio />} label="Hide bridge info" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Hide orders table:</FormLabel>
          <RadioGroup row aria-label="mode" name="mode" value={hideOrdersTable} onChange={toggleHideOrdersTable}>
            <FormControlLabel value="false" control={<Radio />} label="Show orders table" />
            <FormControlLabel value="true" control={<Radio />} label="Hide orders table" />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">Disable trade when price impact is unknown:</FormLabel>
          <RadioGroup
            row
            aria-label="disable-trade-when-price-impact-is-unknown"
            name="disable-trade-when-price-impact-is-unknown"
            value={disableTradeWhenPriceImpactIsUnknown}
            onChange={selectBlockUnknownPriceImpact}
          >
            <FormControlLabel value="false" control={<Radio />} label="Allow trade" />
            <FormControlLabel value="true" control={<Radio />} label="Disable trade" />
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          margin="dense"
          id="disableTradeWhenPriceImpactIsHigherThan"
          label="Disable trade when price impact is higher than (%)"
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
        <TextField
          fullWidth
          margin="dense"
          id="rawParams"
          label="Raw JSON params"
          value={rawParams}
          onChange={(e) => setRawParams(e.target.value)}
          size="medium"
        />

        <Button sx={{ width: '100%' }} variant="contained" onClick={updateWidget}>
          Update widget
        </Button>

        {isDrawerOpen && (
          <Fab
            size="small"
            color="primary"
            aria-label="hide drawer"
            onClick={() => setIsDrawerOpen(false)}
            sx={{ position: 'fixed', top: '1.3rem', left: '26.7rem' }}
          >
            <KeyboardDoubleArrowLeftIcon />
          </Fab>
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
      </Drawer>

      <Box sx={{ ...ContentStyled, pl: isDrawerOpen ? '290px' : 0 }}>
        {params && (
          <>
            <EmbedDialog
              params={params}
              defaultPalette={defaultPalette}
              open={dialogOpen}
              handleClose={handleDialogClose}
            />
            {isWidgetDisplayed &&
              (useFederatedWidget && !IS_IFRAME ? (
                <CowSwapFederatedWidget
                  params={params}
                  provider={!standaloneMode ? provider : undefined}
                  listeners={listeners}
                  onReady={() => console.log('[configurator:onReady] Federated widget ready')}
                />
              ) : (
                <CowSwapWidget
                  params={params}
                  provider={!IS_IFRAME && !standaloneMode ? provider : undefined}
                  listeners={listeners}
                  onReady={() => console.log('[configurator:onReady] Widget ready')}
                />
              ))}
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
