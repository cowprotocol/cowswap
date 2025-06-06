import { useCallback, useEffect, useMemo, useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, DismissableInlineBanner } from '@cowprotocol/ui'

import { NewModal } from 'common/pure/NewModal'

import { EmptyList, HookDappsList, Wrapper } from './styled'

import { useAddCustomHookDapp } from '../../hooks/useAddCustomHookDapp'
import { useCustomHookDapps } from '../../hooks/useCustomHookDapps'
import { useHookById } from '../../hooks/useHookById'
import { useInternalHookDapps } from '../../hooks/useInternalHookDapps'
import { useRemoveCustomHookDapp } from '../../hooks/useRemoveCustomHookDapp'
import { AddCustomHookForm } from '../../pure/AddCustomHookForm'
import { HookDappDetails } from '../../pure/HookDappDetails'
import { HookDetailHeader } from '../../pure/HookDetailHeader'
import { HookListItem } from '../../pure/HookListItem'
import { HookListsTabs } from '../../pure/HookListsTabs'
import { HookDapp, HookDappIframe } from '../../types/hooks'
import { findHookDappById, isHookCompatible, isHookDappIframe } from '../../utils'
import { HookDappContainer } from '../HookDappContainer'
import { HookSearchInput } from '../HookSearchInput'

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
  hookToEdit?: string
  walletType: HookDappWalletCompatibility
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function HookRegistryList({ onDismiss, isPreHook, hookToEdit, walletType }: HookStoreModal) {
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)
  const [dappDetails, setDappDetails] = useState<HookDapp | null>(null)
  const [isAllHooksTab, setIsAllHooksTab] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const addCustomHookDapp = useAddCustomHookDapp(isPreHook)
  const removeCustomHookDapp = useRemoveCustomHookDapp()
  const customHookDapps = useCustomHookDapps(isPreHook)
  const hookToEditDetails = useHookById(hookToEdit, isPreHook)
  const internalHookDapps = useInternalHookDapps(isPreHook)

  const currentDapps = useMemo(
    () => (isAllHooksTab ? [...internalHookDapps, ...customHookDapps] : customHookDapps),
    [isAllHooksTab, internalHookDapps, customHookDapps],
  )

  const filteredDapps = useMemo(() => {
    if (!searchQuery) return currentDapps
    const lowerQuery = searchQuery.toLowerCase()
    return currentDapps.filter(({ name = '', descriptionShort = '' }) =>
      [name, descriptionShort].some((text) => text.toLowerCase().includes(lowerQuery)),
    )
  }, [currentDapps, searchQuery])

  const sortedFilteredDapps = useMemo(() => {
    return filteredDapps.sort((a, b) => {
      const isCompatibleA = isHookCompatible(a, walletType)
      const isCompatibleB = isHookCompatible(b, walletType)
      return isCompatibleA === isCompatibleB ? 0 : isCompatibleA ? -1 : 1
    })
  }, [filteredDapps, walletType])

  const customHooksCount = customHookDapps.length
  const allHooksCount = internalHookDapps.length + customHooksCount

  const title = selectedDapp?.name || (dappDetails ? 'Hook description' : 'Hook Store')

  const onDismissModal = useCallback(() => {
    if (hookToEdit) {
      setSelectedDapp(null)
      onDismiss()
    } else if (dappDetails) {
      setDappDetails(null)
    } else if (selectedDapp) {
      setSelectedDapp(null)
    } else {
      onDismiss()
    }
  }, [onDismiss, selectedDapp, dappDetails, hookToEdit])

  useEffect(() => {
    if (hookToEditDetails) {
      const foundDapp = findHookDappById(currentDapps, hookToEditDetails)
      setSelectedDapp(foundDapp || null)
    } else {
      setSelectedDapp(null)
    }
  }, [hookToEditDetails, currentDapps])

  useEffect(() => {
    setDappDetails(null)
  }, [isAllHooksTab])

  const handleAddCustomHook = useCallback(() => setIsAllHooksTab(false), [setIsAllHooksTab])
  const handleClearSearch = useCallback(() => setSearchQuery(''), [setSearchQuery])

  const emptyListMessage = useMemo(
    () =>
      isAllHooksTab
        ? searchQuery
          ? 'No hooks match your search.'
          : 'No hooks available.'
        : "You haven't added any custom hooks yet. Add a custom hook to get started.",
    [isAllHooksTab, searchQuery],
  )

  const DappsListContent = useMemo(
    () => (
      <>
        <HookSearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value?.trim())}
          placeholder="Search hooks by title or description"
          ariaLabel="Search hooks"
          onClear={handleClearSearch}
        />

        {isAllHooksTab && (
          <DismissableInlineBanner
            orientation={BannerOrientation.Horizontal}
            customIcon={ICON_HOOK}
            iconSize={36}
            bannerId="hooks-store-banner-tradeContainer-customHooks"
            margin="10px 10px 0"
            width="auto"
          >
            <p>
              Can't find a hook that you like?{' '}
              <span onClick={handleAddCustomHook} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Add a custom hook
              </span>
            </p>
          </DismissableInlineBanner>
        )}

        {sortedFilteredDapps.length > 0 ? (
          <HookDappsList>
            {sortedFilteredDapps.map((dapp) => (
              <HookListItem
                key={isHookDappIframe(dapp) ? dapp.url : dapp.name}
                dapp={dapp}
                walletType={walletType}
                onRemove={!isAllHooksTab ? () => removeCustomHookDapp(dapp as HookDappIframe) : undefined}
                onSelect={() => setSelectedDapp(dapp)}
                onOpenDetails={() => setDappDetails(dapp)}
              />
            ))}
          </HookDappsList>
        ) : (
          <EmptyList>{emptyListMessage}</EmptyList>
        )}
      </>
    ),
    [
      isAllHooksTab,
      searchQuery,
      sortedFilteredDapps,
      handleAddCustomHook,
      handleClearSearch,
      emptyListMessage,
      removeCustomHookDapp,
      walletType,
    ],
  )

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title={title}
        onDismiss={onDismissModal}
        contentPadding="0"
        justifyContent="flex-start"
      >
        {!dappDetails && !hookToEditDetails && !selectedDapp && (
          <HookListsTabs
            isAllHooksTab={isAllHooksTab}
            setIsAllHooksTab={setIsAllHooksTab}
            allHooksCount={allHooksCount}
            customHooksCount={customHooksCount}
            onAddCustomHook={handleAddCustomHook}
          />
        )}
        {selectedDapp ? (
          <>
            <HookDetailHeader dapp={selectedDapp} iconSize={58} gap={12} padding="24px 10px" walletType={walletType} />
            <HookDappContainer
              isPreHook={isPreHook}
              onDismiss={onDismiss}
              dapp={selectedDapp}
              hookToEdit={hookToEdit}
            />
          </>
        ) : dappDetails ? (
          <HookDappDetails dapp={dappDetails} onSelect={() => setSelectedDapp(dappDetails)} walletType={walletType} />
        ) : isAllHooksTab ? (
          DappsListContent
        ) : (
          <AddCustomHookForm isPreHook={isPreHook} walletType={walletType} addHookDapp={addCustomHookDapp}>
            {DappsListContent}
          </AddCustomHookForm>
        )}
      </NewModal>
    </Wrapper>
  )
}
