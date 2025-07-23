import { AppKitProvider } from './providers/AppKitProvider'
import EscrowPlatform from './components/EscrowPlatform'
import './App.css'

function App() {
  return (
    <AppKitProvider>
      <EscrowPlatform />
    </AppKitProvider>
  )
}

export default App
