import EventEmitter from 'events'
import ReactAppzi from 'react-appzi'
import { userAgent, majorBrowserVersion } from 'utils/userAgent'

// Metamask IOS app uses a version from July 2019 which causes problems in appZi
const OLD_CHROME_FROM_METAMASK_IOS_APP = 76
const isOldChrome =
  userAgent.browser.name === 'Chrome' && majorBrowserVersion && majorBrowserVersion <= OLD_CHROME_FROM_METAMASK_IOS_APP

export const isAppziEnabled =
  !isOldChrome && (process.env.REACT_APP_FEEDBACK_ENABLED_DEV === 'true' || process.env.NODE_ENV === 'production')

export const FEEDBACK_KEY = process.env.REACT_APP_APPZI_FEEDBACK_KEY || 'f7591eca-72f7-4888-b15f-e7ff5fcd60cd'
export const NPS_KEY = process.env.REACT_APP_APPZI_FEEDBACK_KEY || '55872789-593b-4c6c-9e49-9b5c7693e90a'

const APPZI_TOKEN = process.env.REACT_APP_APPZI_TOKEN || '5ju0G'
const EVENT = 'message'

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

interface AppziCustomSettings {
  userTradedOrWaitedForLong?: true
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

type AppziSettings = {
  userId?: string
  data?: Partial<AppziCustomSettings>
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
  if (event && event.type && event.type === 'open-survey') {
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

/**
 * Opening of the modal is delegated to Appzi
 * It'll display only if the trigger rules are met
 * Check https://portal.appzi.com/portals/5ju0G/configs/55872789-593b-4c6c-9e49-9b5c7693e90a/trigger
 */
export function openNpsAppziSometimes() {
  applyOnceRestyleAppziNps()
  updateAppziSettings({ data: { userTradedOrWaitedForLong: true } })
}

initialize()
