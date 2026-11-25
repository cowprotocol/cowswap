// eslint-disable-next-line import/no-internal-modules -- Test fixtures use the asset type without adding a public module export.
import { LogoAsset } from '../../modules/solverLogoTool/solverLogoTool.types'

export function deferredPromise<T>(): { promise: Promise<T>; resolve(value: T): void; reject(error: Error): void } {
  let resolve = (_value: T): void => {
    throw new Error('Promise has not been created')
  }
  let reject = (_error: Error): void => {
    throw new Error('Promise has not been created')
  }
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

export function makeLogoAsset(overrides: Partial<LogoAsset> = {}): LogoAsset {
  return {
    name: 'source.svg',
    type: 'svg',
    width: 1000,
    height: 1000,
    bytes: new Uint8Array(),
    svg: '',
    image: new Image(),
    url: 'source.svg',
    inkPoints: [],
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    dispose: jest.fn(),
    ...overrides,
  }
}
