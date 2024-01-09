import { getErc20Info } from 'services/helpers'
import { Erc20Api } from 'api/erc20/Erc20Api'
import Web3 from 'web3'
import { logDebug } from 'utils'
import { TokenErc20 } from '@gnosis.pm/dex-js'
// import { TokenErc20 } from '@gnosis.pm/dex-js'

interface Params {
  erc20Api: Erc20Api
  web3: Web3
}

export interface TokenFromErc20Params {
  tokenAddress: string
  networkId: number
}

export function getTokenFromErc20Factory(closureParams: Params) {
  return async (params: TokenFromErc20Params): Promise<TokenErc20 | null> => {
    // Get base info from the ERC20 contract
    const erc20Info = await getErc20Info({ ...closureParams, ...params })
    if (!erc20Info) {
      logDebug(
        '[services:factories:getTokenFromExchange] Could not get details for token token (%s)',
        params.tokenAddress,
      )
      return null
    }

    return erc20Info
  }
}
