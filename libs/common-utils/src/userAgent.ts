import { UAParser } from 'ua-parser-js'

let userAgentRaw: string = ''
let parser: UAParser = new UAParser()
let type: string = ''
let userAgent: any = {}
let isMobile: boolean = false
let isImTokenBrowser: boolean = false
let majorBrowserVersion: number | undefined
let isChrome: boolean = false

if (typeof window !== 'undefined') {
  userAgentRaw = window.navigator.userAgent
  parser = new UAParser(userAgentRaw)
  type = parser.getDevice().type || ''

  userAgent = parser.getResult()
  isMobile = type === 'mobile' || type === 'tablet'
  isImTokenBrowser = /imToken/.test(userAgentRaw)

  function getBrowserMajorVersion() {
    const major = userAgent.browser.version?.split('.')[0]
    return major ? parseInt(major) : undefined
  }

  majorBrowserVersion = getBrowserMajorVersion()

  const { name } = parser.getBrowser()
  isChrome = name?.toLowerCase().startsWith('chrome') || false
}

export { userAgent, isMobile, isImTokenBrowser, majorBrowserVersion, isChrome }
