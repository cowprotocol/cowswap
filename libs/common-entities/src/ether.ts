import { Currency } from './currency'
import { NativeCurrency } from './nativeCurrency'
import { Token } from './token'

/**
 * WETH9 addresses by chainId, used only to satisfy the `wrapped` getter.
 * Sourced from @uniswap/sdk-core.
 */
const WETH9_ADDRESSES: Record<number, string> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  5: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  10: '0x4200000000000000000000000000000000000006',
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  8453: '0x4200000000000000000000000000000000000006',
  11155111: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  11155420: '0x4200000000000000000000000000000000000006',
  100: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
}

export class Ether extends NativeCurrency {
  private static _etherCache: Record<number, Ether> = {}

  protected constructor(chainId: number) {
    super(chainId, 18, 'ETH', 'Ether')
  }

  public static onChain(chainId: number): Ether {
    return (Ether._etherCache[chainId] ??= new Ether(chainId))
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  public get wrapped(): Token {
    const address = WETH9_ADDRESSES[this.chainId]
    if (!address) throw new Error(`No WETH9 address for chainId ${this.chainId}`)
    return new Token(this.chainId, address, 18, 'WETH', 'Wrapped Ether')
  }
}
