import { sendEvent } from '../googleAnalytics'
import { Category } from '../types'

export function shareFortuneTwitterAnalytics() {
  sendEvent({
    category: Category.COW_FORTUNE,
    action: 'Share COW Fortune on Twitter',
  })
}

export function openFortuneCookieAnalytics() {
  sendEvent({
    category: Category.COW_FORTUNE,
    action: 'Open COW Fortune',
  })
}
