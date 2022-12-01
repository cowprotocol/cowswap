import React from 'react'
import * as styledEl from './styled'
import { CheckCircle, Activity } from 'react-feather'
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
          <Item type="completed">Set any limit price and time horizon</Item>
          <Item type="completed">FREE order placement and cancellation</Item>
          <Item type="completed">Place multiple orders using the same balance</Item>
        </styledEl.BodyColumn>

        <styledEl.BodyColumn>
          <Item type="completed">Always receive 100% of your order surplus</Item>
          <Item type="completed">Protection from MEV by default</Item>
          <Item type="pending">Orders are fill or kill. Partial fills coming soon!</Item>
        </styledEl.BodyColumn>
      </styledEl.BodySection>

      <styledEl.ControlSection>
        {/* TODO: update href with a correct external link */}
        {/*TODO HIDDEN: <ExternalLink href={'https://www.google.com'}>Learn more about limit orders ↗</ExternalLink>*/}
        <ButtonPrimary onClick={handleUnlock}>Unlock limit orders (BETA)</ButtonPrimary>
      </styledEl.ControlSection>
    </styledEl.Container>
  )
}
