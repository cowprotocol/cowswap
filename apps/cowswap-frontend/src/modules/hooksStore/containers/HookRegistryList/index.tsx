import { useCallback, useEffect, useMemo, useState } from 'react'

import { Command, HookDapp } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { NewModal } from 'common/pure/NewModal'

import { DappInfoHeader, HookDappsList, Wrapper } from './styled'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../../hookRegistry'
import { useHookById } from '../../hooks/useHookById'
import { HookDappDetails } from '../../pure/HookDappDetails'
import { HookListItem } from '../../pure/HookListItem'
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

  const hookToEditDetails = useHookById(hookToEdit, isPreHook)
  const dapps = isPreHook ? PRE_HOOK_REGISTRY[chainId] : POST_HOOK_REGISTRY[chainId]

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
      setSelectedDapp(dapps.find((i) => i.name === hookToEditDetails.dapp.name) || null)
    }
  }, [hookToEditDetails, dapps])

  return (
    <Wrapper>
      <NewModal modalMode={false} title={title} onDismiss={onDismissModal} contentPadding="0">
        {(() => {
          if (selectedDapp) {
            return (
              <>
                <DappInfoHeader>
                  <img src={selectedDapp.image} alt={selectedDapp.name} />
                  <p>{selectedDapp.description}</p>
                </DappInfoHeader>
                <HookDappContainer
                  isPreHook={isPreHook}
                  onDismiss={onDismiss}
                  onDismissModal={onDismissModal}
                  dapp={selectedDapp}
                  hookToEdit={hookToEdit}
                />
              </>
            )
          }

          if (dappDetails) {
            return <HookDappDetails 
              dapp={dappDetails} 
              onSelect={() => setSelectedDapp(dappDetails)}
            />
          }

          return (
            <HookDappsList>
              {dapps.map((dapp) => (
                <HookListItem
                  key={dapp.name}
                  dapp={dapp}
                  onSelect={() => setSelectedDapp(dapp)}
                  onOpenDetails={() => setDappDetails(dapp)}
                />
              ))}
            </HookDappsList>
          )
        })()}
      </NewModal>
    </Wrapper>
  )
}
