import {
  isCoinbaseWalletBrowser,
  isImTokenBrowser,
  isInjectedWidget,
  isProdLike,
  majorBrowserVersion,
  userAgent,
} from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'

import ms from 'ms.macro'
import ReactAppzi from 'react-appzi'

// Metamask IOS app uses a version from July 2019 which causes problems in appZi
const OLD_CHROME_FROM_METAMASK_IOS_APP = 76
const isOldChrome =
  userAgent.browser?.name === 'Chrome' && majorBrowserVersion && majorBrowserVersion <= OLD_CHROME_FROM_METAMASK_IOS_APP

const isFeedbackEnabled = process.env.REACT_APP_FEEDBACK_ENABLED_DEV === 'true' || process.env.NODE_ENV === 'production'
const isImTokenIosBrowser = isImTokenBrowser && userAgent.os.name === 'iOS'
const isCoinbaseWalletIos = isCoinbaseWalletBrowser && userAgent.os.name === 'iOS'
export const isAppziEnabled =
  !isOldChrome && !isImTokenIosBrowser && !isCoinbaseWalletIos && isFeedbackEnabled && !isInjectedWidget()

const PROD_FEEDBACK_KEY = 'f7591eca-72f7-4888-b15f-e7ff5fcd60cd'
const TEST_FEEDBACK_KEY = '6da8bf10-4904-4952-9a34-12db70e9194e'
const PROD_NPS_KEY = '55872789-593b-4c6c-9e49-9b5c7693e90a'
const TEST_NPS_KEY = '5b794318-f81c-4dac-83ba-15a6e4c9353d'

const FEEDBACK_KEY = process.env.REACT_APP_APPZI_FEEDBACK_KEY || isProdLike ? PROD_FEEDBACK_KEY : TEST_FEEDBACK_KEY
const NPS_KEY = process.env.REACT_APP_APPZI_NPS_KEY || isProdLike ? PROD_NPS_KEY : TEST_NPS_KEY

const APPZI_TOKEN = process.env.REACT_APP_APPZI_TOKEN || '5ju0G'

const PENDING_TOO_LONG_TIME = ms`5 min`

declare global {
  interface Window {
    appzi?: {
      openWidget: (key: string) => void
    }
    appziSettings: {
      userId: string
      data: AppziCustomSettings
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
  created?: true
  cancelled?: true
  openedLimitPage?: true
  // extra contextual data for statistics/debugging
  explorerUrl?: string
  env?: string
  chainId?: number
  orderType?: string
  account?: string
  pendingOrderIds?: string
  walletName?: string
}

type AppziSettings = {
  userId?: string
  data?: Partial<AppziCustomSettings>
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function initialize() {
  if (isAppziEnabled) {
    ReactAppzi.initialize(APPZI_TOKEN)

    if (typeof window !== 'undefined') {
      window.appziSettings = window.appziSettings || {}
    }
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function updateAppziSettings({ data = {}, userId = '' }: AppziSettings) {
  if (typeof window !== 'undefined') {
    window.appziSettings = { ...(window.appziSettings || {}), data, userId }
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function openFeedbackAppzi(params: { account?: string; walletName?: string; chainId: number }) {
  const { account, chainId, walletName } = params

  if (typeof window !== 'undefined') {
    updateAppziSettings({ data: { account, chainId, walletName } })
    window.appzi?.openWidget(FEEDBACK_KEY)
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function openNpsAppzi() {
  if (typeof window !== 'undefined') {
    window.appzi?.openWidget(NPS_KEY)
  }
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

// Limit orders survey trigger conditions
const LIMIT_SURVEY_DATA_TEST = { isLimitSurveyTest: true }
const LIMIT_SURVEY_DATA_PROD = { isLimitSurveyProd: true }

const LIMIT_SURVEY_DATA = isProdLike ? LIMIT_SURVEY_DATA_PROD : LIMIT_SURVEY_DATA_TEST

type SurveyType = 'nps' | 'limit'

/**
 * Opening of the modal is delegated to Appzi
 * It'll display only if the trigger rules are met
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function triggerAppziSurvey(
  data?: Omit<AppziCustomSettings, 'userTradedOrWaitedForLong' | 'isTestNps'>,
  surveyType: SurveyType = 'nps',
) {
  if (isInjectedWidget()) return

  const surveyData = surveyType === 'limit' ? LIMIT_SURVEY_DATA : NPS_DATA

  updateAppziSettings({ data: { ...data, ...surveyData } })
}

export function getSurveyType(orderType: UiOrderType | undefined): SurveyType {
  return orderType === UiOrderType.LIMIT ? 'limit' : 'nps'
}

initialize()
