import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isProviderNetworkUnsupportedAtom } from 'entities/common/isProviderNetworkUnsupported.atom'

import { useIsProviderNetworkUnsupported } from '../hooks/useIsProviderNetworkUnsupported'

export function ProviderNetworkSupportedUpdater(): null {
  const setValue = useSetAtom(isProviderNetworkUnsupportedAtom)
  const value = useIsProviderNetworkUnsupported()

  useEffect(() => {
    setValue(value)
  }, [value, setValue])

  return null
}
