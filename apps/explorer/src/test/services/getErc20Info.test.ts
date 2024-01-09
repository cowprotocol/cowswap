import BN from 'bn.js'

import { getErc20Info } from 'services/helpers'
import { web3, erc20Api } from 'apps/explorer/api'

describe('getErc20Info', () => {
  test('Get null when the address is not a contract', async () => {
    const tokenAddress = '0xe4A09175F943783525b8161243205fc62467C367'
    const networkId = 4
    web3.eth.getCode = async (): Promise<string> => '0x'

    const result = await getErc20Info({ tokenAddress, networkId, web3, erc20Api })

    expect(result).toEqual(null)
  })
  test('Get null when the ERC20 specification is not met', async () => {
    const tokenAddress = '0xe4A09175F943783525b8161243205fc62467C367'
    const networkId = 4
    web3.eth.getCode = async (address: string): Promise<string> => address
    erc20Api.totalSupply = (): Promise<BN> => Promise.reject('fail')
    const result = await getErc20Info({ tokenAddress, networkId, web3, erc20Api })

    expect(result).toEqual(null)
  })
})
