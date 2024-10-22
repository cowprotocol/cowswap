import { useCallback, useEffect, useMemo, useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
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
  const [searchQuery, setSearchQuery] = useState<string>('')

  const isSmartContractWallet = useIsSmartContractWallet()
  const walletType = isSmartContractWallet
    ? HookDappWalletCompatibility.SMART_CONTRACT
    : HookDappWalletCompatibility.EOA
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
    const isCompatible = (dapp: HookDapp) =>
      !dapp.conditions?.walletCompatibility || dapp.conditions.walletCompatibility.includes(walletType)
    return filteredDapps.sort((a, b) => (isCompatible(a) === isCompatible(b) ? 0 : isCompatible(a) ? -1 : 1))
  }, [filteredDapps, isSmartContractWallet])

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

  const handleAddCustomHook = () => setIsAllHooksTab(false)
  const handleClearSearch = () => setSearchQuery('')

  const emptyListMessage = isAllHooksTab
    ? searchQuery
      ? 'No hooks match your search.'
      : 'No hooks available.'
    : "You haven't added any custom hooks yet. Add a custom hook to get started."

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

      {sortedFilteredDapps.length > 0 ? (
        <HookDappsList>
          {sortedFilteredDapps.map((dapp) => (
            <HookListItem
              key={isHookDappIframe(dapp) ? dapp.url : dapp.name}
              dapp={dapp}
              walletType={
                isSmartContractWallet ? HookDappWalletCompatibility.SMART_CONTRACT : HookDappWalletCompatibility.EOA
              }
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
          <AddCustomHookForm
            isPreHook={isPreHook}
            isSmartContractWallet={isSmartContractWallet}
            addHookDapp={addCustomHookDapp}
          >
            {DappsListContent}
          </AddCustomHookForm>
        )}
      </NewModal>
    </Wrapper>
  )
}
