import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

const SOLVERS_RESPONSE = {
  data: [
    {
      id: 1,
      attributes: {
        solverId: 'alpha',
        displayName: 'Alpha Solver',
        description: 'Alpha description',
        website: 'https://alpha.example',
        active: true,
        image: {
          data: {
            id: 100,
            attributes: { url: '/uploads/alpha.png' },
          },
        },
        solver_networks: {
          data: [
            {
              id: 10,
              attributes: {
                active: true,
                address: '0x1111111111111111111111111111111111111111',
                payoutAddress: '0x2222222222222222222222222222222222222222',
                network: { data: { id: 1, attributes: { chainId: 1 } } },
                environment: { data: { id: 1, attributes: { name: 'prod' } } },
              },
            },
            {
              id: 11,
              attributes: {
                active: true,
                address: '0x3333333333333333333333333333333333333333',
                payout_address: '0x4444444444444444444444444444444444444444',
                network: { data: { id: 2, attributes: { chainId: 8453 } } },
                environment: { data: { id: 2, attributes: { name: 'barn' } } },
              },
            },
            {
              id: 12,
              attributes: {
                active: false,
                address: '0x5555555555555555555555555555555555555555',
                network: { data: { id: 3, attributes: { chainId: 10, name: 'Optimism' } } },
                environment: { data: { id: 3, attributes: { name: 'prod' } } },
              },
            },
          ],
        },
      },
    },
    {
      id: 2,
      attributes: {
        solverId: 'inactive',
        displayName: 'Inactive Solver',
        active: false,
        solver_networks: { data: [] },
      },
    },
  ],
}

describe('fetchSolversInfo', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    jest.resetModules()
    process.env.REACT_APP_CMS_BASE_URL = 'https://cms.cow.fi/api'
  })

  it('maps active CMS solvers and normalizes image URL', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(SOLVERS_RESPONSE))

    const { fetchSolversInfo } = await import('../../utils/fetchSolversInfo')
    const result = await fetchSolversInfo()

    expect(result).toHaveLength(1)
    expect(result[0].solverId).toBe('alpha')
    expect(result[0].displayName).toBe('Alpha Solver')
    expect(result[0].image).toBe('https://cms.cow.fi/uploads/alpha.png')
    expect(result[0].deployments).toHaveLength(3)
    expect(result[0].deployments.find((deployment) => deployment.chainId === 10)?.chainName).toBe('Optimism')
    expect(result[0].deployments.map((d) => d.payoutAddress)).toEqual(
      expect.arrayContaining([
        '0x4444444444444444444444444444444444444444',
        '0x2222222222222222222222222222222222222222',
      ]),
    )
  })

  it('filters deployments by network id when provided', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(SOLVERS_RESPONSE))

    const { fetchSolversInfo } = await import('../../utils/fetchSolversInfo')
    const result = await fetchSolversInfo(1)

    expect(result).toHaveLength(1)
    expect(result[0].deployments).toHaveLength(1)
    expect(result[0].deployments[0].chainId).toBe(1)
    expect(result[0].networks).toHaveLength(1)
    expect(result[0].networks[0].chainId).toBe(1)
  })

  it('caches the response and avoids repeated fetches', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(SOLVERS_RESPONSE))

    const { fetchSolversInfo } = await import('../../utils/fetchSolversInfo')

    await fetchSolversInfo()
    await fetchSolversInfo()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps solvers that only have inactive deployments', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: [
          {
            id: 3,
            attributes: {
              solverId: 'inactive-only',
              displayName: 'Inactive Only Solver',
              active: true,
              solver_networks: {
                data: [
                  {
                    id: 13,
                    attributes: {
                      active: false,
                      address: '0x9999999999999999999999999999999999999999',
                      payoutAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                      network: { data: { id: 3, attributes: { chainId: 10, name: 'Optimism' } } },
                      environment: { data: { id: 3, attributes: { name: 'prod' } } },
                    },
                  },
                ],
              },
            },
          },
        ],
      }),
    )

    const { fetchSolversInfo } = await import('../../utils/fetchSolversInfo')
    const allNetworks = await fetchSolversInfo()
    const optimismOnly = await fetchSolversInfo(10)

    expect(allNetworks).toHaveLength(1)
    expect(allNetworks[0].solverId).toBe('inactive-only')
    expect(allNetworks[0].deployments).toHaveLength(1)
    expect(allNetworks[0].deployments[0].active).toBe(false)
    expect(allNetworks[0].networks).toEqual([
      {
        chainId: 10,
        chainName: 'Optimism',
        environments: ['prod'],
      },
    ])

    expect(optimismOnly).toHaveLength(1)
    expect(optimismOnly[0].solverId).toBe('inactive-only')
  })
})
