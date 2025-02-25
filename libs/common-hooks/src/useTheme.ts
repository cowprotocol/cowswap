'use client'

import styled from 'styled-components/macro'

import type { DefaultTheme } from 'styled-components/macro'

import '@cowprotocol/types'

// Re-export the theme hook with proper typing
export function useTheme(): DefaultTheme {
  // SSR-safe check
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // For SSR environments (Next.js)
    const { useTheme: serverUseTheme } = require('styled-components')
    return serverUseTheme()
  } else {
    // For client-side environments (Vite)
    const { useTheme: clientUseTheme } = require('styled-components/macro')
    return clientUseTheme()
  }
}

// Re-export styled for convenience
export { styled }
