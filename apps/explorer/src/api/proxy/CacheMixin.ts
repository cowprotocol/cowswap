/* eslint-disable @typescript-eslint/no-explicit-any */
import NodeCache from 'node-cache'

interface CacheOptions<T> {
  method: keyof T
  ttl?: number
  hashFn?: (...params: any[]) => string
}

interface CacheMethodParams<T, R> extends CacheOptions<T> {
  fnToCache: (...params: any[]) => R
}

export class CacheMixin {
  private cache: NodeCache

  public constructor() {
    this.cache = new NodeCache({ useClones: false })
  }

  /**
   * Injects into provided `instance` a version with cache according to the list `toCache`.
   * Injected methods will obey `ttl` if provided, otherwise global cache config.
   *
   * @param instance Class instance to cache
   * @param toCache List of configs for methods to be cached
   */
  public injectCache<T>(instance: T, toCache: CacheOptions<T>[]): void {
    toCache.forEach((cacheConfig) => {
      const { method } = cacheConfig
      const methodName = method.toString()

      const fnToCache = instance[methodName].bind(instance)

      const params: CacheMethodParams<T, ReturnType<typeof fnToCache>> = {
        ...cacheConfig,
        fnToCache,
      }

      instance[methodName] = this.cacheMethod(params)
    })
  }

  /**
   * HOF that returns a new function caching the return value of provided `fnToCache`
   */
  private cacheMethod<T, R>({ fnToCache, method, ttl, hashFn }: CacheMethodParams<T, R>): (...params: any[]) => R {
    return (...params: any[]): R => {
      const hash = hashFn ? hashFn(method, params) : this.hashParams(method.toString(), params)

      let value = this.get<R>(hash)

      if (value) {
        // cache hit
        return value
      }

      // call original fn
      value = fnToCache(...params)

      // save it for next round
      // store possibly a promise
      this.store(hash, value, ttl)
      Promise.resolve(value)
        // don't cache errors
        .catch(() => {
          // remove failed promise from store
          this.remove(hash)
        })

      return value as R
    }
  }

  private get<R>(hash: string): R | undefined {
    const obj = this.cache.get<R>(hash)

    if (obj === undefined) {
      return
    }

    return obj
  }

  private remove(hash: string): void {
    this.cache.del(hash)
  }

  private store<R>(hash: string, obj: R, ttl?: number): void {
    if (ttl) {
      // with TTL
      this.cache.set(hash, obj, ttl)
    } else {
      // based on default config
      this.cache.set(hash, obj)
    }
  }

  /**
   * Dumb hash function that simply glues together paramName:paramValue
   * Assumes all values being hashed can be converted to string
   * Sorts parameters for determinism
   *
   * TODO: replace this with an actual hash function once testing is done
   *
   * @param params The params we want to hash
   *
   */
  private hashParams(methodName: string, params: any): string {
    return `${methodName}>>${this.hash(params)}`
  }

  private hash(obj: any): string {
    // primitive type
    if (typeof obj !== 'object') {
      return obj.toString()
    }
    // local this.hash with correct `this` reference
    const hash = this.hash.bind(this)
    // array
    if (Array.isArray(obj)) {
      return obj.sort().map(hash).join('|')
    }
    // obj
    return Object.keys(obj)
      .sort()
      .map((key) => `${key}:${hash(obj[key])}`)
      .join('|')
  }
}
