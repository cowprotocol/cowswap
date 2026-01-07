import {
  ChangeEventHandler,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { AllowancesState, useTokenAllowances, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { LpToken, PAGE_TITLES, TokenWithLogo } from '@cowprotocol/common-const'
import { useDebounce, useOnClickOutside, usePrevious, useTheme } from '@cowprotocol/common-hooks'
import { isAddress, isTruthy } from '@cowprotocol/common-utils'
import { useFavoriteTokens, useResetFavoriteTokens, useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui, Trans } from '@lingui/react/macro'
import { Check } from 'react-feather'
import styled from 'styled-components/macro'
import { CloseIcon } from 'theme'

import { TokenTable } from 'legacy/components/Tokens/TokensTable'

import { PageTitle } from 'modules/application/containers/PageTitle'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { CowLoadingIcon } from 'common/pure/CowLoadingIcon'

import {
  AccountHeading,
  ClearSearchInput,
  LeftSection,
  Menu,
  MenuButton,
  MenuItem,
  MenuWrapper,
  Overview,
  RemoveTokens,
  SearchInputFormatter,
  StyledChevronDown,
  TokenSearchInput,
} from './styled'

import Delegate from '../Delegate'
import { CardsLoader } from '../styled'

const TokensLoader = styled(CardsLoader)`
  min-height: 500px;
`

type TokenBalancesMap = ReturnType<typeof useTokensBalances>['values']
type WalletProvider = ReturnType<typeof useWalletProvider>

enum PageViewKeys {
  ALL_TOKENS = 'ALL_TOKENS',
  FAVORITE_TOKENS = 'FAVORITE_TOKENS',
}

const PageView = {
  [PageViewKeys.ALL_TOKENS]: {
    label: msg`All tokens`,
  },
  [PageViewKeys.FAVORITE_TOKENS]: {
    label: msg`Favorite tokens`,
  },
}

interface PageViewItem {
  key: PageViewKeys
  label: MessageDescriptor
}

const PAGE_VIEW_ITEMS: PageViewItem[] = Object.entries(PageView).map(([key, value]) => ({
  key: key as PageViewKeys,
  label: value.label,
}))

export default function TokensOverview(): ReactNode {
  useScrollToTop()

  const { chainId, account } = useWalletInfo()
  const provider = useWalletProvider()
  const { selectedView, isMenuOpen, toggleMenu, selectView, menuRef } = useTokensView()
  const [page, setPage] = useState<number>(1)

  const { formattedTokens, favoriteTokens, balances, allowances, removeAllFavoriteTokens } = useAccountTokensData()

  const { query, debouncedQuery, prevQuery, handleSearch, clearSearch } = useTokenSearch(page, setPage)
  const theme = useTheme()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const handleRestoreTokens = useCallback(() => {
    removeAllFavoriteTokens()
    setPage(1)
  }, [removeAllFavoriteTokens, setPage])

  useResetPageOnContextChange({ account, chainId, selectedView, setPage })

  const { i18n } = useLingui()

  return (
    <>
      {!isProviderNetworkUnsupported && (
        <TokensOverviewHeader
          isMenuOpen={isMenuOpen}
          selectedView={selectedView}
          onToggleMenu={toggleMenu}
          onSelectView={selectView}
          menuRef={menuRef}
          showResetFavorites={selectedView === PageViewKeys.FAVORITE_TOKENS}
          onResetFavorites={handleRestoreTokens}
          query={query}
          onSearchChange={handleSearch}
          onSearchClear={clearSearch}
          checkColor={theme.green1}
        />
      )}
      <Overview>
        <PageTitle title={i18n._(PAGE_TITLES.TOKENS_OVERVIEW)} />
        {isProviderNetworkUnsupported ? (
          <Trans>Unsupported network</Trans>
        ) : (
          <TokensTableContent
            provider={provider}
            darkMode={theme.darkMode}
            selectedView={selectedView}
            formattedTokens={formattedTokens}
            favoriteTokens={favoriteTokens}
            page={page}
            setPage={setPage}
            query={query}
            prevQuery={prevQuery}
            debouncedQuery={debouncedQuery}
            balances={balances}
            allowances={allowances}
          />
        )}
      </Overview>
    </>
  )
}

interface TokensOverviewHeaderProps {
  isMenuOpen: boolean
  selectedView: PageViewKeys
  onToggleMenu: () => void
  onSelectView: (view: PageViewKeys) => void
  menuRef: RefObject<HTMLDivElement | null>
  showResetFavorites: boolean
  onResetFavorites: () => void
  query: string
  onSearchChange: ChangeEventHandler<HTMLInputElement>
  onSearchClear: () => void
  checkColor: string
}

function TokensOverviewHeader(props: TokensOverviewHeaderProps): ReactNode {
  const {
    isMenuOpen,
    selectedView,
    onToggleMenu,
    onSelectView,
    menuRef,
    showResetFavorites,
    onResetFavorites,
    query,
    onSearchChange,
    onSearchClear,
    checkColor,
  } = props

  const { t, i18n } = useLingui()

  return (
    <AccountHeading>
      <LeftSection>
        <MenuWrapper ref={menuRef}>
          <MenuButton onClick={onToggleMenu}>
            {i18n._(PageView[selectedView].label)}
            <StyledChevronDown size={14} />
          </MenuButton>

          {isMenuOpen ? (
            <Menu>
              <TokensOverviewMenuItems
                selectedView={selectedView}
                onSelectView={onSelectView}
                checkColor={checkColor}
              />
            </Menu>
          ) : null}
        </MenuWrapper>
      </LeftSection>

      {showResetFavorites && (
        <RemoveTokens onClick={onResetFavorites}>
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
          onChange={onSearchChange}
        />

        {query.length > 0 && (
          <ClearSearchInput>
            <CloseIcon size={24} onClick={onSearchClear} />
          </ClearSearchInput>
        )}
      </SearchInputFormatter>
    </AccountHeading>
  )
}

interface TokensTableContentProps {
  provider: WalletProvider
  darkMode: boolean
  selectedView: PageViewKeys
  formattedTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  page: number
  setPage: Dispatch<SetStateAction<number>>
  query: string
  prevQuery?: string
  debouncedQuery?: string
  balances: TokenBalancesMap
  allowances: AllowancesState
}

function TokensTableContent(props: TokensTableContentProps): ReactNode {
  const {
    provider,
    darkMode,
    selectedView,
    formattedTokens,
    favoriteTokens,
    page,
    setPage,
    query,
    prevQuery,
    debouncedQuery,
    balances,
    allowances,
  } = props

  const tokensData = selectedView === PageViewKeys.ALL_TOKENS ? formattedTokens : favoriteTokens

  if (!provider) {
    return (
      <TokensLoader>
        <CowLoadingIcon size={120} isDarkMode={darkMode} />
      </TokensLoader>
    )
  }

  return (
    <TokenTable
      page={page}
      query={query}
      prevQuery={prevQuery ?? ''}
      debouncedQuery={debouncedQuery ?? ''}
      setPage={setPage}
      balances={balances}
      tokensData={tokensData}
      allowances={allowances}
    >
      <Delegate dismissable rowOnMobile />
    </TokenTable>
  )
}

interface TokensOverviewMenuItemsProps {
  selectedView: PageViewKeys
  onSelectView: (view: PageViewKeys) => void
  checkColor: string
}

function TokensOverviewMenuItems(props: TokensOverviewMenuItemsProps): ReactNode {
  const { selectedView, onSelectView, checkColor } = props

  const menuItems: ReactNode[] = []

  const { i18n } = useLingui()

  for (const { key, label } of PAGE_VIEW_ITEMS) {
    const isActive = selectedView === key

    menuItems.push(
      <MenuItem key={key} active={isActive} onClick={() => onSelectView(key)}>
        <span>{i18n._(label)}</span>
        {isActive ? <Check size={20} color={checkColor} /> : null}
      </MenuItem>,
    )
  }

  return <>{menuItems}</>
}

function useTokensView(): {
  selectedView: PageViewKeys
  isMenuOpen: boolean
  toggleMenu: () => void
  selectView: (view: PageViewKeys) => void
  menuRef: RefObject<HTMLDivElement | null>
} {
  const [selectedView, setSelectedView] = useState<PageViewKeys>(PageViewKeys.ALL_TOKENS)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  const selectView = useCallback((view: PageViewKeys) => {
    setSelectedView(view)
    setIsMenuOpen(false)
  }, [])

  useOnClickOutside([menuRef], isMenuOpen ? toggleMenu : undefined)

  return { selectedView, isMenuOpen, toggleMenu, selectView, menuRef }
}

interface UseTokenSearchResult {
  query: string
  debouncedQuery?: string
  prevQuery?: string
  handleSearch: ChangeEventHandler<HTMLInputElement>
  clearSearch: () => void
}

function useTokenSearch(page: number, setPage: Dispatch<SetStateAction<number>>): UseTokenSearchResult {
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query, 300)
  const prevQuery = usePrevious(debouncedQuery) ?? undefined

  const handleSearch = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const input = event.target.value.trim().toLowerCase()
      const checksummedInput = isAddress(input)
      setQuery(checksummedInput || input)
      if (page !== 1) {
        setPage(1)
      }
    },
    [page, setPage],
  )

  const clearSearch = useCallback(() => {
    setQuery('')
  }, [])

  return { query, debouncedQuery, prevQuery, handleSearch, clearSearch }
}

function useScrollToTop(): void {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}

interface ResetPageParams {
  account: string | undefined
  chainId: number | undefined
  selectedView: PageViewKeys
  setPage: Dispatch<SetStateAction<number>>
}

function useResetPageOnContextChange(params: ResetPageParams): void {
  const { account, chainId, selectedView, setPage } = params
  const prevAccount = usePrevious(account)
  const prevChainId = usePrevious(chainId)
  const prevSelectedView = usePrevious(selectedView)

  useEffect(() => {
    if (chainId !== prevChainId || selectedView !== prevSelectedView || account !== prevAccount) {
      setPage(1)
    }
  }, [account, chainId, prevAccount, prevChainId, prevSelectedView, selectedView, setPage])
}

interface AccountTokensData {
  formattedTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  balances: TokenBalancesMap
  allowances: AllowancesState
  removeAllFavoriteTokens: () => void
}

function useAccountTokensData(): AccountTokensData {
  const allTokens = useTokensByAddressMap()
  const favoriteTokens = useFavoriteTokens()
  const removeAllFavoriteTokens = useResetFavoriteTokens()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens).filter(isTruthy)
  }, [allTokens])

  const tokenAddresses = useMemo(() => {
    return Object.values(allTokens).reduce<string[]>((acc, token) => {
      if (token && !(token instanceof LpToken)) {
        acc.push(token.address.toLowerCase())
      }
      return acc
    }, [])
  }, [allTokens])

  const { state: allowancesState } = useTokenAllowances(tokenAddresses)
  const { values: balances } = useTokensBalances()
  const allowances: AllowancesState = allowancesState ?? {}

  return {
    formattedTokens,
    favoriteTokens,
    balances,
    allowances,
    removeAllFavoriteTokens,
  }
}
