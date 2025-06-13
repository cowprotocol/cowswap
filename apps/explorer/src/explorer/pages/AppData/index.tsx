import { useCallback, useEffect, useState } from 'react'

import { faCode, faListUl } from '@fortawesome/free-solid-svg-icons'
import { Helmet } from 'react-helmet'

import { FormProps } from './config'
import DecodePage from './DecodePage'
import EncodePage from './EncodePage'
import { StyledExplorerTabs, Wrapper } from './styled'

import TabIcon from '../../../components/common/Tabs/TabIcon'
import { TabItemInterface } from '../../../components/common/Tabs/Tabs'
import { useQuery, useUpdateQueryString } from '../../../hooks/useQuery'
import { APP_TITLE, TAB_QUERY_PARAM_KEY } from '../../const'
import { ContentCard as Content, Title } from '../styled'

export enum TabView {
  ENCODE = 1,
  DECODE = 2,
}

export type TabData = {
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encode: { formData: FormProps; options: any }
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decode: { formData: FormProps; options: any }
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): string {
  const query = useQuery()
  return query.get(TAB_QUERY_PARAM_KEY)?.toUpperCase() ?? DEFAULT_TAB // if URL param empty will be used DEFAULT
}

const tabItems = (
  tabData: TabData,
  setTabData: React.Dispatch<React.SetStateAction<TabData>>,
  onChangeTab: (tabId: number) => void
): TabItemInterface[] => {
  return [
    {
      id: TabView.ENCODE,
      tab: <TabIcon title="Encode" iconFontName={faListUl} />,
      content: <EncodePage tabData={tabData} setTabData={setTabData} handleTabChange={onChangeTab} />,
    },
    {
      id: TabView.DECODE,
      tab: <TabIcon title="Decode" iconFontName={faCode} />,
      content: <DecodePage tabData={tabData} setTabData={setTabData} />,
    },
  ]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const AppDataPage = () => {
  const tab = useQueryViewParams()
  const [tabData, setTabData] = useState<TabData>({
    encode: { formData: {}, options: {} },
    decode: { formData: {}, options: {} },
  })
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum
  const updateQueryString = useUpdateQueryString()

  const onChangeTab = useCallback((tabId: number) => {
    const newTabViewName = TabView[tabId]
    if (!newTabViewName) return
    setTabViewSelected(TabView[newTabViewName])
  }, [])

  useEffect(
    () => updateQueryString(TAB_QUERY_PARAM_KEY, TabView[tabViewSelected].toLowerCase()),
    [tabViewSelected, updateQueryString]
  )

  return (
    <Wrapper>
      <Helmet>
        <title>AppData Details - {APP_TITLE}</title>
      </Helmet>
      <Title>AppData Details</Title>
      <Content>
        <StyledExplorerTabs
          className={`appData-tab--${TabView[tabViewSelected].toLowerCase()}`}
          tabItems={tabItems(tabData, setTabData, onChangeTab)}
          selectedTab={tabViewSelected}
          updateSelectedTab={(key: number): void => onChangeTab(key)}
        />
      </Content>
    </Wrapper>
  )
}

export default AppDataPage
