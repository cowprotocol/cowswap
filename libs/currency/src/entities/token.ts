import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { BaseCurrency } from './baseCurrency'
import { Currency } from './currency'

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export class Token extends BaseCurrency {
  override readonly isNative: false = false
  override readonly isToken: true = true

  /**
   * The contract address on the chain on which this token lives
   */
  readonly address: string

  /**
   *
   * @param chainId {@link BaseCurrency#chainId}
   * @param address The contract address on the chain on which this token lives
   * @param decimals {@link BaseCurrency#decimals}
   * @param symbol {@link BaseCurrency#symbol}
   * @param name {@link BaseCurrency#name}
   */
  constructor(chainId: number, address: string, decimals: number, symbol?: string, name?: string) {
    super(chainId, decimals, symbol, name)
    this.address = address
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */
  override equals(other: Currency): boolean {
    return other.isToken && this.chainId === other.chainId && areAddressesEqual(this.address, other.address)
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  sortsBefore(other: Token): boolean {
    if (this.chainId !== other.chainId) throw new Error('CHAIN_IDS')
    if (areAddressesEqual(this.address, other.address)) throw new Error('ADDRESSES')
    return getAddressKey(this.address) < getAddressKey(other.address)
  }

  /**
   * Return this token, which does not need to be wrapped
   */
  override get wrapped(): Token {
    return this
  }
}
