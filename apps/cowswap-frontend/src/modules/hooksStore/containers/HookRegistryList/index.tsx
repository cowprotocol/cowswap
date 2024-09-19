import { useCallback, useEffect, useMemo, useState } from 'react'

import { Command } from '@cowprotocol/types'
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
import { HookDapp, HookDappIframe } from '../../types/hooks'
import { findHookDappById } from '../../utils'
import { HookDappContainer } from '../HookDappContainer'

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
  hookToEdit?: string
}

export function HookRegistryList({ onDismiss, isPreHook, hookToEdit }: HookStoreModal) {
  const { chainId } = useWalletInfo()
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)
  const [dappDetails, setDappDetails] = useState<HookDapp | null>(null)

  const tabsState = useState(true)
  const [isVerifiedHooksTab] = tabsState

  const isSmartContractWallet = useIsSmartContractWallet()
  const addExternalHookDapp = useAddExternalHookDapp()
  const removeExternalHookDapp = useRemoveExternalHookDapp()
  const externalHookDapps = useExternalHookDapps()
  const hookToEditDetails = useHookById(hookToEdit, isPreHook)

  const dapps = isVerifiedHooksTab
    ? isPreHook
      ? PRE_HOOK_REGISTRY[chainId]
      : POST_HOOK_REGISTRY[chainId]
    : externalHookDapps

  const title = useMemo(() => {
    if (selectedDapp) return selectedDapp.name
    if (dappDetails) return 'Hook description'

    return 'Hook Store'
  }, [selectedDapp, dappDetails])

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

  useEffect(() => {
    if (!hookToEditDetails) {
      setSelectedDapp(null)
    } else {
      setSelectedDapp(findHookDappById(dapps, hookToEditDetails) || null)
    }
  }, [hookToEditDetails, dapps])

  // close details view when tab changed
  useEffect(() => {
    setDappDetails(null)
  }, [isVerifiedHooksTab])

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title={title}
        onDismiss={onDismissModal}
        contentPadding="0"
        justifyContent="flex-start"
      >
        <HookListsTabs tabsState={tabsState} />
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

          const dappsList = dapps.length ? (
            <HookDappsList>
              {dapps.map((dapp) => (
                <HookListItem
                  key={dapp.name}
                  dapp={dapp}
                  onRemove={isVerifiedHooksTab ? undefined : () => removeExternalHookDapp(dapp as HookDappIframe)}
                  onSelect={() => setSelectedDapp(dapp)}
                  onOpenDetails={() => setDappDetails(dapp)}
                />
              ))}
            </HookDappsList>
          ) : (
            <EmptyList>No hook-dapps yet</EmptyList>
          )

          return (
            <>
              {isVerifiedHooksTab ? (
                dappsList
              ) : (
                <AddExternalHookForm
                  isPreHook={isPreHook}
                  isSmartContractWallet={isSmartContractWallet}
                  addHookDapp={addExternalHookDapp}
                >
                  {dappsList}
                </AddExternalHookForm>
              )}
            </>
          )
        })()}
      </NewModal>
    </Wrapper>
  )
}
