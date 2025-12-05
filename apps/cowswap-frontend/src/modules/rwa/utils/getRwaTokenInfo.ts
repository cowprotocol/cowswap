import { Currency } from '@uniswap/sdk-core'

export interface RwaTokenInfo {
  issuer: string
  tosVersion: string
  issuerName?: string
}

// TODO: Implement actual RWA token detection
// For now, this is a placeholder that returns null (no RWA tokens)
export function getRwaTokenInfo(currency: Currency | null): RwaTokenInfo | null {
  if (!currency) {
    return null
  }

  // TODO: Check if currency is RWA-restricted
  // This should check against a list of RWA tokens
  // For now, return null (no RWA tokens detected)
  
  // TEMPORARY: For testing, uncomment the line below to always show modal
  // return { issuer: 'TEST', tosVersion: 'rwa-tos-2025-01-01', issuerName: 'Test Issuer' }
  
  return {
    issuer: 'TEST',
    tosVersion: 'rwa-tos-2025-01-01',
    issuerName: 'Test Issuer',
  }
}

