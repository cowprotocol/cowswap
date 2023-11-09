import { useContext, useEffect, useState } from 'react'

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

import { TRADE_MODES } from './consts'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { ThemeControl } from './controls/ThemeControl'
import { TradeModesControl } from './controls/TradeModesControl'
import { useEmbedDialogState } from './hooks/useEmbedDialogState'
import { useProvider } from './hooks/useProvider'
import { useSyncWidgetNetwork } from './hooks/useSyncWidgetNetwork'
import { useWidgetParamsAndSettings } from './hooks/useWidgetParamsAndSettings'
import { ContentStyled, DrawerStyled, WalletConnectionWrapper, WrapperStyled } from './styled'
import { ConfiguratorState } from './types'

import { ColorModeContext } from '../../theme/ColorModeContext'
import { web3Modal } from '../../wagmiConfig'
import { connectWalletToConfiguratorGA } from '../analytics'
import { EmbedDialog } from '../embedDialog'

const DEFAULT_STATE = {
  sellToken: 'COW',
  buyToken: 'USDC',
  sellAmount: 100000,
  buyAmount: 0,
}

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

  const { dialogOpen, handleDialogClose, handleDialogOpen } = useEmbedDialogState()

  const LINKS = [
    { icon: <CodeIcon />, label: 'View embed code', onClick: () => handleDialogOpen() },
    { icon: <LanguageIcon />, label: 'Widget web', url: `https://cow.fi/widget/?${UTM_PARAMS}` },
    { icon: <ChromeReaderModeIcon />, label: 'Developer docs', url: `https://docs.cow.fi/?${UTM_PARAMS}` },
  ]

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
          {LINKS.map(({ label, icon, url, onClick }) => (
            <ListItemButton
              key={label}
              component={onClick ? 'button' : 'a'}
              href={onClick ? undefined : url}
              target={onClick ? undefined : '_blank'}
              rel={onClick ? undefined : 'noopener noreferrer'}
              onClick={onClick}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={ContentStyled}>
        {params && (
          <>
            <EmbedDialog params={params} open={dialogOpen} handleClose={handleDialogClose} />
            <br />
            <CowSwapWidget provider={provider} params={params} />
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
