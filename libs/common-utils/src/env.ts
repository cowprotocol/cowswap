export function isDevelopmentEnv(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isTestEnv(): boolean {
  return process.env.NODE_ENV === 'test'
}

export function isStagingEnv(): boolean {
  return Boolean(process.env.REACT_APP_STAGING)
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production' && !isStagingEnv()
}

function isEnvironmentName(value: string, environments: readonly string[]): boolean {
  return environments.includes(value)
}

function getEnvironmentVariable(envVarName: string): string | undefined {
  switch (envVarName) {
    case 'REACT_APP_ENVIRONMENT':
      return process.env.REACT_APP_ENVIRONMENT
    case 'NEXT_PUBLIC_ENVIRONMENT':
      return process.env.NEXT_PUBLIC_ENVIRONMENT
    default:
      return process.env[envVarName]
  }
}

export function getConfiguredEnvironmentNameFromEnvVars<EnvName extends string>(
  envVarNames: readonly string[],
  environments: readonly EnvName[],
): EnvName {
  for (const envVarName of envVarNames) {
    const env = getEnvironmentVariable(envVarName)?.trim().toLowerCase()

    if (env) {
      if (!isEnvironmentName(env, environments)) {
        throw new Error(`Invalid ${envVarName}="${env}". Expected one of: ${environments.join(', ')}`)
      }

      return env as EnvName
    }
  }

  throw new Error(`Missing ${envVarNames.join(' or ')}. Expected one of: ${environments.join(', ')}`)
}
