import { ComponentType } from 'react'

export interface WrapperInfo {
  name: string
  description?: string
  image?: string
  website?: string
}

export interface WrapperRegistryEntry {
  info: WrapperInfo
  // Dynamically imports the component that decodes and renders the WrapperEntry.data
  // field. The dynamic import enables code splitting: wrapper render code is only
  // fetched when an order actually uses that wrapper address.
  loadComponent: () => Promise<ComponentType<{ data: string }>>
}
