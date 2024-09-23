// apps/cowswap-frontend/src/modules/hooksStore/containers/HookRegistryList/index.tsx

import { useCallback, useEffect, useMemo, useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, DismissableInlineBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { NewModal } from 'common/pure/NewModal'

import { EmptyList, HookDappsList, Wrapper } from './styled'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../../hookRegistry'
import { useAddExternalHookDapp } from '../../hooks/useAddExternalHookDapp'
import { useExternalHookDapps } from '../../hooks/useExternalHookDapps'
import { useHookById } from '../../hooks/useHookById'
import { useRemoveExternalHookDapp } from '../../hooks/useRemoveExternalHookDapp'
import { AddExternalHookForm } from '../../pure/AddExternalHookForm'
import { HookDappDetails } from '../../pure/HookDappDetails'
import { HookDetailHeader } from '../../pure/HookDetailHeader'
import { HookListItem } from '../../pure/HookListItem'
import { HookListsTabs } from '../../pure/HookListsTabs'
import { HookDapp, HookDappIframe, CowHookDetailsSerialized } from '../../types/hooks'
import { findHookDappById } from '../../utils'
import { HookDappContainer } from '../HookDappContainer'
import { HookSearchInput } from '../HookSearchInput'

// Type Guards
function isCowHookDetailsSerialized(obj: any): obj is CowHookDetailsSerialized {
  return obj && typeof obj === 'object' && 'hookDetails' in obj && 'dappId' in obj
}

function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return 'url' in dapp && typeof dapp.url === 'string'
}

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
  hookToEdit?: string
}

export function HookRegistryList({ onDismiss, isPreHook, hookToEdit }: HookStoreModal) {
  const { chainId } = useWalletInfo()
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)
  const [dappDetails, setDappDetails] = useState<HookDapp | null>(null)

  const [isAllHooksTab, setIsAllHooksTab] = useState<boolean>(true)

  const isSmartContractWallet = useIsSmartContractWallet()
  const addExternalHookDapp = useAddExternalHookDapp()
  const removeExternalHookDapp = useRemoveExternalHookDapp()
  const externalHookDapps = useExternalHookDapps()
  const hookToEditDetails = useHookById(hookToEdit, isPreHook)

  // State for Search Input
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Clear search input handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  // Compute customHookDapps
  const customHookDapps = useMemo(() => {
    const filtered = externalHookDapps.filter(isHookDappIframe).filter((dapp) => dapp.isCustom)
    console.log('Custom Hook Dapps:', filtered) // Debugging
    return filtered
  }, [externalHookDapps])

  // Compute dapps based on the current tab and isPreHook
  const dapps = useMemo(() => {
    if (isAllHooksTab) {
      if (isPreHook) {
        return PRE_HOOK_REGISTRY[chainId] || []
      } else {
        return [...(POST_HOOK_REGISTRY[chainId] || []), ...externalHookDapps]
      }
    } else {
      return customHookDapps
    }
  }, [isAllHooksTab, isPreHook, chainId, externalHookDapps, customHookDapps])

  // Compute filteredDapps based on searchQuery
  const filteredDapps = useMemo(() => {
    if (!searchQuery.trim()) return dapps
    const lowerQuery = searchQuery.toLowerCase()
    return dapps.filter((dapp) => {
      // Ensure dapp.name is a string
      const name = typeof dapp.name === 'string' ? dapp.name.toLowerCase() : ''
      // Ensure dapp.description is a string
      const description = typeof dapp.description === 'string' ? dapp.description.toLowerCase() : ''
      return name.includes(lowerQuery) || description.includes(lowerQuery)
    })
  }, [dapps, searchQuery])

  // Compute counts for tabs
  const allHooksCount = useMemo(() => {
    if (isPreHook) {
      return PRE_HOOK_REGISTRY[chainId]?.length || 0
    } else {
      return (POST_HOOK_REGISTRY[chainId]?.length || 0) + externalHookDapps.length
    }
  }, [isPreHook, chainId, externalHookDapps])

  const customHooksCount = useMemo(() => customHookDapps.length, [customHookDapps])

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
      if (!isCowHookDetailsSerialized(hookToEditDetails)) {
        console.error('hookToEditDetails is missing dappId:', hookToEditDetails)
        setSelectedDapp(null)
        return
      }

      setSelectedDapp(findHookDappById(dapps, hookToEditDetails) || null)
    }
  }, [hookToEditDetails, dapps])

  // Reset dappDetails when tab changes
  useEffect(() => {
    setDappDetails(null)
  }, [isAllHooksTab])

  useEffect(() => {
    console.log('External Hook Dapps:', externalHookDapps)
  }, [externalHookDapps])

  // Handle add custom hook button
  const handleAddCustomHook = useCallback(() => {
    setIsAllHooksTab(false)
  }, [setIsAllHooksTab])

  // Determine the message for EmptyList based on the active tab and search query
  const emptyListMessage = useMemo(() => {
    if (isAllHooksTab) {
      return searchQuery.trim() ? 'No hooks match your search.' : 'No hooks available.'
    } else {
      return "You haven't added any custom hooks yet. Add a custom hook to get started."
    }
  }, [isAllHooksTab, searchQuery])

  // Extract search input component using HookSearchInput
  const SearchInputComponent = (
    <HookSearchInput
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search hooks by title or description"
      ariaLabel="Search hooks"
      onClear={handleClearSearch}
    />
  )

  const renderContent = () => (
    <>
      {isAllHooksTab && (
        <DismissableInlineBanner
          orientation={BannerOrientation.Horizontal}
          customIcon={ICON_HOOK}
          iconSize={36}
          bannerId="hooks-store-banner-tradeContainer-customHooks"
          margin="0 10px 10px"
        >
          <p>
            Can't find a hook that you like?{' '}
            <span onClick={handleAddCustomHook} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Add a custom hook
            </span>
          </p>
        </DismissableInlineBanner>
      )}

      {(isAllHooksTab || customHookDapps.length > 0) && SearchInputComponent}

      {filteredDapps.length > 0 ? (
        <HookDappsList>
          {filteredDapps.map((dapp) => (
            <HookListItem
              key={isHookDappIframe(dapp) ? dapp.url : dapp.name}
              dapp={dapp}
              onRemove={isAllHooksTab ? undefined : () => removeExternalHookDapp(dapp as HookDappIframe)}
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
        {!dappDetails && (
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
            renderContent()
          ) : (
            <AddExternalHookForm
              isPreHook={isPreHook}
              isSmartContractWallet={isSmartContractWallet}
              addHookDapp={addExternalHookDapp}
            >
              {renderContent()}
            </AddExternalHookForm>
          )
        })()}
      </NewModal>
    </Wrapper>
  )
}
