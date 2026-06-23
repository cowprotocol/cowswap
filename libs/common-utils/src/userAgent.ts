import { UAParser } from 'ua-parser-js'

let userAgentRaw: string = ''
let parser: UAParser = new UAParser()
let type: string = ''
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let userAgent: any = {}
let isMobile: boolean = false
let isImTokenBrowser: boolean = false
let isCoinbaseWalletBrowser: boolean = false
let majorBrowserVersion: number | undefined
let isChrome: boolean = false

function getInjectedWalletInfo(): { isCoinbaseWallet?: boolean } | undefined {
  try {
    return (window as Window & { ethereum?: { isCoinbaseWallet?: boolean } }).ethereum
  } catch {
    return undefined
  }
}

if (typeof window !== 'undefined') {
  userAgentRaw = window.navigator.userAgent
  parser = new UAParser(userAgentRaw)
  type = parser.getDevice().type || ''

  userAgent = parser.getResult()
  isMobile = type === 'mobile' || type === 'tablet'
  isImTokenBrowser = /imToken/.test(userAgentRaw)
  isCoinbaseWalletBrowser = !!getInjectedWalletInfo()?.isCoinbaseWallet

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function getBrowserMajorVersion() {
    const major = userAgent.browser.version?.split('.')[0]
    return major ? parseInt(major) : undefined
  }

  majorBrowserVersion = getBrowserMajorVersion()

  const { name } = parser.getBrowser()
  isChrome = name?.toLowerCase().startsWith('chrome') || false
}

export { userAgent, isMobile, isImTokenBrowser, isCoinbaseWalletBrowser, majorBrowserVersion, isChrome }
