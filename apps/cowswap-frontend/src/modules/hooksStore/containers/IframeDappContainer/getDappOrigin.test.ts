describe('getDappOrigin', () => {
  it('Should return "null" when starts with javascript:', () => {
    expect(new URL('javascript:alert(1)').origin).toBe('null')
  })

  it('Should return the URL when it is valid', () => {
    expect(new URL('https://google.com').origin).toBe('https://google.com')
  })

  it('Should throw an error when URL is not valid', () => {
    expect(() => new URL('vreer43').origin).toThrow('Invalid URL')
  })
})
