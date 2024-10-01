import { ReactElement, useMemo, useState } from 'react'

import { latest } from '@cowprotocol/app-data'
import { HookToDappMatch, matchHooksToDappsRegistry } from '@cowprotocol/hook-dapp-lib'
import { InfoTooltip } from '@cowprotocol/ui'

import { ChevronDown, ChevronUp } from 'react-feather'

import { AppDataInfo, decodeAppData } from 'modules/appData'

import { HookItem } from './HookItem'
import * as styledEl from './styled'
import { CircleCount } from './styled'

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
    <styledEl.Wrapper isOpen={isOpen}>
      <styledEl.Summary>
        <styledEl.Label>
          Hooks
          <InfoTooltip content="Hooks are interactions before/after order execution." />
        </styledEl.Label>
        <styledEl.Content onClick={() => setOpen(!isOpen)}>
          {preHooksToDapp.length > 0 && (
            <styledEl.HookTag>
              PRE <b>{preHooksToDapp.length}</b>
            </styledEl.HookTag>
          )}
          {postHooksToDapp.length > 0 && (
            <styledEl.HookTag isPost>
              POST <b>{postHooksToDapp.length}</b>
            </styledEl.HookTag>
          )}
        </styledEl.Content>
        <styledEl.ToggleButton isOpen={isOpen} onClick={() => setOpen(!isOpen)}>
          <styledEl.ToggleIcon isOpen={isOpen}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </styledEl.ToggleIcon>
        </styledEl.ToggleButton>
      </styledEl.Summary>
      {isOpen && (
        <styledEl.Details>
          <HooksInfo data={preHooksToDapp} title="Pre Hooks" />
          <HooksInfo data={postHooksToDapp} title="Post Hooks" />
        </styledEl.Details>
      )}
    </styledEl.Wrapper>,
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
        <styledEl.InfoWrapper>
          <h3>
            {title} <CircleCount>{data.length}</CircleCount>
          </h3>
          <styledEl.HooksList>
            {data.map((item, index) => (
              <HookItem key={item.hook.callData + item.hook.target + item.hook.gasLimit} item={item} index={index} />
            ))}
          </styledEl.HooksList>
        </styledEl.InfoWrapper>
      ) : null}
    </>
  )
}
