import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { providerNetworkSupportedAtom } from 'entities/common/providerNetworkSupported.atom'

import { useIsProviderNetworkUnsupported } from '../hooks/useIsProviderNetworkUnsupported'

export function ProviderNetworkSupportedUpdater(): null {
  const setValue = useSetAtom(providerNetworkSupportedAtom)
  const value = useIsProviderNetworkUnsupported()

  useEffect(() => {
    setValue(value)
  }, [value, setValue])

  return null
}
