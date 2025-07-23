import { useState } from 'react'

function Docs() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = {
    overview: {
      title: 'Overview',
      icon: '📋',
      content: (
        <div className="doc-content">
          <h3>SafeEscrow Platform Overview</h3>
          <p>
            SafeEscrow is a privacy-preserving escrow platform built with Zama's Fully Homomorphic 
            Encryption Virtual Machine (FHEVM) technology, enabling secure multi-party transactions 
            with encrypted amounts and approval states.
          </p>
          
          <h4>Key Features</h4>
          <ul>
            <li><strong>2/3 Multi-Signature Escrow:</strong> Secure transactions requiring 2 out of 3 parties</li>
            <li><strong>Privacy Protection:</strong> Transaction amounts encrypted using Zama's FHE technology</li>
            <li><strong>Dispute Resolution:</strong> Built-in arbitration mechanism</li>
            <li><strong>Timeout Protection:</strong> Emergency refund mechanism for buyers</li>
          </ul>

          <h4>How It Works</h4>
          <ol>
            <li><strong>Create Escrow:</strong> Buyer creates escrow with seller and arbitrator</li>
            <li><strong>Fund Transaction:</strong> Buyer funds the escrow with ETH</li>
            <li><strong>Complete Service:</strong> Seller delivers goods/services</li>
            <li><strong>Multi-Signature:</strong> 2 out of 3 parties sign to release funds</li>
            <li><strong>Funds Released:</strong> ETH automatically transferred to seller</li>
          </ol>
        </div>
      )
    },
    
    howto: {
      title: 'How to Use',
      icon: '🚀',
      content: (
        <div className="doc-content">
          <h3>Getting Started</h3>
          
          <h4>1. Connect Your Wallet</h4>
          <p>Click the "Connect Wallet" button and select your preferred wallet provider (MetaMask, WalletConnect, etc.)</p>
          
          <h4>2. Create an Escrow</h4>
          <ol>
            <li>Go to the "Create" tab</li>
            <li>Enter the seller's Ethereum address</li>
            <li>Specify the amount in ETH</li>
            <li>Add a description of the transaction</li>
            <li>Set the timeout period</li>
            <li>Click "Create Escrow" and confirm the transaction</li>
          </ol>
          
          <h4>3. Managing Escrows</h4>
          <p><strong>For Buyers:</strong></p>
          <ul>
            <li>Sign approval when you receive goods/services</li>
            <li>Request refund if there are issues</li>
            <li>Use emergency refund after timeout if needed</li>
          </ul>
          
          <p><strong>For Sellers:</strong></p>
          <ul>
            <li>Deliver goods/services as agreed</li>
            <li>Sign approval to confirm completion</li>
            <li>Raise disputes if there are issues</li>
          </ul>
          
          <p><strong>For Arbitrators:</strong></p>
          <ul>
            <li>Review disputes objectively</li>
            <li>Make fair decisions based on evidence</li>
            <li>Sign approval for the deserving party</li>
          </ul>
        </div>
      )
    },
    
    security: {
      title: 'Security',
      icon: '🔒',
      content: (
        <div className="doc-content">
          <h3>Security Features</h3>
          
          <h4>Multi-Signature Protection</h4>
          <ul>
            <li><strong>2/3 Threshold:</strong> Requires 2 out of 3 parties to execute</li>
            <li><strong>Role Separation:</strong> Clear distinction between buyer, seller, arbitrator</li>
            <li><strong>No Single Point of Failure:</strong> No single party can control funds</li>
          </ul>
          
          <h4>Privacy Protection (FHEVM)</h4>
          <ul>
            <li><strong>Encrypted Amounts:</strong> Transaction values hidden using homomorphic encryption</li>
            <li><strong>Private Approvals:</strong> Signature states encrypted to prevent manipulation</li>
            <li><strong>Confidential Disputes:</strong> Dispute reasons kept private</li>
            <li><strong>Computational Privacy:</strong> Operations on encrypted data without decryption</li>
          </ul>
          
          <h4>Smart Contract Security</h4>
          <ul>
            <li><strong>Access Control:</strong> Functions restricted to authorized participants</li>
            <li><strong>State Validation:</strong> Comprehensive state checking</li>
            <li><strong>Reentrancy Protection:</strong> Guards against reentrancy attacks</li>
            <li><strong>Tested Code:</strong> Extensively tested smart contracts</li>
          </ul>
          
          <h4>Best Practices</h4>
          <ul>
            <li>Always verify contract addresses before interacting</li>
            <li>Double-check recipient addresses</li>
            <li>Keep your private keys secure</li>
            <li>Use reasonable timeout periods</li>
            <li>Communicate clearly with other parties</li>
          </ul>
        </div>
      )
    },
    
    faq: {
      title: 'FAQ',
      icon: '❓',
      content: (
        <div className="doc-content">
          <h3>Frequently Asked Questions</h3>
          
          <div className="faq-item">
            <h4>What is an escrow service?</h4>
            <p>
              An escrow service is a financial arrangement where a third party holds and regulates 
              payment of funds between two parties in a transaction. It helps protect both buyers 
              and sellers in transactions.
            </p>
          </div>
          
          <div className="faq-item">
            <h4>How does the 2/3 multi-signature work?</h4>
            <p>
              The escrow requires 2 out of 3 participants (buyer, seller, arbitrator) to sign 
              approval before funds are released. This ensures no single party can control the 
              transaction unilaterally.
            </p>
          </div>
          
          <div className="faq-item">
            <h4>What happens if there's a dispute?</h4>
            <p>
              If there's a dispute, the arbitrator reviews the situation and makes a decision. 
              The arbitrator's signature combined with either the buyer's or seller's signature 
              can resolve the escrow.
            </p>
          </div>
          
          <div className="faq-item">
            <h4>Can I get my money back if something goes wrong?</h4>
            <p>
              Yes, there are several protection mechanisms:
            </p>
            <ul>
              <li>2/3 multi-signature allows refunds with arbitrator approval</li>
              <li>Emergency refund available after timeout period</li>
              <li>Dispute resolution through arbitrator</li>
            </ul>
          </div>
          
          <div className="faq-item">
            <h4>What is FHEVM and why is it important?</h4>
            <p>
              FHEVM (Fully Homomorphic Encryption Virtual Machine) by Zama allows computation 
              on encrypted data without decryption. This means transaction amounts and approval 
              states remain completely private while still being verifiable.
            </p>
          </div>
          
          <div className="faq-item">
            <h4>Which networks are supported?</h4>
            <p>
              Currently, SafeEscrow supports:
            </p>
            <ul>
              <li>Sepolia Testnet (for testing)</li>
              <li>FHEVM-compatible networks (for privacy features)</li>
            </ul>
          </div>
          
          <div className="faq-item">
            <h4>What are the fees?</h4>
            <p>
              The only fees are standard Ethereum gas fees for transactions. SafeEscrow 
              itself does not charge any additional fees.
            </p>
          </div>
        </div>
      )
    },
    
    technical: {
      title: 'Technical',
      icon: '⚙️',
      content: (
        <div className="doc-content">
          <h3>Technical Information</h3>
          
          <h4>Smart Contract Addresses</h4>
          <div className="address-list">
            <div className="address-item">
              <strong>Simple Escrow (Sepolia):</strong>
              <code>0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38</code>
            </div>
            <div className="address-item">
              <strong>FHEVM Escrow (Sepolia):</strong>
              <code>0xF3E8B6944f5B2961705b2aDcaD6D4E2389ec2893</code>
            </div>
            <div className="address-item">
              <strong>Default Arbitrator:</strong>
              <code>0xD3d3d1e0a499CaFd2641452f1207Dfe2C5e1DFe8</code>
            </div>
          </div>
          
          <h4>Technology Stack</h4>
          <ul>
            <li><strong>Frontend:</strong> React 18, Viem, Wagmi</li>
            <li><strong>Blockchain:</strong> Ethereum, Sepolia Testnet</li>
            <li><strong>Privacy:</strong> Zama FHEVM v0.7</li>
            <li><strong>Smart Contracts:</strong> Solidity ^0.8.24</li>
            <li><strong>Development:</strong> Hardhat, Vite</li>
          </ul>
          
          <h4>Contract Functions</h4>
          <div className="function-list">
            <div className="function-item">
              <strong>createEscrow()</strong>
              <p>Creates a new escrow transaction with specified parameters</p>
            </div>
            <div className="function-item">
              <strong>signApproval()</strong>
              <p>Signs approval for escrow completion by participants</p>
            </div>
            <div className="function-item">
              <strong>disputeEscrow()</strong>
              <p>Raises a dispute for arbitrator review</p>
            </div>
            <div className="function-item">
              <strong>emergencyRefund()</strong>
              <p>Allows buyer to claim refund after timeout</p>
            </div>
            <div className="function-item">
              <strong>getEscrowDetails()</strong>
              <p>Retrieves detailed information about an escrow</p>
            </div>
          </div>
          
          <h4>Privacy Features</h4>
          <ul>
            <li><strong>Encrypted Amounts:</strong> Using euint64 type from FHEVM</li>
            <li><strong>Private Approvals:</strong> Using ebool type for signature states</li>
            <li><strong>Access Control:</strong> Only participants can access encrypted data</li>
            <li><strong>Homomorphic Operations:</strong> Computations on encrypted data</li>
          </ul>
        </div>
      )
    }
  }

  return (
    <div className="docs-container">
      <div className="docs-header">
        <h2>SafeEscrow Documentation</h2>
        <p>Complete guide to using the SafeEscrow platform</p>
      </div>
      
      <div className="docs-layout">
        <div className="docs-sidebar">
          <nav className="docs-nav">
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                className={`nav-item ${activeSection === key ? 'active' : ''}`}
                onClick={() => setActiveSection(key)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-text">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="docs-main">
          <div className="docs-content">
            {sections[activeSection].content}
          </div>
        </div>
      </div>
      
      <div className="docs-footer">
        <div className="footer-links">
          <a href="https://docs.zama.ai/" target="_blank" rel="noopener noreferrer">
            Zama Documentation
          </a>
          <a href="https://sepolia.etherscan.io/address/0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38" target="_blank" rel="noopener noreferrer">
            View Contract
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            Source Code
          </a>
        </div>
        <p className="footer-note">
          Built with ❤️ using Zama's FHEVM technology for privacy-preserving smart contracts
        </p>
      </div>
    </div>
  )
}

export default Docs