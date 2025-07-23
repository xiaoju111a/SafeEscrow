import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// 1. Get projectId from https://dashboard.reown.com
const projectId = '196fca1b998871d17b51f33cfed2b80b'

// 2. Create a metadata object
const metadata = {
  name: 'Escrow Platform',
  description: '2/3 Multi-signature Escrow Platform',
  url: 'https://escrow-platform.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [mainnet, sepolia]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

// 6. Setup queryClient
export const queryClient = new QueryClient()
export { wagmiAdapter }