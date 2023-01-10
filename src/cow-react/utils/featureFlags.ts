export class FeatureFlag {
  static get(name: string) {
    return localStorage.getItem(name)
  }

  static set(name: string, value: string) {
    localStorage.setItem(name, value)
  }
}
