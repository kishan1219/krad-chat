// ** Store Imports
import { handleNavbarColor } from '@store/layout'
import { useDispatch, useSelector } from 'react-redux'

export const useNavbarColor = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector((state: { layout: { navbarColor: string } }) => state.layout)

  // ** Return a wrapped version of useState's setter function
  const setNavbarColor = (value: string) => {
    dispatch(handleNavbarColor(value))
  }

  return { navbarColor: store.navbarColor, setNavbarColor }
}
