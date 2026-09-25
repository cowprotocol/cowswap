import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'

import { fetchDeployedCowShedAddresses } from './fetchDeployedCowShedAddresses'

jest.mock('@cowprotocol/sdk-composable', () => ({
  ProgrammaticOrderApi: jest.fn(),
}))

const OWNER = '0x1111111111111111111111111111111111111111'
const FIRST_PAGE = '0x2222222222222222222222222222222222222222'
const SECOND_PAGE = '0x3333333333333333333333333333333333333333'
const getDeployedCowSheds = jest.fn()
const ProgrammaticOrderApiMock = ProgrammaticOrderApi as jest.MockedClass<typeof ProgrammaticOrderApi>

describe('fetchDeployedCowShedAddresses', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ProgrammaticOrderApiMock.mockImplementation(() => ({ getDeployedCowSheds }) as unknown as ProgrammaticOrderApi)
  })

  it('collects every page of sheds for the owner on the current chain', async () => {
    getDeployedCowSheds
      .mockResolvedValueOnce({
        items: [{ address: FIRST_PAGE }],
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        items: [{ address: SECOND_PAGE }],
        totalCount: 2,
      })

    await expect(fetchDeployedCowShedAddresses(OWNER, SupportedChainId.MAINNET)).resolves.toEqual([
      FIRST_PAGE,
      SECOND_PAGE,
    ])
    expect(getDeployedCowSheds).toHaveBeenNthCalledWith(
      1,
      { owner: OWNER, chainId: SupportedChainId.MAINNET },
      { limit: 1000, offset: 0 },
    )
    expect(getDeployedCowSheds).toHaveBeenNthCalledWith(
      2,
      { owner: OWNER, chainId: SupportedChainId.MAINNET },
      { limit: 1000, offset: 1 },
    )
  })
})
