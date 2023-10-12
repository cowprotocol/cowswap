import * as React from 'react'
import Box from '@mui/material/Box'
import { ContentStyled, DrawerStyled, WrapperStyled } from './styled'
import Button from '@mui/material/Button'
import InputLabel from '@mui/material/InputLabel'
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
import { ColorModeContext } from '../../main';
import { useTheme } from '@mui/material/styles';

export function Configurator({ title }: { title: string }) {
  const [activeTheme, setActiveTheme] = React.useState('1')
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true)

  const handleChange = (event: SelectChangeEvent) => {
    setActiveTheme(event.target.value)
  }

  enum Theme {
    Auto = 1,
    Light = 2,
    Dark = 3,
  }

  const NetworkOptions = ['Ethereum', 'Gnosis Chain']

  const [network, setNetwork] = React.useState<string | null>(NetworkOptions[0])
  const [networkInput, setNetworkInput] = React.useState(NetworkOptions[0])

  const TokenOptions = ['COW', 'USDC']
  const [sellToken, setSellToken] = React.useState<string | null>(TokenOptions[0])
  const [sellTokenInput, setSellTokenInput] = React.useState(TokenOptions[0])
  const [buyToken, setBuyToken] = React.useState<string | null>(TokenOptions[0])
  const [buyTokenInput, setBuyTokenInput] = React.useState(TokenOptions[1])

  const theme = useTheme();  
  const colorMode = React.useContext(ColorModeContext);

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
            value={activeTheme}
            onChange={handleChange}
            autoWidth
            label="Theme"
            size="small"
          >
            <MenuItem value={Theme.Auto}>Auto</MenuItem>
            <MenuItem value={Theme.Light}>Light</MenuItem>
            <MenuItem value={Theme.Dark}>Dark</MenuItem>
          </Select>
        </FormControl>

        <Divider light />

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

        <Button variant="contained" onClick={colorMode.toggleColorMode}>
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
