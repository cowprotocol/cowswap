export type ExecutingOrdersCountdown = Record<string, number | null>

type happyPath = 'initial' | 'solving' | 'executing' | 'finished'
type errorFlow = 'nextBatch' | 'delayed' | 'unfillable' | 'submissionFailed'
export type OrderProgressBarStepNames = happyPath | errorFlow
