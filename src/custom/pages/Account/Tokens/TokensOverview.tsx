// eslint-disable-next-line no-restricted-imports
import { Trans, t } from '@lingui/macro'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
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
  LeftSection,
  ClearSearchInput,
  Overview,
} from './styled'
import { TokenSearchInput } from 'components/Tokens/styled'
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
import { CardsLoader, CardsSpinner } from '../styled'
import { supportedChainId } from 'utils/supportedChainId'
import { ContentWrapper as SearchInputFormatter } from 'components/SearchModal/CurrencySearch'
import useDebounce from 'hooks/useDebounce'
import { isAddress } from 'utils'
import { CloseIcon } from 'theme'

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
        <CardsLoader style={{ minHeight: '200px' }}>
          <CardsSpinner size="24px" />
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

  const handleSearch = useCallback(
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

  // reset table to page 1 on chain change or on table view change
  useEffect(() => {
    if (chainId !== prevChainId || selectedView !== prevSelectedView || account !== prevAccount) {
      setPage(1)
    }
  }, [account, chainId, prevAccount, prevChainId, prevSelectedView, selectedView])

  return (
    <Overview useFlex={false} padding={'20px 30px 30px'}>
      {isChainSupported && (
        <AccountHeading>
          <LeftSection>
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

            {selectedView === PageViewKeys.FAVORITE_TOKENS && (
              <RemoveTokens onClick={handleRestoreTokens}>
                (<Trans>Restore defaults</Trans>)
              </RemoveTokens>
            )}
          </LeftSection>

          <SearchInputFormatter>
            <TokenSearchInput
              type="text"
              id="token-search-input"
              placeholder={t`Search name/symbol or paste address`}
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

      {renderTableContent()}
    </Overview>
  )
}
