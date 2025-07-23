import { useAccount } from 'wagmi'

function Header() {
  const { address, isConnected } = useAccount()

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">E</div>
          <h1>Escrow</h1>
        </div>
        
        <nav className="header-nav">
          <a href="#" className="nav-item">Voting</a>
          <a href="#" className="nav-item">Compliance</a>
          <a href="#" className="nav-item">📄 Docs</a>
        </nav>
        
        <div className="header-actions">
          <div className="network-badge">
            <div className="network-dot"></div>
            Ethereum
          </div>
          <button className="settings-btn">⚙️ Settings</button>
          <appkit-button />
        </div>
      </div>
    </header>
  )
}

export default Header