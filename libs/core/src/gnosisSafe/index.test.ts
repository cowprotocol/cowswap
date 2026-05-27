import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getSafeWebUrl } from './index'

const SAFE_ADDRESS = '0x000000000000000000000000000000000000dEaD'
const SAFE_TX_HASH = '0x' + 'a'.repeat(64)

describe('getSafeWebUrl', () => {
  it('uses the query-param format (safe= as query, not as path segment) on MAINNET', () => {
    const url = getSafeWebUrl(SupportedChainId.MAINNET, SAFE_ADDRESS, SAFE_TX_HASH)
    const mainnetPrefix = CHAIN_INFO[SupportedChainId.MAINNET].addressPrefix

    // The fix: safe identifier must be a query param, not a path segment.
    expect(url).toContain(`?safe=${mainnetPrefix}:${SAFE_ADDRESS}`)

    // The transactions/tx path must NOT contain the safe identifier as a path segment.
    expect(url).not.toContain(`/${mainnetPrefix}:${SAFE_ADDRESS}/transactions`)

    // The id query param must remain correct.
    expect(url).toContain(`&id=multisig_${SAFE_ADDRESS}_${SAFE_TX_HASH}`)
  })

  it('builds the full expected URL on MAINNET', () => {
    const url = getSafeWebUrl(SupportedChainId.MAINNET, SAFE_ADDRESS, SAFE_TX_HASH)
    const mainnetPrefix = CHAIN_INFO[SupportedChainId.MAINNET].addressPrefix

    expect(url).toBe(
      `https://app.safe.global/transactions/tx?safe=${mainnetPrefix}:${SAFE_ADDRESS}&id=multisig_${SAFE_ADDRESS}_${SAFE_TX_HASH}`,
    )
  })

  it('uses the query-param format on GNOSIS_CHAIN', () => {
    const url = getSafeWebUrl(SupportedChainId.GNOSIS_CHAIN, SAFE_ADDRESS, SAFE_TX_HASH)
    const gnosisPrefix = CHAIN_INFO[SupportedChainId.GNOSIS_CHAIN].addressPrefix

    expect(url).toContain(`?safe=${gnosisPrefix}:${SAFE_ADDRESS}`)
    expect(url).toContain(`&id=multisig_${SAFE_ADDRESS}_${SAFE_TX_HASH}`)
    expect(url).not.toContain(`/${gnosisPrefix}:${SAFE_ADDRESS}/transactions`)
  })
})
