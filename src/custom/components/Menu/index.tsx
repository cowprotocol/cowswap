import { Code, HelpCircle, BookOpen, PieChart, Moon, Sun, Repeat, Star, User, ExternalLink } from 'react-feather'

import MenuMod, {
  MenuItem,
  InternalMenuItem,
  MenuFlyout as MenuFlyoutUni,
  MenuItemBase,
  StyledMenuButton,
} from './MenuMod'
import { useToggleModal } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { useActiveWeb3React } from 'hooks/web3'

import { Separator as SeparatorBase } from 'components/SearchModal/styleds'
import { CONTRACTS_CODE_LINK, DISCORD_LINK, DOCS_LINK, DUNE_DASHBOARD_LINK, TWITTER_LINK } from 'constants/index'
import cowRunnerImage from 'assets/cow-swap/game.gif'
import ninjaCowImage from 'assets/cow-swap/ninja-cow.png'
import { ApplicationModal } from 'state/application/reducer'
import { getExplorerAddressLink } from 'utils/explorer'
import { useHasOrders } from 'api/gnosisProtocol/hooks'

import twitterImage from 'assets/cow-swap/twitter.svg'
import discordImage from 'assets/cow-swap/discord.svg'
import SVG from 'react-inlinesvg'

export * from './MenuMod'

const ResponsiveInternalMenuItem = styled(InternalMenuItem)`
  display: none;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      display: flex;   
  `};
`

const MenuItemResponsiveBase = styled.div`
  ${MenuItemBase}
  display: none;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;   
  `};
`

const MenuItemResponsive = styled(MenuItemResponsiveBase)`
  font-weight: 500;
  flex: 0 1 auto;
  padding: 16px;
  font-size: 18px;
  svg {
    width: 18px;
    height: 18px;
    object-fit: contain;
    margin: 0 8px 0 0;
  }
`

export const StyledMenu = styled(MenuMod)`
  hr {
    margin: 15px 0;
  }

  ${MenuItem},
  ${InternalMenuItem},
  ${MenuItemResponsive} {
    color: ${({ theme }) => theme.header.menuFlyout.color};
    background: ${({ theme }) => theme.header.menuFlyout.background};
    font-size: 16px;
    width: 100%;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      padding: 16px;
    `};

    &:hover {
      color: ${({ theme }) => theme.header.menuFlyout.colorHover};
      background: ${({ theme }) => theme.header.menuFlyout.colorHoverBg};
    }
  }

  ${InternalMenuItem} > a > svg {
    width: 18px;
    height: 18px;
    stroke: transparent;

    > path {
      fill: ${({ theme }) => theme.header.menuFlyout.color};
    }
  }

  span[aria-label='Play CowGame'] > img {
    width: 25px;
    height: 20px;
    object-fit: contain;
    padding: 0 6px 0 0;
  }

  ${StyledMenuButton} {
    height: 38px;
  }
`

const Policy = styled(InternalMenuItem).attrs((attrs) => ({
  ...attrs,
}))`
  font-size: 0.8em;
  text-decoration: underline;
`

const MenuFlyout = styled(MenuFlyoutUni)`
  min-width: 240px;
  box-shadow: 0 0 100vh 100vw rgb(0 0 0 / 25%);
  top: calc(100% + 16px);
  order: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: 0;
    left: 0;
    position: fixed;
    height: 100%;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
    overflow-y: auto;
    flex-flow: row wrap;
    padding: 0 0 56px;
    align-items: flex-start;
    align-content: flex-start;
  `};

  > a:not(${ResponsiveInternalMenuItem}) {
    display: flex;
  }

  > a {
    transition: background 0.2s ease-in-out;
    align-items: center;
    text-decoration: none;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex: 0 1 auto;
      padding: 16px;
      font-size: 18px;
    `};

    > span {
      display: flex;
      align-items: center;
    }
  }
  > a:hover {
    background: ${({ theme }) => theme.disabled};
    border-radius: 6px;
  }

  > a > span > svg {
    width: 18px;
    height: 18px;
    object-fit: contain;
    margin: 0 8px 0 0;

    > path {
      fill: ${({ theme }) => theme.text1};
    }
  }
