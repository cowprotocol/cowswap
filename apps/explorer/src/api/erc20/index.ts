import { Erc20Api, Erc20ApiDependencies } from './Erc20Api'
import Erc20ApiMock from './Erc20ApiMock'
import { Erc20ApiProxy } from './Erc20ApiProxy'

import { erc20Balances, erc20Allowances, unregisteredTokens } from '../../../test/data'

export function createErc20Api(injectedDependencies: Erc20ApiDependencies): Erc20Api {
  let erc20Api
  if (process.env.MOCK_ERC20 === 'true') {
    erc20Api = new Erc20ApiMock({ balances: erc20Balances, allowances: erc20Allowances, tokens: unregisteredTokens })
  } else {
    erc20Api = new Erc20ApiProxy(injectedDependencies)
  }
  window['erc20Api'] = erc20Api // register for convenience
  return erc20Api
}
