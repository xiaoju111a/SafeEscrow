import { useAccount } from 'wagmi'
import Header from './Header'
import MainInterface from './MainInterface'

function EscrowPlatform() {
  const { isConnected } = useAccount()

  return (
    <div className="escrow-platform">
      <Header />
      
      {!isConnected ? (
        <div className="welcome-section">
          <h2>Welcome to 2/3 Multi-sig Escrow Platform</h2>
          <p>Please connect your wallet to get started</p>
          <appkit-button />
        </div>
      ) : (
        <MainInterface />
      )}
    </div>
  )
}

export default EscrowPlatform