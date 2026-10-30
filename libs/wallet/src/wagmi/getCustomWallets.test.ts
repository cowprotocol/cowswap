import { getCustomWallets } from './getCustomWallets'

describe('getCustomWallets', () => {
  it('lists Oath in a standalone app', () => {
    expect(getCustomWallets(false, false, false)).toEqual([
      expect.objectContaining({
        id: 'oath-wallet',
        name: 'Oath Wallet',
        mobile_link: 'oathwallet://',
        app_store: 'https://apps.apple.com/app/id6780187283',
      }),
    ])
  })

  it.each([
    [true, false],
    [false, true],
    [true, true],
  ])('leaves wallet selection to the host when Safe is %s and widget is %s', (isSafeApp, isWidget) => {
    expect(getCustomWallets(isSafeApp, isWidget, false)).toBeUndefined()
  })
})

it('does not offer an iOS-only app handoff on Android', () => {
  expect(getCustomWallets(false, false, true)).toBeUndefined()
})
