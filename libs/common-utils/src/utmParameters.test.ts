import { cleanUpUtmParams, getUtmParams, UtmParams, utmParamsToUrlParams } from './utmParameters'

describe('utmParamsToUrlParams', () => {
  it.each([
    ['utmSource', 'utm_source'],
    ['utmMedium', 'utm_medium'],
    ['utmCampaign', 'utm_campaign'],
    ['utmContent', 'utm_content'],
    ['utmTerm', 'utm_term'],
    ['utmCode', 'utm_code'],
  ])('converts %s to %s', (property, urlParam) => {
    expect(utmParamsToUrlParams({ [property]: 'value' })).toEqual({ [urlParam]: 'value' })
  })

  it('separates every word of a multi-word parameter', () => {
    expect(utmParamsToUrlParams({ utmCreativeFormat: 'value' })).toEqual({ utm_creative_format: 'value' })
  })

  it('skips empty values and properties that are not UTM parameters', () => {
    expect(utmParamsToUrlParams({ utmSource: 'cow.fi', utmMedium: '', utmTerm: undefined, other: 'value' })).toEqual({
      utm_source: 'cow.fi',
    })
  })

  it('round-trips through getUtmParams', () => {
    const utm: UtmParams = {
      utmSource: 'cow.fi',
      utmMedium: 'web',
      utmCampaign: 'launch',
      utmContent: 'hero-button',
      utmTerm: 'swap',
      utmCode: 'abc',
      utmCreativeFormat: 'video',
    }

    expect(getUtmParams(new URLSearchParams(utmParamsToUrlParams(utm)))).toEqual(utm)
  })
})

describe('links carrying double-underscore UTM parameters', () => {
  const searchParams = new URLSearchParams('utm__source=cow.fi&utm__content=hero-button&tab=swap')

  it('are still parsed by getUtmParams', () => {
    expect(getUtmParams(searchParams)).toEqual({ utmSource: 'cow.fi', utmContent: 'hero-button' })
  })

  it('are still removed by cleanUpUtmParams', () => {
    expect(cleanUpUtmParams(searchParams).toString()).toEqual('tab=swap')
  })
})
