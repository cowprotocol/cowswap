import { atom } from 'jotai'

import { BaseFlowContextSource } from '../types/flowContext'

export const baseFlowContextSourceAtom = atom<BaseFlowContextSource | null>(null)
