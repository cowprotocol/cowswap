import NodeCache from 'node-cache'

export class SimpleCache<StoredValue, KeyParts> {
  private cache: NodeCache
  private constructKey: (value: KeyParts) => string

  public constructor(
    keyConstructor: (value: KeyParts) => string = JSON.stringify,
    options: NodeCache.Options = { useClones: false },
  ) {
    this.cache = new NodeCache(options)
    this.constructKey = keyConstructor
  }

  public get(value: KeyParts): StoredValue | undefined {
    const key = this.constructKey(value)
    return this.cache.get<StoredValue>(key)
  }
  public set(value: StoredValue, keyParts: KeyParts): boolean {
    const key = this.constructKey(keyParts)
    return this.cache.set<StoredValue>(key, value)
  }
  public delete(value: KeyParts): number {
    const key = this.constructKey(value)
    return this.cache.del(key)
  }
  public clear(): void {
    return this.cache.flushAll()
  }
}
