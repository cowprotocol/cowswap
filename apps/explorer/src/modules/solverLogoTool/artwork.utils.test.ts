import { preparedSvg } from './artwork.utils'
import { imageRect } from './geometry.utils'
import { readSvg } from './svg.utils'

import { makeLogoAsset } from '../../test/solverLogoTool/fixtures'

jest.mock('@cowprotocol/common-utils', () => jest.requireActual('../../../../../libs/common-utils/src/errors'))

it('keeps exported SVG geometry despite source inline or stylesheet geometry', () => {
  const svg = readSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" style="width:100% !important;height:100%;x:0;y:0"><style>svg{width:100% !important;height:100% !important}</style><rect width="1000" height="1000" fill="red"/></svg>',
  )
  const asset = makeLogoAsset({ svg: svg.text })
  const transform = { scale: 70, x: 10, y: -5, background: 'transparent' }
  const result = preparedSvg(asset, transform)
  expect(result).not.toBeNull()
  const root = new DOMParser().parseFromString(result || '', 'image/svg+xml').documentElement
  const nested = root.querySelector('svg')
  expect(nested).not.toBeNull()
  for (const [property, value] of Object.entries(imageRect(asset, transform))) {
    expect(nested?.getAttribute(property)).toBe(String(value))
    // JSDOM does not support SVG 2 x/y styles or consistently serialize inline priorities.
    if (property === 'width' || property === 'height') {
      expect(nested?.style.getPropertyValue(property)).toBe(`${value}px`)
    }
  }
  expect(result).not.toContain('data:image')
})
