// ** Store Imports
import { handleFooterType } from '@store/layout'
import { useDispatch, useSelector } from 'react-redux'

export const useFooterType = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector((state: { layout: { footerType: string } }) => state.layout)

  const setFooterType = (type: string) => {
    dispatch(handleFooterType(type))
  }

  return { setFooterType, footerType: store.footerType }
}
