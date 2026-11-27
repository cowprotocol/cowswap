import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'

import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

import { findRestrictedAddress, getRestrictedAddresses } from './findRestrictedAddress'

const CHAIN_ID = SupportedChainId.MAINNET
const USER = '0x1111111111111111111111111111111111111111'

describe('findRestrictedAddress', () => {
  it('includes the quoting accounts and their CoW Shed proxies', () => {
    const addresses = getRestrictedAddresses(CHAIN_ID)

    expect(addresses).toEqual(expect.arrayContaining([PERMIT_ACCOUNT.address, BRIDGE_QUOTE_ACCOUNT]))
    expect(addresses.length).toBeGreaterThan(2)
  })

  it('finds an address used as a plain field', () => {
    expect(findRestrictedAddress([USER, BRIDGE_QUOTE_ACCOUNT], CHAIN_ID)).toBe(BRIDGE_QUOTE_ACCOUNT)
  })

  it('finds an address ABI-encoded into calldata regardless of case', () => {
    const calldata = `0xa9059cbb000000000000000000000000${PERMIT_ACCOUNT.address.slice(2).toLowerCase()}0000000000000000000000000000000000000000000000000000000000000001`

    expect(findRestrictedAddress([calldata], CHAIN_ID)).toBe(PERMIT_ACCOUNT.address)
  })

  it('finds a proxy address nested in an appData document', () => {
    const proxy = getRestrictedAddresses(CHAIN_ID).slice(2).pop()
    const appData = JSON.stringify({ metadata: { hooks: { post: [{ target: proxy, callData: '0x' }] } } })

    expect(findRestrictedAddress([appData], CHAIN_ID)).toBe(proxy)
  })

  it('returns undefined when nothing is restricted', () => {
    expect(findRestrictedAddress([USER, undefined, null, '0x'], CHAIN_ID)).toBeUndefined()
  })
})
