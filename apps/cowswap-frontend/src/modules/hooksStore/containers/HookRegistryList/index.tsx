import { useCallback, useState } from 'react'

import { Command, HookDapp } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { NewModal } from 'common/pure/NewModal'

import { HookDappsList, Wrapper } from './styled'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../../hookRegistry'
import { HookListItem } from '../../pure/HookListItem'
import { HookDappContainer } from '../HookDappContainer'

const MODAL_MAX_WIDTH = 450

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
}

export function HookRegistryList({ onDismiss, isPreHook }: HookStoreModal) {
  const { chainId } = useWalletInfo()
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)

  const dapps = isPreHook ? PRE_HOOK_REGISTRY[chainId] : POST_HOOK_REGISTRY[chainId]

  const title = selectedDapp ? selectedDapp.name : 'Hook Store'

  const onDismissModal = useCallback(() => {
    if (selectedDapp) {
      setSelectedDapp(null)
    } else {
      onDismiss()
    }
  }, [onDismiss, selectedDapp])

  return (
    <Wrapper>
      <NewModal modalMode={!selectedDapp} title={title} onDismiss={onDismissModal} maxWidth={MODAL_MAX_WIDTH}>
        {selectedDapp ? (
          <HookDappContainer
            isPreHook={isPreHook}
            onDismiss={onDismiss}
            onDismissModal={onDismissModal}
            dapp={selectedDapp}
          />
        ) : (
          <HookDappsList>
            {dapps.map((dapp) => (
              <HookListItem key={dapp.name} dapp={dapp} onSelect={setSelectedDapp} />
            ))}
          </HookDappsList>
        )}
      </NewModal>
    </Wrapper>
  )
}
