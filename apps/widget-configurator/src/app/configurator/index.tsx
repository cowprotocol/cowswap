import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react'

import WalletIcon from '@mui/icons-material/Wallet'
import LoadingButton from '@mui/lab/LoadingButton'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { AttachIframeResizer } from './attachIframeResizer'
import { NetworkControl, NetworkOption, NetworkOptions } from './controls/NetworkControl'
import { ThemeControl } from './controls/ThemeControl'
import { TradeModesControl } from './controls/TradeModesControl'
import { EmbedDialog } from './embedDialog'
import { ContentStyled, DrawerStyled, WrapperStyled } from './styled'

import { ColorModeContext } from '../../theme/ColorModeContext'

const TokenOptions = ['COW', 'USDC']

export function Configurator({ title }: { title: string }) {
  const { mode } = useContext(ColorModeContext)

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const networkControlState = useState<NetworkOption>(NetworkOptions[0])
  const [network] = networkControlState
  const [sellToken, setSellToken] = useState<string | null>(TokenOptions[0])
  const [sellTokenAmount, setSellTokenAmount] = useState<number>(100000)
  const [buyToken, setBuyToken] = useState<string | null>(TokenOptions[0])
  const [buyTokenAmount, setBuyTokenAmount] = useState<number>(100000)

  const [iframeURL, setIframeURL] = useState<string>('')

  const constructIframeURL = useCallback(() => {
    if (network) {
      return `http://localhost:3000/#/${network.chainID}/widget/swap/${sellToken}/${buyToken}?sellAmount=${sellTokenAmount}&buyAmount=${buyTokenAmount}&theme=${mode}`
    }
    return ''
  }, [sellToken, buyToken, sellTokenAmount, buyTokenAmount, mode, network])

  useEffect(() => {
    setIframeURL(constructIframeURL())
  }, [constructIframeURL, network])

  const handleWidgetRefreshClick = () => {
    const newIframeURL = constructIframeURL()
    setIframeURL(newIframeURL)
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

        <TradeModesControl />

        <NetworkControl state={networkControlState} />

        <Divider variant="middle">Token selection</Divider>

        <Autocomplete
          value={sellToken}
          onChange={(event: ChangeEvent<unknown>, newValue: string | null) => {
            setSellToken(newValue || '')
          }}
          inputValue={sellToken || ''}
          onInputChange={(event: ChangeEvent<unknown>, newInputValue: string) => {
            setSellToken(newInputValue)
          }}
          id="controllable-states-selling-token"
          options={TokenOptions}
          size="small"
          renderInput={(params) => <TextField {...params} label="Sell Token" />}
        />

        <TextField
          id="input-sellTokenAmount"
          label="Sell amount"
          value={sellTokenAmount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSellTokenAmount(Number(e.target.value))}
          size="small"
        />

        <Autocomplete
          value={buyToken}
          onChange={(event: ChangeEvent<unknown>, newValue: string | null) => {
            setBuyToken(newValue || '')
          }}
          inputValue={buyToken || ''}
          onInputChange={(event, newInputValue) => {
            setBuyTokenAmount(Number(newInputValue))
          }}
          id="buy-token-autocomplete"
          options={TokenOptions}
          renderInput={(params) => <TextField {...params} label="Buy Token" size="small" />}
        />

        <TextField
          id="input-buyTokenAmount"
          label="Buy amount"
          value={buyTokenAmount}
          onChange={(e) => setBuyTokenAmount(Number(e.target.value))}
          size="small"
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
        <iframe id="cow-widget" src={iframeURL} width="400px" height="640px" title="widget" />

        <Box
          sx={{
            display: 'flex',
            flexFlow: 'column wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '1.6rem 0 0',
            gap: '2.4rem',
            width: '100%',
          }}
        >
          <Typography variant="body2">URL: {iframeURL}</Typography>
          <EmbedDialog />
        </Box>
      </Box>

      <AttachIframeResizer iframeId={'cow-widget'} />
    </Box>
  )
}
