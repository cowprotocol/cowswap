type GetParamsApi<T> = {
  [K in keyof T]: T[K]
}

interface GetApiFn<T, R> {
  (params?: GetParamsApi<T>): Promise<R>
}

export type FetchQueryApi<T> = {
  get: GetApiFn<T, Response>
}

type FetchQueryParams = {
  queryString: string
  networkId?: string
}

export async function fetchQuery<T>(api: FetchQueryApi<FetchQueryParams>, queryString: string): Promise<T>
export async function fetchQuery<T>(
  api: FetchQueryApi<FetchQueryParams>,
  queryString: string,
  nullOn404: true,
): Promise<T | null>
export async function fetchQuery<T>(
  api: FetchQueryApi<FetchQueryParams>,
  queryString: string,
  nullOn404?: boolean,
): Promise<T | null> {
  let response

  try {
    response = await api.get()
  } catch (e) {
    const msg = `Failed to fetch ${queryString}`
    console.error(msg, e)
    throw new Error(msg)
  }

  if (!response.ok) {
    // 404 is not a hard error, return null instead if `nullOn404` is set
    if (response.status === 404 && nullOn404) {
      return null
    }

    // Just in case response.text() fails
    const responseText = await response.text().catch((e) => {
      console.error(`Failed to fetch response text`, e)
      throw new Error(`Request failed`)
    })

    throw new Error(`Request failed: [${response.status}] ${responseText}`)
  }

  try {
    return await response.json()
  } catch (e) {
    console.error(`Response does not have valid JSON`, e)
    throw new Error(`Failed to parse API response`)
  }
}
