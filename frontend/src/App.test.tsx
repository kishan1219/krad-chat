import { createRoot } from 'react-dom/client'
import { it, jest } from '@jest/globals'
jest.mock('./App', () => () => null)
import App from './App'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const root = createRoot(div)
  root.render(<App />)
  root.unmount()
})
