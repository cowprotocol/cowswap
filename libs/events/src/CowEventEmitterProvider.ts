import { createContext } from 'react'
import { CowEventEmitter } from './CowEventEmitter'

export const CowEventEmitterContext = createContext<CowEventEmitter | undefined>(undefined)
