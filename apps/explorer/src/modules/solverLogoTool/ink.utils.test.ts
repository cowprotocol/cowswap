import { createCanvas, getCanvasContext } from './canvas.utils'
import { clippedFraction, fitMark } from './geometry.utils'
import { analyseInk } from './ink.utils'

jest.mock('./canvas.utils', () => ({ createCanvas: jest.fn(), getCanvasContext: jest.fn() }))

describe('thin logo marks', () => {
  it.each(['vertical', 'horizontal'])('detects a one-pixel %s mark on an odd pixel', (direction) => {
    const data = new Uint8ClampedArray(256 * 256 * 4)
    for (let i = 0; i < 256; i++) {
      const x = direction === 'vertical' ? 1 : i,
        y = direction === 'vertical' ? i : 1
      data[(y * 256 + x) * 4 + 3] = 255
    }
    jest.mocked(createCanvas).mockReturnValue({ width: 256, height: 256 } as HTMLCanvasElement)
    jest.mocked(getCanvasContext).mockReturnValue({
      drawImage: jest.fn(),
      getImageData: () => ({ data, width: 256, height: 256 }),
    } as unknown as CanvasRenderingContext2D)
    const image = new Image()
    Object.defineProperties(image, { naturalWidth: { value: 256 }, naturalHeight: { value: 256 } })
    const ink = analyseInk(image)
    expect(ink.inkPoints).toHaveLength(256)
    expect(ink.bounds).toEqual(
      direction === 'vertical'
        ? { x: 1 / 256, y: 0, width: 1 / 256, height: 1 }
        : { x: 0, y: 1 / 256, width: 1, height: 1 / 256 },
    )
    const asset = { width: 256, height: 256, ...ink }
    expect(fitMark(asset).scale).toBe(76)
    expect(clippedFraction(asset, { scale: 200, x: -100, y: -100, background: 'transparent' })).toBe(1)
  })
})
