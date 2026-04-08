import { isMetaMaskWallet } from './isMetaMaskWallet'

describe('isMetaMaskWallet', () => {
  it('detects MetaMask by connector name', () => {
    expect(isMetaMaskWallet({ connectorName: 'MetaMask' })).toBe(true)
  })

  it('detects MetaMask by exact rdns', () => {
    expect(isMetaMaskWallet({ rdns: 'io.metamask' })).toBe(true)
  })

  it('detects MetaMask by rdns prefix for variants such as Flask', () => {
    expect(isMetaMaskWallet({ rdns: 'io.metamask.flask' })).toBe(true)
  })

  it('detects MetaMask by provider flags for generic injected connections', () => {
    expect(isMetaMaskWallet({ ethereumProvider: { isMetaMask: true } })).toBe(true)
  })

  it('does not treat Rabby as MetaMask when it exposes isMetaMask', () => {
    expect(isMetaMaskWallet({ ethereumProvider: { isMetaMask: true, isRabby: true } })).toBe(false)
  })

  it('returns false when no MetaMask signal is present', () => {
    expect(isMetaMaskWallet({ rdns: 'com.coinbase.wallet', ethereumProvider: { isMetaMask: false } })).toBe(false)
  })
})
