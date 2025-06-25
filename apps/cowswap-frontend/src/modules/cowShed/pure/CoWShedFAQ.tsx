import { useState, ReactNode } from 'react'

import IMG_ICON_MINUS from '@cowprotocol/assets/images/icon-minus.svg'
import IMG_ICON_PLUS from '@cowprotocol/assets/images/icon-plus.svg'
import { ExternalLink } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { Link } from 'react-router'

import { FAQItem, FAQWrapper } from '../containers/CoWShedWidget/styled'

const FAQ_DATA = [
  {
    question: 'What is Account Proxy?',
    answer: (
      <>
        <ExternalLink href="https://github.com/cowdao-grants/cow-shed">Account Proxy aka CoW Shed</ExternalLink> is a
        helper contract that enhances user experience inside CoW Swap for features like{' '}
        <ExternalLink href="https://docs.cow.fi/cow-protocol/reference/core/intents/hooks">CoW Hooks</ExternalLink>
        .
        <br />
        <br />
        This contract is deployed only once per account. This account becomes the only owner. CoW Shed will act as an
        intermediary account who will do the trading on your behalf.
        <br />
        <br />
        Because this contract holds the funds temporarily, it's possible the funds are stuck in some edge cases. This
        tool will help you recover your funds.
      </>
    ),
  },
  {
    question: 'How do I recover my funds from CoW Shed?',
    answer(recoverRouteLink: string) {
      return (
        <>
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
