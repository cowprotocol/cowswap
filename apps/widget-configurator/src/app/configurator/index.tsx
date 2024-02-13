import { useContext, useEffect, useState } from 'react'

import { CowEventListeners, CowEvents, ToastMessageType } from '@cowprotocol/events'
import { TradeType } from '@cowprotocol/widget-lib'
import { CowSwapWidget } from '@cowprotocol/widget-react'

import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode'
import CodeIcon from '@mui/icons-material/Code'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import LanguageIcon from '@mui/icons-material/Language'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useAccount, useNetwork } from 'wagmi'

import { DEFAULT_TOKEN_LISTS, TRADE_MODES } from './consts'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { PaletteControl } from './controls/PaletteControl'
import { ThemeControl } from './controls/ThemeControl'
import { TokenListControl } from './controls/TokenListControl' // Adjust the import path as needed
import { TradeModesControl } from './controls/TradeModesControl'
import { useColorPaletteManager } from './hooks/useColorPaletteManager'
import { useEmbedDialogState } from './hooks/useEmbedDialogState'
import { useProvider } from './hooks/useProvider'
import { useSyncWidgetNetwork } from './hooks/useSyncWidgetNetwork'
import { useWidgetParamsAndSettings } from './hooks/useWidgetParamsAndSettings'
import { ContentStyled, DrawerStyled, WalletConnectionWrapper, WrapperStyled } from './styled'
import { ConfiguratorState, TokenListItem } from './types'

import { ColorModeContext } from '../../theme/ColorModeContext'
import { web3Modal } from '../../wagmiConfig'
import { connectWalletToConfiguratorGA } from '../analytics'
import { EmbedDialog } from '../embedDialog'

const DEFAULT_STATE = {
  sellToken: 'USDC',
  buyToken: 'COW',
  sellAmount: 100000,
  buyAmount: 0,
}

const COW_LISTENERS: CowEventListeners = [
  {
    event: CowEvents.ON_TOAST_MESSAGE,
    handler: (event) => {
      console.log('[TODO:remove] 🍞 Toast message', event.message, event.data)

      // You can provide a simplistic way to handle toast messages (use the "message" to show it in your app)
      if (event.messageType === ToastMessageType.SWAP_ETH_FLOW_SENT_TX) {
        console.error('[TODO:remove] 🍞 Toast message: New eth flow order', event.data.tx)
      }

      // ...or you can do handle them your way using the data:
      switch (event.messageType) {
        case ToastMessageType.SWAP_ETH_FLOW_SENT_TX:
          console.error('[TODO:remove] 🍞 Toast message: New eth flow order. Tx: ', event.data.tx)
          break
        case ToastMessageType.SWAP_POSTED_API:
          console.warn('[TODO:remove] 🍞 Toast message: Posted order', event.data.orderUid)
          break
        // ... and so on
        default:
          console.error('[TODO:remove] 🍞 Toast message: Default', event.message)
      }
    },
  },

  {
    event: CowEvents.ON_POSTED_ORDER,
    handler: (event) => console.log('[TODO:remove] 💌 Posted order: ', event.orderUid),
  },

  {
    event: CowEvents.ON_CANCELLED_ORDER,
    handler: (event) => console.log(`[TODO:remove] ❌ Cancelled order ${event.orderUid}. Reason: ${event.reason}`),
  },

  {
    event: CowEvents.ON_EXECUTED_ORDER,
    handler: (event) => console.log(`[TODO:remove] ✅ Executed order ${event.orderUid}`),
  },
]

const UTM_PARAMS = 'utm_content=cow-widget-configurator&utm_medium=web&utm_source=widget.cow.fi'

export function Configurator({ title }: { title: string }) {
  const { mode } = useContext(ColorModeContext)

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

  const tokenListsState = useState<TokenListItem[]>(DEFAULT_TOKEN_LISTS)
  const [tokenLists] = tokenListsState

  const paletteManager = useColorPaletteManager(mode)
  const { colorPalette, defaultPalette } = paletteManager

  const { dialogOpen, handleDialogClose, handleDialogOpen } = useEmbedDialogState()

  const LINKS = [
    { icon: <CodeIcon />, label: 'View embed code', onClick: () => handleDialogOpen() },
    { icon: <LanguageIcon />, label: 'Widget web', url: `https://cow.fi/widget/?${UTM_PARAMS}` },
    {
      icon: <ChromeReaderModeIcon />,
      label: 'Developer docs',
      url: `https://docs.cow.fi/cow-protocol/tutorials/widget?${UTM_PARAMS}`,
    },
  ]

  const { isDisconnected, isConnected } = useAccount()
  const network = useNetwork()

  const walletChainId = network.chain?.id

  useSyncWidgetNetwork(chainId, setNetworkControlState)

  const provider = useProvider()

  // Don't change chainId in the widget URL if the user is connected to a wallet
  // Because useSyncWidgetNetwork() will send a request to change the network
  const state: ConfiguratorState = {
    chainId: isDisconnected || !walletChainId ? chainId : walletChainId,
    theme: mode,
    currentTradeType,
    enabledTradeTypes,
    sellToken,
    sellTokenAmount,
    buyToken,
    buyTokenAmount,
    tokenLists,
    customColors: colorPalette,
    defaultColors: defaultPalette,
  }

  const params = useWidgetParamsAndSettings(provider, state)

  useEffect(() => {
    web3Modal.setThemeMode(mode)
  }, [mode])

  // Fire an event to GA when user connect a wallet
  useEffect(() => {
    if (isConnected) {
      connectWalletToConfiguratorGA()
    }
  }, [isConnected])

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

        <div style={WalletConnectionWrapper}>
          <w3m-button />
        </div>

        <ThemeControl />

        <PaletteControl paletteManager={paletteManager} />

        <TradeModesControl state={tradeModesState} />

        <CurrentTradeTypeControl state={tradeTypeState} />

        <NetworkControl state={networkControlState} />

        <TokenListControl tokenListsState={tokenListsState} />

        <Divider variant="middle">Token selection</Divider>

        <CurrencyInputControl
          label="Sell token"
          tokenIdState={sellTokenState}
          tokenAmountState={sellTokenAmountState}
        />

        <CurrencyInputControl label="Buy token" tokenIdState={buyTokenState} tokenAmountState={buyTokenAmountState} />

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

      <Box sx={ContentStyled}>
        {params && provider && (
          <>
            <EmbedDialog
              params={params}
              defaultPalette={defaultPalette}
              open={dialogOpen}
              handleClose={handleDialogClose}
            />
            <br />
            <CowSwapWidget provider={provider} params={params} listeners={COW_LISTENERS} />
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
    </Box>
  )
}
