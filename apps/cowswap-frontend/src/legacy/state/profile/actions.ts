import { createAction } from '@reduxjs/toolkit'

export const closeAnnouncement = createAction<{ contentHash: string }>('profile/closeAnnouncement')
