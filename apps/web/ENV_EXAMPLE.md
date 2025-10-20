# Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Enable mainnet (keep false for development)
NEXT_PUBLIC_ENABLE_MAINNET=false

# Contract Addresses (will be populated after deployment)
NEXT_PUBLIC_DRIVER_NFT_ADDRESS=
NEXT_PUBLIC_TEAM_NFT_ADDRESS=
```

## Getting a WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Sign up/login
3. Create a new project
4. Copy the Project ID and paste it in your `.env.local` file

