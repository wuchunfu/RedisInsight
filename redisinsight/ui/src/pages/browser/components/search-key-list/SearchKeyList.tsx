import { keys } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MultiSearch from 'uiSrc/components/multi-search/MultiSearch'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { replaceSpaces } from 'uiSrc/utils'
import { fetchKeys, keysSelector, setFilter, setSearchMatch } from 'uiSrc/slices/keys'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'

import styles from './styles.module.scss'

const SearchKeyList = () => {
  const dispatch = useDispatch()
  const { search: value = '', viewType, filter } = useSelector(keysSelector)
  const [options, setOptions] = useState<string[]>(filter ? [filter] : [])

  useEffect(() => {
    setOptions(filter ? [filter] : [])
  }, [filter])

  const handleApply = () => {
    dispatch(fetchKeys('0', viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT))

    // reset browser tree context
    dispatch(resetBrowserTree())
  }

  const handleChangeValue = (initValue: string) => {
    dispatch(setSearchMatch(initValue))
  }

  const handleChangeOptions = (options: string[]) => {
    // now only one filter, so we delete option
    dispatch(setFilter(null))
    handleApply()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === keys.ENTER) {
      handleApply()
    }
  }

  const onClear = () => {
    handleChangeValue('')
    dispatch(setFilter(null))
    handleApply()
  }

  return (
    <div className={styles.container}>
      <MultiSearch
        value={value}
        onSubmit={handleApply}
        onKeyDown={onKeyDown}
        onChange={handleChangeValue}
        onChangeOptions={handleChangeOptions}
        onClear={onClear}
        options={options}
        placeholder="Filter by Key Name or Pattern"
        className={styles.input}
        data-testid="search-key"
      />
      <p className={styles.hiddenText}>{replaceSpaces(value)}</p>
    </div>
  )
}

export default SearchKeyList
