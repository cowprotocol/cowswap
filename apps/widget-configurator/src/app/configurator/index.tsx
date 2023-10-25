import { useContext, useMemo, useState } from 'react'

import WalletIcon from '@mui/icons-material/Wallet'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { AttachIframeResizer } from './attachIframeResizer'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { ThemeControl } from './controls/ThemeControl'
import { TRADE_MODES, TradeMode, TradeModesControl } from './controls/TradeModesControl'
import { DrawerStyled, WrapperStyled } from './styled'
import { buildIframeUrl } from './utils/buildIframeUrl'

import { ColorModeContext } from '../../theme/ColorModeContext'
import { WidgetIframe } from '../WidgetIframe'

const iframeId = 'cow-widget'
const DEFAULT_STATE = {
  sellToken: 'COW',
  buyToken: 'USDC',
  sellAmount: 100000,
  buyAmount: 0,
}

export function Configurator({ title }: { title: string }) {
  const { mode, setMode } = useContext(ColorModeContext)

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const networkControlState = useState<NetworkOption>(NetworkOptions[0])
  const [{ chainId }] = networkControlState

  // TODO: bind to iframe
  const tradeModesState = useState<TradeMode[]>(TRADE_MODES)

  const sellTokenState = useState<string>(DEFAULT_STATE.sellToken)
  const sellTokenAmountState = useState<number>(DEFAULT_STATE.sellAmount)
  const [sellToken, setSellToken] = sellTokenState
  const [sellTokenAmount, setSellTokenAmount] = sellTokenAmountState

  const buyTokenState = useState<string>(DEFAULT_STATE.buyToken)
  const buyTokenAmountState = useState<number>(DEFAULT_STATE.buyAmount)
  const [buyToken, setBuyToken] = buyTokenState
  const [buyTokenAmount, setBuyTokenAmount] = buyTokenAmountState

  const iframeUrl = useMemo(() => {
    return buildIframeUrl({
      chainId,
      sellTokenId: sellToken,
      sellAmount: sellTokenAmount,
      buyTokenId: buyToken,
      buyAmount: buyTokenAmount,
      theme: mode,
    })
  }, [chainId, sellToken, sellTokenAmount, buyToken, buyTokenAmount, mode])

  const handleWidgetRefreshClick = () => {
    setMode('light')
    setSellToken(DEFAULT_STATE.sellToken)
    setSellTokenAmount(DEFAULT_STATE.sellAmount)

    setBuyToken(DEFAULT_STATE.buyToken)
    setBuyTokenAmount(DEFAULT_STATE.buyAmount)
  }

  return (
    <Box sx={WrapperStyled}>
      <Drawer sx={DrawerStyled} variant="persistent" anchor="left" open={isDrawerOpen}>
        <Typography variant="h6" sx={{ width: '100%', textAlign: 'center', margin: '0 0 1.6rem', fontWeight: 'bold' }}>
          {title}
        </Typography>

        <Divider variant="middle">Wallet</Divider>

        <LoadingButton
          loading={false}
          loadingPosition="start"
          startIcon={<WalletIcon />}
          variant="contained"
          onClick={handleWidgetRefreshClick}
        >
          Connect
        </LoadingButton>

        <Divider variant="middle">General</Divider>

        <ThemeControl />

        <TradeModesControl state={tradeModesState} />

        <NetworkControl state={networkControlState} />

        <Divider variant="middle">Token selection</Divider>

        <CurrencyInputControl
          label="Sell token"
          tokenIdState={sellTokenState}
          tokenAmountState={sellTokenAmountState}
        />

        <CurrencyInputControl label="Buy token" tokenIdState={buyTokenState} tokenAmountState={buyTokenAmountState} />

        <Divider variant="middle" />

        {/* <LoadingButton loading={false} loadingPosition="start" startIcon={<SaveIcon />} variant="contained" onClick={handleWidgetRefreshClick}>
          Refresh Widget
        </LoadingButton> */}

        <Link href="#hide" onClick={() => setIsDrawerOpen(false)}>
          Hide drawer
        </Link>
      </Drawer>

      <WidgetIframe id={iframeId} src={iframeUrl} />

      <AttachIframeResizer iframeId={iframeId} />
    </Box>
  )
}
