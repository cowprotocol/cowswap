import { Network } from 'types'
import { replaceURL, buildSearchString } from 'utils/url'

describe('replace URL path according to network', () => {
  test('path is replaced to rinkeby', () => {
    const currentPath = '/xdai/address/0xb6bad41ae76a11d10f7b0e664c5007b908bc77c9'
    expect(replaceURL(currentPath, 'rinkeby', Network.GNOSIS_CHAIN)).toBe(
      '/rinkeby/address/0xb6bad41ae76a11d10f7b0e664c5007b908bc77c9',
    )
  })

  test('path is replaced to xdai', () => {
    const currentPath = '/goerli/address/0xb6bad41ae76a11d10f7b0e664c5007b908bc77c9'
    expect(replaceURL(currentPath, 'xdai', Network.GOERLI)).toBe(
      '/xdai/address/0xb6bad41ae76a11d10f7b0e664c5007b908bc77c9',
    )
  })

  test('url is replaced to mainnet', () => {
    const currentPath = '/goerli/address/0xb6bad41ae76a11d10f7b0e664c5007b908bc77c9'
    expect(replaceURL(currentPath, '', Network.GOERLI)).toBe('/address/0xb6bad41ae76a11d10f7b0e664c5007b908bc77c9')
  })
})

describe('BuildSearchString', () => {
  test('params decoded correctly', () => {
    const owner = '0xbD326ba3D9BaD3A08cf521C41bC69A620a750B3f'
    const orderId =
      '0x59920c85de0162e9e55df8d396e75f3b6b7c2dfdb535f03e5c807731c31585eaff714b8b0e2700303ec912bd40496c3997ceea2b616d6710'
    const queryString = `/trades` + buildSearchString({ owner, orderUid: orderId })

    expect(queryString).toBe(`/trades?owner=${owner}&orderUid=${orderId}`)
  })
})
