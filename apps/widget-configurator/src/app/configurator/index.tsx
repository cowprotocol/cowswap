import { ChangeEvent, useContext, useEffect, useMemo, useState } from 'react'

import { CowEventListeners } from '@cowprotocol/events'
import { CowSwapWidgetParams, TradeType, TokenInfo } from '@cowprotocol/widget-lib'
import { CowSwapWidget } from '@cowprotocol/widget-react'

import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import LanguageIcon from '@mui/icons-material/Language'
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Snackbar, IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useWeb3ModalAccount, useWeb3ModalTheme } from '@web3modal/ethers5/react'

import { COW_LISTENERS, DEFAULT_PARTNER_FEE_RECIPIENT, DEFAULT_TOKEN_LISTS, TRADE_MODES, IS_IFRAME } from './consts'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { CustomImagesControl } from './controls/CustomImagesControl'
import { CustomSoundsControl } from './controls/CustomSoundsControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { PaletteControl } from './controls/PaletteControl'
import { PartnerFeeControl } from './controls/PartnerFeeControl'
import { ThemeControl } from './controls/ThemeControl'
import { TokenListControl } from './controls/TokenListControl' // Adjust the import path as needed
import { TradeModesControl } from './controls/TradeModesControl'
import { useColorPaletteManager } from './hooks/useColorPaletteManager'
import { useEmbedDialogState } from './hooks/useEmbedDialogState'
import { useProvider } from './hooks/useProvider'
import { useSyncWidgetNetwork } from './hooks/useSyncWidgetNetwork'
import { useToastsManager } from './hooks/useToastsManager'
import { useWidgetParams } from './hooks/useWidgetParamsAndSettings'
import { ContentStyled, DrawerStyled, WalletConnectionWrapper, WrapperStyled } from './styled'
import { ConfiguratorState, TokenListItem } from './types'

import { ColorModeContext } from '../../theme/ColorModeContext'
import { connectWalletToConfiguratorGA } from '../analytics'
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

export function Configurator({ title }: { title: string }) {
  const { setThemeMode } = useWeb3ModalTheme()
  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount()
  const provider = useProvider()

  const [listeners, setListeners] = useState<CowEventListeners>(COW_LISTENERS)
  const { mode } = useContext(ColorModeContext)

  const [widgetMode, setWidgetMode] = useState<WidgetMode>('dapp')
  const standaloneMode = widgetMode === 'standalone'

  const selectWidgetMode = (event: ChangeEvent<HTMLInputElement>) => {
    setWidgetMode(event.target.value as WidgetMode)
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const networkControlState = useState<NetworkOption>(NetworkOptions[0])
  const [{ chainId }, setNetworkControlState] = networkControlState

  const tradeTypeState = useState<TradeType>(TRADE_MODES[0])
  const [currentTradeType] = tradeTypeState

  const tradeModesState = useState<TradeType[]>(TRADE_MODES)
  const [enabledTradeTypes] = tradeModesState

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
  const [tokenListUrls] = tokenListUrlsState
  const [customTokens] = customTokensState

  const partnerFeeBpsState = useState<number>(0)
  const [partnerFeeBps] = partnerFeeBpsState

  const customImagesState = useState<CowSwapWidgetParams['images']>({})
  const customSoundsState = useState<CowSwapWidgetParams['sounds']>({})
  const [customImages] = customImagesState
  const [customSounds] = customSoundsState

  const paletteManager = useColorPaletteManager(mode)
  const { colorPalette, defaultPalette } = paletteManager

  const { dialogOpen, handleDialogClose, handleDialogOpen } = useEmbedDialogState()

  const { closeToast, toasts, selectDisableToastMessages, disableToastMessages } = useToastsManager(setListeners)
  const firstToast = toasts?.[0]

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
    chainId: IS_IFRAME ? undefined : !isConnected || !walletChainId ? chainId : walletChainId,
    theme: mode,
    currentTradeType,
    enabledTradeTypes,
    sellToken,
    sellTokenAmount,
    buyToken,
    buyTokenAmount,
    tokenListUrls,
    customColors: colorPalette,
    defaultColors: defaultPalette,
    partnerFeeBps,
    partnerFeeRecipient: DEFAULT_PARTNER_FEE_RECIPIENT,
    standaloneMode,
    disableToastMessages,
  }

  const computedParams = useWidgetParams(state)
  const params = useMemo(
    () => ({
      ...computedParams,
      images: customImages,
      sounds: customSounds,
      customTokens,
      ...window.cowSwapWidgetParams,
    }),
    [computedParams, customImages, customSounds, customTokens]
  )

  useEffect(() => {
    setThemeMode(mode)
  }, [setThemeMode, mode])

  // Fire an event to GA when user connect a wallet
  useEffect(() => {
    if (isConnected) {
      connectWalletToConfiguratorGA()
    }
  }, [isConnected])

  useSyncWidgetNetwork(chainId, setNetworkControlState)

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
                <w3m-button />
              </div>
            )}
          </>
        )}

        <Divider variant="middle">General</Divider>

        <ThemeControl />

        <PaletteControl paletteManager={paletteManager} />

        <TradeModesControl state={tradeModesState} />

        <CurrentTradeTypeControl state={tradeTypeState} />

        {!IS_IFRAME && <NetworkControl state={networkControlState} />}

        <Divider variant="middle">Tokens</Divider>

        <CurrencyInputControl
          label="Sell token"
          tokenIdState={sellTokenState}
          tokenAmountState={sellTokenAmountState}
        />

        <CurrencyInputControl label="Buy token" tokenIdState={buyTokenState} tokenAmountState={buyTokenAmountState} />

        <TokenListControl tokenListUrlsState={tokenListUrlsState} customTokensState={customTokensState} />

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
            <CowSwapWidget
              params={params}
              provider={!IS_IFRAME && !standaloneMode ? provider : undefined}
              listeners={listeners}
            />
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
