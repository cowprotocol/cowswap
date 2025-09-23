import { useState, ReactNode, FC } from 'react'

import IMG_ICON_MINUS from '@cowprotocol/assets/images/icon-minus.svg'
import IMG_ICON_PLUS from '@cowprotocol/assets/images/icon-plus.svg'
import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { ExternalLink } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router'

import { FAQItem, FAQWrapper } from './styled'

import { COW_SHED_VERSIONS } from '../../consts'

const Answer1: FC = () => (
  <>
    <ExternalLink href="https://github.com/cowdao-grants/cow-shed">
      {ACCOUNT_PROXY_LABEL} <Trans>(also known as CoW Shed)</Trans>
    </ExternalLink>{' '}
    <Trans>is a helper contract that improves the user experience within CoW Swap for features like</Trans>{' '}
    <ExternalLink href="https://docs.cow.fi/cow-protocol/reference/core/intents/hooks">
      <Trans>CoW Hooks</Trans>
    </ExternalLink>
    .
    <br />
    <br />
    <Trans>
      This contract is deployed per account, with that account becoming the single owner. CoW Shed acts as an
      intermediary account that handles trading on your behalf.
    </Trans>
    <br />
    <br />
    <Trans>
      Since {ACCOUNT_PROXY_LABEL} is not an upgradeable smart-contract, it can be versioned and there are
    </Trans>{' '}
    {COW_SHED_VERSIONS.length} <Trans>versions of</Trans> {ACCOUNT_PROXY_LABEL}:
    <ul>
      {COW_SHED_VERSIONS.map((v) => (
        <li key={v}>
          <Link
            to={`https://github.com/cowdao-grants/cow-shed/releases/tag/v${v}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {v}
          </Link>
        </li>
      ))}
    </ul>
  </>
)

const Answer2: FC<{ recoverRouteLink: string }> = ({ recoverRouteLink }) => (
  <>
    <Trans>
      Since this contract temporarily holds funds, there's a possibility that funds could get stuck in certain edge
      cases.
    </Trans>
    <Trans>This tool helps you recover your funds.</Trans>
    <ol>
      <li>
        <Trans>
          <Link to={recoverRouteLink}>Select an {ACCOUNT_PROXY_LABEL}</Link> and then select a token you want to recover
          from CoW Shed.
        </Trans>
      </li>
      <li>
        <Trans>Recover!</Trans>
      </li>
    </ol>
  </>
)

const FAQ_DATA = [
  {
    question: msg`What is ${ACCOUNT_PROXY_LABEL}?`,
    answer: <Answer1 />,
  },
  {
    question: msg`How do I recover my funds from ${ACCOUNT_PROXY_LABEL}?`,
    answer(recoverRouteLink: string) {
      return <Answer2 recoverRouteLink={recoverRouteLink} />
    },
  },
]

interface FAQContentProps {
  recoverRouteLink: string
}

export function FAQContent({ recoverRouteLink }: FAQContentProps): ReactNode {
  const { i18n } = useLingui()
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
            {i18n._(faq.question)}
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
