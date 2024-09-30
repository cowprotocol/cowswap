import { ReactElement, useMemo, useState } from 'react'

import { latest } from '@cowprotocol/app-data'
import { HookToDappMatch, matchHooksToDappsRegistry } from '@cowprotocol/hook-dapp-lib'

import { ChevronDown, ChevronUp } from 'react-feather'

import { AppDataInfo, decodeAppData } from 'modules/appData'

import { HookItem } from './HookItem'
import { HooksList, InfoWrapper, ToggleButton, Wrapper } from './styled'

interface OrderHooksDetailsProps {
  appData: string | AppDataInfo
  children: (content: ReactElement) => ReactElement
}

export function OrderHooksDetails({ appData, children }: OrderHooksDetailsProps) {
  const [isOpen, setOpen] = useState(false)
  const appDataDoc = useMemo(() => {
    return typeof appData === 'string' ? decodeAppData(appData) : appData.doc
  }, [appData])

  if (!appDataDoc) return null

  const metadata = appDataDoc.metadata as latest.Metadata

  const preHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.pre || [])
  const postHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.post || [])

  if (!preHooksToDapp.length && !postHooksToDapp.length) return null

  return children(
    isOpen ? (
      <Wrapper>
        <ToggleButton onClick={() => setOpen(false)}>
          <ChevronUp />
        </ToggleButton>
        <HooksInfo data={preHooksToDapp} title="Pre Hooks" />
        <HooksInfo data={postHooksToDapp} title="Post Hooks" />
      </Wrapper>
    ) : (
      <Wrapper>
        <span>
          {preHooksToDapp.length ? `Pre: ${preHooksToDapp.length}, ` : ''}
          {postHooksToDapp.length ? `Post: ${postHooksToDapp.length}` : ''}
        </span>
        <ToggleButton onClick={() => setOpen(true)}>
          <ChevronDown />
        </ToggleButton>
      </Wrapper>
    ),
  )
}

interface HooksInfoProps {
  data: HookToDappMatch[]
  title: string
}

function HooksInfo({ data, title }: HooksInfoProps) {
  return (
    <>
      {data.length ? (
        <InfoWrapper>
          <h3>{title}</h3>
          <HooksList>
            {data.map((item) => {
              return <HookItem key={item.hook.callData + item.hook.target + item.hook.gasLimit} item={item} />
            })}
          </HooksList>
        </InfoWrapper>
      ) : null}
    </>
  )
}
