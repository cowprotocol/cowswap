import { UAParser } from 'ua-parser-js'

const userAgentRaw = window.navigator.userAgent
const parser = new UAParser(userAgentRaw)
const { type } = parser.getDevice()

export const userAgent = parser.getResult()

export const isMobile = type === 'mobile' || type === 'tablet'
export const isImTokenBrowser = /imToken/.test(userAgentRaw)

function getBrowserMajorVersion() {
  const major = userAgent.browser.version?.split('.')[0]

  return major ? parseInt(major) : undefined
}

export const majorBrowserVersion = getBrowserMajorVersion()

const { name } = parser.getBrowser()
export const isChrome = name?.toLowerCase().startsWith('chrome')
