import { userAgent } from '@uni_src/utils/userAgent'

export * from '@uni_src/utils/userAgent'

function getBrowserMajorVersion() {
  const major = userAgent.browser.version?.split('.')[0]

  return major ? parseInt(major) : undefined
}

export const majorBrowserVersion = getBrowserMajorVersion()
