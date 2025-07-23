# Vercel Deployment Guide

This guide explains how to deploy the SafeEscrow Platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your environment variables

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Connect your GitHub repository
4. Select the escrow-platform repository

### 2. Configure Build Settings

Vercel should automatically detect the Vite framework. Verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

```bash
# Required Environment Variables
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_SIMPLE_CONTRACT_ADDRESS=0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38
VITE_FHEVM_CONTRACT_ADDRESS=0xF3E8B6944f5B2961705b2aDcaD6D4E2389ec2893
VITE_DEFAULT_ARBITRATOR=0xD3d3d1e0a499CaFd2641452f1207Dfe2C5e1DFe8

# Optional Environment Variables
VITE_FHEVM_RPC_URL=https://fhevm-testnet-rpc-url
VITE_APP_NAME=SafeEscrow Platform
VITE_APP_VERSION=2.1.0
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (may take 5-10 minutes)
3. Your app will be available at `https://your-project-name.vercel.app`

## Build Configuration

The project includes these configuration files for Vercel:

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `vite.config.js`
Optimized for production builds with:
- Output directory: `dist`
- Global polyfills for Web3 libraries
- Optimized dependencies

### `.vercelignore`
Excludes unnecessary files from deployment:
- Development files
- Test files
- Contract artifacts
- Node modules

## Environment Variables Guide

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SEPOLIA_RPC_URL` | Sepolia testnet RPC endpoint | `https://eth-sepolia.g.alchemy.com/v2/...` |
| `VITE_SIMPLE_CONTRACT_ADDRESS` | Simple escrow contract address | `0x0CE9a43Cebb0D1b92421F05b338Efd2Af507bb38` |
| `VITE_DEFAULT_ARBITRATOR` | Default arbitrator address | `0xD3d3d1e0a499CaFd2641452f1207Dfe2C5e1DFe8` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_FHEVM_CONTRACT_ADDRESS` | FHEVM contract address | Fallback to simple |
| `VITE_FHEVM_RPC_URL` | FHEVM network RPC | Not used in simple mode |
| `VITE_APP_NAME` | Application name | SafeEscrow Platform |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Optional for wallet features |

## Troubleshooting

### Build Fails

1. **Node.js Version**: Ensure Node.js 18+ is used
2. **Dependencies**: Run `npm install` locally to check for issues
3. **Environment Variables**: Verify all required variables are set

### Runtime Errors

1. **RPC Endpoints**: Verify RPC URLs are accessible
2. **Contract Addresses**: Ensure contract addresses are correct
3. **Network Configuration**: Check that Sepolia testnet is properly configured

### Performance Issues

1. **Bundle Size**: Large Web3 libraries may cause slow loading
2. **RPC Limits**: Consider upgrading to paid RPC providers
3. **Caching**: Enable Vercel's edge caching for better performance

## Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Monitoring

1. **Analytics**: Enable Vercel Analytics in project settings
2. **Functions**: Monitor serverless function usage
3. **Performance**: Use Vercel's performance monitoring

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **RPC Keys**: Use separate keys for production
3. **Rate Limiting**: Configure appropriate rate limits
4. **HTTPS**: Vercel provides HTTPS by default

## Production Checklist

- [ ] Environment variables configured
- [ ] RPC endpoints working
- [ ] Contract addresses verified
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Performance monitoring set up
- [ ] Error tracking configured

## Support

For deployment issues:
1. Check Vercel's build logs
2. Verify environment variables
3. Test build locally first
4. Check network connectivity to RPC endpoints

---

**Deployment Status**: ✅ Ready for Vercel deployment