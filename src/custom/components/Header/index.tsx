import React from 'react'
import { SupportedChainId as ChainId } from 'constants/chains'
import Web3Status from 'components/Web3Status'

import HeaderMod, {
  NetworkCard as NetworkCardUni,
  Title,
  HeaderLinks,
  HeaderRow,
  HeaderControls,
  HeaderElement,
  HideSmall,
  BalanceText,
  AccountElement,
  HeaderElementWrap,
  StyledNavLink as StyledNavLinkUni,
  StyledMenuButton,
} from './HeaderMod'
import Menu from '../Menu'
import { Moon, Sun } from 'react-feather'
import styled from 'styled-components'
import { status as appStatus } from '@src/../package.json'
import { useActiveWeb3React } from 'hooks/web3'
import { useETHBalances } from 'state/wallet/hooks'
import { SHORT_PRECISION } from 'constants/index'
import { useDarkModeManager } from 'state/user/hooks'
import { darken } from 'polished'
import TwitterImage from 'assets/cow-swap/twitter.svg'

import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'

export const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GOERLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.XDAI]: 'xDAI',
}

const CHAIN_CURRENCY_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.XDAI]: 'xDAI',
}

export interface LinkType {
  id: number
  title: string
  path: string
}

const StyledNavLink = styled(StyledNavLinkUni)`
  transition: color 0.15s ease-in-out;
  color: ${({ theme }) => darken(0.3, theme.text1)};

  :hover,
  :focus {
    color: ${({ theme }) => theme.text1};
  }
`

export const HeaderModWrapper = styled(HeaderMod)`
  ${Title} {
    margin: 0;
    text-decoration: none;
    color: ${({ theme }) => theme.text1};
  }

  ${HeaderLinks} {
    margin: 5px 0 0 0;
  }
`

const NetworkCard = styled(NetworkCardUni)`
  background-color: ${({ theme }) => theme.networkCard.background};
  color: ${({ theme }) => theme.networkCard.text};
`

const TwitterLink = styled(StyledMenuButton)`
  margin-left: 0.5rem;
  padding: 0;

  > a {
    ${({ theme }) => theme.cursor};
    padding: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: -3px;
    height: 35px;
    width: 35px;
  }

  > a > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border: 0;
    display: flex;
  }
`

export const LogoImage = styled.img.attrs((props) => ({
  src: props.theme.logo.src,
  alt: props.theme.logo.alt,
  width: props.theme.logo.width,
  height: props.theme.logo.height,
}))`
  object-fit: contain;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 150px;
  `};
`

const UniIcon = styled.div`
  display: flex;
  margin: 0 16px 0 0;
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-5deg);
  }

  &::after {
    content: '${appStatus}';
    display: block;
    font-size: 10px;
    font-weight: bold;
    position: absolute;
    right: 12px;
    top: 2px;
    color: ${({ theme }) => theme.text1};
  }
`

export default function Header() {
  const { account, chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId)

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const nativeToken = chainId && (CHAIN_CURRENCY_LABELS[chainId] || 'ETH')
  const [darkMode, toggleDarkMode] = useDarkModeManager()

  return (
    <HeaderModWrapper>
      <HeaderRow>
        <Title href=".">
          <UniIcon>
            <LogoImage />
          </UniIcon>
        </Title>
        <HeaderLinks>
          <StyledNavLink to="/swap">Swap</StyledNavLink>
          <StyledNavLink to="/about">About</StyledNavLink>
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {formatSmart(userEthBalance, SHORT_PRECISION)} {nativeToken}
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <TwitterLink>
            <a href="https://twitter.com/mevprotection" target="_blank" rel="noopener noreferrer">
              <img src={TwitterImage} alt="Follow CowSwap on Twitter!" />
            </a>
          </TwitterLink>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderModWrapper>
  )
}
