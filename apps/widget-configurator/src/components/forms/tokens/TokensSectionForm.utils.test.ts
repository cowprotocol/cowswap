import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getPrioritizedTokensParam } from './TokensSectionForm.utils'

describe('getPrioritizedTokensParam', () => {
  it('splits each chain text into trimmed addresses and drops blank lines and empty chains', () => {
    expect(
      getPrioritizedTokensParam({
        [SupportedChainId.MAINNET]: ' 0xA \r\n\n0xB\n',
        [SupportedChainId.GNOSIS_CHAIN]: '  \n',
      }),
    ).toEqual({ [SupportedChainId.MAINNET]: ['0xA', '0xB'] })
  })

  it('returns undefined when no chain has addresses', () => {
    expect(getPrioritizedTokensParam({})).toBeUndefined()
    expect(getPrioritizedTokensParam({ [SupportedChainId.MAINNET]: '' })).toBeUndefined()
  })
})
