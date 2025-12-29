import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import {
  ListSearchResponse,
  ListState,
  normalizeListSource,
  restrictedListsAtom,
  useFilterBlockedLists,
  useIsListBlocked,
  useListsEnabledState,
  useRemoveList,
  useToggleList,
} from '@cowprotocol/tokens'
import { Loader } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import {
  getConsentFromCache,
  rwaConsentCacheAtom,
  RwaConsentKey,
  useGeoCountry,
  useGeoStatus,
  useRwaConsentModalState,
} from 'modules/rwa'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { useAddListImport } from '../../hooks/useAddListImport'
import { useIsListRequiresConsent } from '../../hooks/useIsListRequiresConsent'
import { ImportTokenListItem } from '../../pure/ImportTokenListItem'
import { ListItem } from '../../pure/ListItem'

interface ListSearchState {
  source: 'existing' | 'external'
  loading: boolean
  listToImport: ListState | null
}

export interface ManageListsProps {
  lists: ListState[]
  listSearchResponse: ListSearchResponse
  isListUrlValid?: boolean
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function ManageLists(props: ManageListsProps): ReactNode {
  const { lists, listSearchResponse, isListUrlValid } = props

  const { account } = useWalletInfo()
  const country = useGeoCountry()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()

  // Only filter by country (blocked), NOT by consent requirement
  // Lists requiring consent should be visible so users can give consent
  const filteredLists = useFilterBlockedLists(lists, country)

  const activeTokenListsIds = useListsEnabledState()
  const addListImport = useAddListImport()
  const cowAnalytics = useCowAnalytics()

  const removeList = useRemoveList((source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: 'Remove List',
      label: source,
    })
  })

  const baseToggleList = useToggleList((enable, source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: `${enable ? 'Enable' : 'Disable'} List`,
      label: source,
    })
  })

  // Wrapper that checks if consent is required before toggling
  const toggleList = useCallback(
    (list: ListState, enabled: boolean) => {
      // Only check consent when trying to enable (not disable)
      if (enabled) {
        // Already enabled, just toggle off
        baseToggleList(list, enabled)
        return
      }

      // Trying to enable - check if consent is required
      if (!geoStatus.country && restrictedLists.isLoaded) {
        const normalizedSource = normalizeListSource(list.source)
        const consentHash = restrictedLists.consentHashPerList[normalizedSource]

        if (consentHash) {
          // List is restricted - check if consent exists
          let hasConsent = false
          if (account) {
            const consentKey: RwaConsentKey = { wallet: account, ipfsHash: consentHash }
            const existingConsent = getConsentFromCache(consentCache, consentKey)
            hasConsent = !!existingConsent?.acceptedAt
          }

          if (!hasConsent) {
            // Need consent - open modal
            openRwaConsentModal({
              consentHash,
              onImportSuccess: () => {
                // After consent, toggle the list on
                baseToggleList(list, enabled)
              },
            })
            return
          }
        }
      }

      // No consent required or consent already given
      baseToggleList(list, enabled)
    },
    [baseToggleList, geoStatus.country, restrictedLists, account, consentCache, openRwaConsentModal],
  )

  const { source, listToImport, loading } = useListSearchResponse(listSearchResponse)
  const { isBlocked: isListToImportBlocked } = useIsListBlocked(listToImport?.source, country)
  const { requiresConsent } = useIsListRequiresConsent(listToImport?.source)

  // Block the list if country is blocked OR if consent is required (unknown country, no consent)
  const isBlocked = isListToImportBlocked || requiresConsent

  return (
    <styledEl.Wrapper>
      {isListUrlValid && !listToImport?.list && !loading && (
        <styledEl.InputError>
          <Trans>Error importing token list</Trans>
        </styledEl.InputError>
      )}
      {loading && (
        <styledEl.LoaderWrapper>
          <Loader />
        </styledEl.LoaderWrapper>
      )}
      {listToImport && (
        <styledEl.ImportListsContainer>
          <ImportTokenListItem
            source={source}
            list={listToImport}
            isBlocked={isBlocked}
            blockReason={requiresConsent ? 'Consent required. Connect wallet to proceed.' : undefined}
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.LIST,
              action: 'Import List',
              label: listToImport.source,
            })}
            importList={() => {
              if (listToImport) {
                addListImport(listToImport)
              }
            }}
          />
        </styledEl.ImportListsContainer>
      )}
      <styledEl.ListsContainer id="tokens-lists-table">
        {filteredLists
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map((list) => (
            <ListItem
              key={list.source}
              list={list}
              enabled={!!activeTokenListsIds[list.source]}
              removeList={removeList}
              toggleList={toggleList}
            />
          ))}
      </styledEl.ListsContainer>
    </styledEl.Wrapper>
  )
}

function useListSearchResponse(listSearchResponse: ListSearchResponse): ListSearchState {
  return useMemo(() => {
    const { source, response } = listSearchResponse

    if (source === 'existing') {
      return {
        source,
        loading: false,
        listToImport: response,
      }
    }

    if (!response) {
      return { source, loading: false, listToImport: null }
    }

    const { isLoading, data } = response

    return {
      source,
      loading: isLoading,
      listToImport: data || null,
    }
  }, [listSearchResponse])
}
