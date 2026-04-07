import { ReactNode } from 'react'

export function SubscriptionSuccessContent({ username }: { username: string }): ReactNode {
  return (
    <div>
      <strong>Trade alerts enabled successfully</strong>
      <br />
      {`Telegram trade alerts enabled for user @${username}`}
    </div>
  )
}
