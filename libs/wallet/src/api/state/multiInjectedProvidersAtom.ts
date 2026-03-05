import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { createStore } from 'jotai/vanilla'

import { getJotaiIsolatedStorage, jotaiStore } from '@cowprotocol/core'
import { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail } from '@cowprotocol/types'

export const multiInjectedProvidersAtom = atom<EIP6963ProviderDetail[]>([])
type JotaiStore = ReturnType<typeof createStore>
const currentJotaiStore = jotaiStore as unknown as JotaiStore

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

  const previousProviders = currentJotaiStore.get(multiInjectedProvidersAtom)
  const newProvider = providerEvent.detail
  const existingProvider = previousProviders.find((provider) => provider.info.rdns === newProvider.info.rdns)

  if (existingProvider) return

  currentJotaiStore.set(multiInjectedProvidersAtom, [newProvider, ...previousProviders])
})

window.dispatchEvent(new Event('eip6963:requestProvider'))
