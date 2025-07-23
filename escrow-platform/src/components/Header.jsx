import { useAccount } from 'wagmi'

function Header({ currentPage, setCurrentPage }) {
  const { address, isConnected } = useAccount()

  const handleNavClick = (page) => {
    setCurrentPage(page)
  }

  return (
    <header className="header">
      <button 
        onClick={() => handleNavClick('escrow')}
        className="logo"
      >
        <div className="tornado-icon">🌪</div>
        SafeEscrow
      </button>
      
      <nav className="nav-links">
        <button 
          className={currentPage === 'escrow' ? 'nav-link active' : 'nav-link'}
          onClick={() => handleNavClick('escrow')}
        >
          Escrow
        </button>
        <button 
          className={currentPage === 'history' ? 'nav-link active' : 'nav-link'}
          onClick={() => handleNavClick('history')}
        >
          History
        </button>
        <button 
          className={currentPage === 'docs' ? 'nav-link active' : 'nav-link'}
          onClick={() => handleNavClick('docs')}
        >
          Docs
        </button>
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