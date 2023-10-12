import * as React from 'react'
import { ColorModeContext } from '../../main'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { ContentStyled, DrawerStyled, WrapperStyled } from './styled'
import Button from '@mui/material/Button'
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

const NetworkOptions = ['Ethereum', 'Gnosis Chain']
const TokenOptions = ['COW', 'USDC']

export function Configurator({ title }: { title: string }) {
  const theme = useTheme()
  const { mode, toggleColorMode, setAutoMode } = React.useContext(ColorModeContext)

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true)

  const handleThemeChange = (event: SelectChangeEvent) => {
    const selectedTheme = event.target.value
    if (selectedTheme === 'auto') {
      setAutoMode()
    } else {
      toggleColorMode()
    }
  }

  const [tradeModes, setTradeModes] = React.useState<TradeMode[]>([TradeMode.Swap, TradeMode.Limit, TradeMode.TWAP])
  const handleTradeModeChange = (event: SelectChangeEvent<TradeMode[]>) => {
    setTradeModes(event.target.value as TradeMode[])
  }

  const [network, setNetwork] = React.useState<string | null>(NetworkOptions[0])
  const [networkInput, setNetworkInput] = React.useState(NetworkOptions[0])

  const [sellToken, setSellToken] = React.useState<string | null>(TokenOptions[0])
  const [sellTokenInput, setSellTokenInput] = React.useState(TokenOptions[0])
  const [buyToken, setBuyToken] = React.useState<string | null>(TokenOptions[0])
  const [buyTokenInput, setBuyTokenInput] = React.useState(TokenOptions[1])

  return (
    <Box sx={WrapperStyled}>
      <Drawer sx={DrawerStyled} variant="persistent" anchor="left" open={isDrawerOpen}>
        <Typography variant="h6" sx={{ width: '100%', textAlign: 'center', margin: '0 0 1.6rem', fontWeight: 'bold' }}>
          {title}
        </Typography>

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

        <Divider />

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
          value={network}
          onChange={(event: any, newValue: string | null) => {
            setNetwork(newValue)
          }}
          inputValue={networkInput}
          onInputChange={(event, newInputValue) => {
            setNetworkInput(newInputValue)
          }}
          id="controllable-states-demo"
          options={NetworkOptions}
          size="small"
          renderInput={(params) => <TextField {...params} label="Network" />}
        />

        <Divider />

        <Autocomplete
          value={sellToken}
          onChange={(event: any, newValue: string | null) => {
            setSellToken(newValue)
          }}
          inputValue={sellTokenInput}
          onInputChange={(event, newInputValue) => {
            setSellTokenInput(newInputValue)
          }}
          id="controllable-states-demo"
          options={TokenOptions}
          size="small"
          renderInput={(params) => <TextField {...params} label="Sell Token" />}
        />

        <TextField id="input-sellAmount" label="Sell amount" defaultValue="100000" size="small" />

        <Autocomplete
          value={buyToken}
          onChange={(event: any, newValue: string | null) => {
            setBuyToken(newValue)
          }}
          inputValue={buyTokenInput}
          onInputChange={(event, newInputValue) => {
            setBuyTokenInput(newInputValue)
          }}
          id="buy-token-autocomplete"
          options={TokenOptions}
          renderInput={(params) => <TextField {...params} label="Buy Token" size="small" />}
        />

        <TextField id="input-buyAmount" label="Buy amount" defaultValue="100000" size="small" />

        <Button variant="contained">Update</Button>

        <EmbedDialog />

        <Link href="#hide" onClick={() => setIsDrawerOpen(false)}>
          Hide configurator
        </Link>

        <Button variant="contained" onClick={toggleColorMode}>
          Toggle to {theme.palette.mode === 'dark' ? 'Light' : 'Dark'} Mode
        </Button>
      </Drawer>

      <Box sx={ContentStyled}>
        <iframe
          src="https://swap-dev-git-widget-ui-5b-cowswap.vercel.app/#/1/widget/swap/COW/WETH?sellAmount=1200&theme=light"
          width="400px"
          height="640px"
          title="widget"
        />
      </Box>
    </Box>
  )
}
