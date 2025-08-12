export type MulticallResponse<T> = { results: T[]; blockNumber: number }

export type MulticallResponseOptional<T> = MulticallResponse<T | undefined> | null
