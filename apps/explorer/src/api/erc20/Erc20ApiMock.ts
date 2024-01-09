import BN from 'bn.js'
import { assert } from '@gnosis.pm/dex-js'

import { Receipt } from 'types'
import { ZERO, ALLOWANCE_MAX_VALUE } from 'const'
import { RECEIPT } from '../../../test/data'
import { logDebug } from 'utils'
import { waitAndSendReceipt } from 'utils/mock'
import {
  Erc20Api,
  NameParams,
  SymbolParams,
  DecimalsParams,
  TotalSupplyParams,
  BalanceOfParams,
  AllowanceParams,
  ApproveParams,
  TransferParams,
  TransferFromParams,
} from './Erc20Api'

interface Balances {
  [userAddress: string]: { [tokenAddress: string]: BN }
}

interface Allowances {
  [userAddress: string]: { [tokenAddress: string]: { [spenderAddress: string]: BN } }
}

interface Erc20Info {
  name?: string
  name32Bytes?: string
  symbol?: string
  symbol32Bytes?: string
  decimals?: number
}

interface Tokens {
  [tokenAddress: string]: Erc20Info
}

/**
 * Basic implementation of Wallet API
 */
export class Erc20ApiMock implements Erc20Api {
  private _balances: Balances
  private _allowances: Allowances
  private _totalSupply: BN
  private _tokens: Tokens

  public constructor({ balances = {}, allowances = {}, totalSupply = ALLOWANCE_MAX_VALUE, tokens = {} } = {}) {
    this._balances = balances
    this._allowances = allowances
    this._totalSupply = totalSupply
    this._tokens = tokens
  }
  public async name32Bytes({ tokenAddress }: NameParams): Promise<string> {
    const erc20Info = this._initTokens(tokenAddress)
    // Throws when token without `name32Bytes` to mock contract behavior
    assert(erc20Info.name32Bytes, "token does not implement 'name32Bytes'")

    return erc20Info.name32Bytes
  }
  public async symbol32Bytes({ tokenAddress }: NameParams): Promise<string> {
    const erc20Info = this._initTokens(tokenAddress)

    // Throws when token without `symbol` to mock contract behavior
    assert(erc20Info.symbol32Bytes, "token does not implement 'symbol32Bytes'")

    return erc20Info.symbol32Bytes
  }

  public async balanceOf({ tokenAddress, userAddress }: BalanceOfParams): Promise<BN> {
    const userBalances = this._balances[userAddress]
    if (!userBalances) {
      return ZERO
    }

    const balance = userBalances[tokenAddress]
    return balance ? balance : ZERO
  }

  public async name({ tokenAddress }: NameParams): Promise<string> {
    const erc20Info = this._initTokens(tokenAddress)

    // Throws when token without `name` to mock contract behavior
    assert(erc20Info.name, "token does not implement 'name'")

    return erc20Info.name
  }

  public async symbol({ tokenAddress }: SymbolParams): Promise<string> {
    const erc20Info = this._initTokens(tokenAddress)

    // Throws when token without `symbol` to mock contract behavior
    assert(erc20Info.symbol, "token does not implement 'symbol'")

    return erc20Info.symbol
  }

  public async decimals({ tokenAddress }: DecimalsParams): Promise<number> {
    const erc20Info = this._initTokens(tokenAddress)

    // Throws when token without `decimals` to mock contract behavior
    assert(erc20Info.decimals, "token does not implement 'decimals'")

    return erc20Info.decimals
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async totalSupply(_params: TotalSupplyParams): Promise<BN> {
    return this._totalSupply
  }

  public async allowance({ tokenAddress, userAddress, spenderAddress }: AllowanceParams): Promise<BN> {
    const userAllowances = this._allowances[userAddress]
    if (!userAllowances) {
      return ZERO
    }

    const tokenAllowances = userAllowances[tokenAddress]
    if (!tokenAllowances) {
      return ZERO
    }

    const allowance = tokenAllowances[spenderAddress]
    return allowance ? allowance : ZERO
  }

  public async approve({
    userAddress,
    tokenAddress,
    spenderAddress,
    amount,
    txOptionalParams,
  }: ApproveParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })

    this._initAllowances({ userAddress, tokenAddress, spenderAddress })
    this._allowances[userAddress][tokenAddress][spenderAddress] = amount
    logDebug(
      `[Erc20ApiMock] Approved ${amount} for the spender ${spenderAddress} on the token ${tokenAddress}. User ${userAddress}`,
    )

