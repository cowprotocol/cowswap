import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getPrioritizedTokenKeys, getUnknownPrioritizedTokenKeys } from './getPrioritizedTokenKeys'

const WSTETH = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'
const WSTETH_LOWERCASE = WSTETH.toLowerCase()
const LDO = '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'
const SOLANA_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

describe('getPrioritizedTokenKeys', () => {
  it('returns the address keys for the chain, in the configured order', () => {
    expect(getPrioritizedTokenKeys({ [SupportedChainId.MAINNET]: [LDO, WSTETH] }, SupportedChainId.MAINNET)).toEqual([
      getAddressKey(LDO),
      getAddressKey(WSTETH),
    ])
  })

  it('dedupes addresses that differ only in case, keeping the first position', () => {
    expect(
      getPrioritizedTokenKeys(
        { [SupportedChainId.MAINNET]: [WSTETH, LDO, WSTETH_LOWERCASE] },
        SupportedChainId.MAINNET,
      ),
    ).toEqual([getAddressKey(WSTETH), getAddressKey(LDO)])
  })

  it('trims whitespace around addresses', () => {
    expect(getPrioritizedTokenKeys({ [SupportedChainId.MAINNET]: [`  ${WSTETH} `] }, SupportedChainId.MAINNET)).toEqual(
      [getAddressKey(WSTETH)],
    )
  })

  it('keeps case-sensitive Solana mints', () => {
    expect(getPrioritizedTokenKeys({ [SupportedChainId.SOLANA]: [SOLANA_MINT] }, SupportedChainId.SOLANA)).toEqual([
      SOLANA_MINT,
    ])
  })

  it('returns nothing for another chain or an unknown chain', () => {
    expect(getPrioritizedTokenKeys({ [SupportedChainId.MAINNET]: [WSTETH] }, SupportedChainId.GNOSIS_CHAIN)).toEqual([])
    expect(getPrioritizedTokenKeys({ [SupportedChainId.MAINNET]: [WSTETH] }, undefined)).toEqual([])
  })

  // Rows are wrapped so jest does not spread the `[WSTETH]` case into arguments.
  it.each([[undefined], [null], ['not-an-object'], [42], [[WSTETH]], [{ [SupportedChainId.MAINNET]: WSTETH }]])(
    'ignores the malformed param %p',
    (prioritizedTokens) => {
      expect(getPrioritizedTokenKeys(prioritizedTokens, SupportedChainId.MAINNET)).toEqual([])
    },
  )

  it('drops non-string and blank entries', () => {
    expect(
      getPrioritizedTokenKeys({ [SupportedChainId.MAINNET]: [42, null, '', '   ', { address: LDO }, WSTETH] }, 1),
    ).toEqual([getAddressKey(WSTETH)])
  })
})

describe('getUnknownPrioritizedTokenKeys', () => {
  it('returns the keys that are not in the active tokens', () => {
    const wsteth = TokenWithLogo.fromToken({
      chainId: SupportedChainId.MAINNET,
      address: WSTETH,
      decimals: 18,
      symbol: 'wstETH',
      name: 'Wrapped stETH',
    })

    expect(
      getUnknownPrioritizedTokenKeys(
        { [SupportedChainId.MAINNET]: [WSTETH_LOWERCASE, LDO] },
        SupportedChainId.MAINNET,
        [wsteth],
      ),
    ).toEqual([getAddressKey(LDO)])
  })
})
