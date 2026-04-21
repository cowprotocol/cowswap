import { getDappOrigin } from './getDappOrigin'

describe('getDappOrigin', () => {
  it('Should return "null" when starts with javascript:', () => {
    expect(getDappOrigin('javascript:alert(1)')).toBe(null)
  })

  it('Should return the URL when it is valid', () => {
    expect(getDappOrigin('https://google.com')).toBe('https://google.com')
  })

  it('Should return null when URL is not valid', () => {
    expect(getDappOrigin('vreer43')).toBe(null)
  })
})
