import { getValidFromFromAppDataDoc } from './getAppDataValidFrom'

describe('getValidFromFromAppDataDoc', () => {
  it('reads a numeric validFrom from metadata', () => {
    expect(
      getValidFromFromAppDataDoc({
        version: '1.15.0',
        appCode: 'CoW Swap',
        metadata: { validFrom: 1_700_000_300 },
      } as never),
    ).toBe(1_700_000_300)
  })

  it('returns undefined when missing or invalid', () => {
    expect(getValidFromFromAppDataDoc(undefined)).toBeUndefined()
    expect(
      getValidFromFromAppDataDoc({
        version: '1.15.0',
        appCode: 'CoW Swap',
        metadata: {},
      } as never),
    ).toBeUndefined()
    expect(
      getValidFromFromAppDataDoc({
        version: '1.15.0',
        appCode: 'CoW Swap',
        metadata: { validFrom: 'soon' },
      } as never),
    ).toBeUndefined()
  })
})
