import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuWrapper,
  StyledChevronDown,
  Wrapper,
  AccountPageWrapper,
  Subtitle,
  AccountHeading,
  RemoveTokens,
} from './styled'
import { AccountMenu } from '../Menu'
import { useAllTokens } from 'hooks/Tokens'
import { isTruthy } from 'utils/misc'
import TokensTable from 'components/Tokens/TokensTable'
import { useFavouriteTokens, useRemoveAllFavouriteTokens } from 'state/user/hooks'
import { useAllTokenBalances } from 'state/wallet/hooks'
import { Check } from 'react-feather'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'

export enum PageViewKeys {
  ALL_TOKENS = 'ALL_TOKENS',
  FAVOURITE_TOKENS = 'FAVOURITE_TOKENS',
}

const PageView = {
  [PageViewKeys.ALL_TOKENS]: {
    label: 'All tokens',
  },
  [PageViewKeys.FAVOURITE_TOKENS]: {
    label: 'Favourite tokens',
  },
}

export default function TokensOverview() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<PageViewKeys>(PageViewKeys.ALL_TOKENS)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()
  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const balances = useAllTokenBalances()

  const removeAllFavouriteTokens = useRemoveAllFavouriteTokens()

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
    } else if (selectedView === PageViewKeys.FAVOURITE_TOKENS) {
      tokensData = favouriteTokens
    }

    return <TokensTable selectedView={selectedView} balances={balances} tokensData={tokensData} />
  }, [balances, favouriteTokens, formattedTokens, selectedView])

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
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
                  <MenuItem key={key} onClick={() => handleMenuClick(key as PageViewKeys)}>
                    <span>{value.label}</span>
                    {selectedView === key ? <Check size={20} color={theme.green1} /> : null}
                  </MenuItem>
                ))}
              </Menu>
            ) : null}
          </MenuWrapper>

          <RemoveTokens onClick={() => removeAllFavouriteTokens()}>
            (<Trans>Restore defaults</Trans>)
          </RemoveTokens>
        </AccountHeading>

        {renderTableContent()}
      </AccountPageWrapper>
    </Wrapper>
  )
}
