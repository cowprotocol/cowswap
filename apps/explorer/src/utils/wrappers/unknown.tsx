import React from 'react'

import { useContractName } from './_vaultLookup'

export function createUnknownComponent(address: string): React.ComponentType<{ data: string }> {
  function UnknownWrapperComponent(_props: { data: string }): React.ReactElement | null {
    const name = useContractName(address)
    if (!name) return null
    return <span>{name}</span>
  }
  return UnknownWrapperComponent
}