    return RECEIPT
  }

  /**
   * Transfers from `userAddress`. No allowance required.
   *
   * @param userAddress The sender of the tx
   * @param tokenAddress The token being transferred
   * @param toAddress The recipient's address
   * @param amount The amount transferred
   * @param txOptionalParams Optional params
   */
  public async transfer({
    userAddress,
    tokenAddress,
    toAddress,
    amount,
    txOptionalParams,
  }: TransferParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })
    this._initBalances({ userAddress, tokenAddress })
    this._initBalances({ userAddress: toAddress, tokenAddress })

    const balance = this._balances[userAddress][tokenAddress]
    assert(balance.gte(amount), "The user doesn't have enough balance")

    this._balances[userAddress][tokenAddress] = balance.sub(amount)
    this._balances[toAddress][tokenAddress] = this._balances[toAddress][tokenAddress].add(amount)

    logDebug(
      `[Erc20ApiMock:transfer] Transferred ${amount} of the token ${tokenAddress} from ${userAddress} to ${toAddress}`,
    )

    return RECEIPT
  }

  /**
   * Transfers on behalf of `fromAddress` if `userAddress` has allowance
   *
   * @param userAddress The sender of the tx
   * @param tokenAddress The token being transferred
   * @param fromAddress The source of the tokens
   * @param toAddress The recipient's address
   * @param amount The amount transferred
   * @param txOptionalParams Optional params
   */
  public async transferFrom({
    userAddress,
    tokenAddress,
    fromAddress,
    toAddress,
    amount,
    txOptionalParams,
  }: TransferFromParams): Promise<Receipt> {
    await waitAndSendReceipt({ txOptionalParams })
    this._initBalances({ userAddress: fromAddress, tokenAddress })
    this._initBalances({ userAddress: toAddress, tokenAddress })
    this._initAllowances({ userAddress: fromAddress, tokenAddress, spenderAddress: userAddress })

    const balance = this._balances[fromAddress][tokenAddress]
    assert(balance.gte(amount), "The user doesn't have enough balance")

    assert(
      this._hasAllowance({ fromAddress, tokenAddress, spenderAddress: userAddress, amount }),
      'Not allowed to perform this transfer',
    )
    const allowance = this._allowances[fromAddress][tokenAddress][userAddress]
    this._allowances[fromAddress][tokenAddress][userAddress] = allowance.sub(amount)
    logDebug(
      `[Erc20ApiMock:transferFrom] Updated allowance: ${allowance} => ${this._allowances[fromAddress][tokenAddress][userAddress]}`,
    )

    this._balances[fromAddress][tokenAddress] = balance.sub(amount)
    this._balances[toAddress][tokenAddress] = this._balances[toAddress][tokenAddress].add(amount)

    logDebug(
      `[Erc20ApiMock:transferFrom] Transferred ${amount} of the token ${tokenAddress} from ${fromAddress} to ${toAddress} by the spender ${userAddress}`,
    )

    return RECEIPT
  }

  /********************************    private methods   ********************************/
  private _hasAllowance({
    fromAddress,
    tokenAddress,
    spenderAddress,
    amount,
  }: {
    fromAddress: string
    tokenAddress: string
    spenderAddress: string
    amount: BN
  }): boolean {
    const allowance = this._allowances[fromAddress][tokenAddress][spenderAddress]
    return allowance.gte(amount)
  }

  private _initBalances({ userAddress, tokenAddress }: { userAddress: string; tokenAddress: string }): BN {
    let userBalances = this._balances[userAddress]
    if (!userBalances) {
      userBalances = {}
      this._balances[userAddress] = userBalances
    }

    let tokenBalance = userBalances[tokenAddress]
    if (!tokenBalance) {
      tokenBalance = ZERO
      userBalances[tokenAddress] = tokenBalance
    }

    return tokenBalance
  }

  private _initAllowances({
    userAddress,
    tokenAddress,
    spenderAddress,
  }: {
    userAddress: string
    tokenAddress: string
    spenderAddress: string
  }): BN {
    let userAllowances = this._allowances[userAddress]
    if (!userAllowances) {
      userAllowances = {}
      this._allowances[userAddress] = userAllowances
    }

    let userTokenAllowances = userAllowances[tokenAddress]
    if (!userTokenAllowances) {
      userTokenAllowances = {}
      userAllowances[tokenAddress] = userTokenAllowances
    }

    let spenderAllowance = userTokenAllowances[spenderAddress]
    if (!spenderAllowance) {
      spenderAllowance = ZERO
      userTokenAllowances[spenderAddress] = spenderAllowance
    }

    return spenderAllowance
  }

  private _initTokens(tokenAddress: string): Erc20Info {
    if (!this._tokens[tokenAddress]) {
      this._tokens[tokenAddress] = {}
    }

    return this._tokens[tokenAddress]
  }
}

export default Erc20ApiMock
