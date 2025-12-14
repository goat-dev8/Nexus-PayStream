# 🚀 NEXUS PayStream

<div align="center">

![NEXUS PayStream](https://img.shields.io/badge/NEXUS-PayStream-7C3AED?style=for-the-badge&logo=ethereum&logoColor=white)
![Polygon](https://img.shields.io/badge/Polygon-Mainnet-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Privacy-First Payment Infrastructure for Web3**

[Live Demo](https://nexus-paystream.vercel.app) · [Documentation](#documentation) · [Contracts](#smart-contracts)

</div>

---

## ✨ Features

### 🔐 Privacy-First Payments
- **ERC-5564 Stealth Addresses** - Receive payments to unique addresses that can't be linked to your main wallet
- **End-to-End Encryption** - Invoice details are encrypted client-side before storage
- **Anonymous Checkout** - Payers maintain privacy with no on-chain connection to merchant

### 💰 DeFi-Powered Treasury
- **ERC-4626 Vault** - Deposit idle funds to earn yield automatically
- **Aave V3 Integration** - Funds are deposited into Aave's USDC pool on Polygon
- **Auto-Compounding** - Yield is automatically reinvested

### 📄 On-Chain Invoicing
- **Real On-Chain Invoices** - Create invoices stored on Polygon mainnet
- **QR Code Payments** - Scannable QR codes for easy mobile payments
- **Payment Status Tracking** - Real-time status updates (Pending/Paid/Expired)

### 🌐 Merchant Registry
- **Username Resolution** - Register `@username` for easy payments
- **Stealth Meta-Addresses** - Store receiving keys for private payments

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXUS PayStream                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Frontend   │  │   Smart     │  │    External         │ │
│  │  (React)    │◄─┤  Contracts  │◄─┤    Integrations     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│        │                │                    │              │
│        ▼                ▼                    ▼              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  RainbowKit │  │  Polygon    │  │  Aave V3 Protocol   │ │
│  │  + wagmi    │  │  Mainnet    │  │  USDC Pool          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

All contracts are deployed on **Polygon Mainnet**:

| Contract | Address | Description |
|----------|---------|-------------|
| **MerchantRegistry** | [`0xD28eCF94f8Bf58E8865939DA850f86b9004e84B9`](https://polygonscan.com/address/0xD28eCF94f8Bf58E8865939DA850f86b9004e84B9) | Stores merchant profiles with stealth meta-addresses |
| **InvoiceRegistry** | [`0x36fBf54Efd152FD7E518aF1A68F04130fe47de06`](https://polygonscan.com/address/0x36fBf54Efd152FD7E518aF1A68F04130fe47de06) | Creates and tracks on-chain invoices |
| **TreasuryVaultUSDC** | [`0x3C48365aA68B719205F28E34b9bdf61F2e24D9F0`](https://polygonscan.com/address/0x3C48365aA68B719205F28E34b9bdf61F2e24D9F0) | ERC-4626 vault depositing to Aave V3 |

### Contract ABIs

<details>
<summary><strong>MerchantRegistry</strong></summary>

```solidity
// Register as a merchant
function registerMerchant(
    string username,
    address payoutAddress,
    bytes stealthMetaAddress
) returns (uint256 merchantId)

// Resolve username to merchant
function resolve(string username) returns (
    uint256 merchantId,
    address payoutAddress,
    bytes stealthMetaAddress
)

// Get merchant by address
function getMerchantIdByAddress(address addr) returns (uint256)
```
</details>

<details>
<summary><strong>InvoiceRegistry</strong></summary>

```solidity
// Create an invoice
function createInvoice(
    uint256 merchantId,
    address token,
    uint256 amount,
    uint256 expiry,
    string encryptedDetailsPointer
) returns (uint256 invoiceId)

// Mark invoice as paid
function markPaid(
    uint256 invoiceId,
    bytes32 paymentTxHash,
    address payer,
    uint256 paidAmount
)

// Get invoice details
function getInvoice(uint256 invoiceId) returns (Invoice)
```
</details>

<details>
<summary><strong>TreasuryVaultUSDC (ERC-4626)</strong></summary>

```solidity
// Deposit USDC to earn yield
function deposit(uint256 assets, address receiver) returns (uint256 shares)

// Withdraw USDC
function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)

// Get total assets in vault
function totalAssets() returns (uint256)

// Supply idle funds to Aave
function supplyToAave()
```
</details>

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Animations
- **RainbowKit** - Wallet connection
- **wagmi + viem** - Ethereum interactions
- **React Router** - Client-side routing
- **shadcn/ui** - UI components

### Smart Contracts
- **Solidity ^0.8.20**
- **Hardhat** - Development framework
- **OpenZeppelin** - Security standards
- **Aave V3 Protocol** - Yield generation

### Deployment
- **Polygon Mainnet** - Low-cost L2
- **Vercel** - Frontend hosting
- **IPFS** (optional) - Decentralized storage

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/goat-dev8/Nexus-PayStream.git
cd Nexus-PayStream

# Install dependencies
pnpm install

# Start the frontend
cd web
pnpm dev
```

### Environment Variables

Create `web/.env`:

```env
VITE_POLYGON_CHAIN_ID=137
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

For contract deployment, create `contracts/.env`:

```env
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
DEPLOYER_PRIVATE_KEY=your_private_key
```

---

## 📱 Usage

### For Merchants

1. **Connect Wallet** - Use RainbowKit to connect your wallet
2. **Register as Merchant** - Go to Products → Invoices and register with a username
3. **Create Invoices** - Fill in invoice details and create on-chain
4. **Share Payment Link** - Send the QR code or link to customers
5. **Receive Payments** - USDC is transferred directly to the contract

### For Payers

1. **Open Payment Link** - Scan QR code or click invoice link
2. **Connect Wallet** - Connect wallet with USDC balance
3. **Pay Invoice** - 3-step process: Approve → Transfer → Confirm
4. **Done!** - Invoice status updates to "Paid"

### For Yield Earners

1. **Go to Yield** - Navigate to Products → Yield
2. **Deposit USDC** - Deposit USDC to earn Aave V3 yields
3. **Earn ~4.21% APY** - Funds are automatically supplied to Aave
4. **Withdraw Anytime** - No lock-up periods

---

## 🔒 Security

### Smart Contract Security
- Built on OpenZeppelin standards
- Access control on sensitive functions
- Reentrancy protection

### Frontend Security
- No private keys stored on frontend
- Client-side encryption for invoice details
- Secure wallet connections via WalletConnect

### Best Practices
- Environment variables for sensitive data
- Private keys never committed to git
- HTTPS-only deployment

---

## 🌐 Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables:

```
VITE_POLYGON_CHAIN_ID=137
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

4. Deploy with default Vite settings

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Polygon](https://polygon.technology/) - L2 infrastructure
- [Aave](https://aave.com/) - DeFi lending protocol
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract security
- [RainbowKit](https://rainbowkit.com/) - Wallet connection
- [wagmi](https://wagmi.sh/) - React hooks for Ethereum

---

<div align="center">

**Built with 💜 for the Web3 ecosystem**

</div>
