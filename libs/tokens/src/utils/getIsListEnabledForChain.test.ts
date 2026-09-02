import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getIsListEnabledForChain } from './getIsListEnabledForChain'

import { ONDO_TOKENS_LIST_SOURCE } from '../const/tokensLists'
import { TokenListsByChainState } from '../types'

describe('getIsListEnabledForChain', () => {
  it('uses the requested chain instead of the current token environment', () => {
    expect(getIsListEnabledForChain(ONDO_TOKENS_LIST_SOURCE, SupportedChainId.MAINNET, {})).toBe(true)
    expect(getIsListEnabledForChain(ONDO_TOKENS_LIST_SOURCE, SupportedChainId.GNOSIS_CHAIN, {})).toBe(false)
  })

  it('preserves an explicit disabled preference', () => {
    const states = {
      [SupportedChainId.MAINNET]: {
        [ONDO_TOKENS_LIST_SOURCE]: {
          source: ONDO_TOKENS_LIST_SOURCE,
          list: { name: 'Ondo', timestamp: '', version: { major: 1, minor: 0, patch: 0 }, tokens: [] },
          isEnabled: false,
        },
      },
    } as TokenListsByChainState

    expect(getIsListEnabledForChain(ONDO_TOKENS_LIST_SOURCE, SupportedChainId.MAINNET, states)).toBe(false)
  })
})
