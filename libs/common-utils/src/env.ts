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

export function isDevelopmentEnv(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProductionEnv(): boolean {
  for (const envVarName of ['REACT_APP_ENVIRONMENT', 'NEXT_PUBLIC_ENVIRONMENT', 'NODE_ENV']) {
    const env = getEnvironmentVariable(envVarName)?.trim().toLowerCase()
    if (env) return env === 'production'
  }
  return false
}

export function isStagingEnv(): boolean {
  for (const envVarName of ['REACT_APP_ENVIRONMENT', 'NEXT_PUBLIC_ENVIRONMENT', 'NODE_ENV']) {
    const env = getEnvironmentVariable(envVarName)?.trim().toLowerCase()
    if (env) return env === 'staging'
  }
  return false
}

export function isTestEnv(): boolean {
  return process.env.NODE_ENV === 'test'
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

function isEnvironmentName(value: string, environments: readonly string[]): boolean {
  return environments.includes(value)
}
