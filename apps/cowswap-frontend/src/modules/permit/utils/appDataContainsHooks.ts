import { AppDataRootSchema } from '../../appData/types'

export function appDataContainsHooks(fullAppData: string | undefined): boolean {
  if (!fullAppData) {
    return false
  }

  try {
    const appData = JSON.parse(fullAppData) as AppDataRootSchema

    return !!appData.metadata?.hooks
  } catch (e) {
    // Does not match the schema, assume there are no valid hooks
    return false
  }
}
