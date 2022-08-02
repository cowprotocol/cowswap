import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuWrapper,
  StyledChevronDown,
  Subtitle,
  AccountHeading,
  RemoveTokens,
  WrongNetwork,
} from './styled'
import { useAllTokens } from 'hooks/Tokens'
import { isTruthy } from 'utils/misc'
import TokensTable from 'components/Tokens/TokensTable'
import { useFavouriteTokens, useRemoveAllFavouriteTokens } from 'state/user/hooks'
import { useAllTokenBalances } from 'state/connection/hooks'
import { Check } from 'react-feather'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import usePrevious from 'hooks/usePrevious'
import { useWeb3React } from '@web3-react/core'
import { CardsWrapper } from '../styled'
import { supportedChainId } from 'utils/supportedChainId'
import Web3Status from '@src/components/Web3Status'

export enum PageViewKeys {
  ALL_TOKENS = 'ALL_TOKENS',
  FAVORITE_TOKENS = 'FAVORITE_TOKENS',
}

const PageView = {
  [PageViewKeys.ALL_TOKENS]: {
    label: 'All tokens',
  },
  [PageViewKeys.FAVORITE_TOKENS]: {
    label: 'Favorite tokens',
  },
}

export default function TokensOverview() {
  const { chainId } = useWeb3React()

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<PageViewKeys>(PageViewKeys.ALL_TOKENS)
  const [page, setPage] = useState<number>(1)

  const prevChainId = usePrevious(chainId)
  const prevSelectedView = usePrevious(selectedView)

  const isChainSupported = supportedChainId(chainId)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()
  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const balances = useAllTokenBalances()

  const removeAllFavouriteTokens = useRemoveAllFavouriteTokens()
  const handleRestoreTokens = useCallback(() => {
    removeAllFavouriteTokens()
    setPage(1)
  }, [removeAllFavouriteTokens])

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(isTruthy)
  }, [allTokens])

  const toggleMenu = useCallback(() => setIsMenuOpen(!isMenuOpen), [isMenuOpen])
  const handleMenuClick = useCallback((view: PageViewKeys) => {
    setSelectedView(view)
    setIsMenuOpen(false)
  }, [])

  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, isMenuOpen ? toggleMenu : undefined)

  const renderTableContent = useCallback(() => {
    let tokensData: Token[] = []

    if (selectedView === PageViewKeys.ALL_TOKENS) {
      tokensData = formattedTokens
    } else if (selectedView === PageViewKeys.FAVORITE_TOKENS) {
      tokensData = favouriteTokens
    }

    if (!isChainSupported) {
      return (
        <WrongNetwork>
          <Web3Status />
        </WrongNetwork>
      )
    }

    return <TokensTable page={page} setPage={setPage} balances={balances} tokensData={tokensData} />
  }, [balances, favouriteTokens, formattedTokens, isChainSupported, page, selectedView])

  // reset table to page 1 on chain change or on table view change
  useEffect(() => {
    if (chainId !== prevChainId || selectedView !== prevSelectedView) {
      setPage(1)
    }
  }, [chainId, prevChainId, prevSelectedView, selectedView])

  return (
    <CardsWrapper useFlex={false} padding={'20px 30px 30px'}>
      <AccountHeading>
        <MenuWrapper ref={node as any}>
          <MenuButton onClick={toggleMenu}>
            <Subtitle>
              <Trans>{PageView[selectedView].label}</Trans>
            </Subtitle>
            <StyledChevronDown size={14} />
          </MenuButton>

          {isMenuOpen ? (
            <Menu>
              {Object.entries(PageView).map(([key, value]) => (
                <MenuItem key={key} active={selectedView === key} onClick={() => handleMenuClick(key as PageViewKeys)}>
                  <span>{value.label}</span>
                  {selectedView === key ? <Check size={20} color={theme.green1} /> : null}
                </MenuItem>
              ))}
            </Menu>
          ) : null}
        </MenuWrapper>

        {selectedView === PageViewKeys.FAVORITE_TOKENS && (
          <RemoveTokens onClick={handleRestoreTokens}>
            (<Trans>Restore defaults</Trans>)
          </RemoveTokens>
        )}
      </AccountHeading>

      {renderTableContent()}
    </CardsWrapper>
  )
}
