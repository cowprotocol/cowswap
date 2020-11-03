import React from 'react'
import { Code, MessageCircle, PieChart } from 'react-feather'

import MenuMod, { MenuItem } from './MenuMod'
import styled from 'styled-components'

const CODE_LINK = 'https://github.com/gnosis/dex-swap'
const DISCORD_LINK = 'https://chat.gnosis.io'

export const StyledMenu = styled(MenuMod)``

export function Menu() {
  return (
    <StyledMenu>
      <MenuItem id="link" href={CODE_LINK}>
        <Code size={14} />
        Code
      </MenuItem>
      <MenuItem id="link" href={DISCORD_LINK}>
        <MessageCircle size={14} />
        Discord
      </MenuItem>
      <MenuItem id="link" href="https://uniswap.info/">
        <PieChart size={14} />
        Analytics
      </MenuItem>
    </StyledMenu>
  )
}

export default Menu
