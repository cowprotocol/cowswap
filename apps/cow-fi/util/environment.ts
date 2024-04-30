const DEFAULT_ENVIRONMENTS_REGEX: Record<EnvironmentName, string> = {
  local: '^(:?localhost:\\d{2,5}|(?:127|192)(?:\\.[0-9]{1,3}){3})',
  pr: '^cowfi-git-[\\w\\d-]+cowswap\\.vercel\\.app',
  development: '^develop.cow.fi',
  production: '^cow.fi$',
}

function getRegex(env: EnvironmentName) {
  let regex
  switch (env) {
    case 'local':
      regex = process.env.REACT_APP_DOMAIN_REGEX_LOCAL
      break
    case 'development':
      regex = process.env.REACT_APP_DOMAIN_REGEX_DEVELOPMENT
      break
    case 'pr':
      regex = process.env.REACT_APP_DOMAIN_REGEX_PR
      break
    case 'production':
      regex = process.env.REACT_APP_DOMAIN_REGEX_PRODUCTION
      break
  }

  return new RegExp(regex || DEFAULT_ENVIRONMENTS_REGEX[env], 'i')
}

export interface EnvironmentChecks {
  isProd: boolean
  isPr: boolean
  isDev: boolean
  isLocal: boolean
}

export function checkEnvironment(host: string, path: string): EnvironmentChecks {
  return {
    // Project environments
    isLocal: getRegex('local').test(host),
    isDev: getRegex('development').test(host),
    isPr: getRegex('pr').test(host),
    isProd: getRegex('production').test(host),
  }
}

const { isLocal, isDev, isPr, isProd } = checkEnvironmentUsingWindow()

function checkEnvironmentUsingWindow() {
  const [host, pathname] =
    typeof window !== 'undefined' ? [window.location.host, window.location.pathname] : [undefined, undefined]
  return checkEnvironment(host, pathname)
}

export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'production']
export type EnvironmentName = 'local' | 'development' | 'pr' | 'production'

export const environmentName: EnvironmentName | undefined = (function () {
  if (isProd) {
    return 'production'
  } else if (isPr) {
    return 'pr'
  } else if (isDev) {
    return 'development'
  } else if (isLocal) {
    return 'local'
  } else {
    return undefined
  }
})()

export { isLocal, isDev, isPr, isProd }
