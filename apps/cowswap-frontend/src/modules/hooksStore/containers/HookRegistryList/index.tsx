import { useCallback, useEffect, useMemo, useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, DismissableInlineBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

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
import { findHookDappById, isHookDappIframe } from '../../utils'
import { HookDappContainer } from '../HookDappContainer'
import { HookSearchInput } from '../HookSearchInput'

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
  hookToEdit?: string
}

export function HookRegistryList({ onDismiss, isPreHook, hookToEdit }: HookStoreModal) {
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)
  const [dappDetails, setDappDetails] = useState<HookDapp | null>(null)

  const [isAllHooksTab, setIsAllHooksTab] = useState<boolean>(true)

  const isSmartContractWallet = useIsSmartContractWallet()
  const addCustomHookDapp = useAddCustomHookDapp(isPreHook)
  const removeCustomHookDapp = useRemoveCustomHookDapp()
  const customHookDapps = useCustomHookDapps(isPreHook)
  const hookToEditDetails = useHookById(hookToEdit, isPreHook)

  // State for Search Input
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Clear search input handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const internalHookDapps = useInternalHookDapps(isPreHook)

  const currentDapps = useMemo(() => {
    return isAllHooksTab ? internalHookDapps.concat(customHookDapps) : customHookDapps
  }, [isAllHooksTab, internalHookDapps, customHookDapps])

  // Compute filteredDapps based on searchQuery
  const filteredDapps = useMemo(() => {
    if (!searchQuery) return currentDapps

    const lowerQuery = searchQuery.toLowerCase()

    return currentDapps.filter((dapp) => {
      const name = dapp.name?.toLowerCase() || ''
      const description = dapp.descriptionShort?.toLowerCase() || ''

      return name.includes(lowerQuery) || description.includes(lowerQuery)
    })
  }, [currentDapps, searchQuery])

  const customHooksCount = customHookDapps.length
  const allHooksCount = internalHookDapps.length + customHooksCount

  // Compute title based on selected dapp or details
  const title = useMemo(() => {
    if (selectedDapp) return selectedDapp.name
    if (dappDetails) return 'Hook description'
    return 'Hook Store'
  }, [selectedDapp, dappDetails])

  // Handle modal dismiss
  const onDismissModal = useCallback(() => {
    if (hookToEdit) {
      setSelectedDapp(null)
      onDismiss()
      return
    }

    if (dappDetails) {
      setDappDetails(null)
    } else if (selectedDapp) {
      setSelectedDapp(null)
    } else {
      onDismiss()
    }
  }, [onDismiss, selectedDapp, dappDetails, hookToEdit])

  // Handle hookToEditDetails
  useEffect(() => {
    if (!hookToEditDetails) {
      setSelectedDapp(null)
    } else {
      setSelectedDapp(findHookDappById(currentDapps, hookToEditDetails) || null)
    }
  }, [hookToEditDetails, currentDapps])

  // Reset dappDetails when tab changes
  useEffect(() => {
    setDappDetails(null)
  }, [isAllHooksTab])

  // Handle add custom hook button
  const handleAddCustomHook = useCallback(() => {
    setIsAllHooksTab(false)
  }, [setIsAllHooksTab])

  // Determine the message for EmptyList based on the active tab and search query
  const emptyListMessage = useMemo(() => {
    if (isAllHooksTab) {
      return searchQuery ? 'No hooks match your search.' : 'No hooks available.'
    } else {
      return "You haven't added any custom hooks yet. Add a custom hook to get started."
    }
  }, [isAllHooksTab, searchQuery])

  const DappsListContent = (
    <>
      {isAllHooksTab && (
        <DismissableInlineBanner
          orientation={BannerOrientation.Horizontal}
          customIcon={ICON_HOOK}
          iconSize={36}
          bannerId="hooks-store-banner-tradeContainer-customHooks"
          margin="0 10px 10px"
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

      <HookSearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value?.trim())}
        placeholder="Search hooks by title or description"
        ariaLabel="Search hooks"
        onClear={handleClearSearch}
      />

      {filteredDapps.length > 0 ? (
        <HookDappsList>
          {filteredDapps.map((dapp) => (
            <HookListItem
              key={isHookDappIframe(dapp) ? dapp.url : dapp.name}
              dapp={dapp}
              onRemove={isAllHooksTab ? undefined : () => removeCustomHookDapp(dapp as HookDappIframe)}
              onSelect={() => setSelectedDapp(dapp)}
              onOpenDetails={() => setDappDetails(dapp)}
            />
          ))}
        </HookDappsList>
      ) : (
        <EmptyList>{emptyListMessage}</EmptyList>
      )}
    </>
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
        {!dappDetails && !hookToEditDetails && (
          <HookListsTabs
            isAllHooksTab={isAllHooksTab}
            setIsAllHooksTab={setIsAllHooksTab}
            allHooksCount={allHooksCount}
            customHooksCount={customHooksCount}
            onAddCustomHook={handleAddCustomHook}
          />
        )}
        {(() => {
          if (selectedDapp) {
            return (
              <>
                <HookDetailHeader dapp={selectedDapp} iconSize={58} gap={12} padding="24px 10px" />
                <HookDappContainer
                  isPreHook={isPreHook}
                  onDismiss={onDismiss}
                  dapp={selectedDapp}
                  hookToEdit={hookToEdit}
                />
              </>
            )
          }

          if (dappDetails) {
            return <HookDappDetails dapp={dappDetails} onSelect={() => setSelectedDapp(dappDetails)} />
          }

          return isAllHooksTab ? (
            DappsListContent
          ) : (
            <AddCustomHookForm
              isPreHook={isPreHook}
              isSmartContractWallet={isSmartContractWallet}
              addHookDapp={addCustomHookDapp}
            >
              {DappsListContent}
            </AddCustomHookForm>
          )
        })()}
      </NewModal>
    </Wrapper>
  )
}
