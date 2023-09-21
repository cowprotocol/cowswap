import { useEffect, useMemo, useState, useCallback, useRef, ChangeEventHandler } from 'react'

import { useDebounce, useOnClickOutside, usePrevious, useTheme } from '@cowprotocol/common-hooks'
import { isAddress, isTruthy } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Trans, t } from '@lingui/macro'
import { Check } from 'react-feather'

import { ContentWrapper as SearchInputFormatter } from 'legacy/components/SearchModal/CurrencySearch'
import { TokenSearchInput } from 'legacy/components/Tokens/styled'
import TokensTable from 'legacy/components/Tokens/TokensTable'
import { useAllTokenBalances, useAllTokens } from 'legacy/hooks/Tokens'
import { useFavouriteTokens, useRemoveAllFavouriteTokens, useInitFavouriteTokens } from 'legacy/state/user/hooks'
import { CloseIcon } from 'legacy/theme'

import { PageTitle } from 'modules/application/containers/PageTitle'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuWrapper,
  StyledChevronDown,
  AccountHeading,
  RemoveTokens,
  LeftSection,
  ClearSearchInput,
  Overview,
} from './styled'

import { CardsLoader, CardsSpinner } from '../styled'

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
  useInitFavouriteTokens()
  const { chainId, account } = useWalletInfo()
  const { provider } = useWeb3React()

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<PageViewKeys>(PageViewKeys.ALL_TOKENS)
  const [page, setPage] = useState<number>(1)

  const prevChainId = usePrevious(chainId)
  const prevSelectedView = usePrevious(selectedView)
  const prevAccount = usePrevious(account)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()
  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const balances = useAllTokenBalances()

  // search - takes precedence re:filtering
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query, 300)
  const prevQuery = usePrevious(debouncedQuery)

  const removeAllFavouriteTokens = useRemoveAllFavouriteTokens()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

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

    if (!provider) {
      return (
        <CardsLoader>
          <CardsSpinner size="42px" />
        </CardsLoader>
      )
    }

    return (
      <TokensTable
        page={page}
        query={query}
        prevQuery={prevQuery || ''}
        debouncedQuery={debouncedQuery || ''}
        setPage={setPage}
        balances={balances}
        tokensData={tokensData}
      />
    )
  }, [balances, debouncedQuery, favouriteTokens, formattedTokens, page, prevQuery, provider, query, selectedView])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const input = event.target.value.trim().toLowerCase()
      const checksummedInput = isAddress(input)
      setQuery(checksummedInput || input)
      if (page !== 1) setPage(1)
    },
    [page, setPage]
  )

  const handleSearchClear = useCallback(() => {
    setQuery('')
  }, [])

  // reset table to page 1 on chain, account or view change
  useEffect(() => {
    if (chainId !== prevChainId || selectedView !== prevSelectedView || account !== prevAccount) {
      setPage(1)
    }
  }, [account, chainId, prevAccount, prevChainId, prevSelectedView, selectedView])

  return (
    <>
      {!isProviderNetworkUnsupported && (
        <AccountHeading>
          <LeftSection>
            <MenuWrapper ref={node as any}>
              <MenuButton onClick={toggleMenu}>
                <Trans>{PageView[selectedView].label}</Trans>
                <StyledChevronDown size={14} />
              </MenuButton>

              {isMenuOpen ? (
                <Menu>
                  {Object.entries(PageView).map(([key, value]) => (
                    <MenuItem
                      key={key}
                      active={selectedView === key}
                      onClick={() => handleMenuClick(key as PageViewKeys)}
                    >
                      <span>{value.label}</span>
                      {selectedView === key ? <Check size={20} color={theme.green1} /> : null}
                    </MenuItem>
                  ))}
                </Menu>
              ) : null}
            </MenuWrapper>
          </LeftSection>

          {selectedView === PageViewKeys.FAVORITE_TOKENS && (
            <RemoveTokens onClick={handleRestoreTokens}>
              <span>
                (<Trans>Reset favourites</Trans>)
              </span>
            </RemoveTokens>
          )}

          <SearchInputFormatter>
            <TokenSearchInput
              type="text"
              id="token-search-input"
              placeholder={t`Search by name, symbol or address`}
              autoComplete="off"
              value={query}
              onChange={handleSearch}
            />

            {!!query.length && (
              <ClearSearchInput>
                <CloseIcon size={24} onClick={handleSearchClear} />
              </ClearSearchInput>
            )}
          </SearchInputFormatter>
        </AccountHeading>
      )}
      <Overview>
        <PageTitle title="Tokens Overview" />

        {isProviderNetworkUnsupported ? 'Unsupported network' : renderTableContent()}
      </Overview>
    </>
  )
}
