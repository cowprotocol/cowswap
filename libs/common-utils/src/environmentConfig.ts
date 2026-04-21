function isEnvironmentName(value: string, environments: readonly string[]): boolean {
  return environments.includes(value)
}

export function getConfiguredEnvironmentNameFromEnvVars<TEnvironmentName extends string>(
  envVarNames: readonly string[],
  environments: readonly TEnvironmentName[],
): TEnvironmentName {
  for (const envVarName of envVarNames) {
    const env = process.env[envVarName]?.trim().toLowerCase()

    if (env) {
      if (!isEnvironmentName(env, environments)) {
        throw new Error(`Invalid ${envVarName}="${env}". Expected one of: ${environments.join(', ')}`)
      }

      return env as TEnvironmentName
    }
  }

  throw new Error(`Missing ${envVarNames.join(' or ')}. Expected one of: ${environments.join(', ')}`)
}
