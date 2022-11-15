import React from 'react'
import * as styledEl from './styled'
import { CheckCircle, Activity } from 'react-feather'
import { ExternalLink } from 'theme'
import { ButtonPrimary } from 'components/Button'

const iconMap = {
  completed: CheckCircle,
  pending: Activity,
}

interface ItemProps {
  type: keyof typeof iconMap
  children: React.ReactNode
}

function Item({ type, children }: ItemProps) {
  const Icon = iconMap[type]

  return (
    <styledEl.Item>
      <styledEl.Icon type={type}>
        <Icon size={20} />
      </styledEl.Icon>
      <span>{children}</span>
    </styledEl.Item>
  )
}

export function UnlockLimitOrders({ handleUnlock }: { handleUnlock: () => void }) {
  return (
    <styledEl.Container>
      <styledEl.TitleSection>
        <styledEl.Title>Want to try out limit orders?</styledEl.Title>
        <styledEl.SubTitle>Unlock the beta version!</styledEl.SubTitle>
      </styledEl.TitleSection>

      <styledEl.BodySection>
        <styledEl.BodyColumn>
          <Item type="completed">Set your limit price and CoW Protocol executes</Item>
          <Item type="completed">FREE order placement and cancellations</Item>
          <Item type="completed">Place unlimited orders: balances are not locked</Item>
        </styledEl.BodyColumn>

        <styledEl.BodyColumn>
          <Item type="completed">Always receive 100% of the order surplus</Item>
          <Item type="completed">Your order is protected from MEV by default!</Item>
          <Item type="pending">Orders are Fill-or-Kill. Partial fills coming soon!</Item>
        </styledEl.BodyColumn>
      </styledEl.BodySection>

      <styledEl.ControlSection>
        {/* TODO: update href with a correct external link */}
        <ExternalLink href={'https://www.google.com'}>Learn more about limit orders ↗</ExternalLink>
        <ButtonPrimary onClick={handleUnlock}>Unlock limit orders (BETA)</ButtonPrimary>
      </styledEl.ControlSection>
    </styledEl.Container>
  )
}
