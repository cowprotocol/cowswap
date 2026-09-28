export const RWA_API_PREFIX = '/api/v1/'

export interface RwaApiError {
  error: string
}

export class RwaApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export async function rwaFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as RwaApiError | null

    throw new RwaApiRequestError(body?.error ?? `Request failed with ${response.status}`, response.status)
  }

  return response.json() as Promise<T>
}