`

export const Separator = styled(SeparatorBase)`
  background-color: ${({ theme }) => theme.disabled};
  margin: 0.3rem auto;
  width: 90%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 16px auto;
  `};
`

export const CloseMenu = styled.button`
  display: grid;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.header.menuFlyout.closeButtonBg};
  border: 0;
  color: ${({ theme }) => theme.black};
  height: 36px;
  position: sticky;
  top: 0;
  cursor: pointer;
  border-radius: 6px;
  justify-content: center;
  padding: 0;
  margin: 0 0 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 56px;
    border-radius: 0;
    justify-content: flex-end;
    margin: 0;
    width: 100%;
  `};

  &::after {
    content: '✕';
    display: block;
    font-size: 20px;
    margin: 0;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 14px 0 0;
      font-size: 24px;
    `};
  }
`

interface MenuProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export function Menu({ darkMode, toggleDarkMode }: MenuProps) {
  const close = useToggleModal(ApplicationModal.MENU)
  const { account, chainId } = useActiveWeb3React()
  const hasOrders = useHasOrders(account)
  const showOrdersLink = account && hasOrders

  return (
    <StyledMenu>
      <MenuFlyout>
        <CloseMenu onClick={close} />
        <ResponsiveInternalMenuItem to="/" onClick={close}>
          <Repeat size={14} /> Swap
        </ResponsiveInternalMenuItem>
        <ResponsiveInternalMenuItem to="/profile" onClick={close}>
          <User size={14} /> Profile
        </ResponsiveInternalMenuItem>
        <InternalMenuItem to="/about" onClick={close}>
          <Star size={14} />
          About
        </InternalMenuItem>

        <InternalMenuItem to="/faq" onClick={close}>
          <HelpCircle size={14} />
          FAQ
        </InternalMenuItem>

        <MenuItem id="link" href={DOCS_LINK}>
          <BookOpen size={14} />
          Docs
        </MenuItem>

        <MenuItem id="link" href={DUNE_DASHBOARD_LINK}>
          <PieChart size={14} />
          Stats
        </MenuItem>

        <MenuItem id="link" href={CONTRACTS_CODE_LINK}>
          <span aria-hidden="true" onClick={close} onKeyDown={close}>
            <Code size={14} />
            Code
          </span>
        </MenuItem>
        <MenuItem id="link" href={DISCORD_LINK}>
          <span aria-hidden="true" onClick={close} onKeyDown={close}>
            <SVG src={discordImage} description="Find CowSwap on Discord!" />
            Discord
          </span>
        </MenuItem>

        <MenuItem id="link" href={TWITTER_LINK}>
          <span aria-hidden="true" onClick={close} onKeyDown={close}>
            <SVG src={twitterImage} description="Follow CowSwap on Twitter!" /> Twitter
          </span>
        </MenuItem>

        <InternalMenuItem to="/play/mev-slicer" onClick={close}>
          <span role="img" aria-label="Play CowGame">
            <img src={ninjaCowImage} alt="Play Cow MEV Slicer" />
          </span>{' '}
          MEV Slicer
        </InternalMenuItem>

        <InternalMenuItem to="/play/cow-runner" onClick={close}>
          <span role="img" aria-label="Play CowGame">
            <img src={cowRunnerImage} alt="Play Cow Runner Game" />
          </span>{' '}
          Cow Runner
        </InternalMenuItem>
        {showOrdersLink && (
          <MenuItem id="link" href={getExplorerAddressLink(chainId || 1, account)}>
            <span aria-hidden="true" onClick={close} onKeyDown={close}>
              <ExternalLink size={14} />
              View all orders
            </span>
          </MenuItem>
        )}
        <MenuItemResponsive onClick={() => toggleDarkMode()}>
          {darkMode ? (
            <>
              <Moon size={20} /> Dark Theme
            </>
          ) : (
            <>
              <Sun size={20} />
              Light Theme
            </>
          )}
        </MenuItemResponsive>

        <Separator />

        <Policy to="/terms-and-conditions" onClick={close} onKeyDown={close}>
          Terms and conditions
        </Policy>
        {/* 
        <Policy to="/privacy-policy">Privacy policy</Policy>
        <Policy to="/cookie-policy">Cookie policy</Policy> 
        */}
      </MenuFlyout>
    </StyledMenu>
  )
}

export default Menu
