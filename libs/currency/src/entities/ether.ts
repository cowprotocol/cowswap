import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk'

import { Currency } from './currency'
import { NativeCurrency } from './nativeCurrency'
import { Token } from './token'

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */
export class Ether extends NativeCurrency {
  protected constructor(chainId: number) {
    super(chainId, 18, 'ETH', 'Ether')
  }

  override get wrapped(): Token {
    const wrappedNative = WRAPPED_NATIVE_CURRENCIES[this.chainId]
    if (!wrappedNative) throw new Error('WRAPPED')
    return new Token(
      this.chainId,
      wrappedNative.address,
      wrappedNative.decimals,
      wrappedNative.symbol,
      wrappedNative.name,
    )
  }

  private static _etherCache: { [chainId: number]: Ether } = {}

  static onChain(chainId: number): Ether {
    return this._etherCache[chainId] ?? (this._etherCache[chainId] = new Ether(chainId))
  }

  override equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}
