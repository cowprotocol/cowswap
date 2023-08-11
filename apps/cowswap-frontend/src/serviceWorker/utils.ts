/// <reference lib="webworker" />

import { PrecacheEntry } from 'workbox-precaching/_types'

export function toURL(entry: string | PrecacheEntry): string {
  return typeof entry === 'string' ? entry : entry.url
}
