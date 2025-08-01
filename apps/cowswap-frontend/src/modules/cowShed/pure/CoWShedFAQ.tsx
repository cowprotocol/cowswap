import { useState, ReactNode } from 'react'

import IMG_ICON_MINUS from '@cowprotocol/assets/images/icon-minus.svg'
import IMG_ICON_PLUS from '@cowprotocol/assets/images/icon-plus.svg'
import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { ExternalLink } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { Link } from 'react-router'

import { FAQItem, FAQWrapper } from '../containers/CoWShedWidget/styled'

const FAQ_DATA = [
  {
    question: `What is ${ACCOUNT_PROXY_LABEL}?`,
    answer: (
      <>
        <ExternalLink href="https://github.com/cowdao-grants/cow-shed">
{ACCOUNT_PROXY_LABEL} (also known as CoW Shed)
        </ExternalLink>{' '}
        is a helper contract that improves the user experience within CoW Swap for features like{' '}
        <ExternalLink href="https://docs.cow.fi/cow-protocol/reference/core/intents/hooks">CoW Hooks</ExternalLink>
        .
        <br />
        <br />
        This contract is deployed only once per account, with that account becoming the single owner. CoW Shed acts as
        an intermediary account that handles trading on your behalf.
      </>
    ),
  },
  {
    question: 'How do I recover my funds from CoW Shed?',
    answer(recoverRouteLink: string) {
      return (
        <>
          Since this contract temporarily holds funds, there's a possibility that funds could get stuck in certain edge
          cases. This tool helps you recover your funds.
          <ol>
            <li>
              <Link to={recoverRouteLink}>Select the token</Link> you want to recover from CoW Shed
            </li>
            <li>Recover!</li>
          </ol>
        </>
      )
    },
  },
]

interface CoWShedFAQProps {
  recoverRouteLink: string
}

export function CoWShedFAQ({ recoverRouteLink }: CoWShedFAQProps): ReactNode {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 0: true })

  const handleToggle = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <FAQWrapper>
      {FAQ_DATA.map((faq, index) => (
        <FAQItem key={index} open={openItems[index]}>
          <summary onClick={handleToggle(index)}>
            {faq.question}
            <i>
              <SVG src={openItems[index] ? IMG_ICON_MINUS : IMG_ICON_PLUS} />
            </i>
          </summary>
          {openItems[index] && (
            <div>{typeof faq.answer === 'function' ? faq.answer(recoverRouteLink) : faq.answer}</div>
          )}
        </FAQItem>
      ))}
    </FAQWrapper>
  )
}
