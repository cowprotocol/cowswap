import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage, jotaiStore } from '@cowprotocol/core'
import { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail } from '@cowprotocol/types'

export const multiInjectedProvidersAtom = atom<EIP6963ProviderDetail[]>([])

// RDNS of the selected EIP-6963 provider
export const selectedEip6963ProviderRdnsAtom = atomWithStorage<string | null>(
  'selectedEip6963ProviderAtom:v0',
  null,
  getJotaiIsolatedStorage(),
)

export const selectedEip6963ProviderAtom = atom((get) => {
  const providers = get(multiInjectedProvidersAtom)
  const selectedProviderId = get(selectedEip6963ProviderRdnsAtom)

  return selectedProviderId ? providers.find((p) => p.info.rdns === selectedProviderId) : null
})

window.addEventListener('eip6963:announceProvider', (event: Event) => {
  const providerEvent = event as EIP6963AnnounceProviderEvent

  jotaiStore.set(multiInjectedProvidersAtom, (prev: EIP6963ProviderDetail[]) => {
    const newProvider = providerEvent.detail
    const existingProvider = prev.find((p) => p.info.rdns === newProvider.info.rdns)

    if (existingProvider) return prev

    return [newProvider, ...prev]
  })
})

window.dispatchEvent(new Event('eip6963:requestProvider'))
