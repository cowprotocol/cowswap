import EventEmitter from 'events'
import ReactAppzi from 'react-appzi'
import { userAgent, majorBrowserVersion, isImTokenBrowser } from 'legacy/utils/userAgent'
import { environmentName, isProdLike } from 'legacy/utils/environments'
import ms from 'ms.macro'

// Metamask IOS app uses a version from July 2019 which causes problems in appZi
const OLD_CHROME_FROM_METAMASK_IOS_APP = 76
const isOldChrome =
  userAgent.browser.name === 'Chrome' && majorBrowserVersion && majorBrowserVersion <= OLD_CHROME_FROM_METAMASK_IOS_APP

const isFeedbackEnabled = process.env.REACT_APP_FEEDBACK_ENABLED_DEV === 'true' || process.env.NODE_ENV === 'production'
const isImTokenIosBrowser = isImTokenBrowser && userAgent.os.name === 'iOS'
export const isAppziEnabled = !isOldChrome && !isImTokenIosBrowser && isFeedbackEnabled

const PROD_FEEDBACK_KEY = 'f7591eca-72f7-4888-b15f-e7ff5fcd60cd'
const TEST_FEEDBACK_KEY = '6da8bf10-4904-4952-9a34-12db70e9194e'
const PROD_NPS_KEY = '55872789-593b-4c6c-9e49-9b5c7693e90a'
const TEST_NPS_KEY = '5b794318-f81c-4dac-83ba-15a6e4c9353d'

export const FEEDBACK_KEY =
  process.env.REACT_APP_APPZI_FEEDBACK_KEY || isProdLike ? PROD_FEEDBACK_KEY : TEST_FEEDBACK_KEY
export const NPS_KEY = process.env.REACT_APP_APPZI_NPS_KEY || isProdLike ? PROD_NPS_KEY : TEST_NPS_KEY

const APPZI_TOKEN = process.env.REACT_APP_APPZI_TOKEN || '5ju0G'
const EVENT = 'message'

const PENDING_TOO_LONG_TIME = ms`5 min`

type EventCallback = (event: any) => void

declare global {
  interface Window {
    appzi?: {
      openWidget: (key: string) => void
    }
    appziSettings: {
      userId: string
      data: AppziCustomSettings
      onEvent: EventCallback
    }
  }
}

type AppziCustomSettings = {
  // triggers to control when and which NPS is selected
  userTradedOrWaitedForLong?: true
  isTestNps?: true // to trigger test rather than prod NPS
  // general data regarding the circumstances that caused the modal to be shown
  secondsSinceOpen?: number // how long has this order been open (in seconds)?
  waitedTooLong?: true
  expired?: true
  traded?: true
  // extra contextual data for statistics/debugging
  explorerUrl?: string
  env?: string
  chainId?: number
}

type AppziSettings = {
  userId?: string
  data?: Partial<AppziCustomSettings>
}

const eventEmitter = new EventEmitter()

export function onAppziEvent(callback: EventCallback) {
  eventEmitter.on(EVENT, callback)
}

export function onceAppziEvent(callback: EventCallback) {
  eventEmitter.once(EVENT, callback)
}

export function offAppziEvent(callback: EventCallback) {
  eventEmitter.off(EVENT, callback)
}

function triggerAppziEvent(payload: any) {
  // console.log('[appzi] Event', payload)
  eventEmitter.emit(EVENT, payload)
}

function initialize() {
  if (isAppziEnabled) {
    ReactAppzi.initialize(APPZI_TOKEN)

    window.appziSettings = window.appziSettings || {}
    window.appziSettings.onEvent = triggerAppziEvent
  }
}

export function updateAppziSettings({ data = {}, userId = '' }: AppziSettings) {
  window.appziSettings = { ...(window.appziSettings || {}), data, userId }
}

export function openFeedbackAppzi() {
  window.appzi?.openWidget(FEEDBACK_KEY)
}

let appziRestyleApplied = false
function applyOnceRestyleAppziNps() {
  if (!appziRestyleApplied) {
    appziRestyleApplied = true
    // Make sure we apply the re-style once the appzi NPS is loaded
    onceAppziEvent(restyleAppziNps)
  }
}

function restyleAppziNps(event: any) {
  if (event && event.type === 'open-survey') {
    // Add a unique class based on NPS_KEY
    const appziRoot = document.querySelector("div[id^='appzi-wfo-']")
    if (appziRoot) {
      appziRoot.classList.add(`appzi-nps-${NPS_KEY}`)
      appziRestyleApplied = true
    }
  }
}

export function openNpsAppzi() {
  applyOnceRestyleAppziNps()
  window.appzi?.openWidget(NPS_KEY)
}

export function isOrderInPendingTooLong(openSince: number | undefined): boolean {
  const now = Date.now()

  return !!openSince && now - openSince > PENDING_TOO_LONG_TIME
}

// Different triggers for each NPS survey.
// If `userTradedOrWaitedForLong` is present and set, it'll be logged into the PROD NPS
const PROD_NPS_DATA: AppziCustomSettings = { userTradedOrWaitedForLong: true }
// If on the other hand `isTestNps` is present and tagged, it'll be logged into TEST NPS
const TEST_NPS_DATA: AppziCustomSettings = { isTestNps: true }
// Either one or the other. If both are present, PROD takes precedence
const NPS_DATA = isProdLike ? PROD_NPS_DATA : TEST_NPS_DATA

/**
 * Opening of the modal is delegated to Appzi
 * It'll display only if the trigger rules are met
 * Check https://portal.appzi.com/portals/5ju0G/configs/55872789-593b-4c6c-9e49-9b5c7693e90a/trigger
 */
export function openNpsAppziSometimes(data?: Omit<AppziCustomSettings, 'userTradedOrWaitedForLong' | 'isTestNps'>) {
  applyOnceRestyleAppziNps()
  updateAppziSettings({ data: { env: environmentName, ...data, ...NPS_DATA } })
}

initialize()
