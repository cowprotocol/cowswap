import React from 'react'

import { cowAppDataLatestScheme } from '@cowprotocol/cow-sdk'

import { decodeFullAppData } from './decodeFullAppData'
import { WRAPPERS_BY_ADDRESS, WrapperInfo } from './wrapperRegistry'

export interface ResolvedWrapper {
  address: string
  data: string | undefined
  isOmittable: boolean
  info: WrapperInfo
  loadComponent: () => Promise<React.ComponentType<{ data: string }>>
}

export function getOrderWrappers(fullAppData: string | undefined): ResolvedWrapper[] {
  const appData = decodeFullAppData(fullAppData)
  if (!appData) return []

  const metadata = (appData as { metadata?: cowAppDataLatestScheme.Metadata }).metadata
  const entries = metadata?.wrappers ?? []

  return entries.map((entry) => {
    const registryEntry = WRAPPERS_BY_ADDRESS[entry.address.toLowerCase()]

    if (registryEntry) {
      return {
        address: entry.address,
        data: entry.data,
        isOmittable: entry.isOmittable ?? false,
        info: registryEntry.info,
        loadComponent: registryEntry.loadComponent,
      }
    }

    const short = `${entry.address.slice(0, 6)}…${entry.address.slice(-4)}`
    return {
      address: entry.address,
      data: entry.data,
      isOmittable: entry.isOmittable ?? false,
      info: { name: short },
      loadComponent: async () => {
        const { createUnknownComponent } = await import('./wrappers/unknown')
        return createUnknownComponent(entry.address)
      },
    }
  })
}
