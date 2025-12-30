import { ReactNode, useCallback, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import {
  ListState,
  TokenListCategory,
  useAddList,
  useAddUserToken,
  useAllListsList,
  useIsListBlocked,
  useTokenListsTags,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'
import { useGeoCountry } from 'modules/rwa'
import { useLpTokensWithBalances } from 'modules/yield/shared'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { getDefaultTokenListCategories } from './getDefaultTokenListCategories'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useIsListRequiresConsent } from '../../hooks/useIsListRequiresConsent'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useRestrictedTokenImportStatus } from '../../hooks/useRestrictedTokenImportStatus'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useTokensToSelect } from '../../hooks/useTokensToSelect'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'
import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const Wrapper = styled.div`
  width: 100%;

  > div {
    height: calc(100vh - 200px);
    min-height: 600px;
  }
`

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function SelectTokenWidget({ displayLpTokenLists, standalone }: SelectTokenWidgetProps): ReactNode {
  const {
    open,
    onSelectToken,
    tokenToImport,
    listToImport,
    selectedToken,
    onInputPressEnter,
    selectedPoolAddress,
    field,
    oppositeToken,
  } = useSelectTokenWidgetState()
  const { count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const chainsToSelect = useChainsToSelect()
  const onSelectChain = useOnSelectChain()

  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)
  const disableErc20 = field === Field.OUTPUT && !!displayLpTokenLists

  const tokenListCategoryState = useState<TokenListCategory[] | null>(
    getDefaultTokenListCategories(field, oppositeToken, lpTokensWithBalancesCount),
  )

  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { account } = useWalletInfo()

  const cowAnalytics = useCowAnalytics()
  const trackAddListAnalytics = useCallback(
    (source: string) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.LIST,
        action: 'Add List Success',
        label: source,
      })
    },
    [cowAnalytics],
  )
  const addCustomTokenLists = useAddList(trackAddListAnalytics)
  const importTokenCallback = useAddUserToken()

  const {
    tokens: allTokens,
    isLoading: areTokensLoading,
    favoriteTokens,
    areTokensFromBridge,
    isRouteAvailable,
  } = useTokensToSelect()

  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllListsList()
  const balancesState = useTokensBalancesCombined()
  const unsupportedTokens = useUnsupportedTokens()
  const permitCompatibleTokens = usePermitCompatibleTokens()
  const tokenListTags = useTokenListsTags()
  const onTokenListAddingError = useOnTokenListAddingError()

  const isInjectedWidgetMode = isInjectedWidget()

  const closeTokenSelectWidget = useCloseTokenSelectWidget()

  const { isImportDisabled, blockReason } = useRestrictedTokenImportStatus(tokenToImport)
  const country = useGeoCountry()
  const { isBlocked } = useIsListBlocked(listToImport?.source, country)
  const { requiresConsent } = useIsListRequiresConsent(listToImport?.source)

  // without wallet: only block if country is restricted, otherwise list is always visible
  // with wallet: block if country is restricted or if consent is required (unknown country)
  const isListBlocked = isBlocked || (!!account && requiresConsent)

  const openPoolPage = useCallback(
    (selectedPoolAddress: string) => {
      updateSelectTokenWidget({ selectedPoolAddress })
    },
    [updateSelectTokenWidget],
  )

  const closePoolPage = useCallback(() => {
    updateSelectTokenWidget({ selectedPoolAddress: undefined })
  }, [updateSelectTokenWidget])

  const resetTokenImport = useCallback(() => {
    updateSelectTokenWidget({
      tokenToImport: undefined,
    })
  }, [updateSelectTokenWidget])

  const onDismiss = useCallback(() => {
    setIsManageWidgetOpen(false)
    closeTokenSelectWidget()
  }, [closeTokenSelectWidget])

  const selectAndClose = useCallback(
    (token: TokenWithLogo): void => {
      onSelectToken?.(token)
      onDismiss()
    },
    [onSelectToken, onDismiss],
  )

  const importTokenAndClose = useCallback(
    (tokens: TokenWithLogo[]): void => {
      importTokenCallback(tokens)
      if (tokens[0]) {
        selectAndClose(tokens[0])
      }
    },
    [importTokenCallback, selectAndClose],
  )

  const importListAndBack = (list: ListState): void => {
    try {
      addCustomTokenLists(list)
    } catch (error) {
      onDismiss()
      onTokenListAddingError(error)
    }
    updateSelectTokenWidget({ listToImport: undefined })
  }

  if (!onSelectToken || !open) return null

  return (
    <Wrapper>
      {(() => {
        if (tokenToImport && !standalone) {
          return (
            <ImportTokenModal
              tokens={[tokenToImport]}
              onDismiss={onDismiss}
              onBack={resetTokenImport}
              onImport={importTokenAndClose}
              isImportDisabled={isImportDisabled}
              blockReason={blockReason}
            />
          )
        }

        if (listToImport && !standalone) {
          // only show consent message when wallet is connected and consent is required
          const listBlockReason =
            account && requiresConsent ? t`This list requires consent before importing.` : undefined

          return (
            <ImportListModal
              list={listToImport}
              isBlocked={isListBlocked}
              blockReason={listBlockReason}
              onDismiss={onDismiss}
              onBack={resetTokenImport}
              onImport={importListAndBack}
            />
          )
        }

        if (isManageWidgetOpen && !standalone) {
          return (
            <ManageListsAndTokens
              lists={allTokenLists}
              customTokens={userAddedTokens}
              onDismiss={onDismiss}
              onBack={() => setIsManageWidgetOpen(false)}
            />
          )
        }

        if (selectedPoolAddress) {
          return (
            <LpTokenPage
              poolAddress={selectedPoolAddress}
              onDismiss={onDismiss}
              onBack={closePoolPage}
              onSelectToken={onSelectToken}
            />
          )
        }

        return (
          <SelectTokenModal
            standalone={standalone}
            displayLpTokenLists={displayLpTokenLists}
            unsupportedTokens={unsupportedTokens}
            selectedToken={selectedToken}
            allTokens={allTokens}
            favoriteTokens={standalone ? EMPTY_FAV_TOKENS : favoriteTokens}
            balancesState={balancesState}
            permitCompatibleTokens={permitCompatibleTokens}
            onSelectToken={onSelectToken}
            onInputPressEnter={onInputPressEnter}
            onDismiss={onDismiss}
            onOpenManageWidget={() => setIsManageWidgetOpen(true)}
            hideFavoriteTokensTooltip={isInjectedWidgetMode}
            openPoolPage={openPoolPage}
            tokenListCategoryState={tokenListCategoryState}
            disableErc20={disableErc20}
            account={account}
            chainsToSelect={chainsToSelect}
            onSelectChain={onSelectChain}
            areTokensLoading={areTokensLoading}
            tokenListTags={tokenListTags}
            areTokensFromBridge={areTokensFromBridge}
            isRouteAvailable={isRouteAvailable}
          />
        )
      })()}
    </Wrapper>
  )
}
