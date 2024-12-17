import { atomWithStorage } from 'jotai/utils'

import { Announcements, SolversInfo } from '../types'

export const solversInfoAtom = atomWithStorage<SolversInfo>('solversInfoAtom:v0', [])
export const announcementsAtom = atomWithStorage<Announcements>('announcements:v0', [])
