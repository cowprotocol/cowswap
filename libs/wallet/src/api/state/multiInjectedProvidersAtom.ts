import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { jotaiStore } from '@cowprotocol/core'

import { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail } from '../eip6963-types'

export const multiInjectedProvidersAtom = atom<EIP6963ProviderDetail[]>([])

// UUID of the selected EIP-6963 provider
export const selectedEip6963ProviderAtom = atomWithStorage<string | null>('selectedEip6963ProviderAtom:v1', null)

window.addEventListener('eip6963:announceProvider', (event: Event) => {
  const providerEvent = event as EIP6963AnnounceProviderEvent

  jotaiStore.set(multiInjectedProvidersAtom, (prev: EIP6963ProviderDetail[]) => {
    const newProvider = providerEvent.detail
    const existingProvider = prev.find((p) => p.info.uuid === newProvider.info.uuid)

    if (existingProvider) return prev

    return [newProvider, ...prev]
  })
})

window.dispatchEvent(new Event('eip6963:requestProvider'))
