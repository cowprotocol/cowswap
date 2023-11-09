import { useContext, useEffect, useState } from 'react'

import { TradeType } from '@cowprotocol/widget-lib'
import { CowSwapWidget } from '@cowprotocol/widget-react'

import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode'
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

import { TRADE_MODES } from './consts'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { ThemeControl } from './controls/ThemeControl'
import { TradeModesControl } from './controls/TradeModesControl'
import { useProvider } from './hooks/useProvider'
import { useSyncWidgetNetwork } from './hooks/useSyncWidgetNetwork'
import { useWidgetParamsAndSettings } from './hooks/useWidgetParamsAndSettings'
import { ContentStyled, DrawerStyled, WalletConnectionWrapper, WrapperStyled } from './styled'
import { ConfiguratorState } from './types'

import { ColorModeContext } from '../../theme/ColorModeContext'
import { web3Modal } from '../../wagmiConfig'
import { connectWalletToConfigurator } from '../analytics'
import { EmbedDialog } from '../embedDialog'

const DEFAULT_STATE = {
  sellToken: 'COW',
  buyToken: 'USDC',
  sellAmount: 100000,
  buyAmount: 0,
}

const UTM_PARAMS = 'utm_content=cow-widget-configurator&utm_medium=web&utm_source=widget.cow.fi'

const LINKS = [
  { icon: <LanguageIcon />, label: 'Widget web', url: `https://cow.fi/widget/?${UTM_PARAMS}` },
  { icon: <ChromeReaderModeIcon />, label: 'Developer docs', url: `https://docs.cow.fi/?${UTM_PARAMS}` },
]

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

  const { isDisconnected, isConnected } = useAccount()
  const network = useNetwork()

  const walletChainId = network.chain?.id

  useSyncWidgetNetwork(chainId, setNetworkControlState)

  const provider = useProvider()

  const state: ConfiguratorState = {
    // Don't change chainId in the widget URL if the user is connected to a wallet
    // Because useSyncWidgetNetwork() will send a request to change the network
    chainId: isDisconnected || !walletChainId ? chainId : walletChainId,
    theme: mode,
    currentTradeType,
    enabledTradeTypes,
    sellToken,
    sellTokenAmount,
    buyToken,
    buyTokenAmount,
  }

  const params = useWidgetParamsAndSettings(provider, state)

  useEffect(() => {
    web3Modal.setThemeMode(mode)
  }, [mode])

  // Fire an event to GA when user connect a wallet
  useEffect(() => {
    if (isConnected) {
      connectWalletToConfigurator()
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
          style={{ position: 'fixed', bottom: '1.6rem', left: '1.6rem' }}
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

        <TradeModesControl state={tradeModesState} />

        <CurrentTradeTypeControl state={tradeTypeState} />

        <NetworkControl state={networkControlState} />

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
            style={{ position: 'fixed', top: '1.3rem', left: '26.7rem' }}
          >
            <KeyboardDoubleArrowLeftIcon />
          </Fab>
        )}

        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          {LINKS.map(({ label, icon, url }) => (
            <ListItemButton key={label} component="a" href={url}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={ContentStyled}>
        {params && (
          <>
            <EmbedDialog params={params} />
            <br />
            <CowSwapWidget provider={provider} params={params} />
          </>
        )}
      </Box>
    </Box>
  )
}
