import { ADVANCED_ORDERS_FEATURE_FLAG } from 'constants/featureFlags'
import { isProdLike } from 'legacy/utils/environments'

// We can define here some flags to be enabled while we develop
// TODO: update this before the deployment
const ENABLED_FOR_DEVELOP = [ADVANCED_ORDERS_FEATURE_FLAG]

export class FeatureFlag {
  static get(name: string) {
    if (!isProdLike && ENABLED_FOR_DEVELOP.includes(name)) {
      return true
    }

    return localStorage.getItem(name)
  }

  static set(name: string, value: string) {
    localStorage.setItem(name, value)
  }
}
