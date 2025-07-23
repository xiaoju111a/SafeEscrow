import { useAccount } from 'wagmi'

function Header() {
  const { address, isConnected } = useAccount()

  return (
    <header className="header">
      <a href="#" className="logo">
        <div className="tornado-icon">🌪</div>
        SafeEscrow
      </a>
      
      <nav className="nav-links">
        <a href="#">Escrow</a>
        <a href="#">History</a>
        <a href="#">Compliance</a>
        <a href="#">Docs</a>
      </nav>
      
      <div className="header-right">
        <button className="network-btn">
          <div className="network-icon"></div>
          Ethereum
        </button>
        <button className="settings-btn">⚙</button>
        <appkit-button />
      </div>
    </header>
  )
}

export default Header