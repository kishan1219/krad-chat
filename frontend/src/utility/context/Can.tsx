// ** Imports createContext function
import { createContext } from 'react'

// ** Imports createContextualCan function
import { createContextualCan } from '@casl/react'

// ** Create Context
export const AbilityContext = createContext<any>(null)

// ** Init Can Context
export const Can = createContextualCan(AbilityContext.Consumer)
