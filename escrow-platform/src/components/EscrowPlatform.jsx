import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import Header from './Header'
import MainInterface from './MainInterface'
import History from './History'
import Docs from './Docs'
import Footer from './Footer'
import { hideAppKitBalance } from '../utils/hideBalance'

function EscrowPlatform() {
  const { isConnected } = useAccount()
  const [currentPage, setCurrentPage] = useState('escrow')

  useEffect(() => {
    // Hide balance when component mounts and when connection status changes
    hideAppKitBalance()
  }, [isConnected])

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="welcome-section">
          <h2>Welcome to 2/3 Multi-sig Escrow Platform</h2>
          <p>Secure transactions with built-in arbitration system</p>
          <appkit-button />
        </div>
      )
    }

    switch (currentPage) {
      case 'escrow':
        return <MainInterface />
      case 'history':
        return <History />
      case 'docs':
        return <Docs />
      default:
        return <MainInterface />
    }
  }

  return (
    <div className="escrow-platform">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {renderContent()}
      
      <Footer />
    </div>
  )
}

export default EscrowPlatform