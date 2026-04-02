import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getSolversExplorerUrl } from './menuConsts.utils'

jest.mock('@cowprotocol/common-utils', () => ({
  getExplorerBaseUrl: jest.fn(),
}))

describe('getSolversExplorerUrl', () => {
  it('uses environment-specific explorer base URL', () => {
    const mockedGetExplorerBaseUrl = jest.mocked(getExplorerBaseUrl)
    mockedGetExplorerBaseUrl.mockReturnValue('https://barn.explorer.cow.fi')

    const result = getSolversExplorerUrl()

    expect(result).toBe('https://barn.explorer.cow.fi/solvers')
    expect(mockedGetExplorerBaseUrl).toHaveBeenCalledWith(SupportedChainId.MAINNET)
  })
})
