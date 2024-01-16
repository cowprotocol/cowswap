import { TheGraphApiImpl, TheGraphApiImplParams, TheGraphApi } from './TheGraphApi'
import { CacheMixin } from 'api/proxy'
import { PRICES_CACHE_TIME } from 'const'

export class TheGraphApiProxy extends TheGraphApiImpl {
  private cache: CacheMixin

  public constructor(params: TheGraphApiImplParams) {
    super(params)

    this.cache = new CacheMixin()

    this.cache.injectCache<TheGraphApi>(this, [
      { method: 'getPrice', ttl: PRICES_CACHE_TIME },
      { method: 'getPrices', ttl: PRICES_CACHE_TIME },
    ])
  }
}
