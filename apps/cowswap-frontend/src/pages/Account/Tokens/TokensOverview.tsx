import { useEffect, useMemo, useState, useCallback, useRef, ChangeEventHandler } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { PAGE_TITLES, TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme, useDebounce, useOnClickOutside, usePrevious } from '@cowprotocol/common-hooks'
import { isAddress, isTruthy } from '@cowprotocol/common-utils'
import { useTokensByAddressMap, useFavoriteTokens, useResetFavoriteTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Trans, t } from '@lingui/macro'
import { Check } from 'react-feather'
import { CloseIcon } from 'theme'

import TokensTable from 'legacy/components/Tokens/TokensTable'

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
  SearchInputFormatter,
  TokenSearchInput,
} from './styled'

import Delegate from '../Delegate'
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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export default function TokensOverview() {
  const { chainId, account } = useWalletInfo()
  const provider = useWalletProvider()

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
  const allTokens = useTokensByAddressMap()
  const favoriteTokens = useFavoriteTokens()
  const { values: balances } = useTokensBalances()

  // search - takes precedence re:filtering
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query, 300)
  const prevQuery = usePrevious(debouncedQuery)

  const removeAllFavoriteTokens = useResetFavoriteTokens()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const handleRestoreTokens = useCallback(() => {
    removeAllFavoriteTokens()
    setPage(1)
  }, [removeAllFavoriteTokens])

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(isTruthy)
  }, [allTokens])

  const toggleMenu = useCallback(() => setIsMenuOpen(!isMenuOpen), [isMenuOpen])
  const handleMenuClick = useCallback((view: PageViewKeys) => {
    setSelectedView(view)
    setIsMenuOpen(false)
  }, [])

  const node = useRef<HTMLDivElement>(null)
  useOnClickOutside([node], isMenuOpen ? toggleMenu : undefined)

  const renderTableContent = useCallback(() => {
    let tokensData: TokenWithLogo[] = []

    if (selectedView === PageViewKeys.ALL_TOKENS) {
      tokensData = formattedTokens
    } else if (selectedView === PageViewKeys.FAVORITE_TOKENS) {
      tokensData = favoriteTokens
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
      >
        <Delegate dismissable rowOnMobile />
      </TokensTable>
    )
  }, [balances, debouncedQuery, favoriteTokens, formattedTokens, page, prevQuery, provider, query, selectedView])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const input = event.target.value.trim().toLowerCase()
      const checksummedInput = isAddress(input)
      setQuery(checksummedInput || input)
      if (page !== 1) setPage(1)
    },
    [page, setPage],
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
            {/* TODO: Replace any with proper type definitions */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                (<Trans>Reset favorites</Trans>)
              </span>
            </RemoveTokens>
          )}

          <SearchInputFormatter>
            <TokenSearchInput
              type="text"
              id="token-search-input"
              placeholder={t`Name, symbol or address`}
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
        <PageTitle title={PAGE_TITLES.TOKENS_OVERVIEW} />

        {isProviderNetworkUnsupported ? 'Unsupported network' : renderTableContent()}
      </Overview>
    </>
  )
}
