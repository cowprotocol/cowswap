import { atom } from 'jotai'

import { jotaiStore } from '@cowprotocol/core'

import { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail } from '../eip6963-types'

export const multiInjectedProvidersAtom = atom<EIP6963ProviderDetail[]>(window.ethereum ? [window.ethereum] : [])

window.addEventListener('eip6963:announceProvider', (event: Event) => {
  const providerEvent = event as EIP6963AnnounceProviderEvent

  jotaiStore.set(multiInjectedProvidersAtom, (prev: EIP6963ProviderDetail[]) => {
    const newProvider = providerEvent.detail
    const existingProvider = prev.find((p) => p.info.uuid === newProvider.info.uuid)

    if (existingProvider) return prev

    return [...prev, newProvider]
  })
})

window.dispatchEvent(new Event('eip6963:requestProvider'))
