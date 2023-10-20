import * as React from 'react'
import { ColorModeContext } from '../../main'
// import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { ContentStyled, DrawerStyled, WrapperStyled } from './styled'
// import Button from '@mui/material/Button'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Divider from '@mui/material/Divider'
import EmbedDialog from './embedDialog'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
// import SaveIcon from '@mui/icons-material/Save'
import WalletIcon from '@mui/icons-material/Wallet'
import LoadingButton from '@mui/lab/LoadingButton'

enum TradeMode {
  Swap = 1,
  Limit = 2,
  TWAP = 3,
}

const ThemeOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const TradeModeOptions = [
  { label: 'Swap', value: TradeMode.Swap },
  { label: 'Limit', value: TradeMode.Limit },
  { label: 'TWAP', value: TradeMode.TWAP },
]

const NetworkOptions = [
  { chainID: 1, label: 'Ethereum' },
  { chainID: 100, label: 'Gnosis Chain' },
]

const TokenOptions = ['COW', 'USDC']

export function Configurator({ title }: { title: string }) {
  // const theme = useTheme()
  const { mode, toggleColorMode, setAutoMode } = React.useContext(ColorModeContext)

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true)

  const handleThemeChange = (event: SelectChangeEvent) => {
    const selectedTheme = event.target.value
    if (selectedTheme === 'auto') {
      setAutoMode()
    } else {
      toggleColorMode()
    }

    const url = new URL(iframeURL)
    url.searchParams.set('theme', selectedTheme)
    setIframeURL(url.toString())
  }

  const [tradeModes, setTradeModes] = React.useState<TradeMode[]>([TradeMode.Swap, TradeMode.Limit, TradeMode.TWAP])
  const handleTradeModeChange = (event: SelectChangeEvent<TradeMode[]>) => {
    setTradeModes(event.target.value as TradeMode[])
  }

  const [network, setNetwork] = React.useState<{ chainID: number; label: string } | null>(NetworkOptions[0])
  const [sellToken, setSellToken] = React.useState<string | null>(TokenOptions[0])
  const [sellTokenAmount, setSellTokenAmount] = React.useState<number>(100000)
  const [buyToken, setBuyToken] = React.useState<string | null>(TokenOptions[0])
  const [buyTokenAmount, setBuyTokenAmount] = React.useState<number>(100000)

  const [iframeURL, setIframeURL] = React.useState<string>('')

  const constructIframeURL = React.useCallback(() => {
    if (network) {
      return `https://swap-dev-git-widget-ui-6-cowswap.vercel.app/#/${network.chainID}/widget/swap/${sellToken}/${buyToken}?sellAmount=${sellTokenAmount}&buyAmount=${buyTokenAmount}&theme=${mode}`
    }
    return ''
  }, [sellToken, buyToken, sellTokenAmount, buyTokenAmount, mode, network])

  React.useEffect(() => {
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

        <FormControl sx={{ width: '100%' }}>
          <InputLabel id="select-theme">Theme</InputLabel>
          <Select
            labelId="select-theme-label"
            id="select-theme"
            value={mode}
            onChange={handleThemeChange}
            autoWidth
            label="Theme"
            size="small"
          >
            {ThemeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: '100%' }}>
          <InputLabel id="trade-mode-label">Trade Modes</InputLabel>
          <Select
            labelId="trade-mode-label"
            id="trade-mode-select"
            multiple
            size="small"
            value={tradeModes}
            onChange={handleTradeModeChange}
            input={<OutlinedInput id="trade-mode-select-outlined" label="Available trade modes" />}
            renderValue={(selected) =>
              (selected as number[])
                .map((value) => {
                  const option = TradeModeOptions.find((option) => option.value === value)
                  return option ? option.label : ''
                })
                .join(', ')
            }
          >
            {TradeModeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={tradeModes.indexOf(option.value) > -1} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          value={network || NetworkOptions[0]}
          onChange={(event: any, newValue: { chainID: number; label: string } | null) => {
            setNetwork(newValue || NetworkOptions[0])
          }}
          getOptionLabel={(option) => option.label}
          id="controllable-states-network"
          options={NetworkOptions}
          size="small"
          renderInput={(params) => <TextField {...params} label="Network" />}
        />

        <Divider variant="middle">Token selection</Divider>

        <Autocomplete
          value={sellToken}
          onChange={(event: any, newValue: string | null) => {
            setSellToken(newValue)
          }}
          inputValue={sellToken || ''}
          onInputChange={(event, newInputValue) => {
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
          onChange={(e) => setSellTokenAmount(Number(e.target.value))}
          size="small"
        />

        <Autocomplete
          value={buyToken}
          onChange={(event: any, newValue: string | null) => {
            setBuyToken(newValue)
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
        <iframe src={iframeURL} width="400px" height="640px" title="widget" />

        <Box
          sx={{
            display: 'flex',
            flexFlow: 'column wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '1.6rem 0 0',
            gap: '2.4rem',
          }}
        >
          <Typography variant="body2">URL: {iframeURL}</Typography>
          <EmbedDialog />
        </Box>
      </Box>
    </Box>
  )
}
