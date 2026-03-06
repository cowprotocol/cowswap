import { Currency } from './currency'
import { NativeCurrency } from './nativeCurrency'
import { Token } from './token'
import { WETH9 } from './weth9'

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */
export class Ether extends NativeCurrency {
  protected constructor(chainId: number) {
    super(chainId, 18, 'ETH', 'Ether')
  }

  override get wrapped(): Token {
    const weth9 = WETH9[this.chainId]
    if (!weth9) throw new Error('WRAPPED')
    return weth9
  }

  private static _etherCache: { [chainId: number]: Ether } = {}

  static onChain(chainId: number): Ether {
    return this._etherCache[chainId] ?? (this._etherCache[chainId] = new Ether(chainId))
  }

  override equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}
