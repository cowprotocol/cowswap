export class FiniteMap<K, V> extends Map<K, V> {
  private readonly maxSize: number

  constructor(maxSize: number) {
    super()

    if (!Number.isInteger(maxSize) || maxSize <= 0) {
      throw new Error('FiniteMap maxSize must be a positive integer')
    }

    this.maxSize = maxSize
  }

  override get(key: K): V | undefined {
    const value = super.get(key)

    if (value === undefined) return undefined

    // Refresh recency on read (LRU behavior)
    super.delete(key)
    super.set(key, value)

    return value
  }

  override set(key: K, value: V): this {
    if (super.has(key)) {
      super.delete(key)
    }

    super.set(key, value)

    if (this.size > this.maxSize) {
      const oldestKey = this.keys().next().value as K | undefined
      if (oldestKey !== undefined) {
        super.delete(oldestKey)
      }
    }

    return this
  }
}
