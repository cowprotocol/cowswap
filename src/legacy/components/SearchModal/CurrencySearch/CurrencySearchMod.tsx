// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { Currency, Token } from '@uniswap/sdk-core'
import { EventName, ModalName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import useToggle from 'hooks/useToggle'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'
import { ChangeEvent, KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import { useAllTokenBalances } from 'state/connection/hooks'
import styled, { DefaultTheme } from 'styled-components/macro'
import { useAllTokens, useIsUserAddedToken, useSearchInactiveTokenLists, useToken } from 'hooks/Tokens'
import { ButtonText, CloseIcon, ThemedText } from 'theme'
import { isAddress } from 'utils'
import Column from 'components/Column'
import Row /* RowBetween , RowFixed */ from 'components/Row'
import CommonBases from 'components/SearchModal/CommonBases'
import CurrencyList from 'components/SearchModal/CurrencyList'
import ImportRow from 'components/SearchModal/ImportRow'
import { PaddedColumn, SearchInput, Separator, PaddedRow } from 'components/SearchModal/styleds'
import useNetworkName from 'hooks/useNetworkName'
import { ContentWrapper } from './index'
import { searchByAddressAnalytics } from 'components/analytics'
import { useWalletInfo } from 'modules/wallet'
import { useExternalTokenSearch } from 'common/hooks/useExternalTokenSearch'

export const Footer = styled.div`
  width: 100%;
  border-radius: 20px;
  padding: 20px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.bg1};
`

export interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  showManageView: () => void
  showImportView: () => void
  setImportToken: (token: Token) => void
  FooterButtonTextComponent: (props: { theme: DefaultTheme }) => JSX.Element // MOD
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  onDismiss,
  isOpen,
  showManageView,
  showImportView,
  setImportToken,
  FooterButtonTextComponent,
}: CurrencySearchProps) {
  const { chainId } = useWalletInfo()
  const theme = useTheme()

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false)

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const allTokens = useAllTokens()

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery)

  const searchToken = useToken(debouncedQuery)

  const searchTokenIsAdded = useIsUserAddedToken(searchToken)

  const network = useNetworkName()

  useEffect(() => {
    if (isAddressSearch) {
      searchByAddressAnalytics(isAddressSearch)
    }
  }, [isAddressSearch])

  const filteredTokens: Token[] = useMemo(() => {
    return Object.values(allTokens).filter(getTokenFilter(debouncedQuery))
  }, [allTokens, debouncedQuery])

  const [balances, balancesIsLoading] = useAllTokenBalances()
  const sortedTokens: Token[] = useMemo(() => {
    void balancesIsLoading // creates a new array once balances load to update hooks
    return [...filteredTokens].sort(tokenComparator.bind(null, balances))
  }, [balances, filteredTokens, balancesIsLoading])

  const filteredSortedTokens = useSortTokensByQuery(debouncedQuery, sortedTokens)

  const native = useNativeCurrency()

  const filteredSortedTokensWithETH: Currency[] = useMemo(() => {
    // Use Celo ERC20 Implementation and exclude the native asset
    if (!native) {
      return filteredSortedTokens
    }

    const s = debouncedQuery.toLowerCase().trim()
    if (native.symbol?.toLowerCase()?.indexOf(s) !== -1) {
      // Always bump the native token to the top of the list.
      return native ? [native, ...filteredSortedTokens.filter((t) => !t.equals(native))] : filteredSortedTokens
    }
    return filteredSortedTokens
  }, [debouncedQuery, native, filteredSortedTokens])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    // Do a case-insensitive search
    const checksummedInput = isAddress(input.toLowerCase().trim())
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === native?.symbol?.toLowerCase()) {
          handleCurrencySelect(native)
        } else if (filteredSortedTokensWithETH.length > 0) {
          if (
            filteredSortedTokensWithETH[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokensWithETH.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokensWithETH[0])
          }
        }
      }
    },
    [debouncedQuery, native, filteredSortedTokensWithETH, handleCurrencySelect]
  )

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(
    filteredTokens.length === 0 || (debouncedQuery.length > 2 && !isAddressSearch) ? debouncedQuery : undefined
  )

  // Timeout token loader after 3 seconds to avoid hanging in a loading state.
  useEffect(() => {
    const tokenLoaderTimer = setTimeout(() => {
      setTokenLoaderTimerElapsed(true)
    }, 3000)
    return () => clearTimeout(tokenLoaderTimer)
  }, [])

  const existingTokens = useMemo(
    () =>
      new Map(
        [...filteredSortedTokens, ...(filteredInactiveTokens ?? [])]
          .filter((currency: Currency): currency is Token => currency.isToken)
          .map(({ address }) => [address, true])
      ),
    [filteredSortedTokens, filteredInactiveTokens]
  )
  const additionalTokens = useExternalTokenSearch(searchQuery, existingTokens)

  // Autofocus search input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <Trace name={EventName.TOKEN_SELECTOR_OPENED} modal={ModalName.TOKEN_SELECTOR} shouldLogImpression={true}>
      <ContentWrapper>
        <PaddedColumn style={{ padding: 0 }} gap="16px">
          <PaddedRow>
            <Text fontWeight={500} fontSize={16}>
              <Trans>Select a token</Trans>
            </Text>
            <CloseIcon onClick={onDismiss} />
          </PaddedRow>
          <Row padding="0px 20px">
            <SearchInput
              type="text"
              id="token-search-input"
              placeholder={t`Search name or paste address`}
              autoComplete="off"
              value={searchQuery}
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              onKeyDown={handleEnter}
            />
          </Row>
          {showCommonBases && (
            <CommonBases
              chainId={chainId}
              onSelect={handleCurrencySelect}
              selectedCurrency={selectedCurrency}
              searchQuery={searchQuery}
              isAddressSearch={isAddressSearch}
            />
          )}
        </PaddedColumn>
        <Separator />
        {searchToken && !searchTokenIsAdded && filteredSortedTokens?.length === 0 ? (
          <Column id="currency-import" style={{ padding: '20px 0', height: '100%' }}>
            <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
          </Column>
        ) : filteredSortedTokens?.length > 0 || filteredInactiveTokens?.length > 0 || additionalTokens.length > 0 ? (
          <div style={{ flex: '1' }}>
            <AutoSizer disableWidth>
              {({ height }) => (
                <CurrencyList
                  height={height}
                  currencies={disableNonToken ? filteredSortedTokens : filteredSortedTokensWithETH}
                  otherListTokens={filteredInactiveTokens}
                  onCurrencySelect={handleCurrencySelect}
                  otherCurrency={otherSelectedCurrency}
                  selectedCurrency={selectedCurrency}
                  fixedListRef={fixedList}
                  showImportView={showImportView}
                  setImportToken={setImportToken}
                  showCurrencyAmount={showCurrencyAmount}
                  isLoading={balancesIsLoading && !tokenLoaderTimerElapsed}
                  searchQuery={searchQuery}
                  isAddressSearch={isAddressSearch}
                  additionalTokens={additionalTokens}
                />
              )}
            </AutoSizer>
          </div>
        ) : isAddressSearch ? (
          <Column style={{ padding: '20px', height: '100%' }}>
            <ThemedText.Main color={theme.text3} textAlign="center" mb="20px">
              <Trans>No tokens found with this address in {network} network</Trans>
            </ThemedText.Main>
          </Column>
        ) : (
          <Column style={{ padding: '20px', height: '100%' }}>
            <ThemedText.Main color={theme.text3} textAlign="center" mb="20px">
              <Trans>No tokens found for this name in {network} network</Trans>
            </ThemedText.Main>
          </Column>
        )}
        <Footer>
          <Row justify="center">
            <ButtonText onClick={showManageView} color={theme.primary1} className="list-token-manage-button">
              <FooterButtonTextComponent theme={theme} />
            </ButtonText>
          </Row>
        </Footer>
      </ContentWrapper>
    </Trace>
  )
}
