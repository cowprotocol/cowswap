export const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value
