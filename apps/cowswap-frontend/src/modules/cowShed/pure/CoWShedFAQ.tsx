import { useState, ReactNode } from 'react'

import IMG_ICON_MINUS from '@cowprotocol/assets/images/icon-minus.svg'
import IMG_ICON_PLUS from '@cowprotocol/assets/images/icon-plus.svg'
import { ExternalLink } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { FAQItem, FAQWrapper } from '../containers/RecoverFundsFromProxy/styled'

export function CoWShedFAQ({ explorerLink }: { explorerLink: string | undefined }): ReactNode {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({})

  const handleToggle = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const FAQ_DATA = [
    {
      question: 'What is CoW Shed?',
      answer: (
        <>
          <ExternalLink href="https://github.com/cowdao-grants/cow-shed">CoW Shed</ExternalLink> is a helper contract
          that enhances user experience inside CoW Swap for features like{' '}
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
      answer: (
        <>
          <ol>
            <li>
              {explorerLink ? (
                <ExternalLink href={explorerLink}>Check in the block explorer</ExternalLink>
              ) : (
                'Check in block explorer'
              )}{' '}
              if your own CoW Shed has any token
            </li>
            <li>Select the token you want to recover from CoW Shed</li>
            <li>Recover!</li>
          </ol>
        </>
      ),
    },
  ]

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
          {openItems[index] && <div>{faq.answer}</div>}
        </FAQItem>
      ))}
    </FAQWrapper>
  )
}
