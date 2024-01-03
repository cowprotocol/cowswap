import BN from 'bn.js'
import { AbiItem } from 'web3-utils'
import { Erc20Contract, toBN } from '@gnosis.pm/dex-js'
import erc20Abi from '@gnosis.pm/dex-js/build/contracts/abi/Erc20.json'
import erc20_bytes32Abi from 'abis/erc20_bytes32.json'

import { TxOptionalParams, Receipt } from 'types'
import { ZERO } from 'const'
import { logDebug } from 'utils'

import ERC20_DETAILS from 'api/erc20/erc20Details.json'

import Web3 from 'web3'

export interface Erc20Props {
  name: string
  symbol: string
  decimals: number
}

export interface Erc20Details {
  [address: string]: Erc20Props
}

interface BaseParams {
  tokenAddress: string
  networkId: number
}

export type NameParams = BaseParams
export type SymbolParams = BaseParams
export type DecimalsParams = BaseParams
export type TotalSupplyParams = BaseParams

export interface BalanceOfParams extends BaseParams {
  userAddress: string
}

export interface AllowanceParams extends BalanceOfParams {
  spenderAddress: string
}

interface WithTxOptionalParams {
  txOptionalParams?: TxOptionalParams
}

export interface ApproveParams extends AllowanceParams, WithTxOptionalParams {
  amount: BN
}

export interface TransferParams extends BalanceOfParams, WithTxOptionalParams {
  toAddress: string
  amount: BN
}

export interface TransferFromParams extends TransferParams {
  fromAddress: string
}

/**
 * Interfaces the access to ERC20 token
 *
 * See: https://theethereum.wiki/w/index.php/ERC20_Token_Standard
 */
export interface Erc20Api {
  name(params: NameParams): Promise<string>
  name32Bytes(params: NameParams): Promise<string>

  symbol(params: SymbolParams): Promise<string>
  symbol32Bytes(params: SymbolParams): Promise<string>

  decimals(params: DecimalsParams): Promise<number>
  totalSupply(params: TotalSupplyParams): Promise<BN>

  balanceOf(params: BalanceOfParams): Promise<BN>

  allowance(params: AllowanceParams): Promise<BN>

  approve(params: ApproveParams): Promise<Receipt>

  transfer(params: TransferParams): Promise<Receipt>

  transferFrom(params: TransferFromParams): Promise<Receipt>
}

export interface Erc20ApiDependencies {
  web3: Web3
}

/**
 * Basic implementation of ERC20 API
 */
export class Erc20ApiImpl implements Erc20Api {
  private _contractPrototype: Erc20Contract
  private _contract32BytesPrototype: Erc20Contract
  private web3: Web3
  private readonly localErc20Details: Erc20Details

  private static _contractsCache: { [network: number]: { [address: string]: Erc20Contract } } = {}

  public constructor(injectedDependencies: Erc20ApiDependencies) {
    Object.assign(this, injectedDependencies)

    // Local overwrites for token details
    // Usually that shouldn't be needed but some tokens do not abide by the standard
    // and return symbol/name as bytes32 as opposed to string
    this.localErc20Details = ERC20_DETAILS

    this._contractPrototype = new this.web3.eth.Contract(erc20Abi as AbiItem[]) as unknown as Erc20Contract
    this._contract32BytesPrototype = new this.web3.eth.Contract(
      erc20_bytes32Abi as AbiItem[],
    ) as unknown as Erc20Contract

    // TODO remove later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).erc20 = this._contractPrototype
  }

  public async name32Bytes({ tokenAddress }: NameParams): Promise<string> {
    this._contract32BytesPrototype.options.address = tokenAddress
    return this._contract32BytesPrototype.methods.name().call()
  }

  public async symbol32Bytes({ tokenAddress }: NameParams): Promise<string> {
    this._contract32BytesPrototype.options.address = tokenAddress
    return this._contract32BytesPrototype.methods.symbol().call()
  }

  public async balanceOf({ networkId, tokenAddress, userAddress }: BalanceOfParams): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    const result = await erc20.methods.balanceOf(userAddress).call()

    return toBN(result)
  }

  public async name({ tokenAddress, networkId }: NameParams): Promise<string> {
    const name = this._getLocalErc20Property(tokenAddress, 'name')
    if (name) {
      return name
    }

    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    return erc20.methods
      .name()
      .call()
      .catch(() => this.name32Bytes({ tokenAddress, networkId }))
  }

  public async symbol({ tokenAddress, networkId }: SymbolParams): Promise<string> {
    const symbol = this._getLocalErc20Property(tokenAddress, 'symbol')
    if (symbol) {
      return symbol
    }

    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    return erc20.methods
      .symbol()
      .call()
      .catch(() => this.symbol32Bytes({ tokenAddress, networkId }))
  }

  public async decimals({ tokenAddress, networkId }: DecimalsParams): Promise<number> {
    const decimals = this._getLocalErc20Property(tokenAddress, 'decimals')
    if (decimals) {
      return decimals
    }

    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    const decimalsString = await erc20.methods.decimals().call()

    return Number(decimalsString)
  }

  public async totalSupply({ tokenAddress, networkId }: TotalSupplyParams): Promise<BN> {
    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    const totalSupply = await erc20.methods.totalSupply().call()

    return toBN(totalSupply)
  }

  public async allowance({ networkId, tokenAddress, userAddress, spenderAddress }: AllowanceParams): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)
    const result = await erc20.methods.allowance(userAddress, spenderAddress).call()

    return toBN(result)
  }

  public async approve({
    userAddress,
    tokenAddress,
    spenderAddress,
    amount,
    networkId,
    txOptionalParams,
  }: ApproveParams): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    logDebug('[Erc20Api] approve:', { spenderAddress, amount: amount.toString() })

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/gp-v1-ui/issues/231
    const tx = erc20.methods.approve(spenderAddress, amount.toString()).send({
      from: userAddress,
    })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  public async transfer({
    userAddress,
    tokenAddress,
    toAddress,
    amount,
    networkId,
    txOptionalParams,
  }: TransferParams): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    logDebug('[Erc20Api] transfer:', { toAddress, amount: amount.toString() })

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/gp-v1-ui/issues/231
    const tx = erc20.methods.transfer(toAddress, amount.toString()).send({
      from: userAddress,
    })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  public async transferFrom({
    userAddress,
    tokenAddress,
    fromAddress,
    toAddress,
    amount,
    networkId,
    txOptionalParams,
  }: TransferFromParams): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(networkId, tokenAddress)

    logDebug('[Erc20Api] transferFrom:', { userAddress, toAddress, amount: amount.toString() })
    const tx = erc20.methods.transferFrom(userAddress, toAddress, amount.toString()).send({
      from: fromAddress,
    })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  /********************************    private methods   ********************************/

  private _getERC20AtAddress(networkId: number, address: string): Erc20Contract {
    let erc20: Erc20Contract | undefined = undefined

    if (Erc20ApiImpl._contractsCache[networkId]) {
      erc20 = Erc20ApiImpl._contractsCache[networkId][address]
    } else {
      Erc20ApiImpl._contractsCache[networkId] = {}
    }

    if (erc20) {
      return erc20
    }

    const newERC20 = this._contractPrototype.clone()
    newERC20.options.address = address

    return (Erc20ApiImpl._contractsCache[networkId][address] = newERC20)
  }

  private _getLocalErc20Property<P extends keyof Erc20Props>(address: string, prop: P): Erc20Props[P] | undefined {
    const erc20Details = this.localErc20Details[address]

    return erc20Details ? erc20Details[prop] : undefined
  }
}

export default Erc20ApiImpl
