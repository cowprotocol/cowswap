// eslint-disable-next-line no-restricted-imports
import { Trans, t } from '@lingui/macro'
import { useEffect, useMemo, useState, useCallback, useRef, ChangeEventHandler } from 'react'
import { Token } from '@uniswap/sdk-core'
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
import { TokenSearchInput } from 'components/Tokens/styled'
import { useAllTokens } from 'hooks/Tokens'
import { isTruthy } from 'utils/misc'
import TokensTable from 'components/Tokens/TokensTable'
import { useFavouriteTokens, useRemoveAllFavouriteTokens, useInitFavouriteTokens } from 'state/user/hooks'
import { useAllTokenBalances } from 'state/connection/hooks'
import { Check } from 'react-feather'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import usePrevious from 'hooks/usePrevious'
import { useWeb3React } from '@web3-react/core'
import { CardsLoader, CardsSpinner } from '../styled'
import { supportedChainId } from 'utils/supportedChainId'
import { ContentWrapper as SearchInputFormatter } from 'components/SearchModal/CurrencySearch'
import useDebounce from 'hooks/useDebounce'
import { isAddress } from 'utils'
import { CloseIcon } from 'theme'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'

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
  const { chainId, provider, account } = useWeb3React()

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<PageViewKeys>(PageViewKeys.ALL_TOKENS)
  const [page, setPage] = useState<number>(1)

  const prevChainId = usePrevious(chainId)
  const prevSelectedView = usePrevious(selectedView)
  const prevAccount = usePrevious(account)

  const isChainSupported = supportedChainId(chainId)

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
    } else if (!isChainSupported) {
      return <Trans>Unsupported network</Trans>
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
  }, [
    balances,
    debouncedQuery,
    favouriteTokens,
    formattedTokens,
    isChainSupported,
    page,
    prevQuery,
    provider,
    query,
    selectedView,
  ])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const input = event.target.value.trim()
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
    <Trace page={PageName.ACCOUNT_TOKENS_PAGE} shouldLogImpression>
      {isChainSupported && (
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

        {renderTableContent()}
      </Overview>
    </Trace>
  )
}
