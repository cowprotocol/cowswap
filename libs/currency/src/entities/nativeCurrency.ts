import { BaseCurrency } from './baseCurrency'

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */
export abstract class NativeCurrency extends BaseCurrency {
  override readonly isNative: true = true
  override readonly isToken: false = false
}
