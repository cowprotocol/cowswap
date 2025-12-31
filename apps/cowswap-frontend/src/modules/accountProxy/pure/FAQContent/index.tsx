import { useState, ReactNode, FC } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { ExternalLink } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import IMG_ICON_MINUS from 'assets/images/icon-minus.svg'
import IMG_ICON_PLUS from 'assets/images/icon-plus.svg'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router'

import { FAQItem, FAQWrapper } from './styled'

import { COW_SHED_VERSIONS } from '../../consts'

const Answer1: FC = () => {
  const { i18n } = useLingui()
  const accountProxyLabelString = i18n._(ACCOUNT_PROXY_LABEL)

  return (
    <>
      <ExternalLink href="https://github.com/cowdao-grants/cow-shed">
        {accountProxyLabelString} <Trans>(also known as CoW Shed)</Trans>
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
        Since {accountProxyLabelString} is not an upgradeable smart-contract, it can be versioned and there are
      </Trans>{' '}
      {COW_SHED_VERSIONS.length} <Trans>versions of</Trans> {accountProxyLabelString}:
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
}

const Answer2: FC<{ recoverRouteLink: string }> = ({ recoverRouteLink }) => {
  const { i18n } = useLingui()
  const accountProxyLabelString = i18n._(ACCOUNT_PROXY_LABEL)

  return (
    <>
      <Trans>
        Since this contract temporarily holds funds, there's a possibility that funds could get stuck in certain edge
        cases.
      </Trans>
      <Trans>This tool helps you recover your funds.</Trans>
      <ol>
        <li>
          <Trans>
            <Link to={recoverRouteLink}>Select an {accountProxyLabelString}</Link> and then select a token you want to
            recover from CoW Shed.
          </Trans>
        </li>
        <li>
          <Trans>Recover!</Trans>
        </li>
      </ol>
    </>
  )
}

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

  const accountProxyLabel = i18n._(ACCOUNT_PROXY_LABEL)
  const FAQ_DATA = [
    {
      question: msg`What is ${accountProxyLabel}?`,
      answer: <Answer1 />,
    },
    {
      question: msg`How do I recover my funds from ${accountProxyLabel}?`,
      answer: <Answer2 recoverRouteLink={recoverRouteLink} />,
    },
  ]

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
          {openItems[index] && <div>{faq.answer}</div>}
        </FAQItem>
      ))}
    </FAQWrapper>
  )
}
