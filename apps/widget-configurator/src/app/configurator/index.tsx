import { useContext, useEffect, useRef, useState } from 'react'

import {
  cowSwapWidget,
  CowSwapWidgetParams,
  CowSwapWidgetSettings,
  EthereumProvider,
  TradeType,
  UpdateWidgetCallback,
} from '@cowprotocol/widget-lib'

import WalletIcon from '@mui/icons-material/Wallet'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { TRADE_MODES } from './consts'
import { CurrencyInputControl } from './controls/CurrencyInputControl'
import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { ThemeControl } from './controls/ThemeControl'
import { TradeModesControl } from './controls/TradeModesControl'
import { useProvider } from './hooks/useProvider'
import { DrawerStyled, WrapperStyled, ContentStyled } from './styled'

import { ColorModeContext } from '../../theme/ColorModeContext'

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

  const tradeTypeState = useState<TradeType>(TRADE_MODES[0])
  const [currentTradeType] = tradeTypeState

  const tradeModesState = useState<TradeType[]>(TRADE_MODES)
  const [enabledTradeTypes] = tradeModesState

  const sellTokenState = useState<string>(DEFAULT_STATE.sellToken)
  const sellTokenAmountState = useState<number>(DEFAULT_STATE.sellAmount)
  const [sellToken, setSellToken] = sellTokenState
  const [sellTokenAmount, setSellTokenAmount] = sellTokenAmountState

  const buyTokenState = useState<string>(DEFAULT_STATE.buyToken)
  const buyTokenAmountState = useState<number>(DEFAULT_STATE.buyAmount)
  const [buyToken, setBuyToken] = buyTokenState
  const [buyTokenAmount, setBuyTokenAmount] = buyTokenAmountState

  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const updateWidgetRef = useRef<UpdateWidgetCallback | null>(null)

  const [isDynamicHeightEnabled, setDynamicHeightEnabled] = useState(true)

  const provider = useProvider()
  const providerRef = useRef<EthereumProvider | null>()

  useEffect(() => {
    const widgetContainer = iframeContainerRef.current

    if (!widgetContainer) return

    const params: CowSwapWidgetParams = {
      container: widgetContainer,
      metaData: { appKey: 'YOUR_APP_ID', url: 'https://YOUR_APP_URL' },
      width: 400,
      height: 640,
      provider: provider,
    }

    const settings: CowSwapWidgetSettings = {
      urlParams: {
        theme: mode,
        chainId,
        env: 'local',
        tradeType: currentTradeType,
        tradeAssets: {
          sell: { asset: sellToken, amount: sellTokenAmount ? sellTokenAmount.toString() : undefined },
          buy: { asset: buyToken, amount: buyTokenAmount.toString() },
        },
      },
      appParams: {
        dynamicHeightEnabled: isDynamicHeightEnabled,
        enabledTradeTypes,
      },
    }

    // Re-initialize widget when provider is changed
    if (provider && providerRef.current !== provider) {
      updateWidgetRef.current = null
    }

    if (updateWidgetRef.current) {
      updateWidgetRef.current(settings)
    } else {
      updateWidgetRef.current = cowSwapWidget(params, settings)
    }
  }, [
    provider,
    chainId,
    enabledTradeTypes,
    sellToken,
    sellTokenAmount,
    buyToken,
    buyTokenAmount,
    mode,
    currentTradeType,
    isDynamicHeightEnabled,
  ])

  useEffect(() => {
    providerRef.current = provider
  }, [provider])

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
          <w3m-button />
        </LoadingButton>

        <Divider variant="middle">General</Divider>

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

        <Divider variant="middle">Advanced</Divider>

        <FormControlLabel
          control={
            <Checkbox checked={isDynamicHeightEnabled} onChange={(e) => setDynamicHeightEnabled(e.target.checked)} />
          }
          label="Dynamic widget height"
        />

        <Divider variant="middle" />

        {/* <LoadingButton loading={false} loadingPosition="start" startIcon={<SaveIcon />} variant="contained" onClick={handleWidgetRefreshClick}>
          Refresh Widget
        </LoadingButton> */}

        <Link href="#hide" onClick={() => setIsDrawerOpen(false)}>
          Hide drawer
        </Link>
      </Drawer>

      <Box sx={ContentStyled}>
        <div ref={iframeContainerRef}></div>
      </Box>
    </Box>
  )
}
