import { getLegacyIframeDimensionParams } from './legacyIframeDimensions.utils'

describe('getLegacyIframeDimensionParams', () => {
  it('maps width and height from iframeStyle', () => {
    expect(
      getLegacyIframeDimensionParams({
        width: '100%',
        height: '640px',
      }),
    ).toEqual({
      width: '100%',
      height: '640px',
    })
  })

  it('skips height values that rely on CSS variables', () => {
    expect(
      getLegacyIframeDimensionParams({
        width: '100%',
        height: 'var(--dynamicHeight)',
      }),
    ).toEqual({
      width: '100%',
    })
  })

  it('parses maxHeight when provided in pixels', () => {
    expect(
      getLegacyIframeDimensionParams({
        maxHeight: '350px',
      }),
    ).toEqual({
      maxHeight: 350,
    })
  })

  it('ignores maxHeight values that are not plain pixel lengths', () => {
    expect(
      getLegacyIframeDimensionParams({
        maxHeight: 'calc(100% - 32px)',
      }),
    ).toEqual({})
  })
})
