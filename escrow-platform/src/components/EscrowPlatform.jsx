import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import Header from './Header'
import MainInterface from './MainInterface'
import Footer from './Footer'
import { hideAppKitBalance } from '../utils/hideBalance'

function EscrowPlatform() {
  const { isConnected } = useAccount()

  useEffect(() => {
    // Hide balance when component mounts and when connection status changes
    hideAppKitBalance()
  }, [isConnected])

  return (
    <div className="escrow-platform">
      <Header />
      
      {!isConnected ? (
        <div className="welcome-section">
          <h2>Welcome to 2/3 Multi-sig Escrow Platform</h2>
          <p>Secure transactions with built-in arbitration system</p>
          <appkit-button />
        </div>
      ) : (
        <MainInterface />
      )}
      
      <Footer />
    </div>
  )
}

export default EscrowPlatform