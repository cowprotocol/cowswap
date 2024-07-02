export interface NotificationModel {
  id: number
  account: string
  title: string
  description: string
  createdAt: string
  url: string | null
  thumbnail: string | null
}
