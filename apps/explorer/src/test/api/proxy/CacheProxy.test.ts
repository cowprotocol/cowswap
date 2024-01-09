import { CacheMixin } from 'api/proxy'

interface TestApi {
  echo<T>(params: Params<T>): T
  cachedMethod<T>(params: Params<T>): Promise<T>
  syncCachedMethod<T>(params: Params<T>): T
  customHashFn<T>(params: Params<T>): Promise<T>
  nonCachedMethod<T>(params: Params<T>): Promise<T>
  flatParam(param: number): number
  multiFlatParams(p1: number, p2: string): string
}

interface Params<T> {
  p: T
}

class TestApiImpl implements TestApi {
  // 'public' to be able to spy on
  public echo<T>({ p }: Params<T>): T {
    return p
  }

  public async cachedMethod<T>(params: Params<T>): Promise<T> {
    return this.echo(params)
  }
  public syncCachedMethod<T>(params: Params<T>): T {
    return this.echo(params)
  }
  public async customHashFn<T>(params: Params<T>): Promise<T> {
    return this.echo(params)
  }
  public async nonCachedMethod<T>(params: Params<T>): Promise<T> {
    return this.echo(params)
  }
  public flatParam(p: number): number {
    return this.echo({ p })
  }
  public multiFlatParams(p1: number, p2: string): string {
    return this.echo({ p: `${p1}${p2}` })
  }
}

function hashFn(..._params: any[]): string {
  return 'always the same lol'
}

class TestApiProxyV2 extends TestApiImpl {
  private cache: CacheMixin

  public constructor() {
    super()

    this.cache = new CacheMixin()

    this.cache.injectCache<TestApi>(this, [
      { method: 'cachedMethod', ttl: 10 },
      { method: 'syncCachedMethod' },
      { method: 'customHashFn', hashFn },
      { method: 'flatParam' },
      { method: 'multiFlatParams' },
    ])
  }
}

let instance: TestApi

beforeEach(() => {
  instance = new TestApiProxyV2()
})

const p = 'parameter'

describe('With cache', () => {
  it('calls original api when parameters are different', async () => {
    const spy = jest.spyOn(instance, 'echo')

    const firstValue = await instance.cachedMethod({ p })
    const secondValue = await instance.cachedMethod({ p: 'different value' })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(firstValue).not.toEqual(secondValue)
  })

  it('finds cache on second invocation with same parameters', async () => {
    const spy = jest.spyOn(instance, 'echo')

    const firstValue = await instance.cachedMethod({ p })
    const secondValue = await instance.cachedMethod({ p })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(firstValue).toEqual(secondValue)
  })

  it('caching works as well for sync methods', () => {
    const spy = jest.spyOn(instance, 'echo')

    const firstValue = instance.syncCachedMethod({ p })
    const secondValue = instance.syncCachedMethod({ p })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(firstValue).toEqual(secondValue)
  })

  it('uses custom hash function', async () => {
    const spy = jest.spyOn(instance, 'echo')

    const firstValue = await instance.customHashFn({ p })
    const secondValue = await instance.customHashFn({ p: 'something else' })

    // the custom hash function provided always hash to the same key, so doesn't matter the params,
    // the return should always be the result of the first invocation
    expect(spy).toHaveBeenCalledTimes(1)
    expect(firstValue).toEqual(secondValue)
    expect(secondValue).toBe(p)
  })

  it('is able to hash function with flat parameter', () => {
    const spy = jest.spyOn(instance, 'echo')

    const firstValue = instance.flatParam(1)
    const secondValue = instance.flatParam(2)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(firstValue).not.toEqual(secondValue)

    expect(instance.flatParam(1)).toEqual(firstValue)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('is able to hash function with multiple flat parameters', () => {
    const spy = jest.spyOn(instance, 'echo')

    const firstValue = instance.multiFlatParams(1, p)
    const secondValue = instance.multiFlatParams(1, 'a')

    expect(spy).toHaveBeenCalledTimes(2)
    expect(firstValue).not.toEqual(secondValue)

    expect(instance.multiFlatParams(1, p)).toEqual(firstValue)
    expect(spy).toHaveBeenCalledTimes(2)

    expect(instance.multiFlatParams(1, 'a')).toEqual(secondValue)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})

describe('Without cache', () => {
  it('calls original api multiple times when no cache is set', async () => {
    const spy = jest.spyOn(instance, 'echo')

    expect(await instance.nonCachedMethod({ p })).toMatch(p)
    expect(await instance.nonCachedMethod({ p })).toMatch(p)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
