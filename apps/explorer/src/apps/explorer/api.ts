import { createErc20Api } from 'api/erc20'
import { createWeb3Api } from 'api/web3'

const web3 = createWeb3Api()

const injectedDependencies = { web3 }

const erc20Api = createErc20Api(injectedDependencies)

export { web3, erc20Api }
