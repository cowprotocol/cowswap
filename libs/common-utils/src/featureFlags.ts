import { isProdLike } from './environments'

// We can define here some flags to be enabled while we develop
// TODO: update this before the deployment

const ENABLED_FOR_DEVELOP: string[] = []

export class FeatureFlag {
  static get(name: string) {
    if (!isProdLike && ENABLED_FOR_DEVELOP.includes(name)) {
      return true
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(name)
    }

    return null
  }

  static set(name: string, value: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(name, value)
    }
  }
}
