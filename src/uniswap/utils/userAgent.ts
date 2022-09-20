import { UAParser } from 'ua-parser-js'

const userAgentRaw = window.navigator.userAgent
const parser = new UAParser(userAgentRaw)
const { type } = parser.getDevice()

export const userAgent = parser.getResult()

export const isMobile = type === 'mobile' || type === 'tablet'
export const isImTokenBrowser = /imToken/.test(userAgentRaw)
