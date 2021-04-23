import React from 'react'
import { Code, MessageCircle } from 'react-feather'

import MenuMod, { MenuItem, InternalMenuItem, MenuFlyout as MenuFlyoutUni } from './MenuMod'
import styled from 'styled-components'
import { Separator as SeparatorBase } from 'components/swap/styleds'
import { CODE_LINK, DISCORD_LINK } from 'constants/index'

export const StyledMenu = styled(MenuMod)`
  hr {
    margin: 15px 0;
  }
`

const Policy = styled(InternalMenuItem).attrs(attrs => ({
  ...attrs,
  target: '_blank'
}))`
  font-size: 0.8em;
  text-decoration: underline;
`

const MenuFlyout = styled(MenuFlyoutUni)`
  min-width: 11rem;
`

export const Separator = styled(SeparatorBase)`
  background-color: #0000002e;
  margin: 0.3rem auto;
  width: 90%;
`

export function Menu() {
  return (
    <StyledMenu>
      <MenuFlyout>
        <InternalMenuItem to="/faq">
          <Code size={14} />
          FAQ
        </InternalMenuItem>

        <MenuItem id="link" href={CODE_LINK}>
          <Code size={14} />
          Code
        </MenuItem>
        <MenuItem id="link" href={DISCORD_LINK}>
          <MessageCircle size={14} />
          Discord
        </MenuItem>

        <Separator />

        <Policy to="/terms-and-conditions">Terms and conditions</Policy>
        {/* 
        <Policy to="/privacy-policy">Privacy policy</Policy>
        <Policy to="/cookie-policy">Cookie policy</Policy> 
        */}
      </MenuFlyout>
    </StyledMenu>
  )
}

export default Menu
