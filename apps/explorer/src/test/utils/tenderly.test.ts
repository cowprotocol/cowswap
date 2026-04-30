import { getTenderlyTxUrl } from 'utils/tenderly'

describe('getTenderlyTxUrl', () => {
  const tx = '0xc3080dc5c7852550ce99d2122887e2a26f9c4d5cc0ba2152cef77a8878f6c45a'
  const userStorageKey = 'TENDERLY_USER'

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uses the public path when no Tenderly user is set', () => {
    expect(getTenderlyTxUrl(tx)).toBe(`https://dashboard.tenderly.co/tx/${encodeURIComponent(tx)}`)
  })

  it('uses the project path when a Tenderly user slug is set', () => {
    jest.resetModules()
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: string) => (key === userStorageKey ? 'Danziger' : null))

    const { getTenderlyTxUrl: getTenderlyTxUrlWithUser } = require('utils/tenderly') as {
      getTenderlyTxUrl: (txHash: string) => string
    }

    expect(getTenderlyTxUrlWithUser(tx)).toBe(
      `https://dashboard.tenderly.co/${encodeURIComponent('Danziger')}/project/tx/${encodeURIComponent(tx)}`,
    )
  })
})
